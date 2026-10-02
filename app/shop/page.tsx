import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionLabel } from "@/components/brand";
import { ProductCard } from "@/components/product-card";
import { ShopBrowser } from "@/components/shop-browser";
import { listProducts, lowestPrice } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop the catalog",
  description:
    "Research peptides and laboratory supplies in 1, 5 and 10-vial packs. For research use only.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await listProducts();
  const cards = Object.fromEntries(
    products.map((product, index) => [
      product.slug,
      <ProductCard key={product.slug} product={product} priority={index < 4} />,
    ]),
  );

  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-28 sm:px-8">
      <header className="pt-14 pb-12 sm:pt-20">
        <SectionLabel align="start">The catalog</SectionLabel>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] tracking-[0.02em] text-ivory">
            Research <span className="text-gilt">compounds</span>
            <span className="block font-serif text-[0.72em] font-normal tracking-normal text-parchment italic">
              &amp; laboratory supplies
            </span>
          </h1>
          <p className="max-w-md text-[0.975rem] leading-7 text-stone lg:justify-self-end">
            Every strength is offered as a single vial or as a 5- or 10-vial pack. Loose vials of
            the same strength are re-priced at the pack rate automatically in your cart.
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="h-24 border-y hairline" />}>
        <ShopBrowser
          cards={cards}
          products={products.map((product, index) => ({
            slug: product.slug,
            name: product.name,
            classification: product.classification,
            categories: product.categories,
            fromCents: lowestPrice(product),
            sortOrder: index,
          }))}
        />
      </Suspense>
    </div>
  );
}
