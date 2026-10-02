import "server-only";
import { Resend } from "resend";
import type { Order, OrderItem } from "@/db/schema";
import { itemDisplayName, ORDER_STATUS_LABELS } from "./orders";
import { getPaymentInstructions } from "./payment-methods";
import { formatCents } from "./pricing";
import { BRAND, getSiteUrl, RUO_NOTICE } from "./site";

/** Transactional email via Resend. No-ops (with a log line) until RESEND_API_KEY and EMAIL_FROM are set. */
function client() {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) return null;
  return { resend: new Resend(key), from };
}

export function isEmailConfigured() {
  return client() !== null;
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#050505;color:#F2EADB;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 24px">
<p style="letter-spacing:.32em;font-size:12px;color:#C9A15B;margin:0 0 24px">BIO BUILD PEPTIDES</p>
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 20px;color:#F3D9A0">${escape(title)}</h1>
${body}
<p style="font-size:11px;line-height:1.6;color:#6F6658;margin-top:40px">${escape(RUO_NOTICE)}</p>
</div></body></html>`;
}

function itemsTable(items: OrderItem[], order: Order) {
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;color:#D8CDB8">${escape(itemDisplayName(item))} × ${item.quantity}</td><td style="padding:6px 0;text-align:right">${formatCents(item.lineTotalCents)}</td></tr>`,
    )
    .join("");
  const discount = order.discountCents
    ? `<tr><td style="padding:6px 0;color:#A99D88">Referral ${escape(order.referralCode ?? "")}</td><td style="text-align:right">−${formatCents(order.discountCents)}</td></tr>`
    : "";
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
<tr><td style="padding:6px 0;color:#A99D88">Shipping</td><td style="text-align:right">${order.shippingCents ? formatCents(order.shippingCents) : "Free"}</td></tr>${discount}
<tr><td style="padding:12px 0;border-top:1px solid #3a2f1d;font-weight:bold">Total</td><td style="padding:12px 0;border-top:1px solid #3a2f1d;text-align:right;font-weight:bold;color:#F3D9A0">${formatCents(order.totalCents)}</td></tr></table>`;
}

export async function sendOrderPlacedEmails(order: Order, items: OrderItem[], token: string) {
  const mail = client();
  if (!mail) {
    console.info(`[email] skipped order emails for ${order.reference}: Resend not configured`);
    return;
  }
  const url = `${getSiteUrl()}/order/${order.reference}?key=${encodeURIComponent(token)}`;
  const pay = getPaymentInstructions(order.paymentMethod, order.totalCents, order.reference);
  const steps = pay.steps.map((step) => `<li style="margin:4px 0">${escape(step)}</li>`).join("");
  const body = `<p style="line-height:1.6">Thank you. Your order <strong>${order.reference}</strong> is reserved and awaiting payment.</p>
<h2 style="font-size:14px;letter-spacing:.2em;color:#C9A15B;margin-top:28px">PAY WITH ${escape(pay.label.toUpperCase())}</h2>
${pay.destination ? `<p>${escape(pay.destination.label)}: <strong>${escape(pay.destination.value)}</strong></p>` : ""}
<ol style="line-height:1.6;padding-left:18px">${steps}</ol>
${pay.actionUrl ? `<p><a href="${pay.actionUrl}" style="color:#050505;background:#D9B672;padding:12px 18px;text-decoration:none;display:inline-block">${escape(pay.actionLabel ?? "Pay now")}</a></p>` : ""}
${itemsTable(items, order)}
<p style="margin-top:24px"><a href="${url}" style="color:#F3D9A0">View your order</a></p>`;

  const tasks = [
    mail.resend.emails.send({
      from: mail.from,
      to: order.email,
      subject: `${BRAND.short} order ${order.reference} — payment instructions`,
      html: layout("Order received", body),
    }),
  ];
  const notify = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (notify) {
    tasks.push(
      mail.resend.emails.send({
        from: mail.from,
        to: notify,
        subject: `New order ${order.reference} — ${formatCents(order.totalCents)} via ${pay.label}`,
        html: layout(`New order ${order.reference}`, `<p>${escape(order.shippingAddress.fullName)} · ${escape(order.email)}</p>${itemsTable(items, order)}`),
      }),
    );
  }
  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") console.error("[email] send failed", result.reason);
  }
}

export async function sendOrderStatusEmail(order: Order) {
  const mail = client();
  if (!mail) return;
  const tracking =
    order.status === "shipped" && order.trackingNumber
      ? `<p>Carrier: ${escape(order.carrier ?? "")}<br/>Tracking: <strong>${escape(order.trackingNumber)}</strong></p>`
      : "";
  try {
    await mail.resend.emails.send({
      from: mail.from,
      to: order.email,
      subject: `${BRAND.short} order ${order.reference}: ${ORDER_STATUS_LABELS[order.status]}`,
      html: layout(ORDER_STATUS_LABELS[order.status], `<p>Your order <strong>${order.reference}</strong> has been updated.</p>${tracking}<p><a href="${getSiteUrl()}/track" style="color:#F3D9A0">Track your order</a></p>`),
    });
  } catch (error) {
    console.error("[email] status send failed", error);
  }
}
