import { getImageProps } from "next/image";
import Link from "next/link";
import { Wordmark } from "../brand";

export function Hero({ productCount }: { productCount: number }) {
  const common = { alt: "", sizes: "100vw", quality: 90 };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, width: 2400, height: 1350, src: "/images/hero-helix-athletes.jpg" });
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    width: 1200,
    height: 1600,
    src: "/images/hero-helix-athletes-mobile.jpg",
  });

  return (
    <section className="relative isolate -mt-[4.5rem] overflow-hidden bg-void" aria-labelledby="hero-title">
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktop} />
        <img
          {...rest}
          alt=""
          srcSet={mobile}
          fetchPriority="high"
          loading="eager"
          className="relative -z-10 block h-[60svh] max-h-[34rem] w-full object-cover object-[50%_72%] lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:h-full lg:max-h-none lg:w-[78%] lg:object-[74%_center]"
        />
      </picture>
      <span className="hero-helix-light" aria-hidden />
      {/* Desktop: fade the image into the headline column. Mobile: fade into the content below. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[60svh] max-h-[34rem] bg-[linear-gradient(180deg,rgba(5,5,5,0.55)_0%,transparent_22%,transparent_55%,#050505_100%)] lg:inset-0 lg:h-auto lg:max-h-none lg:bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.92)_26%,rgba(5,5,5,0.2)_52%,transparent_70%),linear-gradient(0deg,#050505_0%,transparent_22%)]"
      />

      <div className="relative mx-auto -mt-20 flex max-w-[1320px] flex-col px-5 pb-16 sm:px-8 lg:mt-0 lg:min-h-[min(100svh,58rem)] lg:justify-center lg:pt-32 lg:pb-24">
        <div className="max-w-[40rem]">
          <p className="eyebrow animate-rise" style={{ animationDelay: "80ms" }}>
            Research peptides<span className="hidden sm:inline"> · Laboratory supplies</span>
          </p>
          <h1 id="hero-title" className="animate-rise mt-6" style={{ animationDelay: "160ms" }}>
            <span className="sr-only">Bio Build Peptides — Build Better Biology</span>
            <Wordmark size="xl" />
          </h1>
          <p
            className="animate-rise eyebrow rule-label mt-6 max-w-[34rem] text-[0.6875rem] text-gold-100 sm:text-xs"
            style={{ animationDelay: "260ms" }}
            aria-hidden
          >
            Build better biology
          </p>
          <p
            className="animate-rise mt-8 max-w-[31rem] text-[1.05rem] leading-8 text-parchment"
            style={{ animationDelay: "340ms" }}
          >
            {productCount} research compounds and supplies, each offered as a single vial or in
            5- and 10-vial packs — clearly priced, clearly labelled, and tracked from order to
            your door.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "420ms" }}>
            <Link href="/shop" className="btn-gold">
              Shop the catalog
              <span aria-hidden>→</span>
            </Link>
            <Link href="/science" className="btn-ghost">
              Our standards
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
