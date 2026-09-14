import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { FaWallet, FaPiggyBank, FaBullseye } from "react-icons/fa6";
import { toast } from "react-toastify";
import Card from "../components/UI/Card";
import PageHeader from "../components/UI/PageHeader";
import ProgressBar from "../components/UI/ProgressBar";
import EmptyState from "../components/UI/EmptyState";
import { SkeletonCard, SkeletonRow } from "../components/UI/Skeleton";
import { formatMoney, formatDate } from "../utils/format";
import walletsService from "../api/walletsService";
import transactionsService from "../api/transactionsService";
import goalsService from "../api/goalsService";
import budgetsService from "../api/budgetsService";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [w, t, g, b] = await Promise.allSettled([
          walletsService.getAll(),
          transactionsService.getAll(),
          goalsService.getAll(),
          budgetsService.getAll(),
        ]);
        if (!mounted) return;
        if (w.status === "fulfilled") setWallets(w.value.data || []);
        if (t.status === "fulfilled") setTransactions(t.value.data || []);
        if (g.status === "fulfilled") setGoals(g.value.data || []);
        if (b.status === "fulfilled") setBudgets(b.value.data || []);
      } catch (err) {
        toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0),
    [wallets]
  );

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      const amount = Number(t.amount) || 0;
      const type = (t.type || "").toLowerCase();
      if (type === "income" || type === "kirim") income += amount;
      else if (type === "expense" || type === "chiqim") expense += amount;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [transactions]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 6),
    [transactions]
  );

  const stats = [
    {
      label: "Umumiy balans",
      value: formatMoney(totalBalance),
      icon: FaWallet,
      color: "text-brand-dark dark:text-brand",
      bg: "bg-brand/10",
    },
    {
      label: "Kirimlar",
      value: formatMoney(totalIncome),
      icon: FiTrendingUp,
      color: "text-income",
      bg: "bg-income/10",
    },
    {
      label: "Chiqimlar",
      value: formatMoney(totalExpense),
      icon: FiTrendingDown,
      color: "text-expense",
      bg: "bg-expense/10",
    },
    {
      label: "Faol maqsadlar",
      value: goals.length,
      icon: FaBullseye,
      color: "text-brand-dark dark:text-brand",
      bg: "bg-brand/10",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Xush kelibsiz, ${user?.fullName || user?.name || "Foydalanuvchi"} 👋`}
        subtitle="Bugungi moliyaviy holatingizga umumiy nazar"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted">{s.label}</span>
                    <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <s.icon size={17} className={s.color} />
                    </div>
                  </div>
                  <p className="figure text-2xl font-bold">{s.value}</p>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent transactions - receipt style */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-lineLight dark:border-line flex items-center justify-between">
            <h3 className="font-display font-semibold">So'nggi tranzaksiyalar</h3>
          </div>
          <div className="px-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentTransactions.length === 0 ? (
              <EmptyState
                icon={FiArrowUpRight}
                title="Hozircha tranzaksiya yo'q"
                description="Birinchi kirim yoki chiqimingizni qo'shing va moliyangizni kuzatib boring."
              />
            ) : (
              <div>
                {recentTransactions.map((t, idx) => {
                  const isIncome = (t.type || "").toLowerCase().includes("in") || (t.type || "").toLowerCase() === "kirim";
                  return (
                    <div
                      key={t.id || idx}
                      className={`flex items-center gap-4 py-3.5 ${
                        idx !== recentTransactions.length - 1 ? "receipt-edge" : ""
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          isIncome ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                        }`}
                      >
                        {isIncome ? <FiArrowDownRight size={17} /> : <FiArrowUpRight size={17} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {t.description || t.title || t.category?.name || "Tranzaksiya"}
                        </p>
                        <p className="text-xs text-muted">{formatDate(t.date || t.createdAt)}</p>
                      </div>
                      <p
                        className={`figure text-sm font-semibold whitespace-nowrap ${
                          isIncome ? "text-income" : "text-expense"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatMoney(t.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="h-3" />
        </Card>

        {/* Budgets & goals summary */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaPiggyBank size={17} className="text-brand-dark dark:text-brand" />
              <h3 className="font-display font-semibold">Byudjet holati</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <p className="text-sm text-muted">Hali byudjet belgilanmagan.</p>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((b, i) => {
                  const categoryId = Number(b.categoryId ?? b.category?.id ?? 0);
                  const spent = transactions
                    .filter((transaction) => {
                      const isExpense = String(transaction.type || "").toLowerCase() === "expense" || String(transaction.type || "").toLowerCase() === "chiqim";
                      const sameCategory = Number(transaction.categoryId ?? transaction.category?.id ?? 0) === categoryId;
                      return isExpense && sameCategory;
                    })
                    .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);
                  const limit = Number(b.limit || b.amount) || 1;
                  return (
                    <div key={b.id || i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{b.categoryName || b.category?.name || b.name || "Byudjet"}</span>
                        <span className="text-muted figure">
                          {formatMoney(spent)} / {formatMoney(limit)}
                        </span>
                      </div>
                      <ProgressBar value={spent} max={limit} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaBullseye size={17} className="text-brand-dark dark:text-brand" />
              <h3 className="font-display font-semibold">Moliyaviy maqsadlar</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : goals.length === 0 ? (
              <p className="text-sm text-muted">Hali maqsad qo'shilmagan.</p>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map((g, i) => (
                  <div key={g.id || i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{g.name || g.title}</span>
                      <span className="text-muted figure">
                        {formatMoney(g.currentAmount || 0)} / {formatMoney(g.targetAmount || 0)}
                      </span>
                    </div>
                    <ProgressBar
                      value={g.currentAmount || 0}
                      max={g.targetAmount || 1}
                      colorClass="bg-income"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
