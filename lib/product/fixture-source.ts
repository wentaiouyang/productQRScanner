import { FIXTURES } from "./fixtures";
import type { LookupResult, ProductSource } from "./source";
import { normaliseSku } from "./source";

/**
 * Reads the demo dataset instead of the gateway.
 *
 * Swapping this for the gateway-backed source is the only change needed once
 * application-identity access is granted — no page or component imports fixtures
 * directly.
 */
class FixtureProductSource implements ProductSource {
  readonly name = "fixtures";
  readonly isFixture = true;

  async lookupBySku(sku: string): Promise<LookupResult> {
    const normalised = normaliseSku(sku);
    if (!normalised) return { kind: "not-found" };

    const matches = FIXTURES.filter((product) => product.sku.toUpperCase() === normalised);
    if (matches.length === 0) return { kind: "not-found" };

    return { kind: "found", product: matches[0], matchCount: matches.length };
  }

  availableSkus(): string[] {
    return FIXTURES.map((product) => product.sku);
  }
}

export const productSource: ProductSource = new FixtureProductSource();
