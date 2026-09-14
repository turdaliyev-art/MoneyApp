import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

export default function Input({ label, error, icon: Icon, className = "", type = "text", ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block w-full">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-paper/80">
          {label}
        </span>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />}
        <input
          type={isPassword && visible ? "text" : type}
          className={`w-full rounded-lg border bg-surfacelight dark:bg-surfacedark2 px-3.5 py-2.5 text-sm text-ink dark:text-paper placeholder:text-muted outline-none transition-colors focus:border-brand ${
            Icon ? "pl-10" : ""
          } ${isPassword ? "pr-11" : ""} ${error ? "border-expense" : "border-lineLight dark:border-line"} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink dark:hover:text-paper"
          >
            {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-expense">{error}</span>}
    </label>
  );
}
