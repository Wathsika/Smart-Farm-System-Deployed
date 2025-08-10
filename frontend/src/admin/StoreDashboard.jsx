// src/admin/StoreDashboard.jsx
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";

// Note: I moved StatCard and Table to a new file to be more reusable. You can do that later.
// For now, I'm keeping them here for simplicity.

const StatCard = ({ icon, label, value, hint }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
        <i className={`${icon} text-green-600 text-lg`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{Intl.NumberFormat().format(value ?? 0)}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  </div>
);

export default function StoreDashboard() {
  const [loading, setLoading] = useState(true);
  const [storeSummary, setStoreSummary] = useState(null);
  const [sales30, setSales30] = useState([]);
  const [invByCat, setInvByCat] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [ss, s30, cat] = await Promise.all([
          api.get("/admin/store/summary"),
          api.get("/admin/charts/sales-30d"),
          api.get("/admin/charts/inventory-by-category"),
        ]);
        setStoreSummary(ss.data);
        setSales30(s30.data);
        setInvByCat(cat.data);
      } catch (e) {
        console.error("Failed to load store dashboard data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pieColors = ["#16a34a", "#166534", "#22c55e", "#84cc16", "#10b981", "#65a30d"];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of store & inventory</p>
        </div>
        <Link to="/store" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
          <i className="fas fa-store" /> View Public Store
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="fas fa-boxes" label="Total Products" value={storeSummary?.productCount} />
        <StatCard icon="fas fa-clipboard-list" label="Total Orders" value={storeSummary?.orderCount} />
        <StatCard icon="fas fa-user-friends" label="Customers" value={storeSummary?.customers} />
        <StatCard icon="fas fa-chart-line" label="Revenue (All time)" value={storeSummary?.revenueAllTime} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
         {/* Sales last 30 days */}
         <div className="xl:col-span-2 rounded-2xl p-4 shadow-sm border border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-800 mb-2">Sales (Last 30 days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Inventory by category */}
        <div className="rounded-2xl p-4 shadow-sm border border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-800 mb-2">Inventory by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invByCat} dataKey="value" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
                  {invByCat.map((_, idx) => ( <Cell key={idx} fill={pieColors[idx % pieColors.length]} /> ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {loading && <div className="text-center p-8">Loading Store Data...</div>}
    </div>
  );
}