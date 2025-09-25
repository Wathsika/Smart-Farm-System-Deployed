import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FaArrowTrendUp,
  FaMoneyBillWave,
  FaBagShopping,
} from "react-icons/fa6";
import { api } from "../lib/api";

const formatCurrency = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 });

const Section = ({ title, description, action, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="rounded-3xl bg-white/90 backdrop-blur border border-gray-100 shadow-sm"
  >
    <div className="border-b border-gray-100 px-6 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </motion.section>
);

const StatTile = ({ icon: Icon, label, value, trend }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
      <Icon className="text-xl" />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      {typeof trend === "number" && (
        <p
          className={`text-xs font-medium ${
            trend >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs prev.
        </p>
      )}
    </div>
  </div>
);

const localISO = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};

export default function MainDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [milkDaily, setMilkDaily] = useState([]);

  useEffect(() => {
    let mounted = true;
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [txRes, topRes, milkRes] = await Promise.all([
          api.get("/transactions"),
          api.get("/admin/charts/top-sellers", { params: { limit: 5 } }),
          api.get("/milk/summary/farm/daily", {
            params: { from: localISO(start), to: localISO(today) },
          }),
        ]);

        if (!mounted) return;

        const txRows = Array.isArray(txRes?.data)
          ? txRes.data
          : txRes?.data?.data || [];
        setTransactions(
          txRows.map((row) => ({
            id: row._id || row.id,
            date: row.date,
            type: row.type,
            category: row.category,
            amount: Number(row.amount) || 0,
          }))
        );

        setTopSellers(Array.isArray(topRes?.data) ? topRes.data : []);

        setMilkDaily(Array.isArray(milkRes?.data) ? milkRes.data : []);
      } catch (e) {
        console.error("Failed to load dashboard", e);
        if (mounted) {
          setError(
            e?.response?.data?.message ||
              "Unable to load dashboard information."
          );
          setTransactions([]);
          setTopSellers([]);
          setMilkDaily([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const financeStats = useMemo(() => {
    const income = transactions
      .filter((t) => (t.type || "").toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenses = transactions
      .filter((t) => (t.type || "").toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const net = income - expenses;

    const monthlyMap = new Map();
    transactions.forEach((t) => {
      if (!t.date) return;
      const monthKey = String(t.date).slice(0, 7);
      if (!monthKey) return;
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
      }
      const bucket = monthlyMap.get(monthKey);
      if ((t.type || "").toLowerCase() === "income") {
        bucket.income += Number(t.amount || 0);
      } else {
        bucket.expense += Number(t.amount || 0);
      }
    });

    const chart = Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // keep last 6 months for clarity

    return { income, expenses, net, chart };
  }, [transactions]);

  const topPerformer = useMemo(() => {
    if (!topSellers.length) return null;
    return topSellers.reduce((best, item) => {
      const bestUnits = Number(best?.qty ?? best?.units ?? 0);
      const itemUnits = Number(item?.qty ?? item?.units ?? 0);
      return itemUnits > bestUnits ? item : best;
    }, topSellers[0]);
  }, [topSellers]);

  const milkChartData = useMemo(() => {
    if (!milkDaily.length) return [];

    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);

    const valueByDate = new Map(
      milkDaily.map((item) => {
        const key = localISO(item.date || item.day || item._id);
        const value = Number(
          item.totalLiters ??
            item.volumeLiters ??
            item.liters ??
            item.value ??
            0
        );
        return [key, value];
      })
    );

    const rows = [];
    for (let i = 0; i < 7; i += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const iso = localISO(current);
      rows.push({
        day: current.toLocaleDateString("en-US", { weekday: "short" }),
        liters: valueByDate.get(iso) || 0,
      });
    }
    return rows;
  }, [milkDaily]);

  const milkTotal = useMemo(
    () => milkChartData.reduce((sum, item) => sum + item.liters, 0),
    [milkChartData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Farm Operations Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Real-time snapshot across finance, store and livestock units.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatTile
          icon={FaMoneyBillWave}
          label="Net Profit"
          value={formatCurrency(financeStats.net)}
        />
        <StatTile
          icon={FaArrowTrendUp}
          label="Weekly Milk Output"
          value={`${formatNumber(milkTotal)} L`}
        />
        <StatTile
          icon={FaBagShopping}
          label="Top Product"
          value={topPerformer?.name || "Awaiting sales"}
          trend={topPerformer ? 0 : undefined}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <Section
            title="Finance"
            description="Income vs. expenses (last 6 months)"
            action={
              <Link
                to="/admin/finance/overview"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Open finance overview
                <i className="fas fa-arrow-up-right-from-square text-xs" />
              </Link>
            }
          >
            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
            ) : financeStats.chart.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-gray-500">
                No transaction data yet
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeStats.chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "income" || name === "expense"
                          ? formatCurrency(value)
                          : value
                      }
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expenses"
                      fill="#f97316"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Section>
        </div>

        <div className="xl:col-span-2">
          <Section
            title="Store"
            description="Top performing products"
            action={
              <Link
                to="/admin/store/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Manage store
                <i className="fas fa-arrow-up-right-from-square text-xs" />
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 animate-pulse rounded-2xl border border-gray-100 bg-gray-100"
                  />
                ))}
              </div>
            ) : !topSellers.length ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-gray-500">
                <i className="fas fa-star text-3xl mb-3 text-gray-300" />
                <p className="font-medium">No sales recorded yet</p>
                <p className="text-xs">Your best sellers will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topSellers.map((item, index) => {
                  const units = Number(item?.qty ?? item?.units ?? 0);
                  const revenue = Number(item?.revenue ?? 0);
                  return (
                    <div
                      key={`${item?.id || item?._id || item?.name || index}`}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gradient-to-r from-emerald-50/40 to-white px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{index + 1} {item?.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatNumber(units)} sold
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-emerald-600">
                        {formatCurrency(revenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      </div>

      <Section
        title="Livestock"
        description="Weekly milk production"
        action={
          <Link
            to="/admin/livestock/milk"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Open milk analytics
            <i className="fas fa-arrow-up-right-from-square text-xs" />
          </Link>
        }
      >
        {loading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ) : milkChartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-gray-500">
            No milk records for the selected week
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={milkChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${formatNumber(value)} L`} />
                <Line
                  type="monotone"
                  dataKey="liters"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>
    </div>
  );
}
