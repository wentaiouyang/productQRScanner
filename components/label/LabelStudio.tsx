"use client";

import { useState } from "react";

import type { CardProduct } from "@/lib/product/card";

import { ProductCard } from "./ProductCard";
import { ShelfCard } from "./ShelfCard";

type Format = "single" | "shelf";

/** Rows per shelf card. Three keeps the type at a size readable from a step back. */
const ROWS_PER_SHELF_CARD = 3;

/**
 * Both formats print A5 landscape, so a showroom stocks one card size and one holder.
 * Three rows fill an A5 shelf card; on A4 the same three left a third of the card blank,
 * which reads as a mistake rather than as space.
 */
const PAGE: Record<Format, { size: string; margin: string }> = {
  single: { size: "A5 landscape", margin: "5mm" },
  shelf: { size: "A5 landscape", margin: "5mm" },
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function LabelStudio({
  products,
  unmappedFinishes,
}: {
  products: CardProduct[];
  unmappedFinishes: string[];
}) {
  const [format, setFormat] = useState<Format>("single");
  const [selected, setSelected] = useState<string[]>(products.map((p) => p.sku));
  const [showroom, setShowroom] = useState("Gold Coast");
  const [footnote, setFootnote] = useState("Pricing effective 1 Jul · incl. GST");

  const chosen = products.filter((product) => selected.includes(product.sku));
  const page = PAGE[format];

  const toggle = (sku: string) =>
    setSelected((current) =>
      current.includes(sku) ? current.filter((s) => s !== sku) : [...current, sku],
    );

  return (
    <>
      <style>{`@page { size: ${page.size}; margin: ${page.margin}; }`}</style>

      <div className="no-print border-b border-rule bg-surface">
        <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8">
          <p className="eyebrow">ABI Interiors · Showroom QR</p>
          <h1 className="font-display mt-1 text-3xl">Showroom cards</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Cards print at {page.size} —{" "}
            {format === "single"
              ? "one product per card"
              : `up to ${ROWS_PER_SHELF_CARD} products per card`}
            . Everything below the controls is exactly what goes on paper.
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-5">
            <fieldset>
              <legend className="eyebrow mb-2">Format</legend>
              <div className="flex">
                {(["single", "shelf"] as Format[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormat(option)}
                    aria-pressed={format === option}
                    className={`border px-4 py-2 text-sm transition-colors ${
                      format === option
                        ? "border-brass bg-brass-soft text-ink"
                        : "border-rule text-ink-soft hover:border-ink-faint"
                    } ${option === "shelf" ? "-ml-px" : ""}`}
                  >
                    {option === "single" ? "Single product" : "Shelf card"}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-2">
              <span className="eyebrow">Showroom</span>
              <input
                value={showroom}
                onChange={(event) => setShowroom(event.target.value)}
                placeholder="Leave blank to omit"
                className="w-48 border border-rule bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="eyebrow">Card footnote</span>
              <input
                value={footnote}
                onChange={(event) => setFootnote(event.target.value)}
                className="w-72 border border-rule bg-white px-3 py-2 text-sm"
              />
            </label>

            <button
              type="button"
              onClick={() => window.print()}
              disabled={chosen.length === 0}
              className="bg-ink px-6 py-2.5 text-sm text-canvas transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              Print {chosen.length} {chosen.length === 1 ? "card" : "cards"}
            </button>
          </div>

          <fieldset className="mt-6">
            <legend className="eyebrow mb-2">Products ({chosen.length} selected)</legend>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {products.map((product) => (
                <li key={product.sku}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.sku)}
                      onChange={() => toggle(product.sku)}
                    />
                    <span className="font-mono text-xs text-ink-faint">{product.sku}</span>
                    <span>{product.finish}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          {unmappedFinishes.length > 0 && (
            <p className="mt-6 border-l-2 border-brass bg-brass-soft/50 px-4 py-3 text-sm text-ink-soft">
              <b className="font-medium text-ink">No swatch colour defined</b> for{" "}
              {unmappedFinishes.join(", ")}. These print as a dashed outline. Add them to{" "}
              <code className="font-mono text-xs">lib/finish-colours.ts</code> — and note
              that every colour in that file is an approximation awaiting brand sign-off.
            </p>
          )}

          {format === "shelf" && (
            <p className="mt-3 text-sm text-ink-faint">
              A shelf card covers several products but carries one code, so it points at the
              first product on the card. A proper range URL covering all of them doesn&rsquo;t
              exist yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 overflow-x-auto py-8 print:gap-0 print:py-0">
        {format === "single"
          ? chosen.map((product) => (
              <ProductCard
                key={product.sku}
                product={product}
                showroom={showroom.trim() || undefined}
              />
            ))
          : chunk(chosen, ROWS_PER_SHELF_CARD).map((group) => (
              <ShelfCard
                key={group[0].sku}
                products={group}
                qr={group[0].qr}
                footnote={footnote}
              />
            ))}
      </div>
    </>
  );
}
