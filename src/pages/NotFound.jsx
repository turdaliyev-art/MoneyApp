import { Link } from "react-router-dom";
import { FiCompass } from "react-icons/fi";
import Button from "../components/UI/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-paper dark:bg-ink">
      <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
        <FiCompass size={28} className="text-brand-dark dark:text-brand" />
      </div>
      <h1 className="font-display text-3xl font-bold mb-2">404</h1>
      <p className="text-muted mb-6">Siz izlagan sahifa topilmadi.</p>
      <Link to="/">
        <Button>Bosh sahifaga qaytish</Button>
      </Link>
    </div>
  );
}
