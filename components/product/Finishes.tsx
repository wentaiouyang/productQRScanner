import Link from "next/link";

import type { CustomerProduct } from "@/lib/product/types";

/**
 * Each finish is its own SKU with its own label in the showroom, so these link to the
 * same route the QR codes point at.
 */
export function Finishes({ finishes }: { finishes: CustomerProduct["finishes"] }) {
  if (finishes.length <= 1) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {finishes.map((finish) =>
        finish.isCurrent ? (
          <li
            key={finish.sku}
            aria-current="true"
            className="border border-brass bg-brass-soft px-3 py-1.5 text-sm"
          >
            {finish.label}
          </li>
        ) : (
          <li key={finish.sku}>
            <Link
              href={`/p/${finish.sku}`}
              className="block border border-rule bg-surface px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
            >
              {finish.label}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}
