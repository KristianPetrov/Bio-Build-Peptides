"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import {
  contactMessages,
  orders,
  products,
  productVariants,
  referralCodes,
  referralPartners,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { releaseInventory } from "@/lib/orders";
import { normalizeReferralCode, isValidReferralCodeFormat } from "@/lib/referral";

export type AdminState = { ok?: boolean; message?: string };

function refreshStorefront() {
  revalidatePath("/", "layout");
}

// ─── Orders ────────────────────────────────────────────────────────────────

export async function markOrderPaid(orderId: string): Promise<AdminState> {
  await requireAdmin();
  const db = getDb();
  const [order] = await db
    .update(orders)
    .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  if (!order) return { message: "Order not found." };
  await sendOrderStatusEmail(order);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Marked as paid." };
}

const shipSchema = z.object({
  carrier: z.string().trim().min(2, "Choose a carrier.").max(40),
  trackingNumber: z.string().trim().min(4, "Enter a tracking number.").max(80),
});

export async function markOrderShipped(
  orderId: string,
  _prev: AdminState,
  form: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = shipSchema.safeParse({
    carrier: form.get("carrier"),
    trackingNumber: form.get("trackingNumber"),
  });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message };
  const db = getDb();
  const [order] = await db
    .update(orders)
    .set({
      status: "shipped",
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber,
      shippedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();
  if (!order) return { message: "Order not found." };
  await sendOrderStatusEmail(order);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Marked as shipped." };
}

export async function cancelOrder(orderId: string): Promise<AdminState> {
  await requireAdmin();
  const db = getDb();
  const [order] = await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  if (!order) return { message: "Order not found." };
  await releaseInventory(order.id);
  await sendOrderStatusEmail(order);
  revalidatePath("/admin", "layout");
  refreshStorefront();
  return { ok: true, message: "Cancelled and inventory restored." };
}

export async function saveOrderNotes(
  orderId: string,
  _prev: AdminState,
  form: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const notes = String(form.get("adminNotes") ?? "").slice(0, 4000);
  await getDb()
    .update(orders)
    .set({ adminNotes: notes || null, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Notes saved." };
}

// ─── Catalog ───────────────────────────────────────────────────────────────

const dollars = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Math.round(Number(value) * 100)))
  .refine((value) => value === null || (Number.isFinite(value) && value >= 0), "Enter a valid price.");

const variantSchema = z.object({
  price: dollars.refine((value) => value !== null && value > 0, "Single-vial price is required."),
  pack5: dollars,
  pack10: dollars,
  stock: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .refine((value) => value === null || (Number.isInteger(value) && value >= 0), "Stock must be a whole number."),
  coaUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || /^https:\/\//.test(value), "COA link must start with https://"),
});

export async function updateVariant(
  variantId: string,
  _prev: AdminState,
  form: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = variantSchema.safeParse({
    price: String(form.get("price") ?? ""),
    pack5: String(form.get("pack5") ?? ""),
    pack10: String(form.get("pack10") ?? ""),
    stock: String(form.get("stock") ?? ""),
    coaUrl: String(form.get("coaUrl") ?? ""),
  });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message };
  await getDb()
    .update(productVariants)
    .set({
      priceCents: parsed.data.price!,
      pack5Cents: parsed.data.pack5,
      pack10Cents: parsed.data.pack10,
      stock: parsed.data.stock,
      coaUrl: parsed.data.coaUrl || null,
      active: form.get("active") === "on",
      updatedAt: new Date(),
    })
    .where(eq(productVariants.id, variantId));
  refreshStorefront();
  return { ok: true, message: "Saved." };
}

export async function updateProductFlags(
  productId: string,
  _prev: AdminState,
  form: FormData,
): Promise<AdminState> {
  await requireAdmin();
  await getDb()
    .update(products)
    .set({
      active: form.get("active") === "on",
      featured: form.get("featured") === "on",
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
  refreshStorefront();
  return { ok: true, message: "Saved." };
}

// ─── Referrals ─────────────────────────────────────────────────────────────

export async function createPartner(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  if (name.length < 2) return { message: "Enter a partner name." };
  await getDb().insert(referralPartners).values({
    name,
    email: email || null,
    notes: String(form.get("notes") ?? "").trim() || null,
  });
  revalidatePath("/admin/referrals");
  return { ok: true, message: "Partner created." };
}

export async function createCode(_prev: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const code = normalizeReferralCode(String(form.get("code") ?? ""));
  const partnerId = String(form.get("partnerId") ?? "");
  const discountType = form.get("discountType") === "fixed" ? "fixed" : "percent";
  const rawValue = Number(form.get("discountValue"));
  const minSubtotal = Number(form.get("minSubtotal") || 0);
  if (!isValidReferralCodeFormat(code)) return { message: "Codes use 2–32 letters, numbers or dashes." };
  if (!z.uuid().safeParse(partnerId).success) return { message: "Choose a partner." };
  if (!Number.isFinite(rawValue) || rawValue <= 0) return { message: "Enter a discount value." };
  if (discountType === "percent" && rawValue > 100) return { message: "Percent must be 100 or less." };
  const discountValue = discountType === "percent" ? Math.round(rawValue) : Math.round(rawValue * 100);

  try {
    await getDb().insert(referralCodes).values({
      partnerId,
      code,
      discountType,
      discountValue,
      minSubtotalCents: Math.max(0, Math.round(minSubtotal * 100)),
    });
  } catch {
    return { message: "That code already exists." };
  }
  revalidatePath("/admin/referrals");
  return { ok: true, message: `Code ${code} created.` };
}

export async function toggleCode(codeId: string, active: boolean) {
  await requireAdmin();
  await getDb()
    .update(referralCodes)
    .set({ active, updatedAt: new Date() })
    .where(eq(referralCodes.id, codeId));
  revalidatePath("/admin/referrals");
}

export async function togglePartner(partnerId: string, active: boolean) {
  await requireAdmin();
  await getDb()
    .update(referralPartners)
    .set({ active, updatedAt: new Date() })
    .where(eq(referralPartners.id, partnerId));
  revalidatePath("/admin/referrals");
}

// ─── Messages ──────────────────────────────────────────────────────────────

export async function setMessageStatus(messageId: string, status: "new" | "read" | "archived") {
  await requireAdmin();
  await getDb()
    .update(contactMessages)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactMessages.id, messageId));
  revalidatePath("/admin/messages");
}
