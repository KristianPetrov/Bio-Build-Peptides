"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatCents } from "@/lib/pricing";
import { SHIPPING } from "@/lib/site";
import { useCart } from "./cart-provider";
import { QuantityStepper } from "./quantity-stepper";

export function packLabel(packSize: number) {
  return packSize === 1 ? "Single vial" : `${packSize}-vial pack`;
}

export function CartDrawer() {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cart.isOpen) panelRef.current?.focus();
  }, [cart.isOpen]);

  if (!cart.isOpen) return null;

  const remaining = SHIPPING.freeThresholdCents - cart.subtotalCents;
  const progress = Math.min(1, cart.subtotalCents / SHIPPING.freeThresholdCents);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={cart.close}
        className="animate-fade absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-drawer absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col border-l hairline bg-onyx outline-none"
      >
        <div className="flex items-center justify-between border-b hairline px-6 py-5">
          <div>
            <p className="eyebrow">Your cart</p>
            <p className="mt-1 text-sm text-stone">
              {cart.count} {cart.count === 1 ? "vial" : "vials"}
            </p>
          </div>
          <button
            type="button"
            onClick={cart.close}
            className="grid h-10 w-10 place-items-center text-parchment hover:text-gold-100"
            aria-label="Close cart"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-serif text-3xl italic text-gold-100">Nothing here yet.</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone">
              Browse the catalog to add research materials to your cart.
            </p>
            <Link href="/shop" onClick={cart.close} className="btn-ghost mt-8">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b hairline px-6 py-4">
              <p className="text-xs text-parchment">
                {remaining > 0 ? (
                  <>
                    <span className="text-gold-100">{formatCents(remaining)}</span> away from free shipping
                  </>
                ) : (
                  <span className="text-gold-100">Your order ships free.</span>
                )}
              </p>
              <div className="mt-2.5 h-px w-full bg-gold-400/15">
                <div
                  className="h-px bg-gradient-to-r from-gold-600 to-gold-100 transition-[width] duration-700"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-gold-400/10 overflow-y-auto px-6">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/shop/${line.productSlug}`}
                      onClick={cart.close}
                      className="font-display text-[0.95rem] tracking-[0.05em] text-ivory hover:text-gold-100"
                    >
                      {line.productName}
                    </Link>
                    <p className="mt-1 text-xs tracking-[0.06em] text-stone">
                      {line.variantLabel} · {packLabel(line.packSize)}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(value) => cart.setQuantity(line.id, value)}
                        label={`${line.productName} ${line.variantLabel} quantity`}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => cart.remove(line.id)}
                        className="text-[0.6875rem] tracking-[0.18em] text-ash uppercase underline-offset-4 hover:text-ember hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gold-100 tabular-nums">
                    {formatCents(cart.lineTotals[line.id] ?? 0)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t hairline px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-stone">Subtotal</span>
                <span className="font-display text-2xl text-gilt tabular-nums">
                  {formatCents(cart.subtotalCents)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-ash">
                Shipping and referral discounts are calculated at checkout. Loose vials of the same
                strength earn pack pricing at 5 and 10.
              </p>
              <Link href="/checkout" onClick={cart.close} className="btn-gold mt-5 w-full">
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
