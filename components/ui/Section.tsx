export function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-rule pt-6 ${className}`}>
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </section>
  );
}
