import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { itemDisplayName } from "@/lib/orders";
import { formatCents } from "@/lib/pricing";
import { StatusBadge } from "../../status-badge";
import { OrderActions } from "./order-actions";

export const metadata = { title: "Order" };

const METHOD_LABELS = { zelle: "Zelle", venmo: "Venmo", cashapp: "Cash App", paylink: "Pay link" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const address = order.shippingAddress;
  const when = (date: Date | null) =>
    date ? date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div>
      <Link href="/admin" className="text-[0.6875rem] tracking-[0.2em] text-stone uppercase hover:text-gold-100">← All orders</Link>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <h2 className="font-display text-3xl tracking-[0.06em] text-ivory">{order.reference}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-stone">
        Placed {when(order.createdAt)} · Pays by {METHOD_LABELS[order.paymentMethod]} · Total{" "}
        <span className="text-gold-100">{formatCents(order.totalCents)}</span>
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <section>
            <h3 className="eyebrow">Items</h3>
            <ul className="mt-4 divide-y divide-gold-400/10 border-y hairline text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-3">
                  <span className="text-parchment">
                    {itemDisplayName(item)} <span className="text-stone">× {item.quantity}</span>
                    {item.reservedUnits > 0 ? <span className="ml-2 text-xs text-ash">({item.reservedUnits} reserved)</span> : null}
                  </span>
                  <span className="tabular-nums">{formatCents(item.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone"><dt>Subtotal</dt><dd>{formatCents(order.subtotalCents)}</dd></div>
              {order.discountCents ? <div className="flex justify-between text-sage"><dt>Referral {order.referralCode}</dt><dd>−{formatCents(order.discountCents)}</dd></div> : null}
              <div className="flex justify-between text-stone"><dt>Shipping</dt><dd>{order.shippingCents ? formatCents(order.shippingCents) : "Free"}</dd></div>
              <div className="flex justify-between text-ivory"><dt>Total</dt><dd className="text-gold-100">{formatCents(order.totalCents)}</dd></div>
            </dl>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow">Ship to</h3>
              <address className="mt-3 text-sm leading-7 text-parchment not-italic">
                {address.fullName}<br />{address.address1}<br />
                {address.address2 ? <>{address.address2}<br /></> : null}
                {address.city}, {address.state} {address.postalCode}
              </address>
            </div>
            <div>
              <h3 className="eyebrow">Contact</h3>
              <p className="mt-3 text-sm leading-7 text-parchment">
                <a href={`mailto:${order.email}`} className="hover:text-gold-100">{order.email}</a><br />
                <a href={`tel:${address.phone}`} className="hover:text-gold-100">{address.phone}</a>
              </p>
            </div>
          </section>

          <section>
            <h3 className="eyebrow">Timeline</h3>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-4">
              <dt className="text-stone">Placed</dt><dd className="text-parchment sm:col-span-3">{when(order.createdAt)}</dd>
              <dt className="text-stone">Paid</dt><dd className="text-parchment sm:col-span-3">{when(order.paidAt)}</dd>
              <dt className="text-stone">Shipped</dt><dd className="text-parchment sm:col-span-3">{when(order.shippedAt)}{order.trackingNumber ? ` · ${order.carrier} ${order.trackingNumber}` : ""}</dd>
              <dt className="text-stone">Cancelled</dt><dd className="text-parchment sm:col-span-3">{when(order.cancelledAt)}</dd>
              <dt className="text-stone">RUO confirmed</dt><dd className="text-parchment sm:col-span-3">{when(order.researchAcknowledgedAt)}</dd>
            </dl>
          </section>
        </div>

        <OrderActions
          orderId={order.id}
          status={order.status}
          carrier={order.carrier}
          trackingNumber={order.trackingNumber}
          adminNotes={order.adminNotes}
          reference={order.reference}
        />
      </div>
    </div>
  );
}
