import type { GatewayProduct } from "./types";

export type LookupResult =
  | { kind: "found"; product: GatewayProduct; matchCount: number }
  | { kind: "not-found" };

/**
 * Where product records come from.
 *
 * The demo runs on `FixtureProductSource`. The production implementation calls
 * `GET /tyche/wooproducts/search/advanced` with
 * `{"bool":{"filter":[{"term":{"region":"au"}},{"term":{"sku.keyword":sku}}]}}`,
 * `computeBundlePrices=true` and `source=CUSTOMER_SOURCE_FIELDS`.
 *
 * That call needs an application-identity token, which is still pending approval, so
 * the interface exists to keep every page in this app independent of which one is
 * wired in. Nothing above this boundary knows the difference.
 */
export interface ProductSource {
  readonly name: string;
  /** True when the data is fixtures, so the UI can say so instead of implying live data. */
  readonly isFixture: boolean;
  lookupBySku(sku: string): Promise<LookupResult>;
  /** Fixture sources expose their catalogue so the demo index can link to it. */
  availableSkus(): string[];
}

/**
 * Real ABI SKUs are short numeric strings (`16243`), but the check is deliberately
 * broader than that so an alphanumeric SKU cannot break the app later.
 *
 * An invalid SKU is rejected here rather than sent to the gateway — a scanned label
 * with a mangled code should not cost a network round trip.
 */
export function normaliseSku(raw: string): string | null {
  const trimmed = decodeURIComponent(raw).trim().toUpperCase();
  if (!trimmed || trimmed.length > 64) return null;
  if (!/^[A-Z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}
