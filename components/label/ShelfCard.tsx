import type { CardProduct } from "@/lib/product/card";

import { Dot, FinishDots } from "./FinishDots";

/**
 * Multi-product shelf card, A4 landscape.
 *
 * One card for a whole bay, so it carries a single QR in the footer rather than one per
 * row: a customer scans to reach the range, not a specific SKU. Rows are separated by
 * hairlines and each keeps the same three type roles as the single-product card.
 */
export function ShelfCard({
  products,
  qr,
  footnote,
}: {
  products: CardProduct[];
  qr: string;
  footnote: string;
}) {
  return (
    <article className="card card-a4 flex flex-col bg-white text-ink">
      <div className="border-t-[1.5px] border-ink" />

      <div className="flex-1">
        {products.map((product, index) => (
          <div
            key={product.sku}
            className={index > 0 ? "border-t border-[#c9c5bd] pt-5 mt-5" : "pt-5"}
          >
            <div className="grid grid-cols-[1fr_auto] items-start gap-x-8">
              <div className="min-w-0">
                <h3 className="font-display text-[27px] leading-tight tracking-[-0.01em]">
                  {product.name}
                </h3>

                <div className="mt-2.5 grid grid-cols-[minmax(0,auto)_1fr] items-start gap-x-8">
                  <div className="flex items-center gap-2.5">
                    <Dot swatch={product.swatch} size={15} />
                    <span className="font-display text-[16px] italic whitespace-nowrap">
                      {product.finish}
                    </span>
                  </div>

                  <div className="space-y-0.5 pt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                    {product.specLine && <p>{product.specLine}</p>}
                    <p>{product.availability}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <FinishDots finishes={product.finishes} />
                </div>
              </div>

              <p className="font-display text-[34px] leading-none">
                {product.price ?? (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    On application
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-8 border-t border-[#c9c5bd] pt-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Scan for product details" className="h-[58px] w-[58px]" />
          <p className="font-display text-[14px] italic text-ink-soft">
            Scan for specs, finishes and live availability.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {footnote}
        </p>
      </div>
    </article>
  );
}
