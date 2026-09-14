import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiCalendar,
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-toastify";

import Card from "../components/UI/Card";
import PageHeader from "../components/UI/PageHeader";
import { SkeletonCard } from "../components/UI/Skeleton";
import { formatMoney } from "../utils/format";
import transactionsService from "../api/transactionsService";
import walletsService from "../api/walletsService";
import categoriesService from "../api/categoriesService";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const formatChartValue = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}M`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
  return String(amount);
};

const xavfsizSana = (dateParam) => {
  if (!dateParam) return null;
  if (typeof dateParam.toDate === "function") return dateParam.toDate();
  const d = new Date(dateParam);
  return isNaN(d.getTime()) ? null : d;
};

const isIncome = (transaction) => {
  return ["income", "kirim"].includes((transaction.type || "").toLowerCase());
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-[#12141c]/95">
        <p className="mb-1.5 font-bold text-slate-800 dark:text-slate-100">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatMoney(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-[#12141c]/95">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-bold text-slate-800 dark:text-slate-100">{data.name}</span>
        </div>
        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
          Summa: {formatMoney(data.value)}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Ushbu kategoriyaning ulushi: {data.payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

export default function Statistics() {
  const [data, setData] = useState({ transactions: [], wallets: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const joriyYil = new Date().getFullYear();

  useEffect(() => {
    Promise.allSettled([
      transactionsService.getAll(),
      walletsService.getAll(),
      categoriesService.getAll(),
    ]).then(([t, w, c]) => {
      setData({
        transactions: t.status === "fulfilled" ? t.value.data || [] : [],
        wallets: w.status === "fulfilled" ? w.value.data || [] : [],
        categories: c.status === "fulfilled" ? c.value.data || [] : [],
      });
      if ([t, w, c].every((result) => result.status === "rejected")) {
        toast.error("Statistika ma'lumotlarini yuklashda xatolik yuz berdi.");
      }
      setLoading(false);
    });
  }, []);

  const lineData = useMemo(() => {
    const oylarQisqa = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    return oylarQisqa.map((oyNom, index) => {
      const oyTx = data.transactions.filter((tx) => {
        const txSana = xavfsizSana(tx.date || tx.createdAt || tx.created_at);
        return txSana && txSana.getFullYear() === joriyYil && txSana.getMonth() === index;
      });

      const daromad = oyTx.filter(isIncome).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      const xarajat = oyTx.filter((tx) => !isIncome(tx)).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      return { name: oyNom, Daromad: daromad, Xarajat: xarajat };
    });
  }, [data.transactions, joriyYil]);

  const xarajatTx = useMemo(
    () => data.transactions.filter((tx) => !isIncome(tx)),
    [data.transactions]
  );

  const jamiXarajatSumma = useMemo(
    () => xarajatTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
    [xarajatTx]
  );

  const pieData = useMemo(() => {
    return data.categories
      .map((cat, index) => {
        const catSumma = xarajatTx
          .filter((tx) => tx.categoryId === cat.id || tx.category_id === cat.id)
          .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

        const percentage = jamiXarajatSumma > 0 ? ((catSumma / jamiXarajatSumma) * 100).toFixed(1) : 0;

        return {
          name: cat.name,
          value: catSumma,
          color: cat.color || COLORS[index % COLORS.length],
          percentage,
        };
      })
      .filter((item) => item.value > 0);
  }, [data.categories, xarajatTx, jamiXarajatSumma]);

  const barData = useMemo(() => {
    const haftalarUz = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"];
    const jsDayMap = [6, 0, 1, 2, 3, 4, 5];

    return haftalarUz.map((kun, kunIndex) => {
      const kunTx = xarajatTx.filter((tx) => {
        const txSana = xavfsizSana(tx.date || tx.createdAt || tx.created_at);
        if (!txSana) return false;
        return jsDayMap[txSana.getDay()] === kunIndex;
      });

      const jamiKunlik = kunTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
      return { name: kun, Xarajat: jamiKunlik };
    });
  }, [xarajatTx]);

  const summaryStats = useMemo(() => {
    const jamiDaromad = data.transactions
      .filter(isIncome)
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const ortachaKunlik = jamiXarajatSumma > 0 ? Math.round(jamiXarajatSumma / 30) : 0;

    let engKopXarajatCatName = "Mavjud emas";
    let engKopXarajatCatSumma = 0;

    data.categories.forEach((cat) => {
      const catSumma = xarajatTx
        .filter((tx) => tx.categoryId === cat.id || tx.category_id === cat.id)
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      if (catSumma > engKopXarajatCatSumma) {
        engKopXarajatCatSumma = catSumma;
        engKopXarajatCatName = cat.name;
      }
    });

    const tejashNisbati = jamiDaromad > 0 ? Math.round(((jamiDaromad - jamiXarajatSumma) / jamiDaromad) * 100) : 0;

    return {
      ortachaKunlik,
      engKopXarajatCatName,
      engKopXarajatCatSumma,
      tejashNisbati,
      jamiTranzaksiyalarSoni: data.transactions.length,
    };
  }, [data.transactions, data.categories, xarajatTx, jamiXarajatSumma]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistika"
        subtitle="Xarajatlaringiz bo'yicha tahlil"
        action={
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors dark:border-slate-800 dark:bg-[#12141c] dark:text-slate-200">
            <FiCalendar className="text-emerald-500" />
            <span>{joriyYil} yil</span>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  O'rtacha kunlik xarajat
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <FiTrendingDown className="text-lg" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {formatMoney(summaryStats.ortachaKunlik)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Oxirgi 30 kun</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Eng ko'p xarajat
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <FiDollarSign className="text-lg" />
                </div>
              </div>
              <p className="mt-3 truncate text-2xl font-black text-slate-900 dark:text-white">
                {summaryStats.engKopXarajatCatName}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {formatMoney(summaryStats.engKopXarajatCatSumma)}
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tejash nisbati
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FiTrendingUp className="text-lg" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {summaryStats.tejashNisbati}%
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Daromaddan</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Jami tranzaksiyalar
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                  <FiActivity className="text-lg" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {summaryStats.jamiTranzaksiyalarSoni}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-400">Ushbu yilda</p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
              Daromad va xarajatlar tendensiyasi
            </h3>
            <div className="h-72 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDaromad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorXarajat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatChartValue} width={42} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" align="center" height={34} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="Daromad"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorDaromad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Xarajat"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorXarajat)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
                Kategoriyalar bo'yicha taqsimot
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
                Haftalik xarajatlar
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Xarajat" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}