import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelixRule, SectionLabel } from "@/components/brand";
import { MoleculeViewer } from "@/components/molecule-viewer";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { getCategory } from "@/lib/catalog-data";
import { getProductBySlug, listProducts, lowestPrice } from "@/lib/catalog";
import { parseMolecules } from "@/lib/molecules";
import { formatCents } from "@/lib/pricing";
import { BRAND, getSiteUrl, RUO_NOTICE, SHIPPING } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.classification}`,
    description: `${product.summary} From ${formatCents(lowestPrice(product))}. For research use only.`,
    alternates: { canonical: `/shop/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProductBySlug(slug), listProducts()]);
  if (!product) notFound();

  const categories = product.categories
    .map((id) => getCategory(id))
    .filter((category) => category !== undefined);
  const related = all
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.categories.some((id) => product.categories.includes(id)),
    )
    .slice(0, 4);
  const molecules = parseMolecules(product.molecules);
  const coas = product.variants.filter((variant) => variant.coaUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    brand: { "@type": "Brand", name: BRAND.name },
    url: `${getSiteUrl()}/shop/${product.slug}`,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      name: `${product.name} ${variant.label}`,
      priceCurrency: "USD",
      price: (variant.priceCents / 100).toFixed(2),
      availability:
        variant.stock !== null && variant.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    })),
  };

  return (
    <div className="mx-auto max-w-[1320px] px-5 pb-28 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="pt-8 pb-10 text-[0.6875rem] tracking-[0.2em] text-ash uppercase">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="hover:text-gold-100">Shop</Link>
          </li>
          {categories[0] ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link href={`/shop?category=${categories[0].id}`} className="hover:text-gold-100">
                  {categories[0].label}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden>/</li>
          <li className="text-parchment" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <ProductPurchase
        product={product}
        intro={
          <header>
            <p className="eyebrow">{categories.map((category) => category.label).join(" · ")}</p>
            <h1 className="mt-4 font-display text-[clamp(2.3rem,5vw,3.9rem)] leading-[1.02] tracking-[0.02em] text-ivory">
              {product.name}
            </h1>
            <p className="mt-3 font-serif text-2xl leading-snug text-gold-100 italic">
              {product.classification}
            </p>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-8 text-parchment">{product.summary}</p>
            {product.composition ? (
              <p className="mt-4 text-sm tracking-[0.06em] text-stone">
                <span className="mr-2 text-[0.625rem] tracking-[0.24em] text-gold-300 uppercase">
                  Composition
                </span>
                {product.composition}
              </p>
            ) : null}
          </header>
        }
      >
        <div className="mt-10 border hairline bg-onyx p-5">
          <p className="eyebrow text-[0.625rem]">Research use only</p>
          <p className="mt-2 text-xs leading-6 text-stone">{RUO_NOTICE}</p>
        </div>

        <dl className="mt-8 divide-y divide-gold-400/10 border-y hairline text-sm">
          <div className="flex justify-between gap-6 py-4">
            <dt className="text-stone">Strengths</dt>
            <dd className="text-right text-parchment">
              {product.variants.map((variant) => variant.label).join(" · ")}
            </dd>
          </div>
          <div className="flex justify-between gap-6 py-4">
            <dt className="text-stone">Storage</dt>
            <dd className="max-w-[18rem] text-right text-parchment">
              Follow the conditions printed on the vial label
            </dd>
          </div>
          <div className="flex justify-between gap-6 py-4">
            <dt className="text-stone">Shipping</dt>
            <dd className="text-right text-parchment">
              {formatCents(SHIPPING.flatRateCents, { compact: true })} flat · free over{" "}
              {formatCents(SHIPPING.freeThresholdCents, { compact: true })}
            </dd>
          </div>
          {coas.length > 0 ? (
            <div className="flex justify-between gap-6 py-4">
              <dt className="text-stone">Certificates</dt>
              <dd className="flex flex-wrap justify-end gap-3 text-right">
                {coas.map((variant) => (
                  <a
                    key={variant.id}
                    href={variant.coaUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-100 underline decoration-gold-400/40 underline-offset-4"
                  >
                    {variant.label} COA
                  </a>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </ProductPurchase>

      {molecules.length > 0 ? (
        <section className="mt-28" aria-labelledby="structure-heading" data-reveal>
          <SectionLabel align="start">Structure</SectionLabel>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-end">
            <h2 id="structure-heading" className="font-display text-3xl tracking-[0.03em] text-ivory sm:text-4xl">
              Molecular <span className="font-serif font-normal text-gold-100 italic">model</span>
            </h2>
            <p className="max-w-xl text-sm leading-7 text-stone lg:justify-self-end">
              Interactive structure rendered from public structural data for reference. Drag to
              rotate, scroll or pinch to zoom.
            </p>
          </div>
          <div className="mt-8">
            <MoleculeViewer molecules={molecules} />
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-28" aria-labelledby="related-heading">
          <HelixRule className="mb-14" />
          <div className="flex items-end justify-between gap-6">
            <h2 id="related-heading" className="font-display text-2xl tracking-[0.04em] text-ivory sm:text-3xl">
              Related research
            </h2>
            <Link href="/shop" className="text-[0.6875rem] tracking-[0.24em] text-gold-300 uppercase hover:text-gold-100">
              Full catalog →
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
