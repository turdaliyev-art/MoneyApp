export default function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-paper/80">
          {label}
        </span>
      )}
      <select
        className={`w-full rounded-lg border bg-surfacelight dark:bg-surfacedark2 px-3.5 py-2.5 text-sm text-ink dark:text-paper outline-none transition-colors focus:border-brand ${
          error ? "border-expense" : "border-lineLight dark:border-line"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-expense">{error}</span>}
    </label>
  );
}
