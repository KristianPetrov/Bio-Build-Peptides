"use client";

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 0,
  max = 50,
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  return (
    <div
      className="inline-flex items-center border hairline"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={`${box} grid place-items-center text-parchment transition-colors hover:text-gold-100 disabled:opacity-30`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`${size === "sm" ? "w-8 text-sm" : "w-10"} text-center tabular-nums text-ivory`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={`${box} grid place-items-center text-parchment transition-colors hover:text-gold-100 disabled:opacity-30`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
