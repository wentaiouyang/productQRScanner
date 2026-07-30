import type { Swatch } from "@/lib/finish-colours";
import type { CardFinish } from "@/lib/product/card";

/**
 * A finish with no swatch colour renders as a dashed outline instead of a guessed hex,
 * so an unmapped finish is obvious on screen rather than printed wrong.
 */
export function Dot({ swatch, size = 14 }: { swatch: Swatch; size?: number }) {
  const style = { width: size, height: size };

  if (swatch.hex === null) {
    return (
      <span
        aria-hidden
        title={`No swatch colour defined for “${swatch.name}”`}
        className="inline-block shrink-0 rounded-full border border-dashed border-[#8a8378]"
        style={style}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{ ...style, backgroundColor: swatch.hex }}
    />
  );
}

export function FinishDots({ finishes }: { finishes: CardFinish[] }) {
  if (finishes.length <= 1) return null;

  return (
    <ul className="flex flex-wrap items-center gap-[6px]">
      {finishes.map((finish) => (
        <li key={finish.sku} title={finish.label} className="flex">
          <Dot swatch={finish.swatch} size={13} />
        </li>
      ))}
    </ul>
  );
}
