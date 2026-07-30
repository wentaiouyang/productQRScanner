import type { StockTone } from "./types";

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
});

/**
 * Prices arrive from the gateway as keyword strings (`"399.90"`, or `""` when unset).
 *
 * Parsing them for display arithmetic is fine and necessary. What is forbidden is
 * treating them as numbers inside a gateway query — OpenSearch would compare them
 * lexically and decide `"100" < "99"`.
 */
export function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function formatPrice(value: number | null): string | null {
  return value === null ? null : AUD.format(value);
}

const LOW_STOCK_FALLBACK = 10;

/**
 * Customers see a real quantity, but a bare number reads badly on its own, so it is
 * always paired with a plain-language status.
 */
export function stockLabel(
  status: string,
  quantity: number | null,
  lowStockAmount: number | null,
): { label: string; tone: StockTone } {
  if (status === "onbackorder") {
    return { label: "Made to order", tone: "made-to-order" };
  }
  if (status === "outofstock") {
    return { label: "Currently unavailable", tone: "unavailable" };
  }
  if (status === "instock") {
    const threshold = lowStockAmount ?? LOW_STOCK_FALLBACK;
    if (quantity !== null && quantity <= threshold) {
      return { label: "Low stock", tone: "low" };
    }
    return { label: "In stock", tone: "good" };
  }
  return { label: "Availability on request", tone: "unavailable" };
}

/**
 * Warranty periods come through as either a number of years as a string, or the
 * literal `"Lifetime"`, or `"0"` meaning not covered.
 */
export function warrantyPeriod(raw: string): string {
  if (!raw || raw === "0") return "Not covered";
  if (/^\d+$/.test(raw)) return `${raw} year${raw === "1" ? "" : "s"}`;
  return raw;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&#039;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

/**
 * Attribute and spec *names* arrive HTML-escaped from Woo — a real record labels a row
 * `What&#039;s In The Box`. Values go through the HTML sanitiser, which decodes them, but
 * names are rendered as text and would otherwise show the raw entity.
 */
export function decodeEntities(value: string): string {
  return value.replace(/&(?:amp|#0?39|quot|lt|gt|nbsp);/g, (match) => ENTITIES[match] ?? match);
}

/** `structure` / `non_residential` → `Structure` / `Non residential`. */
export function humanise(key: string): string {
  const spaced = key.replace(/[_-]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The finish is already in the product name ("Mini Water Filter Tap - Brushed Brass"),
 * so a finish switcher repeating the full name for nine siblings is unreadable.
 */
export function finishLabel(fullName: string, groupName: string): string {
  const trimmed = fullName.startsWith(groupName)
    ? fullName.slice(groupName.length)
    : fullName;
  return trimmed.replace(/^[\s–—-]+/, "").trim() || fullName;
}
