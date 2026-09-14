import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiTarget, FiPercent } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa6";
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
import { formatMoney, formatDate } from "../utils/format";
import goalsService from "../api/goalsService";
import walletsService from "../api/walletsService";
import transactionsService from "../api/transactionsService";

const emptyForm = { name: "", targetAmount: "", currentAmount: "", deadline: "", walletId: "" };
const GOAL_ALLOCATION_KEY = "goal_allocations_v1";

const getStoredAllocation = (goalId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(GOAL_ALLOCATION_KEY) || "{}");
    return raw[goalId] || null;
  } catch {
    return null;
  }
};

const saveStoredAllocation = (goalId, allocation) => {
  try {
    const raw = JSON.parse(localStorage.getItem(GOAL_ALLOCATION_KEY) || "{}");
    raw[goalId] = allocation;
    localStorage.setItem(GOAL_ALLOCATION_KEY, JSON.stringify(raw));
  } catch {
    // ignore localStorage issues
  }
};

const removeStoredAllocation = (goalId) => {
  try {
    const raw = JSON.parse(localStorage.getItem(GOAL_ALLOCATION_KEY) || "{}");
    delete raw[goalId];
    localStorage.setItem(GOAL_ALLOCATION_KEY, JSON.stringify(raw));
  } catch {
    // ignore localStorage issues
  }
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [allocationGoal, setAllocationGoal] = useState(null);
  const [allocationSaving, setAllocationSaving] = useState(false);
  const [allocationForm, setAllocationForm] = useState({ source: "wallet", walletId: "", incomeId: "", mode: "amount", value: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [goalResponse, walletResponse, transactionResponse] = await Promise.allSettled([
        goalsService.getAll(),
        walletsService.getAll(),
        transactionsService.getAll(),
      ]);
      if (goalResponse.status === "fulfilled") setGoals(goalResponse.value.data || []);
      if (walletResponse.status === "fulfilled") setWallets(walletResponse.value.data || []);
      if (transactionResponse.status === "fulfilled") {
        setIncomeTransactions((transactionResponse.value.data || []).filter((transaction) => transaction.type === "income"));
      }
    } catch (err) {
      toast.error("Maqsadlarni yuklashda xatolik yuz berdi.");
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

  const openEdit = (g) => {
    setForm({
      name: g.name || g.title || "",
      targetAmount: g.targetAmount ?? "",
      currentAmount: g.currentAmount ?? "",
      deadline: (g.deadline || "").slice(0, 10),
      walletId: g.walletId || g.wallet?.id || "",
    });
    setEditingId(g.id);
    setModalOpen(true);
  };

  const openAllocation = (goal, savedAllocation = getStoredAllocation(goal.id)) => {
    setAllocationGoal(goal);
    setAllocationForm({
      source: savedAllocation?.source || "wallet",
      walletId: savedAllocation?.walletId || goal.walletId || goal.wallet?.id || "",
      incomeId: savedAllocation?.incomeId || "",
      mode: savedAllocation?.mode || "amount",
      value: savedAllocation?.value ?? "",
    });
  };

  const handleAllocation = async (e) => {
    e.preventDefault();
    const previousAllocation = getStoredAllocation(allocationGoal.id);
    const income = incomeTransactions.find((item) => String(item.id) === String(allocationForm.incomeId));
    const wallet = allocationForm.source === "income"
      ? wallets.find((item) => String(item.id) === String(income?.walletId))
      : wallets.find((item) => String(item.id) === String(allocationForm.walletId));
    if (allocationForm.source === "income" && !income) return toast.warn("Kirim tranzaksiyasini tanlang.");
    if (!wallet) return toast.warn("Hamyonni tanlang.");

    const sourceAmount = allocationForm.source === "income"
      ? Number(income.amount) || 0
      : Number(wallet.balance) || 0;
    const walletBalance = Number(wallet.balance) || 0;
    const requestedValue = Number(allocationForm.value);
    const amount = allocationForm.mode === "percent"
      ? sourceAmount * requestedValue / 100
      : requestedValue;
    const current = Number(allocationGoal.currentAmount) || 0;
    const target = Number(allocationGoal.targetAmount) || 0;
    const goalWalletId = allocationGoal.walletId ?? allocationGoal.wallet?.id;
    const previousAmount = Number(previousAllocation?.amount) || 0;
    const nextCurrent = previousAllocation ? current - previousAmount + amount : current + amount;

    if (!requestedValue || requestedValue <= 0) return toast.warn("Ajratiladigan qiymatni kiriting.");
    if (allocationForm.mode === "percent" && requestedValue > 100) return toast.warn("Foiz 100 dan katta bo'lmasligi kerak.");
    if (amount > sourceAmount || amount > walletBalance) return toast.warn("Ajratiladigan summa manbadagi mablag'dan katta bo'lmasin.");
    if (nextCurrent > target) return toast.warn("Ajratma maqsad summasidan oshib ketadi.");
    if (goalWalletId && String(goalWalletId) !== String(wallet.id) && current > 0) {
      return toast.warn("Bu maqsad boshqa hamyonga bog'langan.");
    }

    const previousWallet = previousAllocation && previousAllocation.source === "income"
      ? wallets.find((item) => String(item.id) === String(previousAllocation.walletId))
      : previousAllocation && wallets.find((item) => String(item.id) === String(previousAllocation.walletId));

    setAllocationSaving(true);
    const walletAdjustments = [];
    try {
      if (previousAllocation && previousAmount > 0) {
        const refundWallet = previousWallet || wallet;
        walletAdjustments.push({ wallet: refundWallet, delta: previousAmount });
      }
      walletAdjustments.push({ wallet, delta: -amount });

      for (const entry of walletAdjustments) {
        if (!entry.wallet) continue;
        const currentBalance = Number(entry.wallet.balance) || 0;
        await walletsService.update(entry.wallet.id, { ...entry.wallet, balance: currentBalance + entry.delta });
      }

      await goalsService.update(allocationGoal.id, {
        name: allocationGoal.name || allocationGoal.title,
        targetAmount: target,
        currentAmount: nextCurrent,
        deadline: allocationGoal.deadline || "",
        walletId: wallet.id,
      });

      const savedAllocation = {
        source: allocationForm.source,
        walletId: allocationForm.source === "wallet" ? wallet.id : previousAllocation?.walletId || wallet.id,
        incomeId: allocationForm.source === "income" ? income.id : "",
        mode: allocationForm.mode,
        value: requestedValue,
        amount,
      };
      saveStoredAllocation(allocationGoal.id, savedAllocation);

      setAllocationGoal(null);
      setAllocationForm({ source: "wallet", walletId: "", incomeId: "", mode: "amount", value: "" });
      toast.success(`${formatMoney(amount)} maqsadga ajratildi.`);
      load();
    } catch (err) {
      for (const entry of walletAdjustments) {
        if (!entry.wallet) continue;
        try {
          await walletsService.update(entry.wallet.id, { ...entry.wallet, balance: Number(entry.wallet.balance) });
        } catch {
          // ignore rollback errors
        }
      }
      toast.error("Hamyondan ajratishda xatolik yuz berdi.");
    } finally {
      setAllocationSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Maqsad nomini kiriting.");
    if (!form.targetAmount || Number(form.targetAmount) <= 0)
      return toast.warn("To'g'ri maqsad summasini kiriting.");
    if (!form.walletId) return toast.warn("Jamg'arma uchun hamyonni tanlang.");

    const selectedWallet = wallets.find((wallet) => String(wallet.id) === String(form.walletId));
    const currentAmount = Number(form.currentAmount) || 0;
    const previousGoal = editingId && goals.find((goal) => goal.id === editingId);
    const previousAmount = Number(previousGoal?.currentAmount) || 0;
    const oldWallet = previousGoal && wallets.find((wallet) => String(wallet.id) === String(previousGoal.walletId));
    const balance = Number(selectedWallet?.balance) || 0;
    const sameWallet = previousGoal && String(previousGoal.walletId) === String(form.walletId);
    const requiredFromWallet = sameWallet ? currentAmount - previousAmount : currentAmount;

    if (requiredFromWallet > balance) return toast.warn("Hamyonda maqsad uchun mablag' yetarli emas.");

    setSaving(true);
    const walletChanges = [];
    try {
      const payload = {
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount,
      };
      if (previousGoal && !sameWallet && oldWallet && previousAmount) {
        await walletsService.update(oldWallet.id, { ...oldWallet, balance: Number(oldWallet.balance) + previousAmount });
        walletChanges.push({ wallet: oldWallet, amount: -previousAmount });
      }
      if (requiredFromWallet) {
        await walletsService.update(selectedWallet.id, { ...selectedWallet, balance: balance - requiredFromWallet });
        walletChanges.push({ wallet: selectedWallet, amount: requiredFromWallet });
      }
      if (editingId) {
        await goalsService.update(editingId, payload);
        toast.success("Maqsad yangilandi.");
      } else {
        await goalsService.create(payload);
        toast.success("Yangi maqsad qo'shildi.");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      await Promise.allSettled(walletChanges.map(({ wallet, amount }) =>
        walletsService.update(wallet.id, { ...wallet, balance: Number(wallet.balance) - amount }
      )));
      toast.error("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const goal = goals.find((item) => item.id === deleteId);
    const wallet = goal?.walletId && wallets.find((item) => String(item.id) === String(goal.walletId));
    const savedAmount = Number(goal?.currentAmount) || 0;
    let walletRestored = false;
    try {
      if (wallet && savedAmount) {
        await walletsService.update(wallet.id, { ...wallet, balance: Number(wallet.balance) + savedAmount });
        walletRestored = true;
      }
      await goalsService.remove(deleteId);
      toast.success("Maqsad o'chirildi.");
      setDeleteId(null);
      load();
    } catch (err) {
      if (walletRestored) {
        await walletsService.update(wallet.id, { ...wallet, balance: Number(wallet.balance) });
      }
      toast.error("O'chirishda xatolik yuz berdi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Moliyaviy maqsadlar"
        subtitle="Jamg'arish maqsadlaringizga qadam-baqadam erishing"
        action={
          <Button onClick={openCreate}>
            <FiPlus size={17} /> Yangi maqsad
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiTarget}
            title="Maqsadlar mavjud emas"
            description="Orzuingizdagi mashina, uy yoki sayohat uchun jamg'arishni boshlang."
            action={
              <Button onClick={openCreate}>
                <FiPlus size={16} /> Maqsad qo'shish
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {goals.map((g, i) => {
              const current = Number(g.currentAmount) || 0;
              const target = Number(g.targetAmount) || 1;
              const pct = Math.min(100, Math.round((current / target) * 100));
              const reached = current >= target;
              return (
                <motion.div
                  key={g.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-income/10 flex items-center justify-center">
                          {reached ? (
                            <FaTrophy size={17} className="text-income" />
                          ) : (
                            <FiTarget size={17} className="text-income" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{g.name || g.title}</p>
                          {g.deadline && (
                            <p className="text-xs text-muted">Muddat: {formatDate(g.deadline)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(g.id)}
                          className="p-1.5 rounded-lg hover:bg-expense/10 text-expense"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <ProgressBar value={current} max={target} colorClass="bg-income" />

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted figure">
                        {formatMoney(current)} / {formatMoney(target)}
                      </span>
                      <span className="text-xs font-semibold text-income">{pct}%</span>
                    </div>
                    {reached && (
                      <p className="text-xs text-income mt-2 font-medium">🎉 Maqsadga erishildi!</p>
                    )}
                    {!reached && (
                      <div className="mt-4 space-y-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() => openAllocation(g, getStoredAllocation(g.id))}
                        >
                          <FiPercent size={15} /> {getStoredAllocation(g.id) ? "Ajratishni yangilash" : "Hamyondan ajratish"}
                        </Button>
                        {getStoredAllocation(g.id) && (
                          <button
                            type="button"
                            className="w-full text-xs text-muted hover:text-ink"
                            onClick={() => {
                              removeStoredAllocation(g.id);
                              setAllocationGoal(null);
                              toast.info("Ajratish yozuvi o'chirildi. Yangi qiymat kiriting.");
                            }}
                          >
                            Ajratishni o'chirish
                          </button>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={!!allocationGoal}
        onClose={() => setAllocationGoal(null)}
        title={getStoredAllocation(allocationGoal?.id) ? "Ajratishni yangilash" : "Hamyondan maqsadga ajratish"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAllocation} className="space-y-4">
          <p className="text-sm text-muted">
            Maqsad: <span className="font-medium text-ink dark:text-paper">{allocationGoal?.name || allocationGoal?.title}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={allocationForm.source === "wallet" ? "primary" : "secondary"}
              onClick={() => setAllocationForm({ ...allocationForm, source: "wallet", incomeId: "" })}
            >
              Hamyondan
            </Button>
            <Button
              type="button"
              variant={allocationForm.source === "income" ? "primary" : "secondary"}
              onClick={() => setAllocationForm({ ...allocationForm, source: "income", walletId: "" })}
            >
              Kirimdan
            </Button>
          </div>
          {allocationForm.source === "wallet" ? (
            <Select
              label="Ajratiladigan hamyon"
              value={allocationForm.walletId}
              onChange={(e) => setAllocationForm({ ...allocationForm, walletId: e.target.value })}
            >
              <option value="">Hamyonni tanlang</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} ({formatMoney(wallet.balance, wallet.currency || "so'm")})
                </option>
              ))}
            </Select>
          ) : (
            <Select
              label="Kirim tranzaksiyasi"
              value={allocationForm.incomeId}
              onChange={(e) => setAllocationForm({ ...allocationForm, incomeId: e.target.value })}
            >
              <option value="">Kirimni tanlang</option>
              {incomeTransactions.map((income) => (
                <option key={income.id} value={income.id}>
                  {formatMoney(income.amount)} - {income.description || "Kirim"} ({formatDate(income.date)})
                </option>
              ))}
            </Select>
          )}
          <p className="text-xs text-muted">
            Foiz {allocationForm.source === "income" ? "tanlangan kirim summasidan" : "tanlangan hamyon balansidan"} hisoblanadi.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Ajratish usuli"
              value={allocationForm.mode}
              onChange={(e) => setAllocationForm({ ...allocationForm, mode: e.target.value, value: "" })}
            >
              <option value="amount">Summa</option>
              <option value="percent">Foiz</option>
            </Select>
            <Input
              label={allocationForm.mode === "percent" ? "Foiz (%)" : "Summa"}
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={allocationForm.value}
              onChange={(e) => setAllocationForm({ ...allocationForm, value: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAllocationGoal(null)}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={allocationSaving} disabled={wallets.length === 0 || (allocationForm.source === "income" && incomeTransactions.length === 0)}>
              Ajratish
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Maqsadni tahrirlash" : "Yangi maqsad"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Maqsad nomi"
            placeholder="Masalan: Avtomobil uchun jamg'arma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Maqsad summasi"
            type="number"
            placeholder="0"
            value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
          />
          <Input
            label="Hozirgi jamg'arma"
            type="number"
            placeholder="0"
            value={form.currentAmount}
            onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
          />
          <Select
            label="Jamg'arma hamyoni"
            value={form.walletId}
            onChange={(e) => setForm({ ...form, walletId: e.target.value })}
          >
            <option value="">Hamyonni tanlang</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name} ({formatMoney(wallet.balance, wallet.currency || "so'm")})
              </option>
            ))}
          </Select>
          <Input
            label="Muddat (ixtiyoriy)"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
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
        message="Ushbu maqsadni o'chirishni tasdiqlaysizmi?"
      />
    </div>
  );
}
