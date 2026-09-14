import { FaWallet } from "react-icons/fa6";

export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-paper dark:bg-ink">
      <div className="flex flex-col items-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/20">
          <span className="absolute inset-0 rounded-2xl border-2 border-brand-light/70 animate-ping" />
          <FaWallet className="relative text-2xl text-ink" aria-hidden="true" />
        </div>
        <div className="mt-6 flex items-center gap-1.5" aria-label="Yuklanmoqda">
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-loaderDot" />
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-loaderDot [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-loaderDot [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}