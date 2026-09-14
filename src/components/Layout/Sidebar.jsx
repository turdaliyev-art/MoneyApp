
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiRepeat, FiX, FiBarChart2, FiChevronUp } from "react-icons/fi";
import {
  FaWallet,
  FaTags,
  FaPiggyBank,
  FaBullseye,
  FaHandHoldingDollar,
  FaReceipt,
} from "react-icons/fa6";

const links = [
  { to: "/", label: "Bosh sahifa", icon: FiGrid, end: true },
  { to: "/transactions", label: "Tranzaksiyalar", icon: FiRepeat },
  { to: "/wallets", label: "Hamyonlar", icon: FaWallet },
  { to: "/categories", label: "Kategoriyalar", icon: FaTags },
  { to: "/budgets", label: "Byudjetlar", icon: FaPiggyBank },
  { to: "/goals", label: "Maqsadlar", icon: FaBullseye },
  { to: "/debts", label: "Qarzlar daftari", icon: FaHandHoldingDollar },
  { to: "/statistics", label: "Statistika", icon: FiBarChart2 },
];

export default function Sidebar({ open, onClose }) {
  const [showMore, setShowMore] = useState(false);

  const mainLinks = links.slice(0, 4);
  const moreLinks = links.slice(4);

  const handleMoreClick = () => {
    setShowMore((prev) => !prev);
  };

  const handleMobileLinkClick = () => {
    setShowMore(false);
    onClose?.();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 top-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-lineLight bg-surfacelight dark:border-line dark:bg-surfacedark lg:flex lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="flex items-center justify-between border-b border-lineLight px-5 py-4 dark:border-line">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand">
              <FaReceipt size={19} className="text-ink" />
            </div>

            <div>
              <p className="font-display font-bold leading-tight">
                PulNazorat
              </p>
              <p className="text-[11px] leading-tight text-muted">
                moliya nazorati
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
          >
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand/15 text-brand-dark dark:text-brand"
                    : "text-ink/70 hover:bg-black/5 dark:text-paper/70 dark:hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-lineLight px-3.5 py-3 dark:border-line">
          <div className="rounded-lg bg-brand/10 px-3 py-2.5 text-xs text-ink/70 dark:text-paper/70">
            <p className="mb-1 font-semibold text-brand-dark dark:text-brand">
              Maslahat
            </p>
            Har kuni xarajatlaringizni kiritib boring — byudjetni nazorat
            qilish osonlashadi.
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-lineLight bg-surfacelight/95 px-2.5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-line dark:bg-surfacedark/95 lg:hidden">
        <div className="relative mx-auto max-w-md">
          <div
            className={`absolute bottom-[calc(100%+8px)] left-0 right-0 origin-bottom transition-all duration-300 ease-out ${
              showMore
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none translate-y-5 opacity-0"
            }`}
          >
            <div className="rounded-2xl border border-lineLight bg-surfacelight/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-line dark:bg-surfacedark/95">
              <div className="grid grid-cols-4 gap-1.5">
                {moreLinks.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={handleMobileLinkClick}
                    aria-label={label}
                    className={({ isActive }) =>
                      `flex min-h-[60px] items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-200 ${
                        isActive
                          ? "bg-brand/15 text-brand-dark dark:text-brand"
                          : "text-ink/70 hover:bg-black/5 dark:text-paper/70 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    <span className="flex flex-col items-center justify-center gap-1 text-center">
                      <Icon size={19} />
                      <span className="whitespace-nowrap text-[11px] font-semibold leading-tight">
                        {label}
                      </span>
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {mainLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={handleMobileLinkClick}
                aria-label={label}
                className={({ isActive }) =>
                  `flex min-h-[56px] items-center justify-center rounded-xl px-1 py-1.5 transition-all duration-200 ${
                    isActive
                      ? "bg-brand/15 text-brand-dark dark:text-brand shadow-sm"
                      : "text-ink/70 hover:bg-black/5 dark:text-paper/70 dark:hover:bg-white/5"
                  }`
                }
              >
                <span className="flex flex-col items-center justify-center gap-1 text-center">
                  <Icon size={19} />
                  <span className="whitespace-nowrap text-[10px] font-semibold leading-tight sm:text-[11px]">
                    {label}
                  </span>
                </span>
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleMoreClick}
              aria-label={showMore ? "Yopish" : "Ko'proq"}
              aria-expanded={showMore}
                className={`flex min-h-[56px] items-center justify-center rounded-xl px-1 py-1.5 text-ink/70 transition-all duration-300 hover:bg-black/5 dark:text-paper/70 dark:hover:bg-white/5 ${
                showMore
                  ? "bg-brand/15 text-brand-dark dark:text-brand"
                  : ""
              }`}
            >
              <span className="flex flex-col items-center justify-center gap-1.5 text-center">
                <FiChevronUp
                  size={19}
                  className={`transition-transform duration-300 ${
                    showMore ? "rotate-180" : "rotate-0"
                  }`}
                />
                <span className="text-[10px] font-semibold leading-tight sm:text-[11px]">
                  Ko'proq
                </span>
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

