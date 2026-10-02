"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/products", label: "Products & stock" },
  { href: "/admin/referrals", label: "Referral codes" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-1 mt-6 flex gap-1 overflow-x-auto px-1">
      {TABS.map((tab) => {
        const active = tab.href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/orders") : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 border px-4 py-2.5 text-[0.6875rem] tracking-[0.2em] uppercase transition-colors ${active ? "border-gold-300 bg-gold-400/10 text-gold-100" : "border-transparent text-stone hover:text-parchment"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
