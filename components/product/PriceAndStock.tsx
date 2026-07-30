import { formatPrice } from "@/lib/product/format";
import type { CustomerProduct, StockTone } from "@/lib/product/types";

const TONE_CLASS: Record<StockTone, string> = {
  good: "text-stock-good",
  low: "text-stock-low",
  "made-to-order": "text-ink-soft",
  unavailable: "text-stock-none",
};

const TONE_DOT: Record<StockTone, string> = {
  good: "bg-stock-good",
  low: "bg-stock-low",
  "made-to-order": "bg-ink-faint",
  unavailable: "bg-stock-none",
};

export function PriceAndStock({ product }: { product: CustomerProduct }) {
  const { regularPrice, salePrice, stock } = product;
  const isDiscounted = salePrice !== null && regularPrice !== null && salePrice < regularPrice;
  const payable = isDiscounted ? salePrice : regularPrice;

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      {payable === null ? (
        <span className="text-ink-soft">Price on application</span>
      ) : (
        <>
          <span className="font-display text-3xl leading-none">{formatPrice(payable)}</span>
          {isDiscounted && (
            <span className="text-ink-faint line-through">{formatPrice(regularPrice)}</span>
          )}
          <span className="eyebrow">RRP incl. GST</span>
        </>
      )}

      <span className={`flex items-center gap-2 text-sm ${TONE_CLASS[stock.tone]}`}>
        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[stock.tone]}`} />
        {stock.label}
        {stock.quantity !== null && stock.quantity > 0 && (
          <span className="text-ink-faint">· {stock.quantity} available</span>
        )}
      </span>
    </div>
  );
}
