import type { ReferralCode } from "@/db/schema";

export function normalizeReferralCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidReferralCodeFormat(code: string) {
  return /^[A-Z0-9-]{2,32}$/.test(code);
}

export function computeDiscountCents(
  code: Pick<ReferralCode, "discountType" | "discountValue" | "minSubtotalCents">,
  subtotalCents: number,
) {
  if (subtotalCents < code.minSubtotalCents) return 0;
  const raw =
    code.discountType === "percent"
      ? Math.round((subtotalCents * code.discountValue) / 100)
      : code.discountValue;
  return Math.max(0, Math.min(raw, subtotalCents));
}
