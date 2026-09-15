import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaPiggyBank } from "react-icons/fa6";
import { toast } from "react-toastify";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";
import Modal from "../components/UI/Modal";
import ConfirmDialog from "../components/UI/ConfirmDialog";
import EmptyState from "../components/UI/EmptyState";
import PageHeader from "../components/UI/PageHeader";
import ProgressBar from "../components/UI/ProgressBar";
import { SkeletonCard } from "../components/UI/Skeleton";
import { formatMoney } from "../utils/format";
import budgetsService from "../api/budgetsService";
import categoriesService from "../api/categoriesService";
import transactionsService from "../api/transactionsService";

const emptyForm = { categoryId: "", limit: "", period: "monthly" };

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
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
      const [b, c, t] = await Promise.allSettled([
        budgetsService.getAll(),
        categoriesService.getAll(),
        transactionsService.getAll(),
      ]);
      if (b.status === "fulfilled") setBudgets(b.value.data || []);
      if (c.status === "fulfilled") setCategories(c.value.data || []);
      if (t.status === "fulfilled") setTransactions(t.value.data || []);
    } catch (err) {
      toast.error("Byudjetlarni yuklashda xatolik yuz berdi.");
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

  const openEdit = (b) => {
    setForm({
      categoryId: b.categoryId || b.category?.id || "",
      limit: b.limit ?? b.amount ?? "",
      period: b.period || "monthly",
    });
    setEditingId(b.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) return toast.warn("Kategoriyani tanlang.");
    if (!form.limit || Number(form.limit) <= 0) return toast.warn("To'g'ri limit kiriting.");
    setSaving(true);
    try {
      const payload = { ...form, limit: Number(form.limit) };
      if (editingId) {
        await budgetsService.update(editingId, payload);
        toast.success("Byudjet yangilandi.");
      } else {
        await budgetsService.create(payload);
        toast.success("Yangi byudjet qo'shildi.");
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
      await budgetsService.remove(deleteId);
      toast.success("Byudjet o'chirildi.");
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
        title="Byudjetlar"
        subtitle="Har bir kategoriya uchun oylik xarajat limitini belgilang"
        action={
          <Button onClick={openCreate}>
            <FiPlus size={17} /> Yangi byudjet
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaPiggyBank}
            title="Byudjet belgilanmagan"
            description="Xarajatlaringizni nazorat qilish uchun kategoriyalarga limit belgilang."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Byudjet qo'shish
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {budgets.map((b, i) => {
              const categoryId = Number(b.categoryId ?? b.category?.id ?? 0);
              const spent = transactions
                .filter((transaction) => {
                  const isExpense = String(transaction.type || "").toLowerCase() === "expense" || String(transaction.type || "").toLowerCase() === "chiqim";
                  const sameCategory = Number(transaction.categoryId ?? transaction.category?.id ?? 0) === categoryId;
                  return isExpense && sameCategory;
                })
                .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
              const limit = Number(b.limit || b.amount) || 1;
              const pct = Math.min(100, Math.round((spent / limit) * 100));
              const overBudget = spent > limit;
              return (
                <motion.div
                  key={b.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="p-5"
                    onPointerDown={(event) => {
                      if (event.pointerType === "mouse") return;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      startLongPress(b.id);
                    }}
                    onPointerUp={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                    onContextMenu={(event) => event.preventDefault()}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {b.category?.name || categories.find((c) => c.id === b.categoryId)?.name || "Kategoriya"}
                        </p>
                        <p className="text-xs text-muted capitalize">
                          {b.period === "weekly" ? "Haftalik" : b.period === "yearly" ? "Yillik" : "Oylik"}
                        </p>
                      </div>
                      <div className={`flex gap-1 transition-all duration-200 lg:opacity-100 ${mobileActionsId === b.id ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0 lg:pointer-events-auto"}`}>
                        <button
                          onClick={() => openEdit(b)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(b.id)}
                          className="p-1.5 rounded-lg hover:bg-expense/10 text-expense"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <ProgressBar value={spent} max={limit} />

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted figure">
                        {formatMoney(spent)} / {formatMoney(limit)}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          overBudget ? "text-expense" : "text-brand-dark dark:text-brand"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    {overBudget && (
                      <p className="text-xs text-expense mt-2">Byudjet limiti oshib ketdi!</p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Byudjetni tahrirlash" : "Yangi byudjet"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Kategoriya"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Tanlang</option>
            {categories
              .filter((c) => (c.type || "expense") === "expense")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>

          <Input
            label="Limit summasi"
            type="number"
            placeholder="0"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
          />

          <Select
            label="Davr"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
          >
            <option value="weekly">Haftalik</option>
            <option value="monthly">Oylik</option>
            <option value="yearly">Yillik</option>
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
        message="Ushbu byudjetni o'chirishni tasdiqlaysizmi?"
      />
    </div>
  );
}
