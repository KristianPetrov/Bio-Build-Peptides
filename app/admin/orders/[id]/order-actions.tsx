"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import type { OrderStatus } from "@/db/schema";
import {
  cancelOrder,
  markOrderPaid,
  markOrderShipped,
  saveOrderNotes,
  type AdminState,
} from "../../actions";

const CARRIERS = ["USPS", "UPS", "FedEx", "DHL"];

export function OrderActions({
  orderId,
  status,
  carrier,
  trackingNumber,
  adminNotes,
  reference,
}: {
  orderId: string;
  status: OrderStatus;
  carrier: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  reference: string;
}) {
  const [pending, startTransition] = useTransition();
  const [shipState, shipAction, shipping] = useActionState<AdminState, FormData>(
    markOrderShipped.bind(null, orderId),
    {},
  );
  const [notesState, notesAction, savingNotes] = useActionState<AdminState, FormData>(
    saveOrderNotes.bind(null, orderId),
    {},
  );

  return (
    <aside className="space-y-6">
      {status === "pending_payment" ? (
        <div className="panel p-5">
          <p className="eyebrow">Payment</p>
          <p className="mt-2 text-sm leading-6 text-stone">
            Confirm a payment with memo <span className="text-gold-100">{reference}</span> and the exact total arrived before marking paid.
          </p>
          <button
            type="button"
            className="btn-gold mt-4 w-full"
            disabled={pending}
            onClick={() => startTransition(async () => void (await markOrderPaid(orderId)))}
          >
            Mark as paid
          </button>
        </div>
      ) : null}

      {status === "paid" || status === "shipped" ? (
        <form action={shipAction} className="panel space-y-4 p-5">
          <p className="eyebrow">{status === "shipped" ? "Update tracking" : "Ship order"}</p>
          <div>
            <label htmlFor="carrier" className="label">Carrier</label>
            <select id="carrier" name="carrier" defaultValue={carrier ?? "USPS"} className="field">
              {CARRIERS.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="trackingNumber" className="label">Tracking number</label>
            <input id="trackingNumber" name="trackingNumber" defaultValue={trackingNumber ?? ""} className="field" required />
          </div>
          {shipState.message ? <p role="status" className={`text-xs ${shipState.ok ? "text-sage" : "text-ember"}`}>{shipState.message}</p> : null}
          <button type="submit" className="btn-gold w-full" disabled={shipping}>
            {status === "shipped" ? "Save tracking" : "Mark as shipped"}
          </button>
        </form>
      ) : null}

      <form action={notesAction} className="panel space-y-3 p-5">
        <label htmlFor="adminNotes" className="eyebrow block">Internal notes</label>
        <textarea id="adminNotes" name="adminNotes" defaultValue={adminNotes ?? ""} rows={4} className="field" />
        {notesState.message ? <p role="status" className="text-xs text-sage">{notesState.message}</p> : null}
        <button type="submit" className="btn-ghost w-full" disabled={savingNotes}>Save notes</button>
      </form>

      <div className="flex flex-col gap-3">
        <Link href={`/order/${reference}`} className="btn-ghost w-full" target="_blank">
          View customer page
        </Link>
        {status !== "cancelled" && status !== "shipped" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Cancel ${reference}? Reserved inventory will be restored.`)) {
                startTransition(async () => void (await cancelOrder(orderId)));
              }
            }}
            className="min-h-11 border border-ember/40 text-[0.6875rem] tracking-[0.22em] text-ember uppercase transition-colors hover:bg-ember/10"
          >
            Cancel order
          </button>
        ) : null}
      </div>
    </aside>
  );
}
