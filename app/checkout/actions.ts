"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, normalizeEmail } from "@/lib/auth";
import { sendOrderPlacedEmails } from "@/lib/email";
import {
  buildPricedCart,
  CheckoutError,
  createOrder,
  getOrderWithItems,
  resolveReferral,
} from "@/lib/orders";
import { getCheckoutPaymentMethods } from "@/lib/payment-methods";
import { shippingForSubtotal } from "@/lib/site";

const lineSchema = z.object({
  variantId: z.uuid(),
  packSize: z.number().int(),
  quantity: z.number().int().min(1).max(50),
});

export type Quote =
  | {
      ok: true;
      subtotalCents: number;
      discountCents: number;
      shippingCents: number;
      totalCents: number;
      referralCode: string | null;
      lines: { variantId: string; packSize: number; lineTotalCents: number }[];
    }
  | { ok: false; message: string; field?: "referralCode" | "cart" };

export async function quoteCart(
  rawLines: unknown,
  referralCode?: string,
): Promise<Quote> {
  const parsed = z.array(lineSchema).max(60).safeParse(rawLines);
  if (!parsed.success) return { ok: false, message: "Your cart could not be read.", field: "cart" };

  try {
    const cart = await buildPricedCart(parsed.data);
    let referral = null;
    try {
      referral = await resolveReferral(referralCode, cart.subtotalCents);
    } catch (error) {
      if (error instanceof CheckoutError) {
        return { ok: false, message: error.message, field: "referralCode" };
      }
      throw error;
    }
    const discountCents = referral?.discountCents ?? 0;
    const shippingCents = shippingForSubtotal(cart.subtotalCents - discountCents);
    return {
      ok: true,
      subtotalCents: cart.subtotalCents,
      discountCents,
      shippingCents,
      totalCents: cart.subtotalCents - discountCents + shippingCents,
      referralCode: referral?.code ?? null,
      lines: cart.items.map((item) => ({
        variantId: item.variantId,
        packSize: item.packSize,
        lineTotalCents: item.lineTotalCents,
      })),
    };
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, message: error.message, field: "cart" };
    console.error("quoteCart failed", error);
    return { ok: false, message: "We could not price your cart. Please try again.", field: "cart" };
  }
}

const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.email("Enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number.")
    .max(30)
    .regex(/^[0-9+().\-\s]+$/, "Enter a valid phone number."),
  address1: z.string().trim().min(3, "Enter a street address.").max(200),
  address2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2, "Enter a city.").max(100),
  state: z.string().trim().length(2, "Select a state."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code."),
  paymentMethod: z.enum(["zelle", "venmo", "cashapp", "paylink"], "Choose a payment method."),
  referralCode: z.string().trim().max(40).optional().default(""),
  acknowledge: z.literal(true, "You must confirm research use to place an order."),
  lines: z.array(lineSchema).min(1, "Your cart is empty.").max(60),
});

export type PlaceOrderResult =
  | { ok: true; reference: string; token: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Please review the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;

  const allowed = getCheckoutPaymentMethods().map((method) => method.id);
  if (!allowed.includes(data.paymentMethod)) {
    return {
      ok: false,
      message: "That payment method is not available.",
      fieldErrors: { paymentMethod: "Choose an available payment method." },
    };
  }

  try {
    const user = await getCurrentUser();
    const { order, token } = await createOrder({
      email: normalizeEmail(data.email),
      userId: user?.id ?? null,
      paymentMethod: data.paymentMethod,
      referralCode: data.referralCode,
      lines: data.lines,
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2 || undefined,
        city: data.city,
        state: data.state.toUpperCase(),
        postalCode: data.postalCode,
        country: "US",
      },
    });

    const full = await getOrderWithItems(order.reference);
    if (full) await sendOrderPlacedEmails(full.order, full.items, token);

    revalidatePath("/shop", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, reference: order.reference, token };
  } catch (error) {
    if (error instanceof CheckoutError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: /referral/i.test(error.message) ? { referralCode: error.message } : undefined,
      };
    }
    console.error("placeOrder failed", error);
    return { ok: false, message: "We could not place your order. Please try again." };
  }
}
