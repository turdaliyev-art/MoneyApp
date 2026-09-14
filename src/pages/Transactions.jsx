import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiArrowUpRight, FiArrowDownRight, FiFilter, FiShuffle } from "react-icons/fi";
import { toast } from "react-toastify";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";
import Modal from "../components/UI/Modal";
import ConfirmDialog from "../components/UI/ConfirmDialog";
import EmptyState from "../components/UI/EmptyState";
import PageHeader from "../components/UI/PageHeader";
import { SkeletonRow } from "../components/UI/Skeleton";
import { formatMoney, formatDate } from "../utils/format";
import transactionsService from "../api/transactionsService";
import walletsService from "../api/walletsService";
import categoriesService from "../api/categoriesService";

const emptyForm = {
  type: "expense",
  amount: "",
  walletId: "",
  categoryId: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mobileActionsId, setMobileActionsId] = useState(null);
  const longPressTimer = useRef(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [t, w, c] = await Promise.allSettled([
        transactionsService.getAll(),
        walletsService.getAll(),
        categoriesService.getAll(),
      ]);
      if (t.status === "fulfilled") setTransactions(t.value.data || []);
      if (w.status === "fulfilled") setWallets(w.value.data || []);
      if (c.status === "fulfilled") setCategories(c.value.data || []);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi.");
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

  const openEdit = (t) => {
    setForm({
      type: t.type || "expense",
      amount: t.amount ?? "",
      walletId: t.walletId || t.wallet?.id || "",
      categoryId: t.categoryId || t.category?.id || "",
      description: t.description || "",
      date: (t.date || t.createdAt || "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    });
    setEditingId(t.id);
    setModalOpen(true);
  };

  const getWalletName = (transaction) => (
    transaction.wallet?.name ||
    wallets.find((wallet) => String(wallet.id) === String(transaction.walletId))?.name ||
    "Hamyon ko'rsatilmagan"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast.warn("To'g'ri summa kiriting.");
    if (!form.walletId) return toast.warn("Hamyonni tanlang.");

    const selectedWallet = wallets.find((wallet) => String(wallet.id) === String(form.walletId));
    const selectedWalletBalance = Number(selectedWallet?.balance);
    const editedTransaction = editingId && transactions.find((transaction) => transaction.id === editingId);
    const editedExpenseAmount = editedTransaction && (editedTransaction.type || "").toLowerCase() === "expense"
      ? Number(editedTransaction.amount) || 0
      : 0;
    const isSameWallet = editedTransaction && selectedWallet && String(editedTransaction.walletId) === String(selectedWallet.id);
    const availableBalance = selectedWalletBalance + (isSameWallet ? editedExpenseAmount : 0);

    if (form.type === "expense" && Number.isFinite(selectedWalletBalance) && Number(form.amount) > availableBalance) {
      return toast.warn("Hamyonda mablag' yetarli emas.");
    }

    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await transactionsService.update(editingId, payload);
        toast.success("Tranzaksiya yangilandi.");
      } else {
        await transactionsService.create(payload);
        toast.success("Yangi tranzaksiya qo'shildi.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const message = err.response?.data?.message || "";
      if (/yetarli|insufficient|balance|mablag/i.test(message)) {
        toast.warn("Hamyonda mablag' yetarli emas.");
      } else {
        toast.error("Saqlashda xatolik yuz berdi.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await transactionsService.remove(deleteId);
      toast.success("Tranzaksiya o'chirildi.");
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

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter === "all") return true;
        return (t.type || "").toLowerCase() === typeFilter;
      })
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (t.description || "").toLowerCase().includes(q) ||
          (t.category?.name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [transactions, search, typeFilter]);

  return (
    <div>
      <PageHeader
        title="Tranzaksiyalar"
        subtitle="Barcha kirim va chiqimlaringizni shu yerda boshqaring"
        action={
          <Button onClick={openCreate}>
            <FiPlus size={17} /> Yangi tranzaksiya
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              icon={FiSearch}
              placeholder="Tavsif yoki kategoriya bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-52 flex items-center gap-2">
            <FiFilter size={16} className="text-muted shrink-0" />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Barchasi</option>
              <option value="income">Faqat kirim</option>
              <option value="expense">Faqat chiqim</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="px-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FiShuffle}
            title="Tranzaksiya topilmadi"
            description="Qidiruv shartlariga mos tranzaksiya yo'q yoki hali qo'shilmagan."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Tranzaksiya qo'shish
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-lineLight dark:border-line">
                    <th className="px-5 py-3 font-medium">Tavsif</th>
                    <th className="px-5 py-3 font-medium">Kategoriya</th>
                    <th className="px-5 py-3 font-medium">Hamyon</th>
                    <th className="px-5 py-3 font-medium">Sana</th>
                    <th className="px-5 py-3 font-medium text-right">Summa</th>
                    <th className="px-5 py-3 font-medium text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((t) => {
                      const isIncome = (t.type || "").toLowerCase() === "income";
                      return (
                        <motion.tr
                          key={t.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-lineLight dark:border-line last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                  isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                                }`}
                              >
                                {isIncome ? <FiArrowDownRight size={14} /> : <FiArrowUpRight size={14} />}
                              </div>
                              <span className="font-medium">{t.description || "Tranzaksiya"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted">
                            {t.category?.name || categories.find((c) => c.id === t.categoryId)?.name || "-"}
                          </td>
                          <td className="px-5 py-3.5 text-muted">{getWalletName(t)}</td>
                          <td className="px-5 py-3.5 text-muted">{formatDate(t.date || t.createdAt)}</td>
                          <td
                            className={`px-5 py-3.5 text-right figure font-semibold ${
                              isIncome ? "text-income" : "text-expense"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatMoney(t.amount)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => openEdit(t)}
                                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteId(t.id)}
                                className="p-1.5 rounded-lg hover:bg-expense/10 text-expense"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
        
        <div className="sm:hidden px-3">
          <AnimatePresence>
            {filtered.map((t, idx) => {
              const isIncome = (t.type || "").toLowerCase() === "income";

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                    startLongPress(t.id);
                  }}
                  onPointerUp={cancelLongPress}
                  onPointerCancel={cancelLongPress}
                  onContextMenu={(event) => event.preventDefault()}
                  className={`relative py-4 ${
                    idx !== filtered.length - 1 ? "receipt-edge" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                        isIncome
                          ? "bg-income/10 text-income"
                          : "bg-expense/10 text-expense"
                      }`}
                    >
                      {isIncome ? (
                        <FiArrowDownRight size={17} />
                      ) : (
                        <FiArrowUpRight size={17} />
                      )}
                    </div>

                    <p
                      className={`figure min-w-0 text-right text-base font-bold leading-10 ${
                        isIncome ? "text-income" : "text-expense"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatMoney(t.amount)}
                    </p>
                  </div>

                  <div className="mt-2.5 min-w-0 pl-1">
                    <p className="break-words text-sm font-semibold leading-5">
                      {t.description || "Tranzaksiya"}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-5 text-muted">
                      <span>{formatDate(t.date || t.createdAt)}</span>
                      <span className="opacity-40">•</span>
                      <span className="break-words text-brand-dark dark:text-brand">
                        {getWalletName(t)}
                      </span>
                    </div>
                  </div>

                
<div
  className={`absolute right-1 top-14 flex items-center gap-1.5 rounded-xl bg-surfacelight/95 p-1.5 shadow-lg backdrop-blur-sm dark:bg-surfacedark/95 transition-all duration-200 ${
    mobileActionsId === t.id
      ? "pointer-events-auto translate-y-0 opacity-100"
      : "pointer-events-none translate-y-1 opacity-0"
  }`}
>
  <button
    onClick={() => {
      openEdit(t);
      setMobileActionsId(null);
    }}
    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
  >
    <FiEdit2 size={14} />
    Yangilash
  </button>

  <button
    onClick={() => {
      setDeleteId(t.id);
      setMobileActionsId(null);
    }}
    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-expense transition-colors hover:bg-expense/10"
  >
    <FiTrash2 size={14} />
    O‘chirish
  </button>
</div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Tranzaksiyani tahrirlash" : "Yangi tranzaksiya"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "expense" })}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.type === "expense"
                  ? "border-expense bg-expense/10 text-expense"
                  : "border-lineLight dark:border-line text-muted"
              }`}
            >
              Chiqim
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "income" })}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.type === "income"
                  ? "border-income bg-income/10 text-income"
                  : "border-lineLight dark:border-line text-muted"
              }`}
            >
              Kirim
            </button>
          </div>

          <Input
            label="Summa"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <Select
            label="Hamyon"
            value={form.walletId}
            onChange={(e) => setForm({ ...form, walletId: e.target.value })}
          >
            <option value="">Tanlang</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} - {formatMoney(w.balance, w.currency || "so'm")}
              </option>
            ))}
          </Select>

          <Select
            label="Kategoriya"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Tanlang</option>
            {categories
              .filter((c) => (c.type || "expense") === form.type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>

          <Input
            label="Sana"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <Input
            label="Tavsif (ixtiyoriy)"
            placeholder="Masalan: Bozordan xarid"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

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
        message="Ushbu tranzaksiyani o'chirishni tasdiqlaysizmi?"
      />
    </div>
  );
}
