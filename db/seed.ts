/**
 * Seeds the catalog from lib/catalog-data.ts. Idempotent: existing products and
 * variants are left untouched so admin edits (prices, stock, visibility) survive.
 *   pnpm db:seed
 */
import { and, eq } from "drizzle-orm";
import { CATALOG } from "../lib/catalog-data";
import { getDb } from "./index";
import { products, productVariants } from "./schema";

async function main() {
  const db = getDb();
  let createdProducts = 0;
  let createdVariants = 0;

  for (const [productIndex, item] of CATALOG.entries()) {
    const [inserted] = await db
      .insert(products)
      .values({
        slug: item.slug,
        name: item.name,
        classification: item.classification,
        summary: item.summary,
        composition: item.composition ?? null,
        categories: item.categories,
        molecules: item.molecules,
        featured: item.featured ?? false,
        sortOrder: productIndex,
      })
      .onConflictDoNothing({ target: products.slug })
      .returning({ id: products.id });

    if (inserted) createdProducts += 1;

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, item.slug));

    for (const [variantIndex, variant] of item.variants.entries()) {
      const [existing] = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(
          and(
            eq(productVariants.productId, product.id),
            eq(productVariants.label, variant.label),
          ),
        );
      if (existing) continue;

      await db.insert(productVariants).values({
        productId: product.id,
        label: variant.label,
        priceCents: variant.priceCents,
        pack5Cents: variant.pack5Cents,
        pack10Cents: variant.pack10Cents,
        volumePricing: variant.volumePricing,
        container: variant.container,
        stock: null,
        sortOrder: variantIndex,
      });
      createdVariants += 1;
    }
  }

  console.log(
    `Seed complete: ${createdProducts} products and ${createdVariants} variants created (${CATALOG.length} products in catalog).`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
