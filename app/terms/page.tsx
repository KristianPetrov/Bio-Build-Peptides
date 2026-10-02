import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/page-header";
import { formatCents } from "@/lib/pricing";
import { SHIPPING } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of sale",
  description: "How ordering, payment and shipping work at Bio Build Peptides.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Policy" title="Terms of sale" updated="October 1, 2026">
      <p>
        These terms describe how orders are placed, paid and fulfilled on this website. By placing an
        order you also agree to the <Link href="/research-use">research use policy</Link>.
      </p>
      <h2>Eligibility</h2>
      <p>
        Orders may only be placed by adults aged 21 or older purchasing for laboratory research use.
        Shipping is currently available to addresses within the United States.
      </p>
      <h2>Orders and reservation</h2>
      <p>
        When you place an order you receive an order ID beginning with “BB-”. Inventory for tracked
        items is reserved when the order is placed. Orders remain in “Awaiting payment” status until
        payment is matched.
      </p>
      <h2>Pricing</h2>
      <ul>
        <li>Prices are shown in US dollars for single vials and for 5- and 10-vial packs.</li>
        <li>Where volume pricing applies, five or more loose single vials of the same strength are charged at the 5-pack per-vial rate, and ten or more at the 10-pack rate.</li>
        <li>Referral codes apply to the product subtotal, before shipping.</li>
        <li>Prices are confirmed against the live catalog when the order is placed; the total on your order page is the amount due.</li>
      </ul>
      <h2>Payment</h2>
      <p>
        Payment is made after the order is placed using the method you select (Zelle, Venmo, Cash App
        or the hosted payment link, as available). Send the exact order total and include your order
        ID in the memo so the payment can be matched. Orders ship after payment is confirmed.
      </p>
      <h2>Shipping</h2>
      <p>
        Shipping is {formatCents(SHIPPING.flatRateCents)} per order and free on orders with a product
        subtotal (after discounts) of {formatCents(SHIPPING.freeThresholdCents)} or more. Tracking is
        posted to your order page once the shipment is created.
      </p>
      <h2>Order issues</h2>
      <p>
        If something is wrong with an order, please <Link href="/contact">contact us</Link> with your
        order ID as soon as possible.
      </p>
    </LegalPage>
  );
}
