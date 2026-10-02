import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  orderItems,
  orders,
  products,
  productVariants,
  referralCodes,
  referralPartners,
  type Order,
  type OrderItem,
  type PaymentMethodId,
  type ShippingAddress,
} from "@/db/schema";
import { isPackSize, priceLines, type PackSize, type PricingLine } from "./pricing";
import {
  computeDiscountCents,
  isValidReferralCodeFormat,
  normalizeReferralCode,
} from "./referral";
import { BRAND, shippingForSubtotal } from "./site";

export class CheckoutError extends Error {}

const REFERENCE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReference() {
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += REFERENCE_CHARS[byte % REFERENCE_CHARS.length];
  return `${BRAND.orderPrefix}-${out}`;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(token: string | undefined | null, hash: string) {
  if (!token) return false;
  const a = Buffer.from(hashToken(token));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type CartLineInput = {
  variantId: string;
  packSize: number;
  quantity: number;
};

/** Re-prices a cart against the live catalog. Throws CheckoutError for unavailable items. */
export async function buildPricedCart(lines: CartLineInput[]) {
  if (lines.length === 0) throw new CheckoutError("Your cart is empty.");
  if (lines.length > 60) throw new CheckoutError("Too many cart lines.");

  const db = getDb();
  const variantIds = [...new Set(lines.map((line) => line.variantId))];
  const rows = await db
    .select({ variant: productVariants, product: products })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(inArray(productVariants.id, variantIds));
  const byId = new Map(rows.map((row) => [row.variant.id, row]));

  const pricing: (PricingLine & { row: (typeof rows)[number] })[] = [];
  for (const [index, line] of lines.entries()) {
    const row = byId.get(line.variantId);
    const quantity = Math.floor(Number(line.quantity));
    if (!row || !row.variant.active || !row.product.active) {
      throw new CheckoutError("An item in your cart is no longer available. Please review your cart.");
    }
    if (!isPackSize(line.packSize) || !Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
      throw new CheckoutError("Your cart contains an invalid quantity.");
    }
    pricing.push({
      key: `${index}`,
      variantId: row.variant.id,
      packSize: line.packSize as PackSize,
      quantity,
      variant: row.variant,
      row,
    });
  }

  const { totals, subtotal } = priceLines(pricing);
  return {
    subtotalCents: subtotal,
    items: pricing.map((line) => ({
      variantId: line.variantId,
      productSlug: line.row.product.slug,
      productName: line.row.product.name,
      variantLabel: line.row.variant.label,
      packSize: line.packSize,
      quantity: line.quantity,
      lineTotalCents: totals[line.key],
      tracked: line.row.variant.stock !== null,
      units: line.packSize * line.quantity,
    })),
  };
}

export async function resolveReferral(codeInput: string | undefined, subtotalCents: number) {
  const code = normalizeReferralCode(codeInput ?? "");
  if (!code) return null;
  if (!isValidReferralCodeFormat(code)) throw new CheckoutError("That referral code is not valid.");

  const [row] = await getDb()
    .select({ code: referralCodes, partner: referralPartners })
    .from(referralCodes)
    .innerJoin(referralPartners, eq(referralPartners.id, referralCodes.partnerId))
    .where(eq(referralCodes.code, code));

  if (!row || !row.code.active || !row.partner.active) {
    throw new CheckoutError("That referral code is not active.");
  }
  const discountCents = computeDiscountCents(row.code, subtotalCents);
  if (discountCents === 0 && row.code.minSubtotalCents > subtotalCents) {
    throw new CheckoutError(
      `That code requires a product subtotal of at least $${(row.code.minSubtotalCents / 100).toFixed(2)}.`,
    );
  }
  return { id: row.code.id, code: row.code.code, discountCents };
}

export type CreateOrderInput = {
  email: string;
  userId: string | null;
  paymentMethod: PaymentMethodId;
  shippingAddress: ShippingAddress;
  referralCode?: string;
  lines: CartLineInput[];
};

export async function createOrder(input: CreateOrderInput) {
  const cart = await buildPricedCart(input.lines);
  const referral = await resolveReferral(input.referralCode, cart.subtotalCents);
  const discountCents = referral?.discountCents ?? 0;
  const shippingCents = shippingForSubtotal(cart.subtotalCents - discountCents);
  const totalCents = cart.subtotalCents - discountCents + shippingCents;
  const token = randomBytes(24).toString("base64url");
  const reference = generateReference();

  // Aggregate tracked units per variant so mixed pack sizes reserve correctly.
  const unitsByVariant = new Map<string, { units: number; name: string }>();
  for (const item of cart.items) {
    if (!item.tracked) continue;
    const current = unitsByVariant.get(item.variantId);
    unitsByVariant.set(item.variantId, {
      units: (current?.units ?? 0) + item.units,
      name: `${item.productName} ${item.variantLabel}`,
    });
  }

  const db = getDb();
  const order = await db.transaction(async (tx) => {
    for (const [variantId, { units, name }] of unitsByVariant) {
      const updated = await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${units}`, updatedAt: new Date() })
        .where(
          and(
            eq(productVariants.id, variantId),
            isNotNull(productVariants.stock),
            gte(productVariants.stock, units),
          ),
        )
        .returning({ id: productVariants.id });
      if (updated.length === 0) {
        throw new CheckoutError(`${name} does not have enough stock for that quantity.`);
      }
    }

    const [created] = await tx
      .insert(orders)
      .values({
        reference,
        accessTokenHash: hashToken(token),
        userId: input.userId,
        email: input.email,
        paymentMethod: input.paymentMethod,
        subtotalCents: cart.subtotalCents,
        discountCents,
        shippingCents,
        totalCents,
        referralCodeId: referral?.id ?? null,
        referralCode: referral?.code ?? null,
        shippingAddress: input.shippingAddress,
        researchAcknowledgedAt: new Date(),
      })
      .returning();

    await tx.insert(orderItems).values(
      cart.items.map((item) => ({
        orderId: created.id,
        variantId: item.variantId,
        productSlug: item.productSlug,
        productName: item.productName,
        variantLabel: item.variantLabel,
        packSize: item.packSize,
        quantity: item.quantity,
        lineTotalCents: item.lineTotalCents,
        reservedUnits: item.tracked ? item.units : 0,
      })),
    );

    if (referral) {
      await tx
        .update(referralCodes)
        .set({ usedCount: sql`${referralCodes.usedCount} + 1`, updatedAt: new Date() })
        .where(eq(referralCodes.id, referral.id));
    }

    return created;
  });

  return { order, token };
}

export async function getOrderWithItems(reference: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.reference, reference));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function findOrderForLookup(reference: string, email: string) {
  const found = await getOrderWithItems(reference.trim().toUpperCase());
  if (!found || found.order.email !== email.trim().toLowerCase()) return null;
  return found;
}

export async function listOrdersForUser(userId: string) {
  return getDb()
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

/** Returns reserved units to inventory once. Safe to call repeatedly. */
export async function releaseInventory(orderId: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(orders)
      .set({ inventoryReleasedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), sql`${orders.inventoryReleasedAt} is null`))
      .returning({ id: orders.id });
    if (!claimed) return;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (!item.variantId || item.reservedUnits <= 0) continue;
      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} + ${item.reservedUnits}`, updatedAt: new Date() })
        .where(and(eq(productVariants.id, item.variantId), isNotNull(productVariants.stock)));
    }
  });
}

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid — preparing shipment",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

export function itemDisplayName(item: Pick<OrderItem, "productName" | "variantLabel" | "packSize">) {
  const pack = item.packSize === 1 ? "single vial" : `${item.packSize}-vial pack`;
  return `${item.productName} · ${item.variantLabel} · ${pack}`;
}
