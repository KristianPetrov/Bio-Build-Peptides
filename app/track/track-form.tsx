"use client";

import { useActionState } from "react";
import { trackOrder, type TrackState } from "./actions";

export function TrackForm() {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackOrder, {});
  return (
    <form action={action} className="panel space-y-5 p-6 sm:p-8" noValidate>
      <div>
        <label htmlFor="reference" className="label">Order ID</label>
        <input
          id="reference"
          name="reference"
          required
          defaultValue={state.reference}
          placeholder="BB-XXXXXX"
          autoComplete="off"
          className="field uppercase"
          aria-describedby={state.message ? "track-error" : undefined}
        />
      </div>
      <div>
        <label htmlFor="track-email" className="label">Email</label>
        <input
          id="track-email"
          name="email"
          type="email"
          required
          defaultValue={state.email}
          autoComplete="email"
          className="field"
          aria-describedby={state.message ? "track-error" : undefined}
        />
      </div>
      {state.message ? (
        <p id="track-error" role="alert" className="text-sm text-ember">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-gold w-full">
        {pending ? "Looking up…" : "Find my order"}
      </button>
    </form>
  );
}
