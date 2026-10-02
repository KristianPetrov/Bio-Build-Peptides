import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getContact } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, payment or shipping? Send Bio Build Peptides a message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const contact = getContact();
  return (
    <div className="mx-auto max-w-[1080px] px-5 pb-28 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <div>
          <PageHeader
            eyebrow="Contact"
            title="Talk to"
            accent="Bio Build"
            lede="Questions about an order, payment or shipping? Include your order ID if you have one and we'll reply by email."
          />
          {contact.email || contact.phone ? (
            <dl className="-mt-4 space-y-4 text-sm">
              {contact.email ? (
                <div>
                  <dt className="label">Email</dt>
                  <dd><a href={`mailto:${contact.email}`} className="text-gold-100 hover:underline">{contact.email}</a></dd>
                </div>
              ) : null}
              {contact.phone && contact.phoneHref ? (
                <div>
                  <dt className="label">Phone</dt>
                  <dd><a href={contact.phoneHref} className="text-gold-100 hover:underline">{contact.phone}</a></dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
        <div className="lg:pt-20">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
