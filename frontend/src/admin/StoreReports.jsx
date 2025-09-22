// src/admin/StoreReports.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, Package, FileDown } from "lucide-react";
import {
  BRAND_CONTACT_LINE,
  BRAND_DETAILS,
  BRAND_DOCUMENT_TITLES,
  formatDocumentTitle,
} from "../constants/branding";

// ----------------------------------------
// THEME — white (60) / gray-black (30) / emerald-600 (10)
// ----------------------------------------
const TABS = [
  { key: "sales", label: "Sales Reports", icon: BarChart3 },
  { key: "inventory", label: "Inventory Reports", icon: Package },
  { key: "customers", label: "Customer Reports", icon: Users },
];

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

const rs = (n) =>
  "Rs. " +
  (Number(n) || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  });
const num = (n) => (Number(n) || 0).toLocaleString();

// infer chart keys per tab, but stay resilient to API shapes
function getCfg(tab, rows) {
  if (!rows?.length) return null;
  const keys = Object.keys(rows[0]);
  const has = (k) => keys.includes(k);

  if (tab === "sales") {
    const x = has("date") ? "date" : has("day") ? "day" : keys[0];
    const y = has("total") ? "total" : has("amount") ? "amount" : keys[1];
    const y2 = has("orders") ? "orders" : null;
    return { type: "line", xKey: x, yKey: y, y2Key: y2, nice: true };
  }
  if (tab === "inventory") {
    const x = has("item") ? "item" : has("name") ? "name" : keys[0];
    const y = has("quantity") ? "quantity" : has("stock") ? "stock" : keys[1];
    return { type: "bar", xKey: x, yKey: y, nice: true };
  }
  if (tab === "customers") {
    const x = has("name") ? "name" : has("customer") ? "customer" : keys[0];
    const y = has("orders") ? "orders" : has("count") ? "count" : keys[1];
    const rev = has("revenue") ? "revenue" : null;
    return { type: "bar", xKey: x, yKey: y, revenueKey: rev, nice: true };
  }
  return { type: "bar", xKey: keys[0], yKey: keys[1] };
}

// table headers per tab (pretty labels)
function tableColumns(tab, cfg) {
  if (!cfg) return [];
  if (tab === "sales") {
    return [
      { key: cfg.xKey, label: "Date" },
      { key: cfg.yKey, label: "Total" },
      ...(cfg.y2Key ? [{ key: cfg.y2Key, label: "Orders" }] : []),
    ];
  }
  if (tab === "inventory") {
    return [
      { key: cfg.xKey, label: "Item" },
      { key: cfg.yKey, label: "Quantity" },
    ];
  }
  if (tab === "customers") {
    return [
      { key: cfg.xKey, label: "Name" },
      { key: cfg.yKey, label: "Orders" },
      ...(cfg.revenueKey ? [{ key: cfg.revenueKey, label: "Revenue" }] : []),
    ];
  }
  // fallback
  return [
    { key: cfg.xKey, label: cfg.xKey },
    { key: cfg.yKey, label: cfg.yKey },
  ];
}

// totals for Detailed View footer
function tableTotals(tab, cfg, rows) {
  if (!cfg || !rows?.length) return null;
  if (tab === "sales") {
    const total = rows.reduce((a, r) => a + Number(r[cfg.yKey] || 0), 0);
    const orders = cfg.y2Key
      ? rows.reduce((a, r) => a + Number(r[cfg.y2Key] || 0), 0)
      : null;
    return { total, orders };
  }
  if (tab === "inventory") {
    const qty = rows.reduce((a, r) => a + Number(r[cfg.yKey] || 0), 0);
    return { qty };
  }
  if (tab === "customers") {
    const orders = rows.reduce((a, r) => a + Number(r[cfg.yKey] || 0), 0);
    const revenue = cfg.revenueKey
      ? rows.reduce((a, r) => a + Number(r[cfg.revenueKey] || 0), 0)
      : null;
    return { orders, revenue };
  }
  return null;
}

