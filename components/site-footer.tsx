import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog-data";
import { getContact, RUO_NOTICE } from "@/lib/site";
import { HelixRule, Wordmark } from "./brand";

const COLUMNS = [
  {
    title: "Catalog",
    links: [
      { href: "/shop", label: "All products" },
      ...CATEGORIES.map((category) => ({
        href: `/shop?category=${category.id}`,
        label: category.label,
      })),
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/track", label: "Track an order" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/account", label: "Account" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/science", label: "Research standards" },
      { href: "/research-use", label: "Research use policy" },
      { href: "/terms", label: "Terms of sale" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  const contact = getContact();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t hairline bg-void">
      <div className="mx-auto max-w-[1320px] px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Wordmark size="md" />
            <p className="eyebrow mt-4 text-stone">Build better biology</p>
            <p className="mt-6 max-w-sm text-sm leading-7 text-stone">
              Research peptides and laboratory supplies, presented with transparent tier
              pricing and tracked from order to delivery.
            </p>
            {contact.email || contact.phone ? (
              <ul className="mt-6 space-y-1.5 text-sm text-parchment">
                {contact.email ? (
                  <li>
                    <a href={`mailto:${contact.email}`} className="hover:text-gold-100">
                      {contact.email}
                    </a>
                  </li>
                ) : null}
                {contact.phone && contact.phoneHref ? (
                  <li>
                    <a href={contact.phoneHref} className="hover:text-gold-100">
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <Link href="/contact" className="btn-ghost mt-7">
                Contact us
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="eyebrow">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone transition-colors hover:text-gold-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <HelixRule className="mt-16" />

        <div className="mt-8 grid gap-6 text-xs leading-6 text-ash lg:grid-cols-[2fr_1fr]">
          <p className="max-w-3xl">{RUO_NOTICE} Statements on this website have not been evaluated by the Food and Drug Administration. Products are not intended to diagnose, treat, cure or prevent any disease.</p>
          <p className="lg:text-right">© {year} Bio Build Peptides. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
