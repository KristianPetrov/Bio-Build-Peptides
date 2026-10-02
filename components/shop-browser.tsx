"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { CATEGORIES } from "@/lib/catalog-data";

export type BrowsableProduct = {
  slug: string;
  name: string;
  classification: string;
  categories: string[];
  fromCents: number;
  sortOrder: number;
};

type Sort = "featured" | "name" | "price-asc" | "price-desc";

export function ShopBrowser({
  products,
  cards,
}: {
  products: BrowsableProduct[];
  /** Pre-rendered server cards keyed by slug. */
  cards: Record<string, ReactNode>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category") ?? "all";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("featured");
  const deferredQuery = useDeferredValue(query);

  function setCategory(next: string) {
    const search = new URLSearchParams(params.toString());
    if (next === "all") search.delete("category");
    else search.set("category", next);
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const filtered = products.filter(
      (product) =>
        (category === "all" || product.categories.includes(category)) &&
        (!needle ||
          product.name.toLowerCase().includes(needle) ||
          product.classification.toLowerCase().includes(needle)),
    );
    return filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price-asc") return a.fromCents - b.fromCents;
      if (sort === "price-desc") return b.fromCents - a.fromCents;
      return a.sortOrder - b.sortOrder;
    });
  }, [products, category, deferredQuery, sort]);

  const tabs = [{ id: "all", label: "All" }, ...CATEGORIES];
  const counts = (id: string) =>
    id === "all"
      ? products.length
      : products.filter((product) => product.categories.includes(id)).length;

  return (
    <div>
      <div className="sticky top-[4.5rem] z-30 -mx-5 border-y hairline bg-void/90 px-5 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4 py-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div
            className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]"
            role="tablist"
            aria-label="Filter by research area"
          >
            {tabs.map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(tab.id)}
                  className={`shrink-0 border px-4 py-2.5 text-[0.6875rem] tracking-[0.2em] whitespace-nowrap uppercase transition-colors ${
                    active
                      ? "border-gold-300 bg-gold-400/10 text-gold-100"
                      : "border-transparent text-stone hover:text-parchment"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-ash">{counts(tab.id)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <label className="relative flex-1 sm:max-w-sm 2xl:w-64 2xl:flex-none">
              <span className="sr-only">Search the catalog</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search compounds"
                className="field min-h-11 pl-10"
              />
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
            </label>
            <label>
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="field min-h-11 w-auto text-sm"
              >
                <option value="featured">Catalog order</option>
                <option value="name">Name A–Z</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs tracking-[0.2em] text-stone uppercase" aria-live="polite">
        {visible.length} {visible.length === 1 ? "compound" : "compounds"}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-5 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <li key={product.slug}>{cards[product.slug]}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 border hairline px-6 py-20 text-center">
          <p className="font-serif text-3xl text-gold-100 italic">No matches.</p>
          <p className="mt-3 text-sm text-stone">Try another search term or research area.</p>
          <button
            type="button"
            className="btn-ghost mt-8"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
