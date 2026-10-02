"use client";

import { useState, type ReactNode } from "react";
import type { StoreProduct } from "@/lib/catalog";
import {
  formatCents,
  PACK_SIZES,
  packPriceCents,
  packSavingsPercent,
  perVialCents,
  type PackSize,
} from "@/lib/pricing";
import { useCart } from "./cart/cart-provider";
import { QuantityStepper } from "./cart/quantity-stepper";
import { Vial } from "./vial";

export function ProductPurchase({
  product,
  intro,
  children,
}: {
  product: StoreProduct;
  intro: ReactNode;
  children?: ReactNode;
}) {
  const cart = useCart();
  const firstAvailable =
    product.variants.find((variant) => variant.stock === null || variant.stock > 0) ??
    product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [packSize, setPackSize] = useState<PackSize>(1);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((item) => item.id === variantId) ?? firstAvailable;
  const unitsInCart = cart.lines
    .filter((line) => line.variantId === variant.id)
    .reduce((sum, line) => sum + line.quantity * line.packSize, 0);
  const remaining = variant.stock === null ? null : Math.max(0, variant.stock - unitsInCart);
  const packAvailable = (size: PackSize) => remaining === null || remaining >= size;
  const maxQuantity =
    remaining === null ? 50 : Math.max(0, Math.floor(remaining / packSize));
  const canAdd = maxQuantity >= 1 && quantity <= maxQuantity;

  function add() {
    cart.add(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        variantLabel: variant.label,
        container: variant.container,
        packSize,
        priceCents: variant.priceCents,
        pack5Cents: variant.pack5Cents,
        pack10Cents: variant.pack10Cents,
        volumePricing: variant.volumePricing,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative mx-auto max-w-[32rem] overflow-hidden border hairline bg-[radial-gradient(ellipse_at_50%_58%,#2e2417_0%,#0c0b09_62%)] px-[6%] pt-4">
          <Vial
            key={variant.id}
            name={product.name}
            strength={variant.label}
            container={variant.container}
            priority
            sizes="(max-width: 1024px) 80vw, 32vw"
            className="animate-fade origin-[50%_58%] scale-[1.22]"
          />
        </div>
      </div>

      <div>
        {intro}
        <fieldset className="mt-10">
          <legend className="label">Strength</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((item) => {
              const out = item.stock !== null && item.stock <= 0;
              const active = item.id === variant.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  disabled={out}
                  onClick={() => {
                    setVariantId(item.id);
                    setQuantity(1);
                  }}
                  className={`min-h-11 border px-4 text-sm tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 ${
                    active
                      ? "border-gold-300 bg-gold-400/10 text-gold-50"
                      : "hairline text-parchment hover:border-gold-400/50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="label">Pack</legend>
          <div className="grid grid-cols-3 gap-2">
            {PACK_SIZES.map((size) => {
              const active = size === packSize;
              const savings = packSavingsPercent(variant, size);
              const available = packAvailable(size);
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${size} ${size === 1 ? "vial" : "vials"}, ${formatCents(packPriceCents(variant, size))}, ${formatCents(perVialCents(variant, size))} per vial${savings > 0 ? `, save ${savings}%` : ""}`}
                  disabled={!available}
                  onClick={() => {
                    setPackSize(size);
                    setQuantity(1);
                  }}
                  className={`relative flex flex-col items-start border px-3 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-35 sm:px-4 ${
                    active
                      ? "border-gold-300 bg-gold-400/10"
                      : "hairline hover:border-gold-400/50"
                  }`}
                >
                  <span className="font-display text-xl text-ivory">
                    {size}
                    <span className="ml-1.5 font-sans text-[0.625rem] tracking-[0.2em] text-stone uppercase">
                      {size === 1 ? "vial" : "vials"}
                    </span>
                  </span>
                  <span className="mt-2 text-sm text-gold-100 tabular-nums">
                    {formatCents(packPriceCents(variant, size), { compact: true })}
                  </span>
                  <span className="mt-0.5 text-[0.6875rem] text-stone tabular-nums">
                    {formatCents(perVialCents(variant, size), { compact: true })} / vial
                  </span>
                  {savings > 0 ? (
                    <span className="absolute top-2 right-2 bg-gold-300 px-1.5 py-0.5 text-[0.5625rem] font-semibold tracking-[0.1em] text-void">
                      −{savings}%
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {variant.volumePricing ? (
            <p className="mt-3 text-xs leading-5 text-ash">
              Buying loose? Five or more single vials of this strength are priced at the pack rate.
            </p>
          ) : null}
        </fieldset>

        <div className="mt-8 flex flex-wrap items-end gap-4 border-t hairline pt-8">
          <div>
            <span className="label">Quantity</span>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.max(1, maxQuantity)}
              label="Quantity"
            />
          </div>
          <div className="min-w-[10rem] flex-1">
            <p className="label">Total</p>
            <p className="font-display text-3xl text-gilt tabular-nums">
              {formatCents(packPriceCents(variant, packSize) * quantity)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={!canAdd}
          className="btn-gold mt-6 w-full"
        >
          {!canAdd
            ? "Out of stock"
            : added
              ? "Added to cart ✓"
              : `Add ${packSize * quantity} ${packSize * quantity === 1 ? "vial" : "vials"} to cart`}
        </button>
        <p className="mt-3 min-h-5 text-xs text-stone" aria-live="polite">
          {remaining !== null && remaining > 0 && remaining <= 20
            ? `${remaining} ${remaining === 1 ? "vial" : "vials"} of ${variant.label} remaining.`
            : added
              ? "Your cart has been updated."
              : ""}
        </p>
        {children}
      </div>
    </div>
  );
}
