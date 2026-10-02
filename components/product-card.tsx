import Link from "next/link";
import { getCategory } from "@/lib/catalog-data";
import { formatCents } from "@/lib/pricing";
import type { StoreProduct } from "@/lib/catalog";
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
  const first = product.variants[0];
  const from = Math.min(...product.variants.map((variant) => variant.priceCents));
  const soldOut = product.variants.every(
    (variant) => variant.stock !== null && variant.stock <= 0,
  );
  const category = getCategory(product.categories[0] ?? "");

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden border hairline bg-onyx transition-[border-color,transform] duration-500 ease-[var(--ease-gild)] hover:-translate-y-1 hover:border-gold-400/50"
    >
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_62%,#2a2116_0%,#0c0b09_62%)] px-[14%] pt-6">
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse at 50% 55%, rgba(217,182,114,0.18) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        {typeof index === "number" ? (
          <span className="absolute top-4 left-4 font-display text-xs tracking-[0.14em] text-ash">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        {soldOut ? (
          <span className="absolute top-4 right-4 border border-ember/40 px-2 py-1 text-[0.5625rem] tracking-[0.22em] text-ember uppercase">
            Sold out
          </span>
        ) : null}
        <Vial
          name={product.name}
          strength={product.variants.length === 1 && first.label.length <= 14 ? first.label : undefined}
          container={first.container}
          priority={priority}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 22vw"
          className="transition-transform duration-700 ease-[var(--ease-gild)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col border-t hairline p-5">
        {category ? (
          <p className="text-[0.625rem] tracking-[0.24em] text-stone uppercase">
            {category.label}
          </p>
        ) : null}
        <h3 className="mt-2 font-display text-lg tracking-[0.04em] text-ivory transition-colors group-hover:text-gold-100">
          {product.name}
        </h3>
        <p className="mt-1 font-serif text-[1.05rem] leading-snug text-parchment/85 italic">
          {product.classification}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-xs text-stone">
            {product.variants.length > 1
              ? `${product.variants.length} strengths`
              : first.label}
          </p>
          <p className="text-sm text-gold-100 tabular-nums">
            <span className="mr-1 text-[0.625rem] tracking-[0.2em] text-ash uppercase">
              {product.variants.length > 1 ? "From" : ""}
            </span>
            {formatCents(from, { compact: true })}
          </p>
        </div>
      </div>
    </Link>
  );
}
