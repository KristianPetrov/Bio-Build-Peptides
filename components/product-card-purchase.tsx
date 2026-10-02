"use client";

import { useEffect, useRef, useState } from "react";
import type { StoreProduct } from "@/lib/catalog";
import { formatCents } from "@/lib/pricing";
import { useCart } from "./cart/cart-provider";

export function ProductCardPurchase({ product }: { product: Pick<StoreProduct, "slug" | "name" | "variants"> }) {
  const cart = useCart();
  const first = product.variants.find((item) => item.stock === null || item.stock > 0)
    ?? product.variants[0];
  const [variantId, setVariantId] = useState(first.id);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variant = product.variants.find((item) => item.id === variantId) ?? first;
  const inCart = cart.lines.filter((line) => line.variantId === variant.id)
    .reduce((sum, line) => sum + line.quantity * line.packSize, 0);
  const singles = cart.lines.find((line) => line.variantId === variant.id && line.packSize === 1)?.quantity ?? 0;
  const soldOut = variant.stock !== null && variant.stock <= 0;
  const atLimit = singles >= 50 || (variant.stock !== null && inCart >= variant.stock);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function add() {
    if (!cart.ready || soldOut || atLimit) return;
    cart.add({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantLabel: variant.label,
      container: variant.container,
      packSize: 1,
      priceCents: variant.priceCents,
      pack5Cents: variant.pack5Cents,
      pack10Cents: variant.pack10Cents,
      volumePricing: variant.volumePricing,
    }, 1, { open: false });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-auto px-6 pt-6 pb-6">
      <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
        {product.variants.length > 1 ? (
          <label className="min-w-0 max-w-[65%]">
            <span className="sr-only">{product.name} strength</span>
            <select
              value={variant.id}
              onChange={(event) => { setVariantId(event.target.value); setAdded(false); }}
              className="field min-h-11 text-sm"
            >
              {product.variants.map((item) => (
                <option key={item.id} value={item.id} disabled={item.stock !== null && item.stock <= 0}>
                  {item.label}{item.stock !== null && item.stock <= 0 ? " · Sold out" : ""}
                </option>
              ))}
            </select>
          </label>
        ) : <p className="text-sm text-stone">{variant.label} · Single vial</p>}
        <p className="shrink-0 font-display text-xl text-gold-100 tabular-nums">
          {formatCents(variant.priceCents, { compact: true })}
        </p>
      </div>
      <button
        type="button"
        onClick={add}
        disabled={!cart.ready || soldOut || atLimit}
        aria-label={`Add ${product.name} ${variant.label} to cart`}
        className={`product-add btn-gold w-full ${added ? "is-added" : ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          {added ? <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 5v14M5 12h14" strokeLinecap="round" />}
        </svg>
        {soldOut ? "Sold out" : atLimit ? "Cart limit reached" : added ? "Added to cart" : "Add to cart"}
      </button>
      <span className="sr-only" role="status">{added ? `${product.name} ${variant.label} added to your cart.` : ""}</span>
    </div>
  );
}
