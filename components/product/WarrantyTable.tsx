import type { CustomerProduct } from "@/lib/product/types";

/**
 * Warranty genuinely is a matrix — each component of the product carries a different
 * period for residential versus commercial use — so it stays a table, scrollable on
 * narrow screens rather than reflowed.
 */
export function WarrantyTable({ warranty }: { warranty: CustomerProduct["warranty"] }) {
  if (warranty.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[22rem] text-sm border-collapse">
        <thead>
          <tr className="text-left">
            <th scope="col" className="eyebrow pb-2 font-medium">
              Component
            </th>
            <th scope="col" className="eyebrow pb-2 font-medium">
              Residential
            </th>
            <th scope="col" className="eyebrow pb-2 font-medium">
              Commercial
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule">
          {warranty.map((row) => (
            <tr key={row.component}>
              <th scope="row" className="py-2.5 pr-4 font-normal text-ink-faint text-left">
                {row.component}
              </th>
              <td className="py-2.5 pr-4">{row.residential}</td>
              <td className="py-2.5">{row.commercial}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
