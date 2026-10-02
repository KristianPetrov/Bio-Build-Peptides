import Image from "next/image";

/**
 * Generated vial photograph (blank matte-black label) with a live typographic
 * label set in the brand faces. Label boxes are measured from the source images.
 */
const CONTAINERS = {
  vial_3ml: {
    src: "/images/vial-3ml.png",
    box: { left: 32.6, top: 37.9, width: 34.8, height: 26.7 },
  },
  vial_10ml: {
    src: "/images/vial-10ml.png",
    box: { left: 27.9, top: 40.4, width: 43.6, height: 26.7 },
  },
} as const;

export function Vial({
  name,
  strength,
  container = "vial_3ml",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  className = "",
}: {
  name: string;
  strength?: string;
  container?: keyof typeof CONTAINERS;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const config = CONTAINERS[container];
  // Fit the name to the label: Cinzel caps average ~0.8em per glyph. Long
  // multi-word names may wrap onto two lines.
  const words = name.split(/\s+/);
  const longestWord = Math.max(...words.map((word) => word.length));
  const lineLength =
    words.length > 1 && name.length > 11
      ? Math.max(longestWord, Math.ceil(name.length / 2))
      : name.length;
  const nameSize = Math.min(16, 80 / (lineLength * 0.8));

  return (
    <div className={`relative aspect-[2/3] w-full ${className}`}>
      <Image
        src={config.src}
        alt=""
        fill
        sizes={sizes}
        preload={priority}
        className="blend-lighten object-contain"
      />
      <div
        className="@container absolute flex flex-col items-center justify-center text-center"
        style={{
          left: `${config.box.left}%`,
          top: `${config.box.top}%`,
          width: `${config.box.width}%`,
          height: `${config.box.height}%`,
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
        }}
        aria-hidden
      >
        <span className="font-display text-[11cqw] font-semibold leading-none tracking-[0.12em] text-gilt">
          BIO BUILD
        </span>
        <span className="my-[4.5cqw] h-px w-[46cqw] bg-gold-400/50" />
        <span
          className="max-w-[88cqw] font-display font-semibold uppercase leading-[1.08] text-balance text-gold-50"
          style={{ fontSize: `${nameSize}cqw`, letterSpacing: "0.04em" }}
        >
          {name}
        </span>
        {strength ? (
          <span className="mt-[3.5cqw] max-w-[86cqw] truncate text-[7.5cqw] font-medium uppercase tracking-[0.2em] text-gold-300">
            {strength}
          </span>
        ) : null}
        <span className="mt-[5cqw] text-[4.6cqw] uppercase tracking-[0.28em] text-stone/80">
          Research use only
        </span>
      </div>
    </div>
  );
}
