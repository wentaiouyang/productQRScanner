import { swatchFor, type Swatch } from "@/lib/finish-colours";

import { finishLabel, formatPrice, parsePrice, stockLabel } from "./format";
import type { GatewayProduct, StockTone, WarrantyPeriods } from "./types";

/**
 * The view model for a printed showroom card.
 *
 * Cards carry only what a customer standing in front of the product needs: what it is,
 * what finish they're looking at, the headline numbers, and a code to scan. Everything
 * else belongs on the page the code opens.
 */
export type CardFinish = {
  sku: string;
  label: string;
  swatch: Swatch;
  isCurrent: boolean;
};

export type CardProduct = {
  sku: string;
  name: string;
  finish: string;
  swatch: Swatch;

  price: string | null;
  availability: string;
  tone: StockTone;

  /**
   * Uppercase monospace lines. Kept as separate entries rather than one joined string:
   * dimension text runs long on some categories, and joining it to the warranty produces
   * a wrap that orphans a single word.
   */
  specLine: string;
  detailLines: string[];

  finishes: CardFinish[];
  qr: string;
};

/**
 * Warranty headline.
 *
 * A real record carries a matrix — per component, per use class. A card has room for one
 * phrase, so: any component covered for life outranks a number of years, otherwise the
 * longest residential period wins. Residential because that is who walks into a showroom.
 */
function warrantyHeadline(product: GatewayProduct): string | null {
  const result = product.warrantyResults[0];
  if (!result) return null;

  let longestYears = 0;
  for (const [key, value] of Object.entries(result)) {
    if (key === "name" || key === "sku") continue;
    if (!value || typeof value !== "object") continue;
    const residential = (value as WarrantyPeriods).residential;
    if (/lifetime/i.test(residential)) return "LIFETIME WARRANTY";
    const years = Number.parseInt(residential, 10);
    if (Number.isFinite(years)) longestYears = Math.max(longestYears, years);
  }

  return longestYears > 0 ? `${longestYears} YEAR WARRANTY` : null;
}

/**
 * The "Dimensions" attribute is free text and its shape varies by category — a tap gives
 * height/reach/hole size, a basin gives L/W/H. So the key/value pairs are reformatted
 * compactly rather than parsed into fixed fields, and the values are left exactly as
 * authored (including the odd typo — that is a data fix, not a rendering one).
 */
function dimensionSummary(product: GatewayProduct): string | null {
  const attribute = product.attributes.find(
    (candidate) => candidate.visible && candidate.name === "Dimensions",
  );
  if (!attribute?.value?.trim()) return null;

  const parts = attribute.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      return value ? `${key.trim()} ${value}` : key.trim();
    });

  return parts.length > 0 ? parts.join(" · ").toUpperCase() : null;
}

function availability(product: GatewayProduct): { text: string; tone: StockTone } {
  const { label, tone } = stockLabel(
    product.stockStatus,
    product.stockQuantity,
    product.lowStockAmount,
  );
  // `eta` is populated only when a restock date is known; it is empty on most records.
  const eta = product.eta?.trim();
  return { text: eta ? `${label} · ETA ${eta}` : label, tone };
}

export function toCardProduct(product: GatewayProduct, qr: string): CardProduct {
  const group = product.rainbowFamily[0]?.group_name ?? product.name;
  const finish = product.colour || finishLabel(product.name, group);

  const spec = [
    product.sku,
    product.welsRegistration ? `${product.welsRegistration} (V)` : null,
    product.welsRating ? `WELS ${product.welsRating} STAR` : null,
    product.welsLitres ? `${product.welsLitres} L/MIN` : null,
  ].filter(Boolean);

  const detailLines = [dimensionSummary(product), warrantyHeadline(product)].filter(
    (line): line is string => Boolean(line),
  );

  const { text, tone } = availability(product);
  const sale = parsePrice(product.salePrice);
  const regular = parsePrice(product.regularPrice);

  return {
    sku: product.sku,
    name: group,
    finish,
    swatch: swatchFor(finish),

    // The card shows what a customer would pay today.
    price: formatPrice(sale !== null && regular !== null && sale < regular ? sale : regular),
    availability: text,
    tone,

    specLine: spec.join(" · "),
    detailLines,

    finishes: product.rainbowFamily.map((sibling) => {
      const label = finishLabel(sibling.name, sibling.group_name || group);
      return {
        sku: sibling.sku,
        label,
        swatch: swatchFor(label),
        isCurrent: sibling.sku === product.sku,
      };
    }),

    qr,
  };
}
