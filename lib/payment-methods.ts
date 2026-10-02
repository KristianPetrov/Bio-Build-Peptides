import "server-only";
import type { PaymentMethodId } from "@/db/schema";
import { formatCents } from "./pricing";

/**
 * Manual, after-order payment (same model as Affordable Peptides, East Coast
 * Wellness and Pure Energy). A method is offered only when its destination is
 * configured. On Preview deployments `PAYMENTS_PREVIEW_MODE=true` lists
 * unconfigured methods so the flow can be reviewed — clearly labelled, with no
 * payment destination shown.
 */

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  configured: boolean;
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function config() {
  const venmo = env("PAYMENT_VENMO_HANDLE").replace(/^@/, "");
  const cashtag = env("PAYMENT_CASHAPP_CASHTAG").replace(/^\$/, "");
  return {
    zelleRecipient: env("PAYMENT_ZELLE_RECIPIENT"),
    zelleName: env("PAYMENT_ZELLE_NAME"),
    venmo,
    cashtag,
    linkUrl: env("PAYMENT_LINK_URL"),
    linkLabel: env("PAYMENT_LINK_LABEL") || "Online payment",
  };
}

export function isPaymentsPreviewMode() {
  return env("PAYMENTS_PREVIEW_MODE") === "true";
}

export function getAllPaymentMethods(): PaymentMethodOption[] {
  const c = config();
  return [
    {
      id: "zelle",
      label: "Zelle",
      description: "Bank transfer from your banking app",
      configured: Boolean(c.zelleRecipient),
    },
    {
      id: "venmo",
      label: "Venmo",
      description: "Amount and order ID prefilled",
      configured: Boolean(c.venmo),
    },
    {
      id: "cashapp",
      label: "Cash App",
      description: "Pay the $cashtag with the order ID in the note",
      configured: Boolean(c.cashtag),
    },
    {
      id: "paylink",
      label: c.linkLabel,
      description: "Secure hosted payment page",
      configured: Boolean(c.linkUrl),
    },
  ];
}

/** Methods a customer may choose at checkout. */
export function getCheckoutPaymentMethods() {
  const preview = isPaymentsPreviewMode();
  return getAllPaymentMethods().filter(
    (method) => method.configured || preview,
  );
}

export function isCheckoutOpen() {
  return getCheckoutPaymentMethods().length > 0;
}

export type PaymentInstructions = {
  method: PaymentMethodId;
  label: string;
  configured: boolean;
  destination?: { label: string; value: string };
  actionUrl?: string;
  actionLabel?: string;
  steps: string[];
};

export function getPaymentInstructions(
  method: PaymentMethodId,
  totalCents: number,
  reference: string,
): PaymentInstructions {
  const c = config();
  const amount = formatCents(totalCents);
  const amountPlain = (totalCents / 100).toFixed(2);
  const option = getAllPaymentMethods().find((item) => item.id === method)!;

  if (!option.configured) {
    return {
      method,
      label: option.label,
      configured: false,
      steps: [
        "Payment details for this method have not been configured on this deployment.",
        `Your order ${reference} is recorded and reserved, but no payment can be collected here yet.`,
      ],
    };
  }

  switch (method) {
    case "zelle":
      return {
        method,
        label: "Zelle",
        configured: true,
        destination: {
          label: c.zelleName ? `Send to ${c.zelleName}` : "Send Zelle payment to",
          value: c.zelleRecipient,
        },
        steps: [
          `Open Zelle in your banking app and add the recipient ${c.zelleRecipient}.`,
          `Send exactly ${amount}.`,
          `Enter ${reference} in the memo so we can match your payment.`,
        ],
      };
    case "venmo": {
      const params = new URLSearchParams({
        txn: "pay",
        audience: "private",
        recipients: c.venmo,
        amount: amountPlain,
        note: reference,
      });
      return {
        method,
        label: "Venmo",
        configured: true,
        destination: { label: "Pay this Venmo profile", value: `@${c.venmo}` },
        actionUrl: `https://venmo.com/?${params.toString()}`,
        actionLabel: `Pay ${amount} with Venmo`,
        steps: [
          `Confirm the recipient is @${c.venmo}.`,
          `Confirm the amount is ${amount} and the note contains ${reference}.`,
          "If Venmo clears either field, re-enter them before sending.",
        ],
      };
    }
    case "cashapp":
      return {
        method,
        label: "Cash App",
        configured: true,
        destination: { label: "Pay this $cashtag", value: `$${c.cashtag}` },
        actionUrl: `https://cash.app/$${encodeURIComponent(c.cashtag)}/${amountPlain}`,
        actionLabel: `Pay ${amount} with Cash App`,
        steps: [
          `Confirm the recipient is $${c.cashtag} and the amount is ${amount}.`,
          `Add ${reference} to the note ("For") field before paying.`,
        ],
      };
    case "paylink":
      return {
        method,
        label: c.linkLabel,
        configured: true,
        destination: { label: "Enter this exact amount", value: amount },
        actionUrl: c.linkUrl,
        actionLabel: `Open ${c.linkLabel}`,
        steps: [
          `Open the ${c.linkLabel} payment page and enter exactly ${amount}.`,
          `Add ${reference} in the note or description field.`,
          "Complete payment with any option the page offers.",
        ],
      };
  }
}
