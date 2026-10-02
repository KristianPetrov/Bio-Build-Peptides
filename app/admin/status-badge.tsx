import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

const STYLES: Record<OrderStatus, string> = {
  pending_payment: "border-gold-400/50 text-gold-100",
  paid: "border-sage/50 text-sage",
  shipped: "border-parchment/40 text-parchment",
  cancelled: "border-ember/50 text-ember",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block border px-2 py-1 text-[0.5625rem] tracking-[0.18em] whitespace-nowrap uppercase ${STYLES[status]}`}>
      {status === "pending_payment" ? "Awaiting payment" : ORDER_STATUS_LABELS[status].split(" —")[0]}
    </span>
  );
}
