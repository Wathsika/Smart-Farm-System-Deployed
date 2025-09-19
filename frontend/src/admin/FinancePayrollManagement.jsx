import React, { useEffect, useState } from "react";
import { Play, Save, Calendar, Users, DollarSign, Loader2 } from "lucide-react";
import { api } from "../lib/api";

const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    className: "bg-gray-100 text-gray-800",
  },
  READY: {
    label: "Ready",
    className: "bg-green-100 text-green-800",
  },
  SAVED: {
    label: "Saved",
    className: "bg-blue-100 text-blue-800",
  },
};

// quick UUID for draftKey (browser-only ok)
const uuid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function PayrollRunPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [rows, setRows] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [draftKey] = useState(uuid);

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1) Load employees (pre-calc)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/employees/min");
        const emps = Array.isArray(res.data) ? res.data : [];
        mounted &&
          setRows(
            emps.map((e) => ({
              // pre-calc visible fields
              employee: { id: e._id, empId: e.empId, name: e.name },
              basicSalary: Number(e.basicSalary) || 0,
              workingHours: Number(e.workingHours) || 0,
              allowances: Number(e.allowances) || 0,
              loan: Number(e.loan) || 0,

              // computed (empty until preview)
              otTotal: null,
              epf: null,
              etf: null,
              gross: null,
              netSalary: null,
              status: "PENDING",
              updatedAt: null,
            }))
          );
        setDraftId(null);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // 2) Calculate (backend preview → draft)
  async function handleCalculateAll() {
    if (rows.length === 0) return;
    setCalculating(true);
    try {
      const employeeIds = rows.map((r) => r.employee.id);
      const res = await api.post("/payrolls/preview", {
        draftKey,
        month,
        year,
        employeeIds,
      });
      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      setDraftId(res.data?.draftId || null);

      // server returns computed items: map to UI rows
      setRows(
        items.map((it) => ({
          ...it,
          // normalize field names
          gross: it.gross,
          netSalary: it.net,
          status: "READY",
        }))
      );
    } finally {
      setCalculating(false);
    }
  }

  // 3) Commit (save to PaymentSlip)
  async function handleSaveAll() {
    if (!draftId) return;
    setSaving(true);
    try {
      await api.post("/payrolls/commit", { draftId });
      // Optionally: keep draftId (null to prevent double-save)
      setDraftId(null);
      setRows((prev) =>
        prev.map((row) =>
          row.netSalary != null
            ? {
                ...row,
                status: "SAVED",
              }
            : row
        )
      );
    } finally {
      setSaving(false);
    }
  }

  const valid = rows.filter((r) => r.netSalary != null);
  const totalGross = valid.reduce((s, r) => s + (r.gross || 0), 0);
  const totalNet = valid.reduce((s, r) => s + (r.netSalary || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold">Payroll Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                className="border rounded-lg px-3 py-2 text-sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2023, i, 1).toLocaleDateString("en", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="border rounded-lg px-3 py-2 w-24 text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min="2020"
                max="2035"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCalculateAll}
                disabled={calculating || rows.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg text-sm"
              >
                {calculating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {calculating ? "Calculating…" : "Calculate All"}
              </button>

              <button
                onClick={handleSaveAll}
                disabled={saving || !draftId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving…" : "Save All"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-xl font-bold">{valid.length}</div>
              <div className="text-xs text-gray-500">Processed</div>
            </div>
            <div>
              <div className="text-xl font-bold">{money(totalGross)}</div>
              <div className="text-xs text-gray-500">Total Gross</div>
            </div>
            <div>
              <div className="text-xl font-bold">{money(totalNet)}</div>
              <div className="text-xs text-gray-500">Total Net</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Employee",
                  "Basic Salary",
                  "Working Hours",
                  "Allowances",
                  "Overtime",
                  "EPF",
                  "ETF",
                  "Loan",
                  "Gross",
                  "Net",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right first:text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, idx) => {
                const { label, className } =
                  STATUS_STYLES[row.status] || STATUS_STYLES.PENDING;
                return (
                  <tr
                    key={`${row.employee.id || row.employee._id}-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.employee.name}</div>
                      <div className="text-sm text-gray-500">
                        {row.employee.empId}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      {money(row.basicSalary)}
                    </td>
                    <td className="px-4 py-3 text-right">{row.workingHours}</td>
                    <td className="px-4 py-3 text-right">
                      {money(row.allowances)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {row.otTotal == null ? "—" : money(row.otTotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {row.epf == null ? "—" : `(${money(row.epf)})`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.etf == null ? "—" : money(row.etf)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {row.loan == null ? "—" : `(${money(row.loan)})`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.gross == null ? "—" : money(row.gross)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {row.netSalary == null ? "—" : money(row.netSalary)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${className}`}
                      >
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && <div className="p-6 text-sm text-gray-500">Loading…</div>}
        </div>
      </div>
    </div>
  );
}
