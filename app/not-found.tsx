import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-[1320px] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center">
      <Image src="/images/helix-emblem.png" alt="" width={520} height={520} className="blend-lighten pointer-events-none absolute top-1/2 left-1/2 w-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <p className="eyebrow relative">Error 404</p>
      <h1 className="relative mt-6 font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-tight tracking-[0.03em] text-ivory">
        Sequence <span className="font-serif font-normal text-gold-100 italic">not found</span>
      </h1>
      <p className="relative mt-5 max-w-md leading-7 text-stone">The page you&apos;re looking for has moved or never existed.</p>
      <div className="relative mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-gold">Shop the catalog</Link>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </div>
  );
}
