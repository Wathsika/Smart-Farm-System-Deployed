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

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AuditLogPdfTemplate } from "../components/reports/AuditLogPdfTemplate";

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

const AUDIT_FIELDS = [
  { key: "transaction_id", label: "Transaction ID" },
  { key: "type", label: "Type" },
  { key: "date", label: "Date" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
  { key: "description", label: "Description" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

const formatAuditFieldValue = (val, key) => {
  if (val === null || val === undefined || val === "") return "—";
  if (key === "date" || key === "createdAt" || key === "updatedAt") {
    try {
      return new Date(val).toLocaleString("en-LK", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return String(val);
    }
  }
  if (key === "amount") {
    const num = Number(val);
    if (!Number.isFinite(num)) return String(val);
    return num.toLocaleString("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 2,
    });
  }
  return String(val);
};

const formatDateOnly = (val) => {
  if (!val) return null;
  try {
    return new Date(val).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(val);
  }
};

const DATE_FIELD_KEYS = new Set(["date", "createdAt", "updatedAt"]);

const normalizeAuditFieldValue = (val, key) => {
  if (val === null || val === undefined || val === "") return "";
  if (DATE_FIELD_KEYS.has(key)) {
    const parsed = Date.parse(val);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    return String(val).trim();
  }
  if (key === "amount") {
    const num = Number(val);
    if (Number.isFinite(num)) {
      return num.toFixed(2);
    }
    return String(val).trim();
  }
  return String(val).trim();
};

const getAuditFieldDiffs = (originalData, newData) => {
  return AUDIT_FIELDS.reduce((acc, { key }) => {
    const original = normalizeAuditFieldValue(originalData?.[key], key);
    const updated = normalizeAuditFieldValue(newData?.[key], key);
    acc[key] = original !== updated;
    return acc;
  }, {});
};

const actionBadgeClass = (action) => {
  switch (action) {
    case "ADD":
      return "bg-emerald-100 text-emerald-800";
    case "UPDATE":
      return "bg-amber-100 text-amber-800";
    case "DELETE":
    case "REMOVE":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

/* ---------- Change Block ---------- */
// Removed duplicate ChangeBlock definition
function ChangeBlock({ originalData, newData, action }) {
  const [expanded, setExpanded] = useState(false);
  const diffs = useMemo(
    () => getAuditFieldDiffs(originalData, newData),
    [originalData, newData]
  );

  const changedLabels = useMemo(
    () =>
      AUDIT_FIELDS.filter(({ key }) => diffs[key]).map(({ label }) => label),
    [diffs]
  );

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
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="uppercase tracking-wide font-semibold text-gray-500">
              Changed Fields:
            </span>
            {changedLabels.length ? (
              changedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full"
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="italic text-gray-500">
                No field-level differences captured
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 ${
              action === "UPDATE" ? "lg:grid-cols-2" : ""
            } gap-4`}
          >
            {(action === "UPDATE" || action === "DELETE") && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 px-3 py-2">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Original Data
                  </div>
                </div>
                <div className="p-3">
                  <dl className="divide-y divide-gray-100">
                    {AUDIT_FIELDS.map(({ key, label }) => (
                      <div
                        key={key}
                        className={`py-2 grid grid-cols-3 gap-2 rounded-md px-2 -mx-2 ${
                          diffs[key] && action === "UPDATE"
                            ? "bg-amber-50 border-l-2 border-amber-300"
                            : ""
                        }`}
                      >
                        <dt className="text-xs font-medium text-gray-600 col-span-1">
                          {label}
                        </dt>
                        <dd className="text-xs text-gray-800 col-span-2">
                          {formatAuditFieldValue(originalData?.[key], key)}
                          {diffs[key] && action === "UPDATE" && (
                            <span className="ml-2 inline-flex items-center text-[10px] font-semibold uppercase text-amber-700">
                              Prev
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {(action === "UPDATE" || action === "ADD") && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-emerald-50 border-b border-emerald-100 px-3 py-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Updated Data
                  </div>
                </div>
                <div className="p-3">
                  <dl className="divide-y divide-gray-100">
                    {AUDIT_FIELDS.map(({ key, label }) => (
                      <div
                        key={key}
                        className={`py-2 grid grid-cols-3 gap-2 rounded-md px-2 -mx-2 ${
                          diffs[key] && action === "UPDATE"
                            ? "bg-emerald-50 border-l-2 border-emerald-300"
                            : ""
                        }`}
                      >
                        <dt className="text-xs font-medium text-gray-600 col-span-1">
                          {label}
                        </dt>
                        <dd className="text-xs text-gray-800 col-span-2">
                          {formatAuditFieldValue(newData?.[key], key)}
                          {diffs[key] && action === "UPDATE" && (
                            <span className="ml-2 inline-flex items-center text-[10px] font-semibold uppercase text-emerald-700">
                              New
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
/* ---------- Main Page ---------- */
export default function AuditLogPage() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const pdfRef = React.useRef(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    date: todayISO, // ✅ default to current date
    transactionId: "",
  });
  const pageSize = 20;

  const handleExportPdf = async () => {
    if (!filteredLogs.length) {
      alert("No audit logs to export.");
      return;
    }
    if (!pdfReportData) {
      alert("Report not ready.");
      return;
    }

    const input = pdfRef.current;
    if (!input) {
      alert("Report template not ready.");
      return;
    }

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`audit_logs_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF");
    }
  };

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

  const pdfReportData = useMemo(() => {
    if (!filteredLogs.length) return null;

    const generatedAt = new Date();
    const filterDateLabel = formatDateOnly(filters.date) || "All Dates";
    const transactionFilterLabel = filters.transactionId
      ? `Matching "${filters.transactionId}"`
      : "All Transactions";

    const collectionsImpacted = Array.from(
      new Set(filteredLogs.map((log) => log.collection).filter(Boolean))
    );

    const actionCounts = filteredLogs.reduce((acc, log) => {
      const key = log.action || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const totalFieldChanges = filteredLogs.reduce((total, log) => {
      const diffs = getAuditFieldDiffs(log.originalData, log.newData);
      return (
        total +
        AUDIT_FIELDS.reduce((acc, { key }) => (diffs[key] ? acc + 1 : acc), 0)
      );
    }, 0);

    const averageFieldChanges = totalFieldChanges
      ? (totalFieldChanges / filteredLogs.length).toFixed(1)
      : "0";

    const uniqueUsers = Array.from(
      new Set(filteredLogs.map((log) => log.user).filter(Boolean))
    );

    const latestTimestamp = filteredLogs.reduce((latest, log) => {
      const parsed = Date.parse(log.timestamp);
      if (Number.isNaN(parsed)) return latest;
      if (!latest || parsed > latest) return parsed;
      return latest;
    }, null);

    const logsForReport = filteredLogs.map((row, index) => {
      const diffs = getAuditFieldDiffs(row.originalData, row.newData);
      const changes = AUDIT_FIELDS.filter(({ key }) => diffs[key]).map(
        ({ key, label }) => ({
          label,
          previous: formatAuditFieldValue(row.originalData?.[key], key),
          next: formatAuditFieldValue(row.newData?.[key], key),
        })
      );

      return {
        id:
          row._id ||
          row.recordId ||
          row.transactionId ||
          `${row.timestamp || "audit"}-${index}`,
        timestamp: formatDateTime(row.timestamp),
        action: row.action || "—",
        user: row.user || "—",
        collection: row.collection || "—",
        transactionId: row.transactionId || row.recordId || "—",
        changes,
      };
    });

    return {
      reportNumber: `AUD-${generatedAt
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}`,
      generatedAt,
      filterDateLabel,
      transactionFilterLabel,
      totalRecords: filteredLogs.length,
      collectionsImpacted,
      uniqueUsers,
      actionSummary: Object.entries(actionCounts).map(
        ([action, count]) => `${action}: ${count}`
      ),
      totalFieldChanges,
      averageFieldChanges,
      latestActivity: latestTimestamp ? new Date(latestTimestamp) : null,
      logs: logsForReport,
    };
  }, [filteredLogs, filters]);

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
                max={todayISO} // Restrict to current date or earlier
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Transaction ID filter */}
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
                  maxLength={19} // ✅ Limit max characters
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(
                      /[^a-zA-Z0-9]/g,
                      ""
                    );
                    setFilters((f) => ({
                      ...f,
                      transactionId: cleanValue,
                    }));
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm 
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={loadLogs}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 
                 bg-emerald-600 text-white rounded-lg text-xs font-medium 
                 hover:bg-emerald-700 transition-colors"
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
            <div className="flex gap-2">
              <button
                onClick={handleExportPdf}
                disabled={!filteredLogs.length}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <FileDown size={16} />
                Export PDF
              </button>
            </div>
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
              {formatDateOnly(filters.date) || "all dates"}.
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
                      {/* Collection column removed */}
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
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${actionBadgeClass(
                              row.action
                            )}`}
                          >
                            {row.action || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{row.user || "—"}</td>
                        {/* Collection cell removed */}
                        <td className="px-6 py-4 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {row.transactionId || row.recordId || "—"}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <ChangeBlock
                            originalData={row.originalData}
                            newData={row.newData}
                            action={row.action}
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
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {pdfReportData && (
          <AuditLogPdfTemplate ref={pdfRef} data={pdfReportData} />
        )}
      </div>
    </div>
  );
}
