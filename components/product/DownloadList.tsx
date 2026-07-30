export function DownloadList({ items }: { items: { label: string; link: string }[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-rule">
      {items.map((item) => (
        <li key={item.link}>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 py-3 text-sm"
          >
            <span className="group-hover:text-brass transition-colors">{item.label}</span>
            <span aria-hidden className="text-ink-faint shrink-0">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
