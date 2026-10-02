import type { Metadata } from "next";
import { SectionLabel } from "@/components/brand";
import { getCurrentUser } from "@/lib/auth";
import { getCheckoutPaymentMethods, isPaymentsPreviewMode } from "@/lib/payment-methods";
import { getContact } from "@/lib/site";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const methods = getCheckoutPaymentMethods();
  const contact = getContact();

  return (
    <div className="mx-auto max-w-[1320px] px-5 pt-14 pb-28 sm:px-8 sm:pt-20">
      <SectionLabel align="start">Checkout</SectionLabel>
      <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.04] tracking-[0.02em] text-ivory">
        Secure your <span className="font-serif font-normal text-gold-100 italic">order</span>
      </h1>
      <p className="mt-4 max-w-2xl text-[0.975rem] leading-7 text-stone">
        Your order is reserved the moment it is placed. Payment instructions for your chosen
        method appear on the next screen, and we ship once payment is confirmed.
      </p>

      {methods.length === 0 ? (
        <div className="mt-12 max-w-2xl border hairline bg-onyx p-8">
          <p className="eyebrow">Ordering opens soon</p>
          <p className="mt-4 leading-7 text-parchment">
            Online ordering is not open yet. Your cart is saved on this device — please check back
            shortly{contact.email ? <> or write to <a className="text-gold-100 underline" href={`mailto:${contact.email}`}>{contact.email}</a></> : null}.
          </p>
        </div>
      ) : (
        <CheckoutForm
          methods={methods.map(({ id, label, description, configured }) => ({
            id,
            label,
            description,
            configured,
          }))}
          previewMode={isPaymentsPreviewMode()}
          defaultEmail={user?.email ?? ""}
          defaultName={user?.name ?? ""}
          signedIn={Boolean(user)}
        />
      )}
    </div>
  );
}
