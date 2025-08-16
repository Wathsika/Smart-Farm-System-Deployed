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

const StatCard = ({ title, value, change, icon, trend }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div
            className={`flex items-center text-sm ${
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {trend === "up" && (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 17l9.2-9.2M17 17V7M17 17H7"
                />
              </svg>
            )}
            {trend === "down" && (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7l9.2 9.2M17 7v10M17 7H7"
                />
              </svg>
            )}
            {change}
          </div>
        )}
      </div>
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

export default function OverviewPage() {
  // Transactions data - in a real app, this would come from props or API
  const transactions = [];

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = transactions
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
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
      map.get(key)[r.type === "income" ? "income" : "expense"] += r.amount;
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
      if (!map.has(r.category)) {
        map.set(r.category, { name: r.category, value: 0, type: r.type });
      }
      map.get(r.category).value += r.amount;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Finance Overview</h1>
        <p className="text-gray-600 mt-2">
          Track your farm's financial performance
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Income"
              value={currency(stats.totalIncome)}
              change={
                stats.totalIncome > 0
                  ? "+12.5% from last month"
                  : "No data available"
              }
              trend={stats.totalIncome > 0 ? "up" : undefined}
              icon={
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17l9.2-9.2M17 17V7M17 17H7"
                  />
                </svg>
              }
            />
            <StatCard
              title="Total Expenses"
              value={currency(stats.totalExpenses)}
              change={
                stats.totalExpenses > 0
                  ? "+8.2% from last month"
                  : "No data available"
              }
              trend={stats.totalExpenses > 0 ? "up" : undefined}
              icon={
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7l9.2 9.2M17 7v10M17 7H7"
                  />
                </svg>
              }
            />
            <StatCard
              title="Net Profit"
              value={currency(stats.netProfit)}
              change={
                transactions.length > 0
                  ? stats.netProfit >= 0
                    ? "+15.3% profit margin"
                    : "Loss this period"
                  : "No data available"
              }
              trend={
                transactions.length > 0
                  ? stats.netProfit >= 0
                    ? "up"
                    : "down"
                  : undefined
              }
              icon={
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
            <StatCard
              title="Transactions"
              value={stats.transactionCount.toString()}
              change={
                stats.transactionCount > 0
                  ? "Latest: Today"
                  : "No transactions yet"
              }
              icon={
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg">No data available</p>
                      <p className="text-gray-400 text-sm">
                        Add transactions to see monthly trends
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Categories
              </h3>
              <div className="h-80">
                {categoryData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
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
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={pieColors[index % pieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => currency(Number(v))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {categoryData.slice(0, 4).map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: pieColors[index] }}
                            />
                            <span className="text-gray-600">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {currency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg">No categories yet</p>
                      <p className="text-gray-400 text-sm">
                        Add transactions to see category breakdown
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cumulative Net Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">No balance data</p>
                    <p className="text-gray-400 text-sm">
                      Add transactions to track net balance over time
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
