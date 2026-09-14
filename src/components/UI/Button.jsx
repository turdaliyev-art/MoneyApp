export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none";

  const variants = {
    primary: "bg-brand text-ink hover:bg-brand-light shadow-sm hover:shadow-md",
    secondary:
      "bg-surfacelight dark:bg-surfacedark2 text-ink dark:text-paper border border-lineLight dark:border-line hover:border-brand",
    danger: "bg-expense text-white hover:brightness-110",
    ghost: "bg-transparent text-ink dark:text-paper hover:bg-black/5 dark:hover:bg-white/5",
    outline: "bg-transparent border border-brand text-brand-dark dark:text-brand hover:bg-brand/10",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
