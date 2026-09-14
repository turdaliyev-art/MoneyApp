export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-surfacelight dark:bg-surfacedark rounded-xl border border-lineLight dark:border-line shadow-card dark:shadow-cardDark ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
