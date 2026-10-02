"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoLink } from "./brand";
import { useCart } from "./cart/cart-provider";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/science", label: "Standards" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track Order" },
];

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M5.5 8.5h13l-1 11.5h-11z" strokeLinejoin="round" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <div className="relative z-40 border-b hairline bg-void">
        <p className="mx-auto flex max-w-[1320px] items-center justify-center gap-3 px-5 py-2 text-center text-[0.625rem] tracking-[0.28em] text-stone uppercase">
          <span>For research use only</span>
          <span className="hidden h-px w-6 bg-gold-400/40 sm:block" aria-hidden />
          <span className="hidden sm:inline">Free shipping on orders over $300</span>
        </p>
      </div>
      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || menuOpen
            ? "border-b hairline bg-void/85 backdrop-blur-xl"
            : "border-b border-transparent bg-void/0"
        }`}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8">
          <LogoLink />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`relative py-2 text-[0.6875rem] font-medium tracking-[0.26em] uppercase transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold-300 after:transition-transform after:duration-500 hover:text-gold-100 hover:after:scale-x-100 ${
                      isActive(item.href) ? "text-gold-100 after:scale-x-100" : "text-parchment"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/account"
              className="grid h-11 w-11 place-items-center text-parchment transition-colors hover:text-gold-100"
              aria-label="Account"
            >
              <UserIcon />
            </Link>
            <button
              type="button"
              onClick={open}
              className="relative grid h-11 w-11 place-items-center text-parchment transition-colors hover:text-gold-100"
              aria-label={`Open cart${ready && count ? `, ${count} vials` : ""}`}
            >
              <BagIcon />
              {ready && count > 0 ? (
                <span className="absolute top-1.5 right-1 grid min-w-[1.1rem] place-items-center rounded-full bg-gold-300 px-1 text-[0.625rem] leading-[1.1rem] font-semibold text-void">
                  {count}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center text-parchment lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="relative block h-3 w-5" aria-hidden>
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-5 bg-current transition-transform duration-300 ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>

      </header>
        {menuOpen ? (
          <div
            id="mobile-menu"
            className="animate-fade fixed inset-0 z-30 overflow-y-auto bg-void pt-28 lg:hidden"
          >
            <nav aria-label="Mobile" className="px-6 pt-8 pb-16">
              <ul className="divide-y divide-gold-400/15 border-y hairline">
                {[{ href: "/", label: "Home" }, ...NAV, { href: "/contact", label: "Contact" }, { href: "/account", label: "Account" }].map((item, index) => (
                  <li key={item.href} className="animate-rise" style={{ animationDelay: `${index * 45}ms` }}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-5 font-display text-xl tracking-[0.08em] text-ivory"
                    >
                      {item.label}
                      <span className="text-gold-400" aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-xs leading-6 text-ash">
                All products are supplied for laboratory research use only.
              </p>
            </nav>
          </div>
        ) : null}
    </>
  );
}
