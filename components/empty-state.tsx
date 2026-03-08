export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-border px-8 py-16 text-center">
      <div className="mb-3 text-4xl">📭</div>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      {description && <p className="mt-2 text-sm text-secondary">{description}</p>}
    </div>
  );
}
