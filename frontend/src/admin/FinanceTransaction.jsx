import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { TransactionsAPI } from "/lib/api";

function currency(n) {
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  });
}

function monthKey(iso) {
  return (iso || "").slice(0, 7);
}

function downloadCSV(filename, rows) {
  const headers = ["id", "type", "date", "category", "amount", "note"];
  const body = rows.map((r) =>
    headers
      .map((h) => String(r[h] ?? "").replace(/"/g, '""'))
      .map((v) => `"${v}"`)
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

export default function FinanceTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const navigate = useNavigate();

  // Load from backend whenever filters/search change
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const rows = await TransactionsAPI.list({
          q: q || undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          month: monthFilter !== "all" ? monthFilter : undefined,
        });
        if (!ignore) setTransactions(rows);
      } catch (e) {
        if (!ignore) setErr(e.message || "Failed to load transactions");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [q, typeFilter, monthFilter]);

  const months = useMemo(() => {
    const set = new Set(transactions.map((r) => (r.date || "").slice(0, 7)));
    return ["all", ...Array.from(set).sort().reverse()];
  }, [transactions]);

  const handleDelete = async (id) => {
    try {
      await TransactionsAPI.remove(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e.message || "Failed to delete");
    } finally {
      setShowDeleteModal(null);
    }
  };

  const handleEdit = (row) =>
    navigate(`/admin/finance/new_transaction?edit=${row.id}`);
  const handleAddNew = () => navigate("/admin/finance/new_transaction");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Page Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Transaction Management
        </h1>
        <p className="text-gray-600 mt-2">Manage all your farm transactions</p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gradient-to-r from-white to-emerald-50 rounded-2xl shadow-xl border border-emerald-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-3 shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Filter & Search
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Search Transactions
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    placeholder="Search category, note, date…"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner bg-white/80 backdrop-blur-sm transition-all duration-200"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Transaction Type
                </label>
                <div className="relative">
                  <select
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner bg-white/80 backdrop-blur-sm transition-all duration-200 appearance-none"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">🔄 All Types</option>
                    <option value="income">💰 Income Only</option>
                    <option value="expense">💸 Expenses Only</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Filter by Month
                </label>
                <div className="relative">
                  <select
                    className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner bg-white/80 backdrop-blur-sm transition-all duration-200 appearance-none"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m === "all" ? "📅 All Months" : `📅 ${m}`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Transaction History
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filtered.length} records found
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadCSV("finance-report.csv", filtered)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <Link to="/admin/finance/new_transaction">Add New</Link>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p className="text-gray-500 text-lg">
                            No transactions found
                          </p>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your filters or add a new transaction
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.type === "income"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.type === "income" ? "💰" : "💸"} {r.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {r.note || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {currency(r.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(r.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete Transaction
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this transaction? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteModal)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
