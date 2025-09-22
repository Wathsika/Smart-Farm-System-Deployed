import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { ChevronDown, ChevronUp, RefreshCw, FileDown, X } from "lucide-react";

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

function ChangeBlock({ originalData, newData }) {
  const [expanded, setExpanded] = useState(false);

  const keys = React.useMemo(() => {
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
        </div>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ date: "", transactionId: "" });
  const pageSize = 20;

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/audit"); // ✅ always fetch all logs
      setLogs(Array.isArray(res.data) ? res.data : []);
      setPage(1);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportCsv = () => {
    if (!logs.length) return;
    const name = `audit_filtered.csv`;
    downloadCSV(name, filteredLogs);
  };

  // ✅ filtering logic
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
        const localISO = d.toISOString().slice(0, 10); // yyyy-mm-dd
        ok = ok && localISO === filters.date;
      }
      return ok;
    });
  }, [logs, filters]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

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
              disabled={!filteredLogs.length}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              title={logs.length ? "Export CSV" : "No data to export"}
            >
              <FileDown size={16} />
              Export CSV
            </button>
            <button
              onClick={loadLogs}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((f) => ({ ...f, date: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Transaction ID…"
            value={filters.transactionId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, transactionId: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />
          {(filters.date || filters.transactionId) && (
            <button
              onClick={() => setFilters({ date: "", transactionId: "" })}
              className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 text-sm text-gray-700 flex items-center justify-between">
            <div>
              {loading
                ? "Loading…"
                : `${filteredLogs.length} record(s) (from ${logs.length})`}
            </div>
            {!loading && filteredLogs.length > 0 && (
              <div className="text-xs text-gray-500">
                Page {page} / {Math.ceil(filteredLogs.length / pageSize)}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Fetching audit logs…
            </div>
          ) : !filteredLogs.length ? (
            <div className="p-6 text-center text-gray-500">
              No audit logs found.
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

                        <td className="px-3 py-2">
                          {row.transactionId || "—"}
                        </td>
                        <td className="px-3 py-2">
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
              <div className="px-4 py-3 flex items-center justify-between border-t bg-white">
                <div className="text-xs text-gray-500">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredLogs.length)} of{" "}
                  {filteredLogs.length}
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
                        Math.min(
                          Math.ceil(filteredLogs.length / pageSize),
                          p + 1
                        )
                      )
                    }
                    disabled={page >= Math.ceil(filteredLogs.length / pageSize)}
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
