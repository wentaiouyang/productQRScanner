import type { Metadata } from "next";
import QRCode from "qrcode";

import { LabelStudio } from "@/components/label/LabelStudio";
import { productUrl } from "@/lib/config";
import { unmappedFinishes } from "@/lib/finish-colours";
import { toCardProduct } from "@/lib/product/card";
import { productSource } from "@/lib/product/fixture-source";

export const metadata: Metadata = {
  title: "Showroom cards — ABI Interiors",
};

/**
 * Staff tool for printing showroom cards.
 *
 * QR codes are rendered as SVG rather than PNG: a printed code should be resolution
 * independent, and a raster one at 86px would soften on paper.
 */
async function qrSvgDataUrl(target: string): Promise<string> {
  const svg = await QRCode.toString(target, {
    type: "svg",
    margin: 0,
    color: { dark: "#1b1917", light: "#00000000" },
  });
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** `?format=shelf` makes a format linkable, which the review-page generator relies on. */
export default async function LabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  const { format } = await searchParams;
  const cards = [];

  for (const sku of productSource.availableSkus()) {
    const result = await productSource.lookupBySku(sku);
    if (result.kind !== "found") continue;
    cards.push(toCardProduct(result.product, await qrSvgDataUrl(productUrl(sku))));
  }

  // Surfaced in the UI so a missing swatch is caught before a print run, not after.
  const missing = unmappedFinishes(
    cards.flatMap((card) => [card.finish, ...card.finishes.map((finish) => finish.label)]),
  );

  return (
    <LabelStudio
      products={cards}
      unmappedFinishes={missing}
      initialFormat={format === "shelf" ? "shelf" : "single"}
    />
  );
}
