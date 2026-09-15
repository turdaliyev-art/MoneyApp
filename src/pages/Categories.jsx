import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaTags, FaBagShopping, FaUtensils, FaCarSide, FaHouse, FaHeart, FaBriefcase, FaGift, FaPlane, FaGamepad, FaGraduationCap } from "react-icons/fa6";
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
import categoriesService from "../api/categoriesService";
import transactionsService from "../api/transactionsService";
import ProgressBar from "../components/UI/ProgressBar";
import { formatMoney } from "../utils/format";

const ICONS = {
  ShoppingBag: FaBagShopping,
  Utensils: FaUtensils,
  Car: FaCarSide,
  Home: FaHouse,
  Heart: FaHeart,
  Briefcase: FaBriefcase,
  Gift: FaGift,
  Plane: FaPlane,
  Gamepad2: FaGamepad,
  GraduationCap: FaGraduationCap,
  Tags: FaTags,
};

const COLORS = [
  "#F2B705",
  "#22C55E",
  "#F43F5E",
  "#3B82F6",
  "#A855F7",
  "#F97316",
  "#14B8A6",
  "#EC4899",
];

const emptyForm = { name: "", type: "expense", icon: "Tags", color: COLORS[0] };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mobileActionsId, setMobileActionsId] = useState(null);
  const longPressTimer = useRef(null);

  const startLongPress = (id) => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => setMobileActionsId(id), 2000);
  };

  const cancelLongPress = () => clearTimeout(longPressTimer.current);

  const load = async () => {
    setLoading(true);
    try {
      const [categoryResponse, transactionResponse] = await Promise.allSettled([
        categoriesService.getAll(),
        transactionsService.getAll(),
      ]);
      if (categoryResponse.status === "fulfilled") {
        setCategories((categoryResponse.value.data || []).filter((category) => (category.type || "expense").toLowerCase() === "expense"));
      }
      if (transactionResponse.status === "fulfilled") setTransactions(transactionResponse.value.data || []);
    } catch (err) {
      toast.error("Kategoriyalarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryStats = useMemo(() => {
    const expenses = transactions.filter(
      (transaction) => (transaction.type || "").toLowerCase() === "expense"
    );
    const totalExpense = expenses.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      totalExpense,
      items: categories.map((category) => {
        const categoryTransactions = expenses.filter(
          (transaction) => String(transaction.categoryId ?? transaction.category_id) === String(category.id)
        );
        const amount = categoryTransactions.reduce(
          (sum, transaction) => sum + Number(transaction.amount || 0),
          0
        );
        return {
          category,
          amount,
          count: categoryTransactions.length,
          percentage: totalExpense ? Math.round((amount / totalExpense) * 100) : 0,
        };
      }).sort((a, b) => b.amount - a.amount),
    };
  }, [categories, transactions]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      name: c.name || "",
      type: "expense",
      icon: c.icon || "Tags",
      color: c.color || COLORS[0],
    });
    setEditingId(c.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Kategoriya nomini kiriting.");
    setSaving(true);
    try {
      const payload = { ...form, type: "expense" };
      if (editingId) {
        await categoriesService.update(editingId, payload);
        toast.success("Kategoriya yangilandi.");
      } else {
        await categoriesService.create(payload);
        toast.success("Yangi kategoriya qo'shildi.");
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
    setDeleting(true);
    try {
      await categoriesService.remove(deleteId);
      toast.success("Kategoriya o'chirildi.");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kategoriyalar"
        subtitle="Chiqimlaringizni tartiblash uchun kategoriyalar"
        action={
          <Button onClick={openCreate}>
            <FiPlus size={17} /> Yangi kategoriya
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaTags}
            title="Kategoriyalar mavjud emas"
            description="Tranzaksiyalaringizni tartiblash uchun kategoriya qo'shing."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Kategoriya qo'shish
              </Button>
            }
          />
        </Card>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <AnimatePresence>
            {categoryStats.items.map(({ category: c, amount, count, percentage }, i) => {
              const Icon = ICONS[c.icon] || FaTags;
              const isExpense = (c.type || "expense") === "expense";
              return (
                <motion.div
                  key={c.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className="group relative p-5"
                    onPointerDown={(event) => {
                      if (event.pointerType === "mouse") return;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      startLongPress(c.id);
                    }}
                    onPointerUp={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                    onContextMenu={(event) => event.preventDefault()}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${c.color || COLORS[0]}22` }}
                      >
                        <Icon size={18} style={{ color: c.color || COLORS[0] }} />
                      </div>
                      <span className="text-2xl font-bold figure">{percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold truncate">{c.name}</p>
                        <p className="mt-1 text-xs text-muted">{count} ta tranzaksiya</p>
                      </div>
                      <div className={`flex gap-1 transition-all duration-200 lg:pointer-events-auto lg:opacity-0 lg:group-hover:opacity-100 ${mobileActionsId === c.id ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <FiEdit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg hover:bg-expense/10 text-expense"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className={`figure mt-3 text-lg font-semibold ${isExpense ? "text-expense" : "text-income"}`}>
                      {isExpense ? "-" : "+"}{formatMoney(amount)}
                    </p>
                    <ProgressBar value={percentage} max={100} colorClass="bg-brand" />
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <Card className="p-5">
          <h2 className="mb-5 font-display text-lg font-semibold">Umumiy xarajatlar</h2>
          <div className="space-y-4">
            {categoryStats.items.filter((item) => item.amount > 0).map(({ category: c, amount, percentage }) => {
              const Icon = ICONS[c.icon] || FaTags;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: c.color || COLORS[0], color: "#fff" }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="figure whitespace-nowrap font-semibold">-{formatMoney(amount)}</span>
                    </div>
                    <ProgressBar value={amount} max={categoryStats.totalExpense} colorClass="bg-brand" />
                  </div>
                  <span className="w-9 text-right text-xs text-muted">{percentage}%</span>
                </div>
              );
            })}
            {!categoryStats.items.some((item) => item.amount > 0) && (
              <p className="text-sm text-muted">Hali xarajatlar mavjud emas.</p>
            )}
          </div>
        </Card>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Kategoriya nomi"
            placeholder="Masalan: Oziq-ovqat"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Turi"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="expense">Chiqim</option>
            <option value="income">Kirim</option>
          </Select>
i
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-paper/80">
              Ikonka
            </span>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(ICONS).map(([key, Icon]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setForm({ ...form, icon: key })}
                  className={`h-10 rounded-lg flex items-center justify-center border transition-colors ${
                    form.icon === key
                      ? "border-brand bg-brand/10"
                      : "border-lineLight dark:border-line hover:border-brand/50"
                  }`}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-paper/80">
              Rang
            </span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    form.color === c ? "ring-2 ring-offset-2 ring-brand scale-110 dark:ring-offset-surfacedark" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
        message="Ushbu kategoriyani o'chirishni tasdiqlaysizmi?"
      />
    </div>
  );
}
