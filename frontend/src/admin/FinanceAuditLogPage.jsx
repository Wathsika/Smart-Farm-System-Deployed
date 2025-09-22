import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import {
  ChevronUp,
  RefreshCw,
  FileDown,
  Filter,
  Search,
  Calendar,
  Hash,
  Eye,
  Clock,
  User,
  FileText,
} from "lucide-react";

/* ---------- Helpers ---------- */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
};

function downloadCSV(filename, rows) {
  const headers = [
    "timestamp",
    "action",
    "user",
    "collection",
    "recordId",
    "originalData",
    "newData",
  ];

  const body = rows.map((r) =>
    headers
      .map((h) => {
        const val =
          h === "originalData" || h === "newData"
            ? JSON.stringify(r[h] ?? null)
            : String(r[h] ?? "");
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csv = [headers.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Change Block ---------- */
function ChangeBlock({ originalData, newData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-medium rounded-md transition-colors"
      >
        {expanded ? <ChevronUp size={14} /> : <Eye size={14} />}
        {expanded ? "Hide Changes" : "View Changes"}
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-3 py-2">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Original Data
              </div>
            </div>
            <div className="p-3">
              <pre className="text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                {JSON.stringify(originalData ?? null, null, 2)}
              </pre>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100 px-3 py-2">
              <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Updated Data
              </div>
            </div>
            <div className="p-3">
              <pre className="text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                {JSON.stringify(newData ?? null, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Page ---------- */
export default function AuditLogPage() {
  const todayISO = new Date().toISOString().slice(0, 10);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    date: todayISO, // ✅ default to current date
    transactionId: "",
  });
  const pageSize = 20;

  /* Load logs from backend */
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit"); // ✅ Fetch all logs
      setLogs(Array.isArray(res.data) ? res.data : []);
      setPage(1);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Export CSV */
  const exportCsv = () => {
    if (!logs.length) return;
    const name = `audit_filtered_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(name, filteredLogs);
  };

  /* Filtering logic */
  const filteredLogs = useMemo(() => {
    return logs.filter((row) => {
      let ok = true;
      if (filters.transactionId) {
        ok =
          ok &&
          String(row.recordId || "")
            .toLowerCase()
            .includes(filters.transactionId.toLowerCase());
      }
      if (filters.date) {
        const d = new Date(row.timestamp);
        const localISO = d.toISOString().slice(0, 10);
        ok = ok && localISO === filters.date;
      }
      return ok;
    });
  }, [logs, filters]);

  /* Pagination */
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page]);

  /* Initial load */
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Filter & Search
            </h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {filteredLogs.length} records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Select Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Transaction ID filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Transaction ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by transaction ID..."
                  value={filters.transactionId}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      transactionId: e.target.value,
                    }))
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={loadLogs}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Activity Log
            </h3>
            <button
              onClick={exportCsv}
              disabled={!filteredLogs.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <FileDown size={16} />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading audit logs...</span>
              </div>
            </div>
          ) : !filteredLogs.length ? (
            <div className="p-12 text-center text-gray-500">
              No audit logs found for{" "}
              {new Date(filters.date).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              .
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <Clock size={14} className="inline mr-1" /> Timestamp
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <User size={14} className="inline mr-1" /> User
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <Hash size={14} className="inline mr-1" /> Transaction
                        ID
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Changes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paged.map((row) => (
                      <tr key={row._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          {formatDateTime(row.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              row.action === "ADD"
                                ? "bg-emerald-100 text-emerald-800"
                                : row.action === "UPDATE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{row.user || "—"}</td>
                        <td className="px-6 py-4 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {row.transactionId || row.recordId || "—"}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <ChangeBlock
                            originalData={row.originalData}
                            newData={row.newData}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * pageSize + 1}–{" "}
                  {Math.min(page * pageSize, filteredLogs.length)} of{" "}
                  {filteredLogs.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm bg-white border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {page} of {Math.ceil(filteredLogs.length / pageSize)}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          Math.ceil(filteredLogs.length / pageSize),
                          p + 1
                        )
                      )
                    }
                    disabled={page >= Math.ceil(filteredLogs.length / pageSize)}
                    className="px-4 py-2 text-sm bg-white border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
