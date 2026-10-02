import Image from "next/image";
import Link from "next/link";
import { HelixGlyph, HelixRule, SectionLabel } from "@/components/brand";
import { SpinningHelix } from "@/components/spinning-helix";
import { Hero } from "@/components/home/hero";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/catalog-data";
import { listProducts } from "@/lib/catalog";
import { formatCents, packPriceCents, packSavingsPercent, perVialCents, PACK_SIZES } from "@/lib/pricing";
import { SHIPPING } from "@/lib/site";

export const revalidate = 60;

const STEPS = [
  {
    title: "Choose",
    body: "Select a strength and a 1, 5 or 10-vial pack. Loose vials of the same strength re-price at the pack rate automatically.",
  },
  {
    title: "Reserve",
    body: "Place your order and confirm research use. Your vials are reserved immediately and you receive an order ID.",
  },
  {
    title: "Pay",
    body: "Pay by Zelle, Venmo, Cash App or our secure payment link, using your order ID as the memo.",
  },
  {
    title: "Receive",
    body: "Once payment is matched we ship and post tracking to your order page.",
  },
];

export default async function HomePage() {
  const products = await listProducts();
  const featured = products.filter((product) => product.featured).slice(0, 6);
  const showcase = featured.length >= 3 ? featured : products.slice(0, 6);
  const tierExample =
    products.find((product) => product.slug === "bpc-157") ?? products[0];
  const tierVariant = tierExample?.variants[0];

  return (
    <>
      <Hero productCount={products.length} />

      {/* Ledger of facts drawn from how the store actually works. */}
      <section aria-label="At a glance" className="border-y hairline bg-onyx">
        <dl className="mx-auto grid max-w-[1320px] grid-cols-2 divide-gold-400/15 px-5 sm:px-8 lg:grid-cols-4 lg:divide-x">
          {[
            { k: "Compounds", v: String(products.length) },
            { k: "Pack sizes", v: "1 · 5 · 10" },
            { k: "Free shipping", v: `Over ${formatCents(SHIPPING.freeThresholdCents, { compact: true })}` },
            { k: "Payment", v: "After you order" },
          ].map((item) => (
            <div key={item.k} className="py-7 lg:px-8 lg:first:pl-0">
              <dt className="text-[0.625rem] tracking-[0.28em] text-stone uppercase">{item.k}</dt>
              <dd className="mt-2 font-display text-lg tracking-[0.06em] text-gold-100 sm:text-xl">{item.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-[1320px] px-5 pt-28 sm:px-8" aria-labelledby="featured-heading">
        <div data-reveal>
          <SectionLabel index="01">Foundations</SectionLabel>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <h2 id="featured-heading" className="font-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.05] tracking-[0.02em] text-ivory">
              The most requested
              <span className="block font-serif font-normal text-gold-100 italic">research compounds</span>
            </h2>
            <Link href="/shop" className="btn-ghost justify-self-start lg:justify-self-end">
              View all {products.length}
            </Link>
          </div>
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-6 min-[600px]:grid-cols-2 xl:grid-cols-3">
          {showcase.map((product, index) => (
            <li key={product.slug} data-reveal style={{ "--reveal-delay": `${(index % 3) * 90}ms` } as React.CSSProperties}>
              <ProductCard product={product} index={index} />
            </li>
          ))}
        </ul>
      </section>

      {/* Research areas */}
      <section className="relative mt-32 overflow-hidden border-y hairline" aria-labelledby="areas-heading">
        <Image
          src="/images/standards-vials-macro.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[70%_center] opacity-55"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.94)_38%,rgba(5,5,5,0.55)_70%,rgba(5,5,5,0.3)_100%)]" />
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div data-reveal>
            <SectionLabel index="02" align="start">Disciplines</SectionLabel>
            <h2 id="areas-heading" className="mt-8 font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[0.02em] text-ivory">
              Five areas of
              <span className="block font-serif font-normal text-gold-100 italic">research</span>
            </h2>
            <p className="mt-6 max-w-md leading-7 text-stone">
              The catalog is organised by research pathway — a way to navigate the materials, not a
              statement about what they do.
            </p>
          </div>
          <ol className="divide-y divide-gold-400/15 border-y hairline" data-reveal>
            {CATEGORIES.map((category, index) => {
              const n = products.filter((product) => product.categories.includes(category.id)).length;
              return (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${category.id}`}
                    className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-6 transition-colors hover:bg-gold-400/5 sm:px-4"
                  >
                    <span className="font-display text-sm text-ash transition-colors group-hover:text-gold-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display text-xl tracking-[0.04em] text-ivory transition-colors group-hover:text-gold-100 sm:text-2xl">
                        {category.label}
                      </span>
                      <span className="mt-1.5 block text-sm leading-6 text-stone">{category.description}</span>
                    </span>
                    <span className="text-xs tracking-[0.18em] text-gold-300 uppercase">
                      {n}
                      <span className="ml-2 inline-block transition-transform duration-500 group-hover:translate-x-1" aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Tier pricing */}
      {tierExample && tierVariant ? (
        <section className="mx-auto max-w-[1320px] px-5 pt-32 sm:px-8" aria-labelledby="tiers-heading">
          <div className="text-center" data-reveal>
            <SectionLabel index="03">Pack pricing</SectionLabel>
            <h2 id="tiers-heading" className="mx-auto mt-8 max-w-3xl font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[0.02em] text-ivory">
              Built for <span className="font-serif font-normal text-gold-100 italic">volume</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-stone">
              Every strength comes in three pack sizes. Shown here with {tierExample.name}{" "}
              {tierVariant.label}; each product page lists its own pack prices.
            </p>
          </div>
          <div className="mt-14 grid gap-px border hairline bg-gold-400/15 md:grid-cols-3">
            {PACK_SIZES.map((size, index) => {
              const savings = packSavingsPercent(tierVariant, size);
              return (
                <div
                  key={size}
                  data-reveal
                  style={{ "--reveal-delay": `${index * 110}ms` } as React.CSSProperties}
                  className={`ambient-panel relative bg-onyx px-8 py-12 text-center ${size === 10 ? "bg-[radial-gradient(ellipse_at_top,#241c11_0%,#0c0b09_70%)]" : ""}`}
                >
                  {size === 10 ? (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-300 px-3 py-1 text-[0.5625rem] font-semibold tracking-[0.24em] text-void uppercase">
                      Best value
                    </span>
                  ) : null}
                  <p className="font-display text-6xl text-gilt">{size}</p>
                  <p className="mt-2 text-[0.625rem] tracking-[0.3em] text-stone uppercase">
                    {size === 1 ? "Vial" : "Vial pack"}
                  </p>
                  <p className="mt-8 font-display text-3xl text-ivory tabular-nums">
                    {formatCents(packPriceCents(tierVariant, size), { compact: true })}
                  </p>
                  <p className="mt-2 text-sm text-stone tabular-nums">
                    {formatCents(perVialCents(tierVariant, size), { compact: true })} per vial
                  </p>
                  <p className={`mt-5 text-xs tracking-[0.2em] uppercase ${savings ? "text-gold-100" : "text-ash"}`}>
                    {savings ? `Save ${savings}%` : "Single"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Story */}
      <section className="mx-auto mt-32 grid max-w-[1320px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20" aria-labelledby="story-heading">
        <div className="relative" data-reveal>
          <div className="relative aspect-[4/5] overflow-hidden border hairline">
            <Image
              src="/images/training-portrait.jpg"
              alt="Athlete training with battle ropes under warm gold light"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
          </div>
          <HelixGlyph className="absolute -right-3 -bottom-8 h-28 w-8 opacity-80 lg:-right-6" />
        </div>
        <div data-reveal>
          <SectionLabel index="04" align="start">Build better biology</SectionLabel>
          <h2 id="story-heading" className="mt-8 font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[0.02em] text-ivory">
            Discipline,
            <span className="block font-serif font-normal text-gold-100 italic">in every detail</span>
          </h2>
          <div className="mt-8 space-y-5 text-[1.02rem] leading-8 text-parchment">
            <p>
              Serious research starts with knowing exactly what you ordered, what you paid and where
              it is. Bio Build is built around that clarity: plain-language listings, pack pricing you
              can see before checkout, and an order page that follows every step.
            </p>
            <p className="text-stone">
              Every product is sold strictly for laboratory research. We say so on every page, at
              checkout, and on every label.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/about" className="btn-ghost">About Bio Build</Link>
            <Link href="/research-use" className="text-[0.6875rem] tracking-[0.24em] text-gold-300 uppercase underline-offset-8 hover:underline self-center px-2">
              Research use policy
            </Link>
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className="mx-auto max-w-[1320px] px-5 pt-32 sm:px-8" aria-labelledby="steps-heading">
        <div data-reveal>
          <SectionLabel index="05">Ordering</SectionLabel>
          <h2 id="steps-heading" className="mt-8 text-center font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] tracking-[0.02em] text-ivory">
            Four steps, <span className="font-serif font-normal text-gold-100 italic">fully tracked</span>
          </h2>
        </div>
        <ol className="mt-14 grid gap-px border hairline bg-gold-400/15 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              data-reveal
              style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
              className="bg-void p-8"
            >
              <span className="font-display text-sm text-gold-400">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-2xl tracking-[0.05em] text-ivory">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="relative mx-auto mt-32 mb-28 max-w-[1320px] px-5 sm:px-8" aria-labelledby="cta-heading">
        <div className="ambient-panel relative overflow-hidden border hairline bg-[radial-gradient(ellipse_at_center,#1e1810_0%,#050505_70%)] px-6 py-24 text-center" data-reveal>
          <div className="closing-helix" aria-hidden>
            <SpinningHelix span={0.8} rungs={10} />
          </div>
          <div className="relative">
            <HelixRule className="mx-auto max-w-xs" />
            <h2 id="cta-heading" className="mt-10 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[0.03em] text-gilt">
              Build better biology
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-7 text-parchment">
              Explore the full catalog of research compounds and laboratory supplies.
            </p>
            <Link href="/shop" className="btn-gold mt-10">
              Enter the catalog <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
