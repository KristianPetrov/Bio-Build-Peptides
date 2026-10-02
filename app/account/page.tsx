import type { Metadata } from "next";
import Link from "next/link";
import { SectionLabel } from "@/components/brand";
import { requireUser } from "@/lib/auth";
import { listOrdersForUser, ORDER_STATUS_LABELS } from "@/lib/orders";
import { formatCents } from "@/lib/pricing";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-[1080px] px-5 pt-14 pb-28 sm:px-8 sm:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <SectionLabel align="start">Account</SectionLabel>
          <h1 className="mt-6 font-display text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.04] tracking-[0.02em] text-ivory">
            {user.name ? user.name.split(" ")[0] : "Your account"}
          </h1>
          <p className="mt-2 text-sm text-stone">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {user.role === "admin" ? (
            <Link href="/admin" className="btn-gold">Admin dashboard</Link>
          ) : null}
          <form action={logout}>
            <button type="submit" className="btn-ghost">Sign out</button>
          </form>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="eyebrow">Order history</h2>
        {orders.length === 0 ? (
          <div className="mt-5 border hairline p-8 text-center">
            <p className="font-serif text-2xl text-gold-100 italic">No orders yet.</p>
            <Link href="/shop" className="btn-ghost mt-6">Browse the catalog</Link>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-gold-400/10 border-y hairline">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/order/${order.reference}`} className="grid gap-2 py-5 transition-colors hover:bg-gold-400/5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8 sm:px-3">
                  <span>
                    <span className="font-display tracking-[0.08em] text-ivory">{order.reference}</span>
                    <span className="ml-3 text-xs text-stone">
                      {order.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                  </span>
                  <span className="text-xs tracking-[0.16em] text-gold-300 uppercase">{ORDER_STATUS_LABELS[order.status]}</span>
                  <span className="text-ivory tabular-nums">{formatCents(order.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
