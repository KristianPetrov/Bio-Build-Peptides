import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HelixRule, SectionLabel } from "@/components/brand";
import { PageHeader } from "@/components/page-header";
import { RUO_NOTICE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research standards",
  description:
    "How Bio Build Peptides presents, labels and handles research materials. For research use only.",
  alternates: { canonical: "/science" },
};

const STANDARDS = [
  {
    title: "Identity-first listings",
    body: "Each product page names the compound, its classification and — for blends — the composition of every component, with an interactive structural model where public structural data exists.",
  },
  {
    title: "Labelled strengths",
    body: "Strengths are listed exactly as supplied (for example 10mg or 10,000 IU). Multi-strength compounds are offered as separate, clearly labelled variants.",
  },
  {
    title: "Documentation",
    body: "Where a certificate of analysis is available for a lot, it is linked directly from the product page beside the matching strength.",
  },
  {
    title: "Handling",
    body: "Store each material as directed on its vial label, keep vials sealed until use, and follow your institution's laboratory handling procedures.",
  },
];

export default function SciencePage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-28 sm:px-8">
      <PageHeader
        eyebrow="Standards"
        title="Research"
        accent="standards"
        lede="Bio Build supplies materials for in-vitro laboratory, academic and institutional research. This page explains how products are presented, labelled and documented."
      />

      <div className="relative aspect-[21/9] overflow-hidden border hairline" data-reveal>
        <Image
          src="/images/standards-vials-macro.jpg"
          alt="A row of gold-capped research vials on black stone"
          fill
          preload
          sizes="(max-width: 1320px) 100vw, 1320px"
          className="object-cover"
        />
      </div>

      <section className="mt-24 grid gap-14 lg:grid-cols-[1fr_1.6fr]" aria-labelledby="standards-heading">
        <div data-reveal>
          <SectionLabel align="start">What to expect</SectionLabel>
          <h2 id="standards-heading" className="mt-8 font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.06] tracking-[0.02em] text-ivory">
            Presented with
            <span className="block font-serif font-normal text-gold-100 italic">precision</span>
          </h2>
        </div>
        <ol className="divide-y divide-gold-400/15 border-y hairline">
          {STANDARDS.map((item, index) => (
            <li key={item.title} className="grid gap-3 py-8 sm:grid-cols-[3rem_1fr]" data-reveal>
              <span className="font-display text-sm text-gold-400">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl tracking-[0.04em] text-ivory">{item.title}</h3>
                <p className="mt-2 leading-7 text-stone">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <HelixRule className="my-24" />

      <section className="mx-auto max-w-3xl text-center" aria-labelledby="ruo-heading" data-reveal>
        <SectionLabel>Research use only</SectionLabel>
        <h2 id="ruo-heading" className="sr-only">Research use only</h2>
        <p className="mt-8 font-serif text-[1.6rem] leading-[1.5] text-gold-100 italic">{RUO_NOTICE}</p>
        <p className="mt-6 text-sm leading-7 text-stone">
          We do not provide dosing, administration or medical guidance of any kind.
        </p>
        <Link href="/research-use" className="btn-ghost mt-10">Read the full policy</Link>
      </section>
    </div>
  );
}
