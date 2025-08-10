// src/admin/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Note: Reusable components like StatCard and Table can be moved to their own files later
const GREEN = "#16a34a";
const GREEN_DARK = "#166534";
const BG = "bg-white";

const StatCard = ({ icon, label, value, hint }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`${BG} rounded-2xl p-5 shadow-sm border border-gray-100`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
        <i className={`${icon} text-green-600`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{Intl.NumberFormat().format(value ?? 0)}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    </div>
  </motion.div>
);

const Table = ({ columns = [], rows = [], empty = "No data" }) => (
  <div className={`${BG} rounded-2xl p-0 shadow-sm border border-gray-100 overflow-hidden`}>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-3 font-semibold text-gray-600">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">{empty}</td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {typeof c.render === "function" ? c.render(r[c.key], r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// This component now ONLY shows the Store's dashboard.
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [storeSummary, setStoreSummary] = useState(null);
  const [sales30, setSales30] = useState([]);
  const [invByCat, setInvByCat] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [ov, ss, s30, cat] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/store/summary"),
          api.get("/admin/charts/sales-30d"),
          api.get("/admin/charts/inventory-by-category"),
        ]);
        if (mounted) {
            setOverview(ov.data);
            setStoreSummary(ss.data);
            setSales30(s30.data);
            setInvByCat(cat.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if(mounted){
            setLoading(false);
        }
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const pieColors = [GREEN, GREEN_DARK, "#22c55e", "#84cc16", "#10b981", "#65a30d"];

  if (loading) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-green-700">
              <span className="animate-spin inline-block w-5 h-5 rounded-full border-2 border-green-600 border-t-transparent" />
              Loading Store Dashboard…
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of online store & inventory</p>
        </div>
        <Link to="/store" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
          <i className="fas fa-store" /> View Storefront
        </Link>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon="fas fa-box" label="Products" value={overview?.cards?.productCount} />
            <StatCard icon="fas fa-exclamation-triangle" label="Low Stock" value={overview?.cards?.lowStockCount} hint="Below threshold" />
            <StatCard icon="fas fa-receipt" label="Orders" value={overview?.cards?.orderCount} />
            <StatCard icon="fas fa-dollar-sign" label="Revenue Today" value={overview?.cards?.revenueToday} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl p-4 shadow-sm border border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-800 mb-2">Sales (Last 30 days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke={GREEN} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl p-4 shadow-sm border border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-800 mb-2">Inventory by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={invByCat} dataKey="value" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name ?? "N/A"} (${Intl.NumberFormat().format(Math.round(value))})`}>{invByCat.map((_, idx) => (<Cell key={idx} fill={pieColors[idx % pieColors.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer>
          </div>
        </div>
      </div>
       
      {/* Tables and other stats can remain the same */}
    </div>
  );
}