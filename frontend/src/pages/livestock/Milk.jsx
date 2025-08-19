import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaDownload, FaPlus, FaSearch } from "react-icons/fa";
import { createPortal } from "react-dom";
import { AddRecordModal, EditRecordModal } from "./MilkModal";
import { api } from "../../lib/api";

/* ---------- date helpers ---------- */
const pad = (n) => String(n).padStart(2, "0");
const liso = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const todayKey = () => liso(new Date());

const startOfWeekMon = (d = new Date()) => {
  const x = new Date(d);
  const day = x.getDay() || 7; // Sun(0)=>7
  if (day !== 1) x.setDate(x.getDate() - (day - 1));
  x.setHours(0, 0, 0, 0);
  return x;
};

// ---- ISO week helpers (for <input type="week">) ----
function isoWeekString(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday determines ISO-year
  const th = new Date(d);
  th.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const isoYear = th.getFullYear();
  const week1Mon = startOfWeekMon(new Date(isoYear, 0, 4));
  const week = 1 + Math.floor((lisoDays(th) - lisoDays(week1Mon)) / 7);
  return `${isoYear}-W${pad(week)}`;
}
function mondayFromISOWeek(iso) {
  // iso like "2025-W33"
  const [yStr, wStr] = iso.split("-W");
  const y = Number(yStr);
  const w = Number(wStr);
  const week1Mon = startOfWeekMon(new Date(y, 0, 4)); // Monday of ISO week 1
  const mon = new Date(week1Mon);
  mon.setDate(mon.getDate() + (w - 1) * 7);
  return mon;
}
function lisoDays(d) {
  // number of days since 1970-01-01 (local)
  return Math.floor(new Date(liso(d)).getTime() / 86400000);
}

const labelsWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const labelsYear = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmtL = (n) => `${Number(n || 0).toFixed(1)} L`;
const isFemale = (c) => String(c?.gender || c?.sex || "").toLowerCase().startsWith("f");

