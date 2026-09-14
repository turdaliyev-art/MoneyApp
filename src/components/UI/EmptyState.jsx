export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-fadeIn">
      {Icon && (
        <div className="mb-4 h-14 w-14 rounded-full bg-brand/10 flex items-center justify-center">
          <Icon size={26} className="text-brand-dark dark:text-brand" />
        </div>
      )}
      <h4 className="font-display font-semibold text-lg mb-1">{title}</h4>
      {description && <p className="text-sm text-muted max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
