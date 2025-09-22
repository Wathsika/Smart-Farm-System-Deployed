import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  X,
  FileDown,
} from "lucide-react";

/** Helpers */
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

const isLikelyObjectId = (v) => /^[a-f0-9]{24}$/i.test(v || "");

/** CSV download */
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

/** A tiny diff viewer */
function ChangeBlock({ originalData, newData }) {
  const [expanded, setExpanded] = useState(false);

  const keys = useMemo(() => {
    const left = Object.keys(originalData || {});
    const right = Object.keys(newData || {});
    return Array.from(new Set([...left, ...right])).sort();
  }, [originalData, newData]);

  return (
    <div className="text-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 font-medium"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? "Hide details" : "View details"}
      </button>

      {expanded && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded-lg p-2 bg-gray-50">
            <div className="font-semibold text-gray-700 mb-1">Original</div>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(originalData ?? null, null, 2)}
            </pre>
          </div>
          <div className="border rounded-lg p-2 bg-gray-50">
            <div className="font-semibold text-gray-700 mb-1">New</div>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(newData ?? null, null, 2)}
            </pre>
          </div>

          {/* side-by-side field diff */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-700">
              Field-by-field changes
            </div>
            <div className="divide-y">
              {keys.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">No fields</div>
              )}
              {keys.map((k) => {
                const a = originalData?.[k];
                const b = newData?.[k];
                const changed =
                  JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
                return (
                  <div
                    key={k}
                    className={`px-3 py-2 text-xs flex items-start gap-2 ${
                      changed ? "bg-amber-50" : ""
                    }`}
                  >
                    <div className="w-40 shrink-0 font-medium text-gray-700">
                      {k}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="border rounded p-1 bg-white min-h-[32px]">
                        {typeof a === "object"
                          ? JSON.stringify(a)
                          : String(a ?? "—")}
                      </div>
                      <div className="border rounded p-1 bg-white min-h-[32px]">
                        {typeof b === "object"
                          ? JSON.stringify(b)
                          : String(b ?? "—")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [transactionId, setTransactionId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warnId, setWarnId] = useState("");

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const loadLogs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get("/audit", {
        params: Object.keys(params).length ? params : undefined,
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setLogs(list);
      setPage(1);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, page]);

  useEffect(() => {
    // gentle warning if ID doesn’t look like Mongo ObjectId
    if (transactionId && !isLikelyObjectId(transactionId)) {
      setWarnId(
        "This doesn’t look like a MongoDB ObjectId (24 hex chars). You can still search though."
      );
    } else {
      setWarnId("");
    }
  }, [transactionId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const fetchLogs = useCallback(() => {
    const params = {};
    if (date) params.date = date; // backend will convert to start..end of day
    if (transactionId) params.transactionId = transactionId.trim();
    loadLogs(params);
  }, [date, transactionId, loadLogs]);

  const clearFilters = () => {
    setDate("");
    setTransactionId("");
    loadLogs();
  };

  const exportCsv = () => {
    if (!logs.length) return;
    const rows = logs.map((l) => ({
      timestamp: l.timestamp,
      action: l.action,
      user: l.user,
      collection: l.collection,
      recordId: l.recordId,
      originalData: l.originalData,
      newData: l.newData,
    }));
    const name = `audit_${date || "all"}_${transactionId || "all"}.csv`;
    downloadCSV(name, rows);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Finance Audit Log
            </h1>
            <p className="text-sm text-gray-600">
              Track all <span className="font-medium">ADD</span>,{" "}
              <span className="font-medium">UPDATE</span>, and{" "}
              <span className="font-medium">DELETE</span> actions with who did
              it and when.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={!logs.length}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              title={logs.length ? "Export CSV" : "No data to export"}
            >
              <FileDown size={16} />
              Export CSV
            </button>
            <button
              onClick={fetchLogs}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border rounded-xl p-4 bg-white shadow-sm mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Specific Day
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Shows logs that happened on this day (local time).
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                placeholder="e.g., 64f1c1d3a2b4c5d6e7f81234"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm tracking-wider"
              />
              {warnId && (
                <p className="text-[11px] text-amber-600 mt-1">{warnId}</p>
              )}
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchLogs}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 w-full md:w-auto"
              >
                <Search size={16} />
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 w-full md:w-auto"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 text-sm text-gray-700 flex items-center justify-between">
            <div>
              {loading ? "Loading…" : `${logs.length} record(s)`}
              {date && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                  date: {date}
                </span>
              )}
              {transactionId && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                  id: {transactionId}
                </span>
              )}
            </div>
            {!loading && !!logs.length && (
              <div className="text-xs text-gray-500">
                Page {page} / {Math.max(1, Math.ceil(logs.length / pageSize))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Fetching audit logs…
            </div>
          ) : !logs.length ? (
            <div className="p-6 text-center text-gray-500">
              No audit logs found. Try changing filters and click{" "}
              <b>Apply Filters</b>.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">
                        Time
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Action
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        User
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Transaction ID
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Collection
                      </th>
                      <th className="text-left px-3 py-2 font-semibold">
                        Changes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paged.map((row) => (
                      <tr key={row._id}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDateTime(row.timestamp)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              row.action === "ADD"
                                ? "bg-green-100 text-green-800"
                                : row.action === "UPDATE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className="px-3 py-2">{row.user || "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {row.recordId || "—"}
                        </td>
                        <td className="px-3 py-2">{row.collection || "—"}</td>
                        <td className="px-3 py-2">
                          {row.action === "ADD" && (
                            <ChangeBlock
                              originalData={null}
                              newData={row.newData}
                            />
                          )}
                          {row.action === "UPDATE" && (
                            <ChangeBlock
                              originalData={row.originalData}
                              newData={row.newData}
                            />
                          )}
                          {row.action === "DELETE" && (
                            <ChangeBlock
                              originalData={row.originalData}
                              newData={null}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 flex items-center justify-between border-t bg-white">
                <div className="text-xs text-gray-500">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, logs.length)} of {logs.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(logs.length / pageSize), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(logs.length / pageSize)}
                    className="px-3 py-1.5 border rounded disabled:opacity-50"
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
