import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { products, productVariants } from "@/db/schema";
import { ProductFlagsForm, VariantForm } from "./forms";

export const metadata = { title: "Products & stock" };

export default async function AdminProductsPage() {
  const db = getDb();
  const [productRows, variantRows] = await Promise.all([
    db.select().from(products).orderBy(asc(products.sortOrder), asc(products.name)),
    db.select().from(productVariants).orderBy(asc(productVariants.sortOrder)),
  ]);

  return (
    <div>
      <p className="max-w-3xl text-sm leading-6 text-stone">
        Prices are per pack in dollars. Leave <span className="text-parchment">Stock</span> empty to sell
        without inventory tracking; enter a number to track units — checkout reserves vials and
        cancelled orders return them. Leave 5- and 10-pack prices empty to charge 5× / 10× the
        single price.
      </p>
      <ul className="mt-8 space-y-4">
        {productRows.map((product) => {
          const variants = variantRows.filter((variant) => variant.productId === product.id);
          return (
            <li key={product.id} className="border hairline">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-onyx px-5 py-4">
                <div>
                  <p className="font-display text-lg tracking-[0.04em] text-ivory">{product.name}</p>
                  <p className="text-xs text-stone">/{product.slug} · {product.classification}</p>
                </div>
                <ProductFlagsForm productId={product.id} active={product.active} featured={product.featured} />
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[860px] divide-y divide-gold-400/10">
                  <div className="grid grid-cols-[1.2fr_repeat(4,0.8fr)_1.6fr_0.6fr_0.8fr] gap-3 px-5 py-2 text-[0.5625rem] tracking-[0.2em] text-ash uppercase">
                    <span>Strength</span><span>1 vial $</span><span>5-pack $</span><span>10-pack $</span><span>Stock</span><span>COA link (https)</span><span>Active</span><span />
                  </div>
                  {variants.map((variant) => (
                    <VariantForm
                      key={variant.id}
                      variant={{
                        id: variant.id,
                        label: variant.label,
                        price: (variant.priceCents / 100).toFixed(2),
                        pack5: variant.pack5Cents === null ? "" : (variant.pack5Cents / 100).toFixed(2),
                        pack10: variant.pack10Cents === null ? "" : (variant.pack10Cents / 100).toFixed(2),
                        stock: variant.stock === null ? "" : String(variant.stock),
                        coaUrl: variant.coaUrl ?? "",
                        active: variant.active,
                      }}
                    />
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
