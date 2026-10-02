"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      className="shrink-0 border hairline px-3 py-1.5 text-[0.625rem] tracking-[0.2em] text-gold-100 uppercase transition-colors hover:border-gold-300"
      aria-label={`${label}: ${value}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
