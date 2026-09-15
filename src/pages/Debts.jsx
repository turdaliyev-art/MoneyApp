import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiArrowDownLeft, FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import { FaHandHoldingDollar } from "react-icons/fa6";
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
import debtsService from "../api/debtsService";

const emptyForm = {
  type: "lent", // lent = berilgan, borrowed = olingan
  personName: "",
  amount: "",
  dueDate: "",
  status: "pending",
  note: "",
};

const statusLabel = {
  pending: "Qaytarilmagan",
  paid: "Qaytarilgan",
};

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState("all");
  const [mobileActionsId, setMobileActionsId] = useState(null);
  const longPressTimer = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await debtsService.getAll();
      setDebts(res.data || []);
    } catch (err) {
      toast.error("Qarzlar ro'yxatini yuklashda xatolik yuz berdi.");
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

  const openEdit = (d) => {
    setForm({
      type: d.type || "lent",
      personName: d.personName || d.person || "",
      amount: d.amount ?? "",
      dueDate: (d.dueDate || "").slice(0, 10),
      status: d.status || "pending",
      note: d.note || "",
    });
    setEditingId(d.id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.personName.trim()) return toast.warn("Shaxs ismini kiriting.");
    if (!form.amount || Number(form.amount) <= 0) return toast.warn("To'g'ri summa kiriting.");
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await debtsService.update(editingId, payload);
        toast.success("Qarz yozuvi yangilandi.");
      } else {
        await debtsService.create(payload);
        toast.success("Yangi qarz yozuvi qo'shildi.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (d) => {
    try {
      const newStatus = d.status === "paid" ? "pending" : "paid";
      await debtsService.update(d.id, { ...d, status: newStatus });
      toast.success(
        newStatus === "paid" ? "Qarz qaytarilgan deb belgilandi." : "Qarz qaytarilmagan deb belgilandi."
      );
      load();
    } catch (err) {
      toast.error("Statusni o'zgartirishda xatolik yuz berdi.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await debtsService.remove(deleteId);
      toast.success("Qarz yozuvi o'chirildi.");
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
    if (tab === "all") return debts;
    return debts.filter((d) => d.type === tab);
  }, [debts, tab]);

  const tabs = [
    { id: "all", label: "Barchasi" },
    { id: "lent", label: "Berilgan" },
    { id: "borrowed", label: "Olingan" },
  ];

  return (
    <div>
      <PageHeader
        title="Qarzlar daftari"
        subtitle="Qarzga bergan va olgan pullaringizni kuzatib boring"
        action={
          <Button onClick={openCreate}>
            <FiPlus size={17} /> Yangi yozuv
          </Button>
        }
      />

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-brand text-ink"
                : "bg-surfacelight dark:bg-surfacedark2 text-ink/70 dark:text-paper/70 border border-lineLight dark:border-line"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="px-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FaHandHoldingDollar}
            title="Qarz yozuvlari mavjud emas"
            description="Qarzga bergan yoki olgan pullaringizni shu yerga qo'shing."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Yozuv qo'shish
              </Button>
            }
          />
        ) : (
          <div className="px-4 sm:px-5">
            <AnimatePresence>
              {filtered.map((d, idx) => {
                const isLent = d.type === "lent";
                const isPaid = d.status === "paid";
                return (
                  <motion.div
                    key={d.id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onPointerDown={(event) => {
                      if (event.pointerType === "mouse") return;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      startLongPress(d.id);
                    }}
                    onPointerUp={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                    onContextMenu={(event) => event.preventDefault()}
                    className={`grid grid-cols-[40px_minmax(0,1fr)] items-start gap-x-3 gap-y-2 py-4 lg:flex lg:items-center lg:gap-4 ${
                      idx !== filtered.length - 1 ? "receipt-edge" : ""
                    }`}
                  >
                    <div
                      className={`row-span-2 h-10 w-10 rounded-full flex items-center justify-center shrink-0 lg:row-span-1 ${
                        isLent ? "bg-brand/15 text-brand-dark dark:text-brand" : "bg-expense/10 text-expense"
                      }`}
                    >
                      {isLent ? <FiArrowUpRight size={17} /> : <FiArrowDownLeft size={17} />}
                    </div>
                    <div className="min-w-0 lg:flex-1">
                      <p className="break-words text-sm font-semibold leading-5">{d.personName || d.person}</p>
                      <p className="text-xs leading-5 text-muted">
                        {isLent ? "Qarzga berilgan" : "Qarzga olingan"}
                        {d.dueDate ? ` • Muddat: ${formatDate(d.dueDate)}` : ""}
                      </p>
                    </div>
                    <div className="col-start-2 row-start-2 text-left lg:col-auto lg:row-auto lg:ml-auto lg:text-right">
                      <p className="figure whitespace-nowrap text-base font-semibold leading-5 sm:text-sm">{formatMoney(d.amount)}</p>
                      <button
                        onClick={() => toggleStatus(d)}
                        className={`text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1 mt-1 transition-colors ${
                          isPaid
                            ? "bg-income/10 text-income"
                            : "bg-brand/15 text-brand-dark dark:text-brand"
                        }`}
                      >
                        <FiCheckCircle size={11} />
                        {statusLabel[d.status] || statusLabel.pending}
                      </button>
                    </div>
                    <div
                      onPointerDown={(event) => event.stopPropagation()}
                      className={`col-start-2 row-start-3 flex justify-end gap-1 shrink-0 lg:col-auto lg:row-auto lg:pointer-events-auto lg:opacity-100 ${mobileActionsId === d.id ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      <button
                        onClick={() => openEdit(d)}
                        aria-label="Qarz yozuvini tahrirlash"
                        className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(d.id)}
                        aria-label="Qarz yozuvini o'chirish"
                        className="rounded-lg p-2 text-expense hover:bg-expense/10"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Qarz yozuvini tahrirlash" : "Yangi qarz yozuvi"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "lent" })}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.type === "lent"
                  ? "border-brand bg-brand/10 text-brand-dark dark:text-brand"
                  : "border-lineLight dark:border-line text-muted"
              }`}
            >
              Qarzga berdim
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "borrowed" })}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                form.type === "borrowed"
                  ? "border-expense bg-expense/10 text-expense"
                  : "border-lineLight dark:border-line text-muted"
              }`}
            >
              Qarzga oldim
            </button>
          </div>

          <Input
            label="Shaxs ismi"
            placeholder="Masalan: Alisher"
            value={form.personName}
            onChange={(e) => setForm({ ...form, personName: e.target.value })}
          />
          <Input
            label="Summa"
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Input
            label="Qaytarish muddati (ixtiyoriy)"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="pending">Qaytarilmagan</option>
            <option value="paid">Qaytarilgan</option>
          </Select>
          <Input
            label="Izoh (ixtiyoriy)"
            placeholder="Qo'shimcha izoh"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
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
        message="Ushbu qarz yozuvini o'chirishni tasdiqlaysizmi?"
      />
    </div>
  );
}
