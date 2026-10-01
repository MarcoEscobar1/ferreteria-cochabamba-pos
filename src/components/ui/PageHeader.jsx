export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight text-steel-900 sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-steel-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
