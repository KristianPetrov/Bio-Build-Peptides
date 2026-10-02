import Link from "next/link";
import { useId } from "react";

/** Vertical double helix used as the wordmark's centre glyph and as an ornament. */
export function HelixGlyph({
  className = "",
  rungs = 7,
}: {
  className?: string;
  rungs?: number;
}) {
  const id = useId().replace(/:/g, "");
  const height = 100;
  const width = 28;
  const steps = 48;
  const strand = (phase: number) =>
    Array.from({ length: steps + 1 }, (_, index) => {
      const t = index / steps;
      const x = width / 2 + Math.sin(t * Math.PI * 2.5 + phase) * (width / 2 - 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${(t * height).toFixed(2)}`;
    }).join(" ");

  const rungLines = Array.from({ length: rungs }, (_, index) => {
    const t = (index + 0.5) / rungs;
    const a = width / 2 + Math.sin(t * Math.PI * 2.5) * (width / 2 - 2);
    const b = width / 2 + Math.sin(t * Math.PI * 2.5 + Math.PI) * (width / 2 - 2);
    return { y: t * height, x1: Math.min(a, b), x2: Math.max(a, b) };
  }).filter((rung) => rung.x2 - rung.x1 > 4);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
      fill="none"
    >
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBE9BD" />
          <stop offset="0.45" stopColor="#C9A15B" />
          <stop offset="0.6" stopColor="#8A6A2F" />
          <stop offset="1" stopColor="#F3D9A0" />
        </linearGradient>
      </defs>
      {rungLines.map((rung) => (
        <line
          key={rung.y}
          x1={rung.x1}
          x2={rung.x2}
          y1={rung.y}
          y2={rung.y}
          stroke={`url(#g${id})`}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
      <path d={strand(0)} stroke={`url(#g${id})`} strokeWidth="2.4" strokeLinecap="round" />
      <path d={strand(Math.PI)} stroke={`url(#g${id})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function Wordmark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: { text: "text-[1.15rem]", glyph: "h-[1.55rem] w-[0.5rem]", gap: "gap-[0.28em]" },
    md: { text: "text-[1.6rem]", glyph: "h-[2.1rem] w-[0.68rem]", gap: "gap-[0.3em]" },
    xl: {
      text: "text-[clamp(3.1rem,12vw,6.4rem)]",
      glyph: "h-[1.3em] w-[0.42em]",
      gap: "gap-[0.16em]",
    },
  }[size];

  return (
    <span
      className={`inline-flex items-center font-display font-semibold leading-none tracking-[0.04em] ${sizes.text} ${sizes.gap} ${className}`}
    >
      <span className={size === "xl" ? "text-gilt-sheen" : "text-gilt"}>BIO</span>
      {size === "xl" ? (
        <span className="gilded-helix shrink-0 -my-2" aria-hidden>
          <span className="gilded-helix-turn"><span className="gilded-helix-texture" /></span>
        </span>
      ) : <HelixGlyph className={`${sizes.glyph} shrink-0 -my-2`} />}
      <span className={size === "xl" ? "text-gilt-sheen" : "text-gilt"}>BUILD</span>
    </span>
  );
}

export function LogoLink({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <Link
      href="/"
      className="group inline-flex flex-col items-start"
      aria-label="Bio Build Peptides — home"
    >
      <Wordmark size={size} />
      <span className="mt-1 text-[0.5rem] font-medium tracking-[0.62em] text-stone transition-colors group-hover:text-gold-300">
        PEPTIDES
      </span>
    </Link>
  );
}

/** Horizontal ornament: hairline — helix — hairline. */
export function HelixRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/40" />
      <HelixGlyph className="h-7 w-2 rotate-90" rungs={6} />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/40" />
    </div>
  );
}

export function SectionLabel({
  index,
  children,
  align = "center",
}: {
  index?: string;
  children: React.ReactNode;
  align?: "center" | "start";
}) {
  return (
    <p
      className={`eyebrow rule-label ${align === "start" ? "rule-label-start" : ""}`}
    >
      {index ? <span className="text-ash">{index}</span> : null}
      <span>{children}</span>
    </p>
  );
}
