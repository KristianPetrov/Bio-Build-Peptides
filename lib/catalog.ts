import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { products, productVariants } from "@/db/schema";

export type StoreVariant = {
  id: string;
  label: string;
  priceCents: number;
  pack5Cents: number | null;
  pack10Cents: number | null;
  volumePricing: boolean;
  container: "vial_3ml" | "vial_10ml";
  /** Units available; `null` when inventory is not tracked. */
  stock: number | null;
  coaUrl: string | null;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  classification: string;
  summary: string;
  composition: string | null;
  categories: string[];
  molecules: string[];
  featured: boolean;
  variants: StoreVariant[];
};

type Options = { includeInactive?: boolean };

export async function listProducts(options: Options = {}): Promise<StoreProduct[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select({ product: products, variant: productVariants })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .orderBy(asc(products.sortOrder), asc(products.name), asc(productVariants.sortOrder));

  const map = new Map<string, StoreProduct>();
  for (const { product, variant } of rows) {
    if (!options.includeInactive && (!product.active || !variant.active)) continue;
    let entry = map.get(product.id);
    if (!entry) {
      entry = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        classification: product.classification,
        summary: product.summary,
        composition: product.composition,
        categories: product.categories,
        molecules: product.molecules,
        featured: product.featured,
        variants: [],
      };
      map.set(product.id, entry);
    }
    entry.variants.push({
      id: variant.id,
      label: variant.label,
      priceCents: variant.priceCents,
      pack5Cents: variant.pack5Cents,
      pack10Cents: variant.pack10Cents,
      volumePricing: variant.volumePricing,
      container: variant.container,
      stock: variant.stock,
      coaUrl: variant.coaUrl,
    });
  }
  return [...map.values()];
}

export async function getProductBySlug(slug: string) {
  const all = await listProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export function lowestPrice(product: StoreProduct) {
  return Math.min(...product.variants.map((variant) => variant.priceCents));
}

export function isSoldOut(product: StoreProduct) {
  return product.variants.every(
    (variant) => variant.stock !== null && variant.stock <= 0,
  );
}
