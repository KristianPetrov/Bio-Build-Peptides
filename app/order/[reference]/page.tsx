import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HelixRule } from "@/components/brand";
import { OrderSummary, OrderTimeline, PaymentPanel } from "@/components/order-details";
import { getCurrentUser } from "@/lib/auth";
import { hasOrderAccess } from "@/lib/order-access";
import { getOrderWithItems, tokenMatches } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/order/[reference]">) {
  const { reference } = await params;
  const { key } = await searchParams;
  const found = await getOrderWithItems(reference.toUpperCase());
  if (!found) notFound();

  const user = await getCurrentUser();
  const allowed =
    tokenMatches(typeof key === "string" ? key : null, found.order.accessTokenHash) ||
    (user && (user.role === "admin" || user.id === found.order.userId)) ||
    (await hasOrderAccess(found.order.reference));
  if (!allowed) notFound();

  const { order, items } = found;

  return (
    <div className="mx-auto max-w-[1080px] px-5 pt-14 pb-28 sm:px-8 sm:pt-20">
      <p className="eyebrow">{order.status === "pending_payment" ? "Order reserved" : "Order"}</p>
      <h1 className="mt-4 font-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.04] tracking-[0.03em] text-ivory">
        {order.reference}
      </h1>
      <p className="mt-3 font-serif text-xl text-gold-100 italic">
        {order.status === "pending_payment"
          ? "Thank you — complete payment to release your order for shipment."
          : "Thank you for your order."}
      </p>
      <p className="mt-3 text-sm text-stone">
        Placed {order.createdAt.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}.
        Bookmark this page, or look the order up any time with your order ID and email on{" "}
        <Link href="/track" className="text-gold-100 underline decoration-gold-400/40 underline-offset-4">Track order</Link>.
      </p>

      <div className="mt-10">
        <OrderTimeline order={order} />
      </div>

      {order.status === "pending_payment" ? (
        <div className="mt-10">
          <PaymentPanel order={order} />
        </div>
      ) : null}

      <HelixRule className="my-14" />
      <OrderSummary order={order} items={items} />
    </div>
  );
}