// custom tooltip (clean card look, money for totals)
function CustomTooltip({ active, payload, label, tab, cfg }) {
  if (!active || !payload?.length) return null;
  const lines = payload.map((p, i) => {
    const name = p.dataKey;
    const isMoney =
      (tab === "sales" && (name === cfg.yKey || name?.toLowerCase().includes("total") || name?.toLowerCase().includes("amount"))) ||
      (tab === "customers" && name === cfg.revenueKey);
    const val = isMoney ? rs(p.value) : num(p.value);
    return (
      <div key={i} className="flex items-center justify-between gap-6">
        <span className="text-gray-500">{name}</span>
        <span className="font-semibold text-gray-900">{val}</span>
      </div>
    );
  });

  return (
    <div className="rounded-xl border border-emerald-100 bg-white/95 backdrop-blur px-3 py-2 shadow-sm">
      <div className="mb-1 text-sm font-semibold text-gray-900">{label}</div>
      <div className="space-y-1 text-sm">{lines}</div>
    </div>
  );
}

export default function StoreReports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [range, setRange] = useState("today");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/${activeTab}`, { params: { range } });
        if (!mounted) return;
        setData(Array.isArray(res.data) ? res.data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [activeTab, range]);

  const cfg = useMemo(() => getCfg(activeTab, data), [activeTab, data]);
  const cols = useMemo(() => tableColumns(activeTab, cfg), [activeTab, cfg]);
  const totals = useMemo(() => tableTotals(activeTab, cfg, data), [activeTab, cfg, data]);

  // ---- PDF (kept; CSV removed as you asked) ----
  const exportPDF = () => {
    const doc = new jsPDF();
    const sectionLabel = TABS.find((t) => t.key === activeTab)?.label || "";
    const rangeLabel = RANGES.find((r) => r.key === range)?.label || "";
    const generatedAt = new Date();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(22, 101, 52);
    doc.text(BRAND_DETAILS.name, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    doc.text(BRAND_DETAILS.address, 14, 28);
    doc.text(BRAND_CONTACT_LINE, 14, 34);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    const headerTitle = formatDocumentTitle(
      sectionLabel || BRAND_DOCUMENT_TITLES.report
    );
    doc.text(headerTitle, 196, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt.toLocaleDateString()}`, 196, 28, { align: "right" });
    doc.text(generatedAt.toLocaleTimeString(), 196, 34, { align: "right" });

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    const metaStartY = 46;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Section:", 14, metaStartY);
    doc.setFont("helvetica", "normal");
    doc.text(sectionLabel || "—", 36, metaStartY);
    doc.setFont("helvetica", "bold");
    doc.text("Range:", 14, metaStartY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(rangeLabel || "—", 33, metaStartY + 8);
    doc.setFont("helvetica", "bold");
    doc.text("Generated:", 196, metaStartY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(generatedAt.toLocaleString(), 196, metaStartY + 8, { align: "right" });

    let startY = metaStartY + 16;

    // optional KPI mini-table for sales/customers
    if (activeTab === "sales" && data.length && cfg) {
      const tot = data.reduce((a, r) => a + Number(r[cfg.yKey] || 0), 0);
      const ord = cfg.y2Key
        ? data.reduce((a, r) => a + Number(r[cfg.y2Key] || 0), 0)
        : 0;
      autoTable(doc, {
        startY,
        head: [["Metric", "Value"]],
        body: [
          ["Total Sales", rs(tot)],
          ...(cfg.y2Key ? [["Total Orders", num(ord)]] : []),
        ],
        headStyles: { fillColor: [22, 163, 74] },
        styles: { fontSize: 10 },
      });
      startY = doc.lastAutoTable.finalY + 8;
    }

    if (data.length) {
      const headers = cols.map((c) => c.label);
      const body = data.map((r) =>
        cols.map((c) => {
          const v = r[c.key];
          if (activeTab === "sales" && c.label === "Total") return rs(v);
          if (activeTab === "customers" && c.label === "Revenue") return rs(v);
          return String(v ?? "—");
        })
      );
      autoTable(doc, {
        startY,
        head: [headers],
        body,
        headStyles: { fillColor: [22, 163, 74] },
        styles: { fontSize: 9 },
      });
    } else {
      doc.text("No data available", 14, startY);
    }

    doc.save(`${activeTab}-report.pdf`);
  };

  // smooth card entrance
  const cardAnim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 space-y-6">
      {/* Header card */}
      <motion.div
        {...cardAnim}
        className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              {(() => {
                const Icon = TABS.find(t => t.key === activeTab)?.icon ?? BarChart3;
                return <Icon className="h-5 w-5 text-emerald-600" />;
              })()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {TABS.find((t) => t.key === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                {RANGES.find((r) => r.key === range)?.label} overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-emerald-600 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {RANGES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
            <button
              onClick={exportPDF}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-5 rounded-2xl bg-white">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              {cfg && data.length ? (
                cfg.type === "line" ? (
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                    <XAxis dataKey={cfg.xKey} tick={{ fill: "#6b7280" }} />
                    <YAxis tick={{ fill: "#6b7280" }} domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      content={<CustomTooltip tab="sales" cfg={cfg} />}
                      cursor={{ stroke: "#10b981", strokeDasharray: "3 3" }}
                    />
                    <Line
                      type="monotone"
                      dataKey={cfg.yKey}
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: "#059669", strokeWidth: 2, fill: "#ffffff" }}
                      activeDot={{ r: 6 }}
                      isAnimationActive
                    />
                    {cfg.y2Key && (
                      <Line
                        type="monotone"
                        dataKey={cfg.y2Key}
                        stroke="#111827"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        isAnimationActive
                      />
                    )}
                  </LineChart>
                ) : (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                    <XAxis dataKey={cfg.xKey} tick={{ fill: "#6b7280" }} />
                    <YAxis tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      content={
                        <CustomTooltip tab={activeTab} cfg={cfg} />
                      }
                      cursor={{ fill: "rgba(16,185,129,0.08)" }}
                    />
                    <Bar dataKey={cfg.yKey} fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                )
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Tabs (simple) */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const is = t.key === activeTab;
          return (
            <motion.button
              key={t.key}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                is
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-900 border-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {t.label}
            </motion.button>
          );
        })}
      </div>

      {/* Detailed View */}
      <motion.div
        {...cardAnim}
        className="rounded-3xl border border-emerald-100 bg-white shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-emerald-100">
          <div className="h-5 w-1 rounded-full bg-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">Detailed View</h3>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className="px-4 py-3 text-left font-semibold uppercase tracking-wide text-gray-700"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {data.length ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40">
                    {cols.map((c) => {
                      let v = row[c.key];
                      if (activeTab === "sales" && c.label === "Total") v = rs(v);
                      if (activeTab === "customers" && c.label === "Revenue") v = rs(v);
                      return (
                        <td key={c.key} className="px-4 py-2 text-gray-900">
                          {String(v ?? "—")}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-600" colSpan={cols.length}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>

            {/* Totals row (when applicable) */}
            {!!totals && data.length > 0 && (
              <tfoot>
                <tr className="bg-emerald-50 border-t border-emerald-100">
                  {activeTab === "sales" && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-700">Totals</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{rs(totals.total)}</td>
                      {cfg?.y2Key && (
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {num(totals.orders)}
                        </td>
                      )}
                    </>
                  )}
                  {activeTab === "inventory" && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-700">Totals</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {num(totals.qty)}
                      </td>
                    </>
                  )}
                  {activeTab === "customers" && (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-700">Totals</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {num(totals.orders)}
                      </td>
                      {cfg?.revenueKey && (
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {rs(totals.revenue)}
                        </td>
                      )}
                    </>
                  )}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>
    </div>
  );
}
