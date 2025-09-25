import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceDot,   
} from "recharts";
import { FaDownload, FaPlus, FaSearch, FaEdit, FaTrashAlt, FaEllipsisV, FaCalendarAlt, FaChartBar, FaChartLine } from "react-icons/fa";
import { createPortal } from "react-dom";
import { AddRecordModal, EditRecordModal } from "./MilkModal";
import { api } from "../../lib/api";
import { pdf } from "@react-pdf/renderer";
import { MilkReportPDF } from "./MilkReport";

const CLOSE_EVT = "app:close-action-menus";
/*  date helpers  */
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

//  week helpers 
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
  const week1Mon = startOfWeekMon(new Date(y, 0, 4)); // Monday of week 1
  const mon = new Date(week1Mon);
  mon.setDate(mon.getDate() + (w - 1) * 7);
  return mon;
}
function lisoDays(d) {
  return Math.floor(new Date(liso(d)).getTime() / 86400000);
}

const labelsWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const labelsYear = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmtL = (n) => `${Number(n || 0).toFixed(1)} L`;
const isFemale = (c) => String(c?.gender || c?.sex || "").toLowerCase().startsWith("f");

/*  small UI  */
function PeriodTabs({ value, onChange }) {
  const Btn = ({ v, label, Icon }) => (
    <button
      onClick={() => onChange(v)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
        value === v
          ? "bg-green-500 text-white shadow-md"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Icon className="text-sm" />
      {label}
    </button>
  );
  return (
    <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
      <Btn v="week" label="Week" Icon={FaCalendarAlt} />
      <Btn v="month" label="Month" Icon={FaChartBar} />
      <Btn v="year" label="Year" Icon={FaChartLine} />
    </div>
  );
}

/*  floating actions menu  */
function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const width = 224;
  const CLOSE_EVT = "app:close-action-menus";

  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener(CLOSE_EVT, handler);
    return () => window.removeEventListener(CLOSE_EVT, handler);
  }, []);

  useEffect(() => {
    const closeIfOutside = (e) => {
      const insideBtn  = e.target.closest?.("[data-actions-btn]");
      const insideMenu = e.target.closest?.("[data-actions-menu]");
      if (!insideBtn && !insideMenu) setOpen(false);
    };
    document.addEventListener("mousedown", closeIfOutside);
    return () => document.removeEventListener("mousedown", closeIfOutside);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
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
          if (open) { setOpen(false); return; }
          window.dispatchEvent(new Event(CLOSE_EVT));
          computePos(e.currentTarget);
          setOpen(true);
        }}
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center"
        aria-label="Actions"
      >
        <span className="text-gray-600">⋮</span>
      </button>

      {open &&
        createPortal(
          <div
            data-actions-menu
            className="fixed z-50 w-56 rounded-xl border bg-white shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            <button
              onClick={() => { setOpen(false); onEdit?.(); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <FaEdit className="text-gray-600" /> <span>Edit</span>
            </button>
            <button
              onClick={() => { setOpen(false); onDelete?.(); }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <FaTrashAlt className="text-red-600" /> <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

/*  Milk Records Table  */
function MilkRecordsTable({
    records,
    onEditRow,
    onDeleteRow,
    dateFilter,
    onDateFilterChange,
    onClearDateFilter,
    hasMore,
    onLoadMore,
    onLoadLess,
    canLoadLess,
    tableMonthIdx,
    onTableMonthChange,
    onClearMonthFilter,
    yearSel,
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0–11

  useEffect(() => {
    if (
      yearSel > currentYear ||
      (yearSel === currentYear && tableMonthIdx !== null && tableMonthIdx > currentMonth)
    ) {
      onTableMonthChange?.(null);
    }
  }, [yearSel, tableMonthIdx, currentYear, currentMonth, onTableMonthChange]);

  const fmtDate = (isoStr) =>
    new Date(isoStr).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  return (
    <section className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Milk Records</h2>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        {/* Date + Month Filters together */}
        <div className="flex items-center gap-3">
          {/* Date */}
          <input
            type="date"
            value={dateFilter || ""}
            max={todayKey()}   //  block future dates
            onChange={(e) => onDateFilterChange?.(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500"
          />
          {dateFilter && (
            <button
              onClick={onClearDateFilter}
              className="px-3 py-2 text-xs rounded-lg border text-gray-600 hover:bg-gray-100 transition"
            >
              Clear
            </button>
          )}

          {/* Month */}
          <select
            value={tableMonthIdx === null ? "" : String(tableMonthIdx)}
            onChange={(e) =>
              onTableMonthChange?.(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All months</option>
            {labelsYear.map((m, i) => {
              const disableFuture =
                yearSel > currentYear || (yearSel === currentYear && i > currentMonth);
              return (
                <option key={i} value={i} disabled={disableFuture}>
                  {m}
                </option>
              );
            })}
          </select>
          {tableMonthIdx !== null && (
            <button
              onClick={onClearMonthFilter}
              className="px-3 py-2 text-xs rounded-lg border text-gray-600 hover:bg-gray-100 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full table-fixed text-base border-collapse align-middle">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-6 text-left font-bold text-green-700">
                Date
              </th>
              <th className="py-3 px-6 text-left font-bold text-green-700">
                Cow
              </th>
              <th className="py-3 px-6 text-center font-bold text-green-700">
                Morning (L)
              </th>
              <th className="py-3 px-6 text-center font-bold text-green-700">
                Evening (L)
              </th>
              <th className="py-3 px-6 text-center font-bold text-green-700">
                Total (L)
              </th>
              <th className="py-3 px-6 text-center font-bold text-green-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.map((r, i) => {
              const total = Number(r.morning || 0) + Number(r.evening || 0);
              return (
                <tr
                  key={r._rowId}
                  className={`transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  } hover:bg-green-50`}
                >
                  <td className="py-3 px-6 text-gray-800 font-medium whitespace-nowrap">
                    {fmtDate(r.date)}
                  </td>
                  <td className="py-3 px-6">
                    <span className="font-semibold text-gray-800">
                      {r.cowName || "—"}
                    </span>
                    {r.tagId && (
                      <span className="text-gray-400 text-sm"> ({r.tagId})</span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700 tabular-nums">
                    {Number(r.morning || 0).toFixed(1)}
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700 tabular-nums">
                    {Number(r.evening || 0).toFixed(1)}
                  </td>
                  <td className="py-3 px-6 text-center font-bold text-gray-900 tabular-nums">
                    {total.toFixed(1)}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <ActionMenu
                      onEdit={() => onEditRow?.(r)}
                      onDelete={() => onDeleteRow?.(r)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination buttons */}
        {(hasMore || canLoadLess) && (
          <div className="flex justify-center gap-3 mt-4">
            {hasMore && (
              <button
                onClick={onLoadMore}
                className="px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-70"
              >
                Show More
              </button>
            )}
            {canLoadLess && (
              <button
                onClick={onLoadLess}
                className="px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-70"
              >
                Show Less
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/*  PAGE  */
export default function Milk() {
  // State for Chart Controls
  const [period, setPeriod] = useState("week");
  const [weekISO, setWeekISO] = useState(isoWeekString());
  const [monthIdx, setMonthIdx] = useState(new Date().getMonth());
  const [yearSel, setYearSel] = useState(new Date().getFullYear());

  // State for Table Filters
  const [dateFilter, setDateFilter] = useState(""); 
  const [tableMonthIdx, setTableMonthIdx] = useState(null); 

  // General State
  const [search, setSearch] = useState("");
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState("all");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0, pctChange: 0 });
  const [error, setError] = useState("");

  const filteredCows = useMemo(() => {
    if (!search.trim()) return cows;
    const q = search.toLowerCase();
    return cows.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.tagId || "").toLowerCase().includes(q)
    );
  }, [search, cows]);

  // Table records with "Show more/less" functionality
  const [allRows, setAllRows] = useState([]);
  const [visible, setVisible] = useState(10);
  const hasMore = visible < allRows.length;

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // PDF Export state
  const [isExporting, setIsExporting] = useState(false);
  
  // Chart hover state
  const [activeIndex, setActiveIndex] = useState(null);

  /* Load female cows for dropdowns */
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

  /* Load data for the chart and summary cards */
  async function loadSeriesAndSummary() {
    setLoading(true);
    setError("");
    try {
      // Determine date range based on the selected period for the chart
      let from, to;
      if (period === "week") {
        const mon = mondayFromISOWeek(weekISO);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        from = liso(mon);
        to = liso(sun);
      } else if (period === "month") {
        const s = new Date(yearSel, monthIdx, 1);
        const e = new Date(yearSel, monthIdx + 1, 0);
        from = liso(s);
        to = liso(e);
      } else { // year
        from = `${yearSel}-01-01`;
        to = `${yearSel}-12-31`;
      }

      const params = { from, to };
      let rows = [];
      if (cowId === "all") {
      if (searchCowIds && searchCowIds.length) {
        rows = [];
        for (const id of searchCowIds) {
          const { data } = await api.get(`/milk/cow/${id}/daily`, { params });
          const raw = Array.isArray(data) ? data : [];
          rows.push(...raw.map(x => ({ date: x.date, totalLiters: x.liters })));
        }
        // group by date if multiple cows matched
        const grouped = new Map();
        for (const r of rows) {
          const k = liso(r.date);
          grouped.set(k, (grouped.get(k) || 0) + r.totalLiters);
        }
        rows = Array.from(grouped.entries()).map(([date, totalLiters]) => ({ date, totalLiters }));
      } else {
        const { data } = await api.get("/milk/summary/farm/daily", { params });
        rows = Array.isArray(data) ? data : [];
      }
    } else {
      const { data } = await api.get(`/milk/cow/${cowId}/daily`, { params });
      const raw = Array.isArray(data) ? data : [];
      rows = raw.map((x) => ({ date: x.date, totalLiters: x.liters }));
    }

      const byDate = new Map(rows.map(x => [liso(x.date), Number(x.totalLiters || 0)]));

      // Build chart series data
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
      } else { // year
        const sums = new Array(12).fill(0);
        for (const [k, v] of byDate) if (k.startsWith(`${yearSel}-`)) sums[Number(k.slice(5, 7)) - 1] += v;
        seriesData = sums.map((v, i) => ({ date: `${yearSel}-${pad(i + 1)}-01`, label: labelsYear[i], value: v }));
      }

      // Fetch data for summary cards (Today, This Week, This Month)
      const sum = (arr) => arr.reduce((s, it) => s + Number(it.volumeLiters || 0), 0);
      const addCow = (p) => (cowId !== "all" ? { ...p, cow: cowId } : p);

      const [ { data: { items: todayItems = [] } }, { data: { items: ydayItems = [] } }, { data: { items: weekItems = [] } }, { data: { items: monthItems = [] } } ] = await Promise.all([
        api.get("/milk", { params: addCow({ from: todayKey(), to: todayKey(), limit: 2000 }) }),
        api.get("/milk", { params: addCow({ from: liso(new Date().setDate(new Date().getDate() - 1)), to: liso(new Date().setDate(new Date().getDate() - 1)), limit: 2000 }) }),
        api.get("/milk", { params: addCow({ from: liso(startOfWeekMon()), to: todayKey(), limit: 5000 }) }),
        api.get("/milk", { params: addCow({ from: liso(new Date(new Date().setDate(1))), to: todayKey(), limit: 10000 }) }),
      ]);
      
      const todayTotal = sum(todayItems);
      const yesterdayTotal = sum(ydayItems);
      const pctChange = yesterdayTotal ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : (todayTotal > 0 ? 100 : 0);

      setSeries(seriesData);
      setSummary({ today: todayTotal, week: sum(weekItems), month: sum(monthItems), pctChange });
    } catch {
      setError("Couldn't reach the analytics API.");
      setSeries([]);
      setSummary({ today: 0, week: 0, month: 0, pctChange: 0 });
    } finally {
      setLoading(false);
    }
  }

  /* Load records for the table based on filters */
  function groupDaily(items) {
    const map = new Map();
    for (const it of items) {
      const dateKey = liso(it.date);
      const cowKey = String(it.cow?._id || it.cow);
      const key = `${dateKey}|${cowKey}`;
      const row = map.get(key) || {
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
      const params = { limit: 100, page: 1, sortBy: "date", sortOrder: "desc" };
      if (cowId !== "all") params.cow = cowId;

      // Apply either the exact date filter or the month/year filter
      if (dateFilter) {
        params.from = params.to = dateFilter;
      } else if (tableMonthIdx !== null) {
        const s = new Date(yearSel, tableMonthIdx, 1);
        const e = new Date(yearSel, tableMonthIdx + 1, 0);
        params.from = liso(s);
        params.to = liso(e);
      }

      const { data } = await api.get("/milk", { params });
      const rows = groupDaily(data.items || []);
      setAllRows(rows);
      setVisible(10);
    } catch {
      setAllRows([]);
      setVisible(0);
    }
  }

  const loadMore = () => setVisible((v) => Math.min(v + 10, allRows.length));
  const loadLess = () => setVisible((v) => Math.max(10, v - 10));

  /* --- Triggers for data loading --- */
  // Reload chart data when its controls change
  useEffect(() => { loadSeriesAndSummary(); }, [period, weekISO, monthIdx, yearSel, cowId, search]);
  
  useEffect(() => { loadAllRows(); }, [cowId, dateFilter, tableMonthIdx, yearSel]);

  /* Delete records for a specific cow on a specific day */
  async function handleDeleteRow(row) {
    if (!confirm(`Delete all records for ${row.cowName || row.tagId} on ${row.date}?`)) return;
    try {
      const params = { cow: row.cowId, from: row.date, to: row.date, limit: 10 };
      const { data } = await api.get("/milk", { params });
      
      await Promise.all((data.items || []).map(it => api.delete(`/milk/${it._id}`)));
      
      await loadAllRows();
      await loadSeriesAndSummary();
    } catch {
      alert("Failed to delete records.");
    }
  }
  
  /* Prepare and trigger download for the monthly PDF report */
  async function handleExport() {
    setIsExporting(true);
    try {
      const currentMonthName = labelsYear[monthIdx];
      const from = liso(new Date(yearSel, monthIdx, 1));
      const to = liso(new Date(yearSel, monthIdx + 1, 0));

      const { data } = await api.get("/milk", { params: { from, to, limit: 5000, ...(cowId !== "all" && { cow: cowId }) } });
      const items = data?.items || [];

      if (!items.length) {
        alert(`No data for ${currentMonthName} ${yearSel}. Try another month/year.`);
        return;
      }

      const selectedCow = cows.find(c => c._id === cowId);
      const cowName = cowId === "all" ? "All Cows" : (selectedCow?.name || selectedCow?.tagId || "N/A");
      
      const reportInfo = { records: items, monthName: currentMonthName, year: yearSel, cowName };
      
      const doc = <MilkReportPDF {...reportInfo} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Milk_Report_${reportInfo.monthName}_${reportInfo.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to prepare report data.");
    } finally {
      setIsExporting(false);
    }
  }

  const title = useMemo(() => (
    period === "week" ? "Weekly Milk Production" :
    period === "month" ? "Monthly Milk Production" :
    "Yearly Milk Production"
  ), [period]);

  const searchCowIds = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return cows
      .filter(c =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.tagId || "").toLowerCase().includes(q)
      )
      .map(c => c._id);
  }, [search, cows]);

  const ChartControls = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0–11

    return (
      <div className="flex items-center gap-2">
        {/* Week filter */}
        {period === "week" && (
          <input
            type="week"
            value={weekISO}
            max={isoWeekString(new Date())} //  block future weeks
            onChange={(e) => setWeekISO(e.target.value || isoWeekString())}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
            title="Select week"
          />
        )}

        {/* Month filter */}
        {period === "month" && (
          <>
            <select
              value={monthIdx}
              onChange={(e) => setMonthIdx(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              {labelsYear.map((m, i) => (
                <option
                  key={i}
                  value={i}
                  disabled={
                    yearSel > currentYear ||
                    (yearSel === currentYear && i > currentMonth) //  block future months
                  }
                >
                  {m}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="2000"
              max={currentYear} //  block future years
              step="1"
              value={yearSel}
              onChange={(e) =>
                setYearSel(
                  Number(e.target.value || new Date().getFullYear())
                )
              }
              className="w-28 px-3 py-2 border rounded-lg text-sm bg-white"
              title="Select year"
            />
          </>
        )}

        {/* Year filter */}
        {period === "year" && (
          <input
            type="number"
            min="2000"
            max={currentYear} //  block future years
            step="1"
            value={yearSel}
            onChange={(e) =>
              setYearSel(
                Number(e.target.value || new Date().getFullYear())
              )
            }
            className="w-28 px-3 py-2 border rounded-lg text-sm bg-white"
            title="Pick any year"
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Milk Production</h1>
        <p className="text-gray-500 mb-4">Track and manage daily milk yield</p>
        {/* Controls Bar */}
        <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search + Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Cow Filter */}
            <div className="relative">
              <select
                value={cowId}
                onChange={(e) => setCowId(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 
                          rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Filter by cow"
              >
                <option value="all">All Cows</option>
                {filteredCows.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>
          </div>

          {/* Add Record Button */}
          <button
            onClick={() => setAddOpen(true)}
            className="self-start md:self-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg 
                      hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus /> Add Record
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <PeriodTabs value={period} onChange={setPeriod} />
          <ChartControls />
        </div>
      </header>
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
          {error && <div className="mb-4 rounded-md bg-yellow-50 text-yellow-800 px-4 py-2">{error}</div>}
          <div className="h-72 md:h-80">
            {loading ? <div className="h-full grid place-items-center text-gray-500">Loading production…</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={series} 
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.isTooltipActive) {
                      setActiveIndex(state.activeTooltipIndex);
                    } else {
                      setActiveIndex(null);
                    }
                  }}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <defs>
                    <linearGradient id="milkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={true}
                    tickLine={true}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={true}
                    tickLine={true}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(v) => [fmtL(v), "Milk Yield"]} 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={false}
                  />
                  {activeIndex !== null && series[activeIndex] && (
                    <>
                                
                    </>
                  )}
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22C55E" 
                    strokeWidth={3} 
                    fill="url(#milkGradient)"
                    dot={{ r: 5, fill: '#22C55E', strokeWidth: 1, stroke: '#ffffff' }} 
                    activeDot={{ r: 7, fill: '#22C55E', strokeWidth: 1, stroke: '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <aside className="w-full lg:w-80 bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Production Summary</h3>
          <div className="space-y-5">
            <div>
              <p className="text-gray-500 text-sm">Today's Total</p>
              <p className="text-2xl font-extrabold">{fmtL(summary.today)}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${ summary.pctChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700" }`}> {summary.pctChange >= 0 ? "↑" : "↓"} {Math.abs(summary.pctChange).toFixed(1)}% vs yesterday </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">This Week (Mon-Today)</p>
              <p className="text-lg font-semibold">{fmtL(summary.week)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">This Month (1st-Today)</p>
              <p className="text-lg font-semibold">{fmtL(summary.month)}</p>
            </div>
            <div>
              <button onClick={handleExport} disabled={isExporting} className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> <FaDownload /> {isExporting ? "Generating..." : "Export Monthly Report"} </button>
            </div>
          </div>
        </aside>
      </div>
      <div className="mt-6">
        <MilkRecordsTable
          records={allRows .filter(r => {
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                (r.cowName || "").toLowerCase().includes(q) ||
                (r.tagId || "").toLowerCase().includes(q)
              );
            }).slice(0, visible)}  
           hasMore={hasMore}
          onLoadMore={loadMore}
          onLoadLess={loadLess}
          canLoadLess={visible > 10}
          dateFilter={dateFilter}
          onDateFilterChange={(d) => { setDateFilter(d); setTableMonthIdx(null); }}
          onClearDateFilter={() => setDateFilter("")}
          tableMonthIdx={tableMonthIdx}
          onTableMonthChange={(m) => { setTableMonthIdx(m); setDateFilter(""); }}
          onClearMonthFilter={() => setTableMonthIdx(null)}
          yearSel={yearSel}
          onEditRow={(r) => { setEditRow(r); setEditOpen(true); }}
          onDeleteRow={handleDeleteRow}
        />
      </div>
      {addOpen && (
        <AddRecordModal open={addOpen} onClose={() => setAddOpen(false)} cows={cows} onSaved={() => { loadAllRows(); loadSeriesAndSummary(); }} />
      )}
      {editOpen && (
        <EditRecordModal open={editOpen} row={editRow} cows={cows} onClose={() => setEditOpen(false)} onSaved={() => { loadAllRows(); loadSeriesAndSummary(); }} />
      )}
    </div>
  );
}