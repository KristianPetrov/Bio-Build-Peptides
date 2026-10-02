import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What information Bio Build Peptides collects and how it is used.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Policy" title="Privacy" updated="October 1, 2026">
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Orders:</strong> name, email, phone number, shipping address, items ordered, selected payment method and order totals.</li>
        <li><strong>Accounts:</strong> name, email and a securely hashed password if you create an account.</li>
        <li><strong>Messages:</strong> the details you submit through the contact form.</li>
      </ul>
      <p>
        Payments are made directly through your chosen payment provider. This website does not
        collect or store card or bank account details.
      </p>
      <h2>How it is used</h2>
      <p>
        Information is used to process, ship and support your order, to match payments to orders,
        to provide order status and account features, and to respond to messages.
      </p>
      <h2>Cookies and local storage</h2>
      <p>
        The site uses a cookie to keep you signed in and to show an order you looked up, and your
        browser&apos;s local storage to remember your cart and your age confirmation. No advertising
        or third-party analytics cookies are set by this website.
      </p>
      <h2>Service providers</h2>
      <p>
        Data is stored with our hosting and database providers, and order emails are sent through an
        email delivery provider. These providers process data only to operate the service.
      </p>
      <h2>Your choices</h2>
      <p>
        To ask about, correct or delete your information, please <Link href="/contact">contact us</Link>.
      </p>
    </LegalPage>
  );
}
