import type { Order, OrderItem } from "@/db/schema";
import { itemDisplayName, ORDER_STATUS_LABELS } from "@/lib/orders";
import { getPaymentInstructions } from "@/lib/payment-methods";
import { formatCents } from "@/lib/pricing";
import { CopyButton } from "./copy-button";

const STEPS: { status: Order["status"]; label: string }[] = [
  { status: "pending_payment", label: "Order placed" },
  { status: "paid", label: "Payment confirmed" },
  { status: "shipped", label: "Shipped" },
];

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <p className="border border-ember/40 bg-ember/5 p-4 text-sm text-ember">
        This order was cancelled{order.cancelledAt ? ` on ${order.cancelledAt.toLocaleDateString("en-US", { dateStyle: "medium" })}` : ""}.
      </p>
    );
  }
  const currentIndex = STEPS.findIndex((step) => step.status === order.status);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step.status} aria-current={index === currentIndex ? "step" : undefined}>
            <span className={`block h-px ${done ? "bg-gradient-to-r from-gold-600 to-gold-100" : "bg-gold-400/15"}`} />
            <span className={`mt-3 block text-[0.625rem] tracking-[0.2em] uppercase sm:text-[0.6875rem] ${done ? "text-gold-100" : "text-ash"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function PaymentPanel({ order }: { order: Order }) {
  const pay = getPaymentInstructions(order.paymentMethod, order.totalCents, order.reference);
  return (
    <section className="panel p-6 sm:p-8" aria-labelledby="pay-heading">
      <p className="eyebrow">Next step</p>
      <h2 id="pay-heading" className="mt-3 font-display text-2xl tracking-[0.04em] text-ivory">
        Pay with {pay.label}
      </h2>
      {!pay.configured ? (
        <p className="mt-4 border border-ember/40 bg-ember/5 p-3 text-xs leading-5 text-ember">
          Preview only — no payment destination is configured for {pay.label}. Do not send payment.
        </p>
      ) : null}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="border hairline p-4">
          <dt className="label">Amount</dt>
          <dd className="flex items-center justify-between gap-3">
            <span className="font-display text-2xl text-gilt tabular-nums">{formatCents(order.totalCents)}</span>
            <CopyButton value={(order.totalCents / 100).toFixed(2)} />
          </dd>
        </div>
        <div className="border hairline p-4">
          <dt className="label">Memo / note</dt>
          <dd className="flex items-center justify-between gap-3">
            <span className="font-display text-xl tracking-[0.08em] text-gold-100">{order.reference}</span>
            <CopyButton value={order.reference} />
          </dd>
        </div>
        {pay.destination ? (
          <div className="border hairline p-4 sm:col-span-2">
            <dt className="label">{pay.destination.label}</dt>
            <dd className="flex items-center justify-between gap-3">
              <span className="break-all text-lg text-ivory">{pay.destination.value}</span>
              <CopyButton value={pay.destination.value} />
            </dd>
          </div>
        ) : null}
      </dl>
      <ol className="mt-6 space-y-2.5 text-sm leading-6 text-parchment">
        {pay.steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="font-display text-gold-300">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {pay.actionUrl ? (
        <a href={pay.actionUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-7 w-full sm:w-auto">
          {pay.actionLabel}
        </a>
      ) : null}
      <p className="mt-5 text-xs leading-5 text-ash">
        We match payments by order ID and amount, then mark your order paid and prepare it for
        shipment.
      </p>
    </section>
  );
}

export function OrderSummary({ order, items }: { order: Order; items: OrderItem[] }) {
  const address = order.shippingAddress;
  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="eyebrow">Items</h2>
        <ul className="mt-4 divide-y divide-gold-400/10 border-y hairline">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3.5 text-sm">
              <span className="text-parchment">
                {itemDisplayName(item)} <span className="text-stone">× {item.quantity}</span>
              </span>
              <span className="text-ivory tabular-nums">{formatCents(item.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone"><dt>Subtotal</dt><dd className="tabular-nums">{formatCents(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 ? (
            <div className="flex justify-between text-sage"><dt>Referral {order.referralCode}</dt><dd className="tabular-nums">−{formatCents(order.discountCents)}</dd></div>
          ) : null}
          <div className="flex justify-between text-stone"><dt>Shipping</dt><dd className="tabular-nums">{order.shippingCents ? formatCents(order.shippingCents) : "Free"}</dd></div>
          <div className="flex justify-between border-t hairline pt-3 text-ivory"><dt>Total</dt><dd className="font-display text-xl text-gilt tabular-nums">{formatCents(order.totalCents)}</dd></div>
        </dl>
      </section>
      <section aria-labelledby="ship-heading">
        <h2 id="ship-heading" className="eyebrow">Ships to</h2>
        <address className="mt-4 text-sm leading-7 text-parchment not-italic">
          {address.fullName}<br />
          {address.address1}<br />
          {address.address2 ? <>{address.address2}<br /></> : null}
          {address.city}, {address.state} {address.postalCode}
        </address>
        <p className="mt-3 text-sm text-stone">{order.email}</p>
        <p className="mt-6 text-xs tracking-[0.18em] text-ash uppercase">Status</p>
        <p className="mt-1 text-sm text-gold-100">{ORDER_STATUS_LABELS[order.status]}</p>
        {order.trackingNumber ? (
          <p className="mt-3 text-sm text-parchment">
            {order.carrier ? `${order.carrier} · ` : ""}
            <span className="tracking-[0.06em]">{order.trackingNumber}</span>
          </p>
        ) : null}
      </section>
    </div>
  );
}
