import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiUser, FiFileText } from "react-icons/fi";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Ism familiya kiritilishi shart";
    if (!form.email.trim()) e.email = "Email kiritilishi shart";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email formati noto'g'ri";
    if (!form.password) e.password = "Parol kiritilishi shart";
    else if (form.password.length < 6) e.password = "Kamida 6 ta belgidan iborat bo'lsin";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Parollar mos kelmadi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const { confirmPassword, ...payload } = form;
    const res = await register(payload);
    if (res.success) navigate("/");
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-paper px-4 py-3 dark:bg-ink sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-3 flex flex-col items-center sm:mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand">
            <FiFileText size={24} className="text-ink" />
          </div>
        </div>

        <div className="rounded-2xl border border-lineLight bg-surfacelight p-4 shadow-card dark:border-line dark:bg-surfacedark dark:shadow-cardDark sm:p-8">
          <h2 className="mb-4 text-center font-display text-xl font-semibold sm:mb-5">Ro'yxatdan o'tish</h2>

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
            <Input
              label="To'liq ism"
              icon={FiUser}
              placeholder="Aziz Karimov"
              value={form.fullName}
              error={errors.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
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
              placeholder="Kamida 6 ta belgi"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input
              label="Parolni tasdiqlang"
              type="password"
              icon={FiLock}
              placeholder="••••••••"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Ro'yxatdan o'tish
            </Button>
          </form>

          <p className="mt-3 text-center text-sm text-muted sm:mt-6">
            Hisobingiz bormi?{" "}
            <Link to="/login" className="text-brand-dark dark:text-brand font-medium hover:underline">
              Tizimga kirish
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
