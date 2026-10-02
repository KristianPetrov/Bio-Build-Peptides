import { SectionLabel } from "@/components/brand";

export function AuthShell({
  eyebrow,
  title,
  accent,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-[1080px] gap-14 px-5 pt-14 pb-28 sm:px-8 sm:pt-20 lg:grid-cols-2 lg:gap-20">
      <div>
        <SectionLabel align="start">{eyebrow}</SectionLabel>
        <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.04] tracking-[0.02em] text-ivory">
          {title} <span className="font-serif font-normal text-gold-100 italic">{accent}</span>
        </h1>
        <p className="mt-5 max-w-md leading-7 text-stone">{body}</p>
      </div>
      {children}
    </div>
  );
}
