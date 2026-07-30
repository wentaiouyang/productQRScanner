import Link from "next/link";

import type { CustomerProduct } from "@/lib/product/types";

/**
 * A tap that cannot function without a separately sold filtration system is the kind
 * of thing a customer needs told before they leave the showroom, not on the invoice.
 * It gets a callout rather than a row in a table.
 */
export function RequiredWith({
  requires,
  noteHtml,
}: {
  requires: CustomerProduct["requires"];
  noteHtml: string;
}) {
  if (requires.length === 0) return null;

  return (
    <aside className="border border-brass/40 bg-brass-soft/60 p-4">
      <h2 className="eyebrow mb-2 text-brass">Required, sold separately</h2>

      {noteHtml ? (
        <div
          className="rich-text text-sm text-ink-soft mb-3"
          dangerouslySetInnerHTML={{ __html: noteHtml }}
        />
      ) : null}

      <ul className="space-y-1">
        {requires.map((item) => (
          <li key={item.sku}>
            <Link href={`/p/${item.sku}`} className="text-sm underline underline-offset-2">
              {item.name}
            </Link>
            <span className="text-ink-faint text-sm"> · SKU {item.sku}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
