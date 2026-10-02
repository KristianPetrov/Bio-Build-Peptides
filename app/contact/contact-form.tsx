"use client";

import { useActionState } from "react";
import { CONTACT_TOPICS } from "@/lib/contact";
import { sendContactMessage, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, {});
  if (state.ok) {
    return (
      <div className="panel p-8" role="status">
        <p className="eyebrow">Message received</p>
        <p className="mt-4 font-serif text-2xl leading-snug text-gold-100 italic">{state.message}</p>
      </div>
    );
  }
  const err = (name: string) => state.errors?.[name];
  const v = state.values ?? {};
  return (
    <form action={action} className="panel space-y-5 p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Name</label>
          <input id="c-name" name="name" required autoComplete="name" defaultValue={v.name} className="field" aria-invalid={err("name") ? true : undefined} aria-describedby={err("name") ? "c-name-error" : undefined} />
          {err("name") ? <p id="c-name-error" className="mt-1.5 text-xs text-ember">{err("name")}</p> : null}
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email</label>
          <input id="c-email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className="field" aria-invalid={err("email") ? true : undefined} aria-describedby={err("email") ? "c-email-error" : undefined} />
          {err("email") ? <p id="c-email-error" className="mt-1.5 text-xs text-ember">{err("email")}</p> : null}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-topic" className="label">Topic</label>
          <select id="c-topic" name="topic" defaultValue={v.topic || CONTACT_TOPICS[0]} className="field">
            {CONTACT_TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="c-ref" className="label">Order ID (optional)</label>
          <input id="c-ref" name="orderReference" defaultValue={v.orderReference} placeholder="BB-XXXXXX" className="field uppercase" />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" required rows={6} defaultValue={v.message} className="field" aria-invalid={err("message") ? true : undefined} aria-describedby={err("message") ? "c-message-error" : undefined} />
        {err("message") ? <p id="c-message-error" className="mt-1.5 text-xs text-ember">{err("message")}</p> : null}
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="c-company">Company</label>
        <input id="c-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && !state.ok ? <p role="alert" className="text-sm text-ember">{state.message}</p> : null}
      <button type="submit" disabled={pending} className="btn-gold w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs leading-5 text-ash">
        We can&apos;t answer questions about dosing, administration or medical use.
      </p>
    </form>
  );
}
