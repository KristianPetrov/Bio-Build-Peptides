"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatCents } from "@/lib/pricing";
import { SHIPPING } from "@/lib/site";
import { Vial } from "../vial";
import { useCart } from "./cart-provider";
import { QuantityStepper } from "./quantity-stepper";

export function packLabel(packSize: number) {
  return packSize === 1 ? "Single vial" : `${packSize}-vial pack`;
}

export function CartDrawer() {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cart.isOpen) return;
    const panel = panelRef.current;
    const previousFocus = document.activeElement;
    panel?.focus();
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== "Tab" || !panel) return;
      const controls = Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
      ));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [cart.isOpen]);

  if (!cart.isOpen) return null;

  const remaining = SHIPPING.freeThresholdCents - cart.subtotalCents;
  const progress = Math.min(1, cart.subtotalCents / SHIPPING.freeThresholdCents);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close cart overlay"
        onClick={cart.close}
        className="animate-fade absolute inset-0 bg-black/45 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        id="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
        className="cart-panel flex flex-col border hairline bg-onyx outline-none"
      >
        <div className="flex items-center justify-between border-b hairline px-6 py-5">
          <div>
            <h2 id="cart-title" className="eyebrow">Your cart</h2>
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
          <div className="flex min-h-64 flex-1 flex-col items-center justify-center px-8 py-10 text-center">
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

            <ul className="min-h-0 flex-1 divide-y divide-gold-400/10 overflow-y-auto overscroll-contain px-6">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  <div className="relative -my-3 w-12 shrink-0 self-center">
                    <Vial name={line.productName} strength={line.variantLabel} container={line.container} sizes="48px" />
                  </div>
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
                        aria-label={`Remove ${line.productName} ${line.variantLabel} ${packLabel(line.packSize)}`}
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

            <div className="shrink-0 border-t hairline px-6 pt-5 pb-6">
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
