// src/admin/StoreDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { motion } from "framer-motion";
import { api } from "../lib/api";

// --- Small helpers ---
const formatNumber = (n) => Intl.NumberFormat("en-LK").format(Number(n || 0));
const formatCurrency = (n) =>
  `Rs ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- Reusable stat card ---
const StatCard = ({ icon, label, value, hint }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
        <i className={`${icon} text-green-600 text-lg`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  </motion.div>
);

// --- Skeletons for loading ---
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100" />
      <div className="flex-1">
        <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
        <div className="h-6 w-32 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="rounded-2xl p-4 shadow-sm border border-gray-100 bg-white">
    <div className="h-5 w-48 bg-gray-100 rounded mb-3 animate-pulse" />
    <div className="h-72 sm:h-80 w-full bg-gray-100 rounded-xl animate-pulse" />
  </div>
);

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true);
  const [storeSummary, setStoreSummary] = useState(null);
  const [sales30, setSales30] = useState([]);
  const [invByCat, setInvByCat] = useState([]);
  const [error, setError] = useState("");

  // fetch data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [ss, s30, cat] = await Promise.all([
          api.get("/admin/store/summary"),
          api.get("/admin/charts/sales-30d"),
          api.get("/admin/charts/inventory-by-category"),
        ]);
        if (!mounted) return;

        setStoreSummary(ss?.data || {});
        setSales30(Array.isArray(s30?.data) ? s30.data : []);
        setInvByCat(Array.isArray(cat?.data) ? cat.data : []);
      } catch (e) {
        console.error("Failed to load store dashboard data:", e);
        setError(e?.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // normalize data for charts (robust to different key names)
  const salesData = useMemo(() => {
    return (sales30 || []).map((d, i) => ({
      date: d.date || d._id || d.day || d.label || `Day ${i + 1}`,
      revenue: Number(d.revenue ?? d.total ?? 0),
      orders: Number(d.orders ?? d.count ?? 0),
    }));
  }, [sales30]);

  const invData = useMemo(() => {
    return (invByCat || []).map((d) => ({
      name: d._id || d.name || "Unknown",
      value: Number(d.value ?? d.qty ?? d.count ?? 0),
    }));
  }, [invByCat]);

  const summary = storeSummary || {};
  const pieColors = ["#16a34a", "#15803d", "#22c55e", "#84cc16", "#10b981", "#65a30d", "#34d399", "#4ade80"];

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-gray-600 text-sm">Overview of store & inventory</p>
        </div>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <i className="fas fa-store" />
          View Public Store
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton /> <CardSkeleton /> <CardSkeleton /> <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard icon="fas fa-boxes" label="Total Products" value={summary.productCount} />
            <StatCard icon="fas fa-clipboard-list" label="Total Orders" value={summary.orderCount} />
            <StatCard icon="fas fa-user-friends" label="Customers" value={summary.customers} />
            <StatCard
              icon="fas fa-chart-line"
              label="Revenue (All time)"
              value={summary.revenueAllTime}
              hint={formatCurrency(summary.revenueAllTime)}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sales last 30 days */}
        {loading ? (
          <div className="xl:col-span-2"><ChartSkeleton /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="xl:col-span-2 rounded-2xl p-4 shadow-sm border border-gray-100 bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Sales (Last 30 days)</h3>
              {salesData.length > 0 && (
                <span className="text-xs text-gray-500">
                  Total: {formatCurrency(salesData.reduce((s, d) => s + (d.revenue || 0), 0))}
                </span>
              )}
            </div>
            <div className="h-72 sm:h-80">
              {salesData.length === 0 ? (
                <div className="h-full w-full rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-500">
                  No sales data to display
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "revenue" ? formatCurrency(value) : value
                      }
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                    {/* You can also visualize orders: */}
                    {/* <Line type="monotone" dataKey="orders" name="Orders" stroke="#0ea5e9" strokeWidth={2} dot={false} /> */}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}

        {/* Inventory by category */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-4 shadow-sm border border-gray-100 bg-white"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Inventory by Category</h3>
            <div className="h-72 sm:h-80">
              {invData.length === 0 ? (
                <div className="h-full w-full rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-500">
                  No inventory data to display
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={invData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {invData.map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading footer */}
      {loading && (
        <div className="text-center p-6 text-gray-500">Loading Store Data...</div>
      )}
    </div>
  );
}
