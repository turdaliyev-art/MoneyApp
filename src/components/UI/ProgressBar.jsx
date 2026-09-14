export default function ProgressBar({ value = 0, max = 100, colorClass = "bg-brand" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100 || 0));
  const isOver = value > max;
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isOver ? "bg-expense" : colorClass
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
