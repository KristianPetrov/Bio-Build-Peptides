"use client";

import { usePathname } from "next/navigation";
import { formatCents } from "@/lib/pricing";
import { useCart } from "./cart-provider";

export function FloatingCart() {
  const cart = useCart();
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;
  const count = cart.ready ? cart.count : 0;
  const total = formatCents(cart.ready ? cart.subtotalCents : 0);

  return (
    <div className="floating-cart">
      <button
        type="button"
        className={`floating-cart-button ${cart.isOpen ? "is-open" : ""}`}
        onClick={cart.isOpen ? cart.close : cart.open}
        aria-expanded={cart.isOpen}
        aria-controls={cart.isOpen ? "cart-panel" : undefined}
        aria-haspopup="dialog"
        aria-label={`${cart.isOpen ? "Close" : "Open"} cart, ${count} ${count === 1 ? "vial" : "vials"}, subtotal ${total}`}
      >
        <span className="floating-cart-bag" key={`${count}:${total}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M5.5 8.5h13l-1 11.5h-11z" strokeLinejoin="round" />
            <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
          </svg>
          {count > 0 ? <span className="floating-cart-count">{count}</span> : null}
        </span>
        <span className="text-left">
          <span className="block text-[0.5625rem] tracking-[0.24em] text-gold-100/75 uppercase">Your cart</span>
          <span className="block text-base font-medium text-gold-50 tabular-nums">{total}</span>
        </span>
        <svg viewBox="0 0 20 20" className={`ml-2 h-4 w-4 transition-transform duration-500 ${cart.isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="m5 12 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="sr-only" role="status">{count} {count === 1 ? "vial" : "vials"} in cart. Subtotal {total}.</span>
    </div>
  );
}
