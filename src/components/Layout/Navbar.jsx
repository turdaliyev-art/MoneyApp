import { FiMenu, FiSun, FiMoon, FiLogOut, FiChevronDown } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../UI/ConfirmDialog";

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (user?.fullName || user?.name || user?.username || "F")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-lineLight dark:border-line bg-surfacelight/80 dark:bg-surfacedark/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="lg:hidden" />

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Rejimni almashtirish"
          className="rounded-lg border border-lineLight p-2.5 transition-colors hover:border-brand dark:border-line"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.65 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.65 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex"
            >
              {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-brand text-ink flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
              {user?.fullName || user?.name || user?.username || "Foydalanuvchi"}
            </span>
            <FiChevronDown size={15} className="text-muted" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-lineLight dark:border-line bg-surfacelight dark:bg-surfacedark shadow-card dark:shadow-cardDark py-1.5 animate-popIn origin-top-right">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              >
                Profil sozlamalari
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
                className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-expense hover:bg-expense/10"
              >
                <FiLogOut size={15} /> Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
        title="Hisobdan chiqish"
        message="Hisobingizdan chiqishni tasdiqlaysizmi?"
        confirmLabel="Ha, chiqish"
      />
    </header>
  );
}
