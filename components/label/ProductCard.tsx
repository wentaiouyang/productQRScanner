import type { CardProduct } from "@/lib/product/card";

import { Dot, FinishDots } from "./FinishDots";

/**
 * Single-product showroom card, A5 landscape.
 *
 * Three type roles carry the whole design: a high-contrast serif for the name and price,
 * the same serif in italic for the finish and soft notes, and letterspaced uppercase
 * monospace for anything technical. Colour appears only in the finish swatches.
 */
export function ProductCard({
  product,
  showroom,
}: {
  product: CardProduct;
  showroom?: string;
}) {
  return (
    <article className="card card-a5 flex flex-col bg-white text-ink">
      <div className="grid flex-1 grid-cols-[1fr_auto] gap-x-10">
        <div className="flex min-w-0 flex-col">
          <div className="border-t-[1.5px] border-ink" />
          <h2 className="font-display mt-4 text-[40px] leading-[1.05] tracking-[-0.01em]">
            {product.name}
          </h2>
          <div className="mt-4 border-t border-[#c9c5bd]" />

          <div className="mt-5 flex items-center gap-3">
            <Dot swatch={product.swatch} size={16} />
            <span className="font-display text-[19px] italic">{product.finish}</span>
          </div>

          <div className="mt-6 space-y-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            {product.specLine && <p>{product.specLine}</p>}
            {product.detailLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          {product.price ? (
            <>
              <p className="font-display text-[54px] leading-none">{product.price}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {product.availability}
                {showroom ? ` · ${showroom}` : ""}
              </p>
            </>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              Price on application
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-end gap-x-10">
        <div className="min-w-0">
          {product.finishes.length > 1 && (
            <>
              <div className="mb-4 border-t border-[#c9c5bd]" />
              <FinishDots finishes={product.finishes} />
              <p className="font-display mt-3 text-[13px] italic text-ink-soft">
                Available in these finishes. Prices may vary.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center">
          {/* Data-URI QR; nothing for the image optimiser to do. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.qr} alt={`Scan for ${product.name}`} className="h-[86px] w-[86px]" />
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            Scan for specs &amp; care
          </p>
        </div>
      </div>
    </article>
  );
}
