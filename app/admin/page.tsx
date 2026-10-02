import Link from "next/link";
import { and, count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, type OrderStatus } from "@/db/schema";
import { formatCents } from "@/lib/pricing";
import { StatusBadge } from "./status-badge";

export const metadata = { title: "Orders" };

const FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending_payment", label: "Awaiting payment" },
  { id: "paid", label: "Paid" },
  { id: "shipped", label: "Shipped" },
  { id: "cancelled", label: "Cancelled" },
];

const METHOD_LABELS = { zelle: "Zelle", venmo: "Venmo", cashapp: "Cash App", paylink: "Pay link" };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin">) {
  const { status: rawStatus, q: rawQuery } = await searchParams;
  const status = FILTERS.some((filter) => filter.id === rawStatus) ? (rawStatus as OrderStatus | "all") : "all";
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  const db = getDb();

  const conditions = [
    status !== "all" ? eq(orders.status, status) : undefined,
    query
      ? or(
          ilike(orders.reference, `%${query}%`),
          ilike(orders.email, `%${query}%`),
          sql`${orders.shippingAddress}->>'fullName' ilike ${`%${query}%`}`,
        )
      : undefined,
  ].filter(Boolean);

  const [rows, stats] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(200),
    db
      .select({ status: orders.status, n: count(), total: sum(orders.totalCents) })
      .from(orders)
      .groupBy(orders.status),
  ]);
  const stat = (id: OrderStatus) => stats.find((row) => row.status === id);
  const confirmedRevenue =
    Number(stat("paid")?.total ?? 0) + Number(stat("shipped")?.total ?? 0);

  return (
    <div>
      <dl className="grid grid-cols-2 gap-px border hairline bg-gold-400/10 lg:grid-cols-4">
        {[
          { label: "Awaiting payment", value: String(stat("pending_payment")?.n ?? 0) },
          { label: "Ready to ship", value: String(stat("paid")?.n ?? 0) },
          { label: "Shipped", value: String(stat("shipped")?.n ?? 0) },
          { label: "Confirmed revenue", value: formatCents(confirmedRevenue) },
        ].map((item) => (
          <div key={item.label} className="bg-onyx p-5">
            <dt className="text-[0.625rem] tracking-[0.22em] text-stone uppercase">{item.label}</dt>
            <dd className="mt-2 font-display text-2xl text-gold-100 tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => (
            <Link
              key={filter.id}
              href={filter.id === "all" ? "/admin" : `/admin?status=${filter.id}`}
              className={`border px-3 py-2 text-[0.625rem] tracking-[0.2em] uppercase ${status === filter.id ? "border-gold-300 text-gold-100" : "hairline text-stone hover:text-parchment"}`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
        <form className="flex gap-2" action="/admin">
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <label className="sr-only" htmlFor="order-search">Search orders</label>
          <input id="order-search" name="q" defaultValue={query} placeholder="Order ID, email or name" className="field min-h-11 w-64" />
          <button className="btn-ghost min-h-11 px-4" type="submit">Search</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 border hairline p-10 text-center text-stone">No orders match.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border hairline">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-onyx text-[0.625rem] tracking-[0.2em] text-stone uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/10">
              {rows.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gold-400/5">
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-display tracking-[0.08em] text-gold-100 hover:underline">
                      {order.reference}
                    </Link>
                    <p className="mt-0.5 text-xs text-ash">
                      {order.createdAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-ivory">{order.shippingAddress.fullName}</p>
                    <p className="text-xs text-stone">{order.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-parchment">{METHOD_LABELS[order.paymentMethod]}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3.5 text-right text-ivory tabular-nums">{formatCents(order.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
