"use client";

import { useActionState } from "react";
import { updateProductFlags, updateVariant, type AdminState } from "../actions";

type VariantValues = {
  id: string;
  label: string;
  price: string;
  pack5: string;
  pack10: string;
  stock: string;
  coaUrl: string;
  active: boolean;
};

const input = "field min-h-10 px-2.5 py-1.5 text-sm";

export function VariantForm({ variant }: { variant: VariantValues }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    updateVariant.bind(null, variant.id),
    {},
  );
  const id = (name: string) => `${variant.id}-${name}`;
  return (
    <form action={action} className="grid grid-cols-[1.2fr_repeat(4,0.8fr)_1.6fr_0.6fr_0.8fr] items-center gap-3 px-5 py-3">
      <span className="text-sm text-parchment">{variant.label}</span>
      <label className="sr-only" htmlFor={id("price")}>{variant.label} single price</label>
      <input id={id("price")} name="price" inputMode="decimal" defaultValue={variant.price} className={input} required />
      <label className="sr-only" htmlFor={id("pack5")}>{variant.label} 5-pack price</label>
      <input id={id("pack5")} name="pack5" inputMode="decimal" defaultValue={variant.pack5} className={input} />
      <label className="sr-only" htmlFor={id("pack10")}>{variant.label} 10-pack price</label>
      <input id={id("pack10")} name="pack10" inputMode="decimal" defaultValue={variant.pack10} className={input} />
      <label className="sr-only" htmlFor={id("stock")}>{variant.label} stock</label>
      <input id={id("stock")} name="stock" inputMode="numeric" defaultValue={variant.stock} placeholder="untracked" className={input} />
      <label className="sr-only" htmlFor={id("coa")}>{variant.label} COA link</label>
      <input id={id("coa")} name="coaUrl" type="url" defaultValue={variant.coaUrl} placeholder="https://" className={input} />
      <label className="flex items-center gap-2 text-xs text-stone">
        <input type="checkbox" name="active" defaultChecked={variant.active} className="h-4 w-4 accent-[#d9b672]" />
        <span className="sr-only">{variant.label} active</span>On
      </label>
      <span className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="border hairline px-3 py-2 text-[0.625rem] tracking-[0.2em] text-gold-100 uppercase hover:border-gold-300">
          {pending ? "…" : "Save"}
        </button>
        {state.message ? (
          <span role="status" className={`text-[0.6875rem] ${state.ok ? "text-sage" : "text-ember"}`}>{state.message}</span>
        ) : null}
      </span>
    </form>
  );
}

export function ProductFlagsForm({
  productId,
  active,
  featured,
}: {
  productId: string;
  active: boolean;
  featured: boolean;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    updateProductFlags.bind(null, productId),
    {},
  );
  return (
    <form action={action} className="flex items-center gap-5 text-xs text-stone">
      <label className="flex items-center gap-2">
        <input type="checkbox" name="active" defaultChecked={active} className="h-4 w-4 accent-[#d9b672]" /> Visible
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="featured" defaultChecked={featured} className="h-4 w-4 accent-[#d9b672]" /> Featured
      </label>
      <button type="submit" disabled={pending} className="border hairline px-3 py-2 text-[0.625rem] tracking-[0.2em] text-gold-100 uppercase hover:border-gold-300">
        Save
      </button>
      {state.message ? <span role="status" className={state.ok ? "text-sage" : "text-ember"}>{state.message}</span> : null}
    </form>
  );
}
