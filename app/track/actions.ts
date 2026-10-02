"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { grantOrderAccess } from "@/lib/order-access";
import { findOrderForLookup } from "@/lib/orders";

export type TrackState = {
  message?: string;
  reference?: string;
  email?: string;
};

const schema = z.object({
  reference: z.string().trim().min(4).max(20),
  email: z.email().max(200),
});

export async function trackOrder(_prev: TrackState, form: FormData): Promise<TrackState> {
  const reference = String(form.get("reference") ?? "").trim().toUpperCase();
  const email = String(form.get("email") ?? "").trim();
  const parsed = schema.safeParse({ reference, email });
  if (!parsed.success) {
    return { message: "Enter your order ID and the email used at checkout.", reference, email };
  }
  // Small constant delay blunts brute-force guessing of order IDs.
  await new Promise((resolve) => setTimeout(resolve, 350));
  const found = await findOrderForLookup(parsed.data.reference, parsed.data.email);
  if (!found) {
    return { message: "We couldn't find an order with that ID and email.", reference, email };
  }
  await grantOrderAccess(found.order.reference);
  redirect(`/order/${found.order.reference}`);
}
