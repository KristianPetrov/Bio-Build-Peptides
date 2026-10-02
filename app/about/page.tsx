import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HelixRule, SectionLabel } from "@/components/brand";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "Bio Build Peptides — research compounds presented with clarity. Build better biology.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    title: "Clarity",
    body: "Each listing states what a compound is — its classification, composition and available strengths — in plain language, without promises about outcomes.",
  },
  {
    title: "Transparent pricing",
    body: "Single-vial, 5-pack and 10-pack prices are visible on every product before you reach checkout, and shipping rules are stated up front.",
  },
  {
    title: "Accountability",
    body: "Every order receives an ID and a status page, from reservation through payment confirmation to shipment and tracking.",
  },
  {
    title: "Research only",
    body: "We sell to adults purchasing for laboratory research. We do not provide dosing, medical or usage guidance of any kind.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-28 sm:px-8">
      <PageHeader
        eyebrow="About"
        title="Build better"
        accent="biology"
        lede="Bio Build Peptides supplies research compounds and laboratory supplies with a simple standard: say exactly what it is, show exactly what it costs, and keep every order accountable."
      />

      <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
        <div className="relative aspect-[16/10] overflow-hidden border hairline lg:aspect-[4/3]" data-reveal>
          <Image
            src="/images/hero-helix-athletes.jpg"
            alt="Two athletes back to back beside a gold double helix"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-[72%_center]"
          />
        </div>
        <div data-reveal>
          <p className="font-serif text-[1.7rem] leading-[1.45] text-gold-100 italic">
            The name is the brief: biology is the subject, building is the discipline.
          </p>
          <div className="mt-8 space-y-5 leading-8 text-parchment">
            <p>
              The double helix between two athletes in our mark stands for that pairing — the
              structure research studies, and the rigour it demands.
            </p>
            <p className="text-stone">
              Our catalog spans metabolic, tissue-response, endocrine and cellular research
              materials, alongside the laboratory supplies used to prepare them.
            </p>
          </div>
        </div>
      </div>

      <HelixRule className="my-24" />

      <section aria-labelledby="principles-heading">
        <SectionLabel>Principles</SectionLabel>
        <h2 id="principles-heading" className="sr-only">Principles</h2>
        <ul className="mt-12 grid gap-px border hairline bg-gold-400/15 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((item, index) => (
            <li key={item.title} className="bg-void p-8" data-reveal style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}>
              <span className="font-display text-sm text-gold-400">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-2xl tracking-[0.04em] text-ivory">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-20 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-gold">Shop the catalog</Link>
        <Link href="/contact" className="btn-ghost">Contact us</Link>
      </div>
    </div>
  );
}
