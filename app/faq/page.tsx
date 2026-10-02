import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { formatCents } from "@/lib/pricing";
import { SHIPPING } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Ordering, payment, pack pricing, shipping and order tracking at Bio Build Peptides.",
  alternates: { canonical: "/faq" },
};

const free = formatCents(SHIPPING.freeThresholdCents, { compact: true });
const flat = formatCents(SHIPPING.flatRateCents, { compact: true });

const GROUPS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "Ordering",
    items: [
      {
        q: "How do pack sizes work?",
        a: "Every strength is sold as a single vial or as a 5- or 10-vial pack, each with its own price shown on the product page. If you add loose single vials instead, five or more of the same strength are automatically re-priced at the 5-pack rate, and ten or more at the 10-pack rate. Laboratory supplies such as bacteriostatic water are priced per vial without volume discounts.",
      },
      {
        q: "Do I need an account to order?",
        a: (
          <>
            No. Guest checkout is always available. An <Link href="/account/register">account</Link> keeps
            your order history in one place.
          </>
        ),
      },
      {
        q: "Who can purchase?",
        a: "Adults aged 21 or older purchasing strictly for laboratory research. Every order requires a research-use confirmation at checkout. Products are not for human or animal consumption.",
      },
      {
        q: "Do you offer referral or discount codes?",
        a: "Yes. Enter an active referral code at checkout; the discount is applied to the product subtotal before shipping is calculated.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        q: "How do I pay?",
        a: "Payment is completed after you place your order, using Zelle, Venmo, Cash App or our secure payment link. The order page shows the exact amount, where to send it, and your order ID to use as the memo.",
      },
      {
        q: "Why do I need to include my order ID?",
        a: "We match each payment to its order by order ID and amount. Including the ID lets us confirm your payment and release your order for shipment quickly.",
      },
      {
        q: "Is my order reserved before I pay?",
        a: "Yes. Stock is reserved as soon as the order is placed, and the order shows as “Awaiting payment” until payment is confirmed.",
      },
    ],
  },
  {
    title: "Shipping & tracking",
    items: [
      {
        q: "How much is shipping?",
        a: `Shipping is a flat ${flat} per order and free on orders of ${free} or more (after any referral discount). We currently ship within the United States.`,
      },
      {
        q: "When does my order ship?",
        a: "Orders ship after payment is confirmed. Tracking is added to your order page when the shipment is created.",
      },
      {
        q: "How do I track my order?",
        a: (
          <>
            Use <Link href="/track">Track order</Link> with your order ID (it begins with BB-) and the
            email you used at checkout, or sign in to your account.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((group) =>
      group.items
        .filter((item) => typeof item.a === "string")
        .map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
    ),
  };

  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-28 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader
        eyebrow="Support"
        title="Questions,"
        accent="answered"
        lede={<>Can&apos;t find what you need? <Link href="/contact" className="text-gold-100 underline decoration-gold-400/40 underline-offset-4">Send us a message</Link>.</>}
      />
      <div className="space-y-16">
        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`faq-${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-12">
            <h2 id={`faq-${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="eyebrow pt-6">{group.title}</h2>
            <div className="divide-y divide-gold-400/15 border-y hairline">
              {group.items.map((item) => (
                <details key={item.q} className="group py-1 [&_a]:text-gold-100 [&_a]:underline [&_a]:decoration-gold-400/40 [&_a]:underline-offset-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg tracking-[0.03em] text-ivory transition-colors hover:text-gold-100 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="relative h-3 w-3 shrink-0" aria-hidden>
                      <span className="absolute top-1/2 left-0 h-px w-3 bg-gold-300" />
                      <span className="absolute top-0 left-1/2 h-3 w-px bg-gold-300 transition-transform duration-300 group-open:scale-y-0" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 leading-7 text-stone">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
