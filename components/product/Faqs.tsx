import type { CustomerProduct } from "@/lib/product/types";

/** Native disclosure elements — accordion behaviour with no client JavaScript. */
export function Faqs({ faqs }: { faqs: CustomerProduct["faqs"] }) {
  if (faqs.length === 0) return null;

  return (
    <ul className="divide-y divide-rule">
      {faqs.map((faq) => (
        <li key={faq.question}>
          <details className="group py-3">
            <summary className="flex cursor-pointer items-start gap-3 list-none">
              <span
                aria-hidden
                className="mt-1.5 shrink-0 text-ink-faint transition-transform group-open:rotate-45"
              >
                +
              </span>
              <span className="text-sm font-medium">{faq.question}</span>
            </summary>
            <p className="mt-2 pl-6 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