/* ---------- small UI ---------- */
function PeriodTabs({ value, onChange }) {
  const Btn = ({ v, label }) => (
    <button
      onClick={() => onChange(v)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        value === v
          ? "bg-green-600 text-white"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex gap-2">
      <Btn v="week" label="Week" />
      <Btn v="month" label="Month" />
      <Btn v="year" label="Year" />
    </div>
  );
}

/* ---------- floating actions menu (portal) ---------- */
function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const width = 224;

  useEffect(() => {
    const close = (e) => {
      if (!(e.target.closest && e.target.closest("[data-actions-btn]"))) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const computePos = (btn) => {
    const r = btn.getBoundingClientRect();
    let left = Math.min(window.innerWidth - width - 8, r.right - width);
    if (left < 8) left = 8;
    const top = Math.min(window.innerHeight - 8, r.bottom + 8);
    setPos({ top, left });
  };

  return (
    <>
      <button
        data-actions-btn
        onClick={(e) => {
          computePos(e.currentTarget);
          setOpen((v) => !v);
        }}
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center"
        aria-label="Actions"
      >
        <span className="text-gray-600">⋮</span>
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-50 w-56 rounded-xl border bg-white shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            <button
              onClick={() => { setOpen(false); onEdit?.(); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              ✏️ <span>Edit</span>
            </button>
            <button
              onClick={() => { setOpen(false); onDelete?.(); }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              🗑️ <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

/* ---------- Milk Records Table ---------- */
function MilkRecordsTable({
  records,
  onEditRow,
  onDeleteRow,
  dateFilter,
  onDateFilterChange,
  onClearDateFilter,
  hasMore,
  onLoadMore,
}) {
  const fmtDate = (isoStr) =>
    new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  return (
    <section className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Milk Records</h2>
          <p className="text-sm text-gray-500">{records.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter || ""}
            onChange={(e) => onDateFilterChange?.(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            title="Filter by date"
          />
          {dateFilter && (
            <button
              onClick={onClearDateFilter}
              className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-gray-600 border-b">
            <tr>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Cow</th>
              <th className="py-3 px-3 text-right">Morning (L)</th>
              <th className="py-3 px-3 text-right">Evening (L)</th>
              <th className="py-3 px-3 text-right">Total (L)</th>
              <th className="py-3 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const total = Number(r.morning || 0) + Number(r.evening || 0);
              return (
                <tr key={r._rowId} className="border-b last:border-0">
                  <td className="py-3 px-3 whitespace-nowrap">{fmtDate(r.date)}</td>
                  <td className="py-3 px-3">
                    {r.cowName || "—"} {r.tagId ? <span className="text-gray-500">({r.tagId})</span> : null}
                  </td>
                  <td className="py-3 px-3 text-right">{Number(r.morning || 0).toFixed(1)}</td>
                  <td className="py-3 px-3 text-right">{Number(r.evening || 0).toFixed(1)}</td>
                  <td className="py-3 px-3 text-right font-semibold">{total.toFixed(1)}</td>
                  <td className="py-3 px-3">
                    <ActionMenu onEdit={() => onEditRow?.(r)} onDelete={() => onDeleteRow?.(r)} />
                  </td>
                </tr>
              );
            })}
            {!records.length && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Show more
          </button>
        </div>
      )}
    </section>
  );
}

/* ---------- AI Insights ---------- */
function AIInsights({ pctChange = 0 }) {
  return (
    <section className="bg-green-50 border border-green-100 rounded-lg p-5">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
        AI Production Insights
      </h3>
      <div className="mt-3 text-sm text-gray-700">
        <span className="font-semibold">Trend:</span>{" "}
        {pctChange >= 0 ? "↑" : "↓"} {Math.abs(pctChange).toFixed(1)}% vs. yesterday.
      </div>
    </section>
  );
}

/* ============================================================= */
/*                              PAGE                              */
/* ============================================================= */
export default function Milk() {
  const [period, setPeriod] = useState("week");

  // NEW: pick exact week & any year
  const [weekISO, setWeekISO] = useState(isoWeekString());
  const [monthIdx, setMonthIdx] = useState(new Date().getMonth());
  const [yearSel, setYearSel] = useState(new Date().getFullYear());

  const [search, setSearch] = useState("");
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState("all");

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0, pctChange: 0 });
  const [error, setError] = useState("");

  // records with "Show more"
  const [allRows, setAllRows] = useState([]);
  const [visible, setVisible] = useState(10);
  const hasMore = visible < allRows.length;
  const [dateFilter, setDateFilter] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  /* cows (female only) */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cows");
        setCows(Array.isArray(data) ? data.filter(isFemale) : []);
      } catch {
        setCows([]);
      }
    })();
  }, []);

  /* analytics / chart (DB-backed) */
  async function loadSeriesAndSummary() {
    setLoading(true);
    setError("");
    try {
      // Range for selected period
      let from, to;
      if (period === "week") {
        const mon = mondayFromISOWeek(weekISO);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        from = liso(mon);
        to = liso(sun);
      } else if (period === "month") {
        const y = new Date().getFullYear();
        const s = new Date(y, monthIdx, 1);
        const e = new Date(y, monthIdx + 1, 0);
        from = liso(s);
        to = liso(e);
      } else {
        from = `${yearSel}-01-01`;
        to = `${yearSel}-12-31`;
      }

      // fetch timeline
      const params = { from, to };
      let rows = [];
      if (cowId === "all") {
        const { data } = await api.get("/milk/summary/farm/daily", { params });
        rows = Array.isArray(data) ? data : []; // [{date,totalLiters}]
      } else {
        const { data } = await api.get(`/milk/cow/${cowId}/daily`, { params });
        const raw = Array.isArray(data) ? data : []; // [{date, liters}]
        rows = raw.map((x) => ({ date: x.date, totalLiters: x.liters }));
      }

      // map date -> total
      const byDate = new Map();
      for (const x of rows) {
        const d = liso(x.date);
        byDate.set(d, (byDate.get(d) || 0) + Number(x.totalLiters || 0));
      }

      // build chart series
      let seriesData = [];
      if (period === "week") {
        const s = new Date(from);
        for (let i = 0; i < 7; i++) {
          const d = new Date(s);
          d.setDate(s.getDate() + i);
          const k = liso(d);
          seriesData.push({ date: k, label: labelsWeek[i], value: byDate.get(k) || 0 });
        }
      } else if (period === "month") {
        const s = new Date(from), e = new Date(to);
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          const k = liso(d);
          seriesData.push({ date: k, label: String(d.getDate()), value: byDate.get(k) || 0 });
        }
      } else {
        const sums = new Array(12).fill(0);
        for (const [k, v] of byDate) if (k.startsWith(`${yearSel}-`)) sums[Number(k.slice(5, 7)) - 1] += v;
        seriesData = sums.map((v, i) => ({ date: `${yearSel}-${pad(i + 1)}-01`, label: labelsYear[i], value: v }));
      }

      // summary (today / this week / this month from DB)
      const today = todayKey();
      const yday = liso(new Date(new Date().setDate(new Date().getDate() - 1)));
      const weekFrom = liso(startOfWeekMon());
      const weekTo = liso(new Date(new Date(weekFrom).setDate(new Date(weekFrom).getDate() + 6)));
      const monthFrom = liso(new Date(new Date().setDate(new Date().getDate() - 29)));
      const addCow = (p) => (cowId !== "all" ? { ...p, cow: cowId } : p);
      const sum = (arr) => arr.reduce((s, it) => s + Number(it.volumeLiters || 0), 0);

      const paramsT = addCow({ from: today, to: today, limit: 2000 });
      const paramsY = addCow({ from: yday, to: yday, limit: 2000 });
      const paramsW = addCow({ from: weekFrom, to: weekTo, limit: 5000 });
      const paramsM = addCow({ from: monthFrom, to: today, limit: 10000 });

      const [{ data: dT }, { data: dY }, { data: dW }, { data: dM }] = await Promise.all([
        api.get("/milk", { params: paramsT }),
        api.get("/milk", { params: paramsY }),
        api.get("/milk", { params: paramsW }),
        api.get("/milk", { params: paramsM }),
      ]);

      const TI = dT.items || [];
      const YI = dY.items || [];
      const WI = dW.items || [];
      const MI = dM.items || [];

      const todayTotal = sum(TI);
      const yesterdayTotal = sum(YI);
      const weekTotal = sum(WI);
      const monthTotal = sum(MI);
      const pctChange = yesterdayTotal ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

      setSeries(seriesData);
      setSummary({ today: todayTotal, week: weekTotal, month: monthTotal, pctChange });
    } catch {
      setError("Couldn’t reach the analytics API.");
      setSeries([]);
      setSummary({ today: 0, week: 0, month: 0, pctChange: 0 });
    } finally {
      setLoading(false);
    }
  }

  /* records (top 10 + Show more) */
  function groupDaily(items) {
    const map = new Map();
    for (const it of items) {
      const dateKey = liso(it.date);
      const cowKey = String(it.cow?._id || it.cow);
      const key = `${dateKey}|${cowKey}`;
      const row =
        map.get(key) || {
          _rowId: key,
          date: dateKey,
          cowId: it.cow?._id || it.cow,
          cowName: it.cow?.name,
          tagId: it.cow?.tagId,
          morning: 0,
          evening: 0,
        };
      if (it.shift === "PM") row.evening += Number(it.volumeLiters || 0);
      else row.morning += Number(it.volumeLiters || 0);
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  async function loadAllRows() {
    try {
      const params = { limit: 80, page: 1 };
      if (cowId !== "all") params.cow = cowId;
      if (dateFilter) params.from = params.to = dateFilter;
      const { data } = await api.get("/milk", { params });
      const { items = [] } = data;
      const rows = groupDaily(items);
      setAllRows(rows);
      setVisible(Math.min(10, rows.length)); // start with 10
    } catch {
      setAllRows([]);
      setVisible(0);
    }
  }
  const loadMore = () => setVisible((v) => Math.min(v + 10, allRows.length));

  /* triggers */
  useEffect(() => { loadSeriesAndSummary(); }, [period, weekISO, monthIdx, yearSel, cowId]);
  useEffect(() => { loadAllRows(); }, [cowId, dateFilter]);

  /* delete */
  async function handleDeleteRow(row) {
    if (!confirm(`Delete AM/PM records for ${row.cowName || row.tagId || "cow"} on ${row.date}?`)) return;
    try {
      const params = { cow: row.cowId, from: row.date, to: row.date, limit: 10 };
      const { data } = await api.get("/milk", { params });
      const { items = [] } = data;
      for (const it of items) await api.delete(`/milk/${it._id}`);
      await loadAllRows();
      await loadSeriesAndSummary();
    } catch {
      alert("Failed to delete");
    }
  }

  const title = useMemo(() => (
    period === "week" ? "Weekly Milk Production" :
    period === "month" ? "Monthly Milk Production" :
    "Yearly Milk Production"
  ), [period]);

  // Controls shown beside tabs
  const ChartControls = () => (
    <div className="flex items-center gap-2">
      {period === "week" && (
        <input
          type="week"
          value={weekISO}
          onChange={(e) => setWeekISO(e.target.value || isoWeekString())}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
          title="Select week"
        />
      )}
      {period === "month" && (
        <select
          value={monthIdx}
          onChange={(e) => setMonthIdx(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          {labelsYear.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
      )}
      {period === "year" && (
        <input
          type="number"
          min="2000"
          max="2100"
          step="1"
          value={yearSel}
          onChange={(e) => setYearSel(Number(e.target.value || new Date().getFullYear()))}
          className="w-28 px-3 py-2 border rounded-lg text-sm bg-white"
          title="Pick any year"
        />
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Milk Production</h1>
        <p className="text-gray-500">Track and manage daily milk yield</p>

        {/* toolbar */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadAllRows()}
                placeholder="Search (optional)…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <select
                value={cowId}
                onChange={(e) => setCowId(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Filter by cow"
              >
                <option value="all">All Cows</option>
                {cows.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || c.tagId || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="self-start md:self-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus />
            Add Record
          </button>
        </div>

        {/* tabs + controls */}
        <div className="mt-4 flex items-center justify-between">
          <PeriodTabs value={period} onChange={setPeriod} />
          <ChartControls />
        </div>
      </header>

      {/* chart + summary */}
      <div className="grid lg:grid-cols-[1fr_20rem] gap-6">
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">
              {period === "week" && "Total yield by day (Mon–Sun)"}
              {period === "month" && "Daily totals for selected month"}
              {period === "year" && "Monthly totals for selected year"}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-yellow-50 text-yellow-800 px-4 py-2">{error}</div>
          )}

          <div className="h-72 md:h-80">
            {loading ? (
              <div className="h-full grid place-items-center text-gray-500">Loading production…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtL(v)} labelFormatter={(l) => `${l}`} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                    name="Milk Yield (L)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <aside className="w-full lg:w-80 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Production Summary</h3>
          <div className="space-y-5">
            <div>
              <p className="text-gray-500 text-sm">Today’s Total</p>
              <p className="text-2xl font-extrabold">{fmtL(summary.today)}</p>
              <span
                className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                  summary.pctChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {summary.pctChange >= 0 ? "↑" : "↓"} {Math.abs(summary.pctChange).toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">This Week</p>
              <p className="text-lg font-semibold">{fmtL(summary.week)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-lg font-semibold">{fmtL(summary.month)}</p>
            </div>
            <button
              onClick={() => window.open(`${api.defaults.baseURL}/reports/milk?period=month`, "_blank")}
              className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50"
            >
              <FaDownload /> Export Report
            </button>
          </div>
        </aside>
      </div>

      {/* records + insights */}
      <div className="mt-6 space-y-6">
        <MilkRecordsTable
          records={allRows.slice(0, visible)}
          hasMore={hasMore}
          onLoadMore={loadMore}
          dateFilter={dateFilter}
          onDateFilterChange={(d) => setDateFilter(d)}
          onClearDateFilter={() => setDateFilter("")}
          onEditRow={(r) => { setEditRow(r); setEditOpen(true); }}
          onDeleteRow={handleDeleteRow}
        />
        <AIInsights pctChange={summary.pctChange} />
      </div>

      {/* modals */}
      <AddRecordModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        cows={cows}
        onSaved={() => { loadAllRows(); loadSeriesAndSummary(); }}
      />
      <EditRecordModal
        open={editOpen}
        row={editRow}
        cows={cows}
        onClose={() => setEditOpen(false)}
        onSaved={() => { loadAllRows(); loadSeriesAndSummary(); }}
      />
    </div>
  );
}
