import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiFileText } from "react-icons/fi";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email kiritilishi shart";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email formati noto'g'ri";
    if (!form.password) e.password = "Parol kiritilishi shart";
    else if (form.password.length < 4) e.password = "Parol juda qisqa";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const res = await login(form);
    if (res.success) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-brand flex items-center justify-center mb-3">
            <FiFileText size={24} className="text-ink" />
          </div>
          <h1 className="font-display text-2xl font-bold">PulNazorat</h1>
          <p className="text-sm text-muted mt-1">Shaxsiy moliyangizni nazorat qiling</p>
        </div>

        <div className="bg-surfacelight dark:bg-surfacedark border border-lineLight dark:border-line rounded-2xl shadow-card dark:shadow-cardDark p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold mb-1">Tizimga kirish</h2>
          <p className="text-sm text-muted mb-6">Hisobingizga kirish uchun ma'lumotlarni kiriting</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email manzil"
              type="email"
              icon={FiMail}
              placeholder="siz@example.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Parol"
              type="password"
              icon={FiLock}
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Kirish
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Hisobingiz yo'qmi?{" "}
            <Link to="/register" className="text-brand-dark dark:text-brand font-medium hover:underline">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
