"use client";

import { useActionState, useTransition } from "react";
import { createCode, createPartner, toggleCode, togglePartner, type AdminState } from "../actions";

export function PartnerForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(createPartner, {});
  return (
    <form action={action} className="panel space-y-4 p-5">
      <p className="eyebrow">New partner</p>
      <div>
        <label htmlFor="partner-name" className="label">Name</label>
        <input id="partner-name" name="name" required className="field" />
      </div>
      <div>
        <label htmlFor="partner-email" className="label">Email (optional)</label>
        <input id="partner-email" name="email" type="email" className="field" />
      </div>
      <div>
        <label htmlFor="partner-notes" className="label">Notes (optional)</label>
        <input id="partner-notes" name="notes" className="field" />
      </div>
      {state.message ? <p role="status" className={`text-xs ${state.ok ? "text-sage" : "text-ember"}`}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="btn-ghost w-full">Create partner</button>
    </form>
  );
}

export function CodeForm({ partners }: { partners: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(createCode, {});
  return (
    <form action={action} className="panel space-y-4 p-5">
      <p className="eyebrow">New code</p>
      <div>
        <label htmlFor="code-partner" className="label">Partner</label>
        <select id="code-partner" name="partnerId" className="field">
          {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="code-code" className="label">Code</label>
        <input id="code-code" name="code" required className="field uppercase" placeholder="BUILD10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="code-type" className="label">Type</label>
          <select id="code-type" name="discountType" className="field">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed $</option>
          </select>
        </div>
        <div>
          <label htmlFor="code-value" className="label">Value</label>
          <input id="code-value" name="discountValue" inputMode="decimal" required className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="code-min" className="label">Minimum subtotal $ (optional)</label>
        <input id="code-min" name="minSubtotal" inputMode="decimal" className="field" />
      </div>
      {state.message ? <p role="status" className={`text-xs ${state.ok ? "text-sage" : "text-ember"}`}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="btn-gold w-full">Create code</button>
    </form>
  );
}

export function ToggleButton({ kind, id, active }: { kind: "code" | "partner"; id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (kind === "code") await toggleCode(id, !active);
          else await togglePartner(id, !active);
        })
      }
      className={`border px-3 py-1.5 text-[0.5625rem] tracking-[0.2em] uppercase ${active ? "border-sage/50 text-sage" : "border-ember/40 text-ember"}`}
      aria-label={`${active ? "Deactivate" : "Activate"} ${kind}`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
