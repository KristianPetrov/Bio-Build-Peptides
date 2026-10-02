/**
 * Tier pricing shared by the client cart and the server order builder.
 * Ported from Affordable Peptides: a variant sells as a 1-, 5- or 10-vial pack.
 * With volume pricing, loose single vials of the same variant are re-priced at
 * the 5- or 10-pack per-vial rate once 5 or 10 singles are in the cart.
 */

export const PACK_SIZES = [1, 5, 10] as const;
export type PackSize = (typeof PACK_SIZES)[number];

export type PricedVariant = {
  priceCents: number;
  pack5Cents: number | null;
  pack10Cents: number | null;
  volumePricing: boolean;
};

export function isPackSize(value: number): value is PackSize {
  return (PACK_SIZES as readonly number[]).includes(value);
}

export function packPriceCents(variant: PricedVariant, packSize: PackSize) {
  if (packSize === 10) return variant.pack10Cents ?? variant.priceCents * 10;
  if (packSize === 5) return variant.pack5Cents ?? variant.priceCents * 5;
  return variant.priceCents;
}

export function perVialCents(variant: PricedVariant, packSize: PackSize) {
  return Math.round(packPriceCents(variant, packSize) / packSize);
}

export function packSavingsPercent(variant: PricedVariant, packSize: PackSize) {
  const full = variant.priceCents * packSize;
  if (full <= 0) return 0;
  return Math.max(0, Math.round((1 - packPriceCents(variant, packSize) / full) * 100));
}

export type PricingLine = {
  key: string;
  variantId: string;
  packSize: PackSize;
  quantity: number;
  variant: PricedVariant;
};

/** Returns per-line totals (cents) and the subtotal, applying loose-vial volume rates. */
export function priceLines(lines: PricingLine[]) {
  const totals: Record<string, number> = {};
  const singlesByVariant = new Map<string, number>();

  for (const line of lines) {
    if (line.packSize === 1) {
      singlesByVariant.set(
        line.variantId,
        (singlesByVariant.get(line.variantId) ?? 0) + line.quantity,
      );
    }
  }

  let subtotal = 0;
  for (const line of lines) {
    let total: number;
    if (line.packSize === 1 && line.variant.volumePricing) {
      const singles = singlesByVariant.get(line.variantId) ?? 0;
      const rateSize: PackSize = singles >= 10 ? 10 : singles >= 5 ? 5 : 1;
      total = Math.round(
        (packPriceCents(line.variant, rateSize) / rateSize) * line.quantity,
      );
    } else {
      total = packPriceCents(line.variant, line.packSize) * line.quantity;
    }
    totals[line.key] = total;
    subtotal += total;
  }

  return { totals, subtotal };
}

export function formatCents(cents: number, options: { compact?: boolean } = {}) {
  const value = cents / 100;
  const whole = Number.isInteger(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.compact && whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
