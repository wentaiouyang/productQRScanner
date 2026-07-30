import type { CustomerProduct } from "@/lib/product/types";

/**
 * Definition list rather than a table: the rows are name/value pairs, and on a phone
 * a two-column table forces the values into a narrow gutter.
 */
export function SpecTable({ specs }: { specs: CustomerProduct["specs"] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="divide-y divide-rule">
      {specs.map((spec) => (
        <div key={spec.name} className="py-3 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-6">
          <dt className="text-sm text-ink-faint">{spec.name}</dt>
          <dd
            className="text-sm leading-relaxed mt-1 sm:mt-0 rich-text"
            dangerouslySetInnerHTML={{ __html: spec.valueHtml }}
          />
        </div>
      ))}
    </dl>
  );
}
