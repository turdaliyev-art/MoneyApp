import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaWallet, FaCreditCard } from "react-icons/fa6";
import { toast } from "react-toastify";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";
import Modal from "../components/UI/Modal";
import ConfirmDialog from "../components/UI/ConfirmDialog";
import EmptyState from "../components/UI/EmptyState";
import PageHeader from "../components/UI/PageHeader";
import { SkeletonCard } from "../components/UI/Skeleton";
import { formatMoney } from "../utils/format";
import walletsService from "../api/walletsService";
import goalsService from "../api/goalsService";

const emptyForm = { name: "", type: "cash", balance: "", currency: "UZS" };

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mobileActionsId, setMobileActionsId] = useState(null);
  const longPressTimer = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [walletResponse, goalResponse] = await Promise.allSettled([
        walletsService.getAll(),
        goalsService.getAll(),
      ]);
      if (walletResponse.status === "fulfilled") setWallets(walletResponse.value.data || []);
      if (goalResponse.status === "fulfilled") setGoals(goalResponse.value.data || []);
    } catch (err) {
      toast.error("Hamyonlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (w) => {
    setForm({
      name: w.name || "",
      type: w.type || "cash",
      balance: w.balance ?? "",
      currency: w.currency || "UZS",
    });
    setEditingId(w.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Hamyon nomini kiriting.");
    setSaving(true);
    try {
      const payload = { ...form, balance: Number(form.balance) || 0 };
      if (editingId) {
        await walletsService.update(editingId, payload);
        toast.success("Hamyon muvaffaqiyatli yangilandi.");
      } else {
        await walletsService.create(payload);
        toast.success("Yangi hamyon qo'shildi.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const linkedGoals = goals.filter((goal) =>
      String(goal.walletId ?? goal.wallet?.id) === String(deleteId)
    );
    if (linkedGoals.length > 0) {
      setDeleteId(null);
      toast.warn("Bu hamyon maqsadga biriktirilgan. Avval maqsadni boshqa hamyonga ko'chiring yoki o'chiring.");
      return;
    }

    setDeleting(true);
    try {
      await walletsService.remove(deleteId);
      toast.success("Hamyon o'chirildi.");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi.");
    } finally {
      setDeleting(false);
    }
  };

  const startLongPress = (id) => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => setMobileActionsId(id), 2000);
  };

  const cancelLongPress = () => clearTimeout(longPressTimer.current);

  return (
    <div>
      <PageHeader
        title="Hamyonlar"
        subtitle="Barcha hamyon va kartalaringizni shu yerdan boshqaring"
        action={
          <Button onClick={openCreate}>
            <FiPlus size={17} /> Yangi hamyon
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaWallet}
            title="Hamyonlar mavjud emas"
            description="Balansingizni kuzatish uchun birinchi hamyoningizni qo'shing."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Hamyon qo'shish
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {wallets.map((w, i) => (
              <motion.div
                key={w.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className="relative overflow-hidden p-5 group"
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                    startLongPress(w.id);
                  }}
                  onPointerUp={cancelLongPress}
                  onPointerCancel={cancelLongPress}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10 group-hover:bg-brand/20 transition-colors" />
                  <div className="relative flex items-start justify-between mb-6">
                    <div className="h-11 w-11 rounded-lg bg-brand/15 flex items-center justify-center">
                      <FaCreditCard size={20} className="text-brand-dark dark:text-brand" />
                    </div>
                    <div className={`flex gap-1 lg:pointer-events-auto lg:opacity-100 ${mobileActionsId === w.id ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                      <button
                        onClick={() => openEdit(w)}
                        aria-label="Hamyonni tahrirlash"
                        className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(w.id)}
                        aria-label="Hamyonni o'chirish"
                        className="rounded-lg p-2 text-expense hover:bg-expense/10"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="mb-1 break-words text-base font-semibold text-muted">{w.name}</p>
                  <p className="figure mb-1 whitespace-nowrap text-2xl font-bold">{formatMoney(w.balance, w.currency || "so'm")}</p>
                  <p className="text-sm text-muted capitalize">{w.type || "naqd pul"}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Hamyonni tahrirlash" : "Yangi hamyon qo'shish"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Hamyon nomi"
            placeholder="Masalan: Naqd pul, Karta"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Turi"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="cash">Naqd pul</option>
            <option value="card">Bank kartasi</option>
            <option value="bank">Bank hisobi</option>
            <option value="other">Boshqa</option>
          </Select>
          <Input
            label="Boshlang'ich balans"
            type="number"
            placeholder="0"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
          />
          <Select
            label="Valyuta"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          >
            <option value="UZS">UZS (so'm)</option>
            <option value="USD">USD (dollar)</option>
            <option value="EUR">EUR (evro)</option>
          </Select>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="Ushbu hamyonni o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
}
