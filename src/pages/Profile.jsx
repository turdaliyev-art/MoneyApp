import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FiActivity, FiCalendar, FiDollarSign, FiKey, FiLogOut, FiMail, FiSave, FiShield, FiUser } from "react-icons/fi";
import { FaWallet } from "react-icons/fa6";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import Select from "../components/UI/Select";
import PageHeader from "../components/UI/PageHeader";
import { formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import usersService from "../api/usersService";
import transactionsService from "../api/transactionsService";
import walletsService from "../api/walletsService";
import ConfirmDialog from "../components/UI/ConfirmDialog";
import Modal from "../components/UI/Modal";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    currency: user?.currency || "UZS",
  });
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", password: "", confirmPassword: "" });
  const [accountStats, setAccountStats] = useState({ transactions: 0, expenses: 0, wallets: 0 });
  const { logout } = useAuth();

  useEffect(() => {
    Promise.allSettled([transactionsService.getAll(), walletsService.getAll()]).then(([transactions, wallets]) => {
      const list = transactions.status === "fulfilled" ? transactions.value.data || [] : [];
      setAccountStats({
        transactions: list.length,
        expenses: list.filter((item) => !["income", "kirim"].includes((item.type || "").toLowerCase())).reduce((sum, item) => sum + Number(item.amount || 0), 0),
        wallets: wallets.status === "fulfilled" ? (wallets.value.data || []).length : 0,
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Foydalanuvchi identifikatori topilmadi.");
      return;
    }
    setSaving(true);
    try {
      const res = await usersService.update(user.id, form);
      setUser({ ...user, ...(res.data || form) });
      toast.success("Profil ma'lumotlari yangilandi.");
    } catch (err) {
      toast.error("Yangilashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const joinedAt = user?.created_at || user?.createdAt;
  const initials = useMemo(() => (form.fullName || "F").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(), [form.fullName]);

  return (
    <div>
      <PageHeader title="Profil sozlamalari" subtitle="Shaxsiy ma'lumotlaringizni yangilang" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="p-6"><div className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-ink">{initials}</div><div><p className="font-semibold">{form.fullName || "Foydalanuvchi"}</p><p className="text-sm text-muted">{form.email}</p><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-income/10 px-2 py-0.5 text-xs text-income"><FiActivity size={11} /> Faol hisob</span></div></div><form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="To'liq ism" icon={FiUser} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /><Input label="Email" type="email" icon={FiMail} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Select label="Asosiy valyuta" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option value="UZS">UZS - O'zbek so'mi</option><option value="USD">USD - AQSh dollari</option><option value="EUR">EUR - Yevro</option><option value="RUB">RUB - Rossiya rubli</option></Select><div className="flex items-end sm:col-span-2"><Button type="submit" loading={saving}><FiSave size={16} /> O'zgarishlarni saqlash</Button></div></form></Card>
          <Card className="p-6"><div className="mb-4 flex items-center gap-2"><FiShield size={18} className="text-income" /><h2 className="font-display font-semibold">Xavfsizlik</h2></div><div className="rounded-lg border border-lineLight p-4 dark:border-line"><p className="text-sm font-medium">Parolni yangilash</p><p className="mt-1 text-xs text-muted">Hisobingizni himoyalash uchun kuchli paroldan foydalaning.</p><Button type="button" variant="secondary" className="mt-4" onClick={() => setPasswordOpen(true)}><FiKey size={16} /> Parolni o'zgartirish</Button></div></Card>
        </div>
        <div className="space-y-6"><Card className="p-5"><h2 className="mb-4 font-display font-semibold">Hisob statistikasi</h2><div className="space-y-3">{[[FiCalendar, "Ro'yxatdan o'tgan", joinedAt ? new Date(joinedAt).toLocaleDateString("uz-UZ") : "-", "text-blue-500"], [FaWallet, "Hamyonlar", accountStats.wallets, "text-income"], [FiDollarSign, "Jami tranzaksiyalar", accountStats.transactions, "text-brand-dark dark:text-brand"], [FiActivity, "Jami xarajat", formatMoney(accountStats.expenses), "text-expense"]].map(([Icon, label, value, color]) => <div key={label} className="flex items-center gap-3 rounded-lg bg-black/[0.04] p-3 dark:bg-white/[0.06]"><Icon size={17} className={color} /><div><p className="text-xs text-muted">{label}</p><p className="figure text-sm font-semibold">{value}</p></div></div>)}</div></Card><Card className="p-5"><h2 className="mb-4 font-display font-semibold">Hisob harakatlari</h2><button onClick={() => setLogoutOpen(true)} className="flex w-full items-center gap-2 rounded-lg border border-expense/20 px-3 py-2.5 text-left text-sm text-expense hover:bg-expense/10"><FiLogOut size={16} /> Hisobdan chiqish</button></Card></div>
      </div>
      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Parolni o'zgartirish" maxWidth="max-w-md">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (passwordForm.password.length < 6) return toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lsin.");
          if (passwordForm.password !== passwordForm.confirmPassword) return toast.error("Yangi parollar mos kelmadi.");
          if (!user?.id) return toast.error("Foydalanuvchi identifikatori topilmadi.");
          setPasswordSaving(true);
          try {
            await usersService.update(user.id, { password: passwordForm.password, currentPassword: passwordForm.currentPassword });
            setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" });
            setPasswordOpen(false);
            toast.success("Parol muvaffaqiyatli o'zgartirildi.");
          } catch (err) {
            toast.error(err.response?.data?.message || "Parolni o'zgartirishda xatolik yuz berdi.");
          } finally {
            setPasswordSaving(false);
          }
        }}>
          <Input label="Joriy parol" type="password" icon={FiKey} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
          <Input label="Yangi parol" type="password" icon={FiKey} value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} required />
          <Input label="Yangi parolni tasdiqlang" type="password" icon={FiKey} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="secondary" onClick={() => setPasswordOpen(false)}>Bekor qilish</Button><Button type="submit" loading={passwordSaving}><FiSave size={16} /> Saqlash</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={() => { setLogoutOpen(false); logout(); }} title="Hisobdan chiqish" message="Hisobingizdan chiqishni tasdiqlaysizmi?" confirmLabel="Ha, chiqish" />
    </div>
  );
}
