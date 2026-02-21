export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-steel-100">
          <Icon className="h-7 w-7 text-steel-400" />
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-steel-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-steel-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
