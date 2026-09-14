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
    <div className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-paper px-4 py-4 dark:bg-ink sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-4 flex flex-col items-center sm:mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand">
            <FiFileText size={24} className="text-ink" />
          </div>
        </div>

        <div className="rounded-2xl border border-lineLight bg-surfacelight p-4 shadow-card dark:border-line dark:bg-surfacedark dark:shadow-cardDark sm:p-8">
          <h2 className="mb-4 text-center font-display text-xl font-semibold sm:mb-6">Tizimga kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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

          <p className="mt-4 text-center text-sm text-muted sm:mt-6">
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
