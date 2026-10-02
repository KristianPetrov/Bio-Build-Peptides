import { SectionLabel } from "./brand";

export function PageHeader({
  eyebrow,
  title,
  accent,
  lede,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lede?: React.ReactNode;
}) {
  return (
    <header className="pt-14 pb-12 sm:pt-20 sm:pb-16">
      <SectionLabel align="start">{eyebrow}</SectionLabel>
      <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.3rem,5.6vw,4.4rem)] leading-[1.03] tracking-[0.02em] text-ivory">
        {title}
        {accent ? <span className="block font-serif font-normal text-gold-100 italic">{accent}</span> : null}
      </h1>
      {lede ? <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-stone">{lede}</p> : null}
    </header>
  );
}

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[860px] px-5 pb-28 sm:px-8">
      <PageHeader eyebrow={eyebrow} title={title} />
      <p className="-mt-6 mb-10 text-xs tracking-[0.2em] text-ash uppercase">Last updated {updated}</p>
      <div className="prose-bb">{children}</div>
    </div>
  );
}
