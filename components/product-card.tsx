import Link from "next/link";
import { getCategory } from "@/lib/catalog-data";
import type { StoreProduct } from "@/lib/catalog";
import { ProductCardPurchase } from "./product-card-purchase";
import { Vial } from "./vial";

export function ProductCard({
  product,
  priority = false,
  index,
}: {
  product: StoreProduct;
  priority?: boolean;
  index?: number;
}) {
  const first = product.variants.find((variant) => variant.stock === null || variant.stock > 0)
    ?? product.variants[0];
  const soldOut = product.variants.every(
    (variant) => variant.stock !== null && variant.stock <= 0,
  );
  const category = getCategory(product.categories[0] ?? "");

  return (
    <article className="product-card group relative flex h-full flex-col border hairline bg-onyx">
      <Link href={`/shop/${product.slug}`} className="product-card-link block" aria-label={`View ${product.name}`}>
        <div className="product-stage relative isolate overflow-hidden">
          <span className="product-halo" aria-hidden />
          <span className="product-floor" aria-hidden />
          {typeof index === "number" ? (
            <span className="absolute top-5 left-5 z-10 font-display text-xs tracking-[0.14em] text-ash">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          {soldOut ? (
            <span className="absolute top-5 right-5 z-10 border border-ember/40 px-2 py-1 text-[0.5625rem] tracking-[0.22em] text-ember uppercase">
              Sold out
            </span>
          ) : null}
          <Vial
            name={product.name}
            strength={product.variants.length === 1 && first.label.length <= 14 ? first.label : undefined}
            container={first.container}
            priority={priority}
            sizes="(max-width: 600px) 90vw, (max-width: 1280px) 46vw, 32vw"
            className="product-vial"
          />
        </div>
        <div className="px-6 pt-6">
          {category ? (
            <p className="text-[0.625rem] tracking-[0.24em] text-stone uppercase">{category.label}</p>
          ) : null}
          <h3 className="mt-2 font-display text-xl tracking-[0.04em] text-ivory transition-colors group-hover:text-gold-100">
            {product.name}
          </h3>
          <p className="mt-1 font-serif text-[1.15rem] leading-snug text-parchment/85 italic">
            {product.classification}
          </p>
        </div>
      </Link>
      <ProductCardPurchase product={{ slug: product.slug, name: product.name, variants: product.variants }} />
    </article>
  );
}
