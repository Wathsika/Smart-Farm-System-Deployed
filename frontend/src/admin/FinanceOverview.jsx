// src/admin/OverviewPage.jsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaMoneyBillWave,
  FaArrowTrendDown,
  FaScaleBalanced,
} from "react-icons/fa6";

const theme = {
  primary: {
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
  },
  secondary: {
    500: "#ef4444",
  },
  neutral: {
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    600: "#4b5563",
  },
};

function currency(n) {
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  });
}

function monthKey(iso) {
  return (iso || "").slice(0, 7);
}

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
    {/* Icon */}
    <div className={`p-3 rounded-lg ${color} text-white shrink-0`}>
      <Icon size={22} />
    </div>

    {/* Text */}
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  </div>
);

export default function OverviewPage() {
  // In real app, fetch transactions
  const transactions = [];

  // Normalize types to handle "INCOME"/"EXPENSE" or lowercase
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((r) => (r.type || "").toLowerCase() === "income")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const totalExpenses = transactions
      .filter((r) => (r.type || "").toLowerCase() === "expense")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const netProfit = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const map = new Map();
    transactions.forEach((r) => {
      const key = monthKey(r.date);
      if (!key) return;
      if (!map.has(key)) map.set(key, { month: key, income: 0, expense: 0 });
      const t =
        (r.type || "").toLowerCase() === "income" ? "income" : "expense";
      map.get(key)[t] += Number(r.amount || 0);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [transactions]);

  const cumulativeData = useMemo(() => {
    let running = 0;
    return chartData.map((d) => {
      running += d.income - d.expense;
      return { month: d.month, net: running };
    });
  }, [chartData]);

  const categoryData = useMemo(() => {
    const map = new Map();
    transactions.forEach((r) => {
      const cat = r.category || "others";
      if (!map.has(cat)) map.set(cat, { name: cat, value: 0 });
      map.get(cat).value += Number(r.amount || 0);
    });
    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  const pieColors = [
    theme.primary[500],
    theme.primary[400],
    theme.primary[300],
    theme.secondary[500],
    theme.neutral[400],
    theme.neutral[300],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Page Title */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Finance Overview</h1>
        <p className="text-gray-600 mt-2">
          Track your farm&apos;s financial performance
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-8">
        {/* 3-card Stats with Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-stretch">
          <StatCard
            title="Total Income"
            value={currency(stats.totalIncome)}
            subtext={
              stats.totalIncome > 0
                ? "Showing all-time income"
                : "No data available yet"
            }
            icon={FaMoneyBillWave}
            color="bg-emerald-500"
          />
          <StatCard
            title="Total Expenses"
            value={currency(stats.totalExpenses)}
            subtext={
              stats.totalExpenses > 0
                ? "Showing all-time expenses"
                : "No data available yet"
            }
            icon={FaArrowTrendDown}
            color="bg-red-500"
          />
          <StatCard
            title="Net Profit"
            value={currency(stats.netProfit)}
            subtext={
              transactions.length > 0
                ? "Income − Expenses"
                : "No data available yet"
            }
            icon={FaScaleBalanced}
            color="bg-green-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Monthly Income vs Expense */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Income vs Expense
            </h3>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.neutral[200]}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={theme.neutral[600]}
                      fontSize={12}
                    />
                    <YAxis stroke={theme.neutral[600]} fontSize={12} />
                    <Tooltip
                      formatter={(v) => [currency(Number(v)), ""]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: `1px solid ${theme.neutral[200]}`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill={theme.primary[500]}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill={theme.secondary[500]}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available yet
                </div>
              )}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Categories
            </h3>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={pieColors[i % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => currency(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-1">
                    {categoryData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium text-gray-900">
                          {currency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cumulative Net Balance */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cumulative Net Balance
          </h3>
          <div className="h-80">
            {cumulativeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cumulativeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.neutral[200]}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={theme.neutral[600]}
                    fontSize={12}
                  />
                  <YAxis stroke={theme.neutral[600]} fontSize={12} />
                  <Tooltip
                    formatter={(v) => [currency(Number(v)), "Net Balance"]}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: `1px solid ${theme.neutral[200]}`,
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke={theme.primary[500]}
                    strokeWidth={3}
                    dot={{ fill: theme.primary[500], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: theme.primary[600] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
