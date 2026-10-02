import type { Metadata } from "next";
import { SectionLabel } from "@/components/brand";
import { TrackForm } from "./track-form";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Look up the status and payment details of a Bio Build Peptides order.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="mx-auto grid max-w-[1080px] gap-14 px-5 pt-14 pb-28 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <div>
        <SectionLabel align="start">Order lookup</SectionLabel>
        <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.04] tracking-[0.02em] text-ivory">
          Track your <span className="font-serif font-normal text-gold-100 italic">order</span>
        </h1>
        <p className="mt-5 max-w-md leading-7 text-stone">
          Enter the order ID shown after checkout (it starts with <span className="text-parchment">BB-</span>)
          and the email address you used. You&apos;ll see payment instructions, status and tracking.
        </p>
      </div>
      <TrackForm />
    </div>
  );
}
