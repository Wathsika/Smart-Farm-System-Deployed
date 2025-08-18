import React, { useEffect, useState } from "react";
import {
  Play,
  Save,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";

// ---------- helpers ----------
const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function computeRow(basicSalary, rules) {
  const salary = Number(basicSalary) || 0;
  const days = Number(rules.daysPerMonth || 28);
  const hrs = Number(rules.hoursPerDay || 8);
  if (salary <= 0 || days <= 0 || hrs <= 0) {
    return {
      allowances: 0,
      loan: 0,
      otTotal: 0,
      epf: 0,
      etf: 0,
      gross: 0,
      netSalary: 0,
      error: true,
    };
  }
  const perDay = salary / days;
  const hourly = perDay / hrs;
  const otTotal =
    hourly * 0 * (rules.otWeekdayMultiplier || 1.5) +
    hourly * 0 * (rules.otHolidayMultiplier || 2.0);
  const epf = salary * (rules.epfRate || 0.08);
  const etf = salary * (rules.etfRate || 0.03);
  const allowances = 0;
  const loan = 0;
  const gross = salary + allowances + otTotal;
  const netSalary = Math.max(0, gross - (epf + etf + loan));
  return {
    allowances,
    loan,
    otTotal,
    epf,
    etf,
    gross,
    netSalary,
    error: false,
  };
}

// ---------- component ----------
export default function PayrollRunPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  // rules: safe defaults so page always renders
  const [rules, setRules] = useState({
    daysPerMonth: 28,
    hoursPerDay: 8,
    otWeekdayMultiplier: 1.5,
    otHolidayMultiplier: 2.0,
    epfRate: 0.08,
    etfRate: 0.03,
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  // load rules + employees (non-blocking: uses defaults if API fails)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [settingsRes, employeesRes] = await Promise.allSettled([
          api.get("/payroll/settings"),
          api.get("/employees"),
        ]);

        if (settingsRes.status === "fulfilled" && settingsRes.value?.data) {
          mounted && setRules(settingsRes.value.data);
        }
        if (
          employeesRes.status === "fulfilled" &&
          Array.isArray(employeesRes.value?.data)
        ) {
          const emps = employeesRes.value.data;
          mounted &&
            setRows(
              emps.map((e) => ({
                employee: { empId: e.empId, name: e.name },
                basicSalary: Number(e.basicSalary) || 0,
                allowances: null,
                loan: null,
                otTotal: null,
                epf: null,
                etf: null,
                gross: null,
                netSalary: null,
                updatedAt: null,
                error: null,
              }))
            );
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  async function handleCalculateAll() {
    setCalculating(true);
    const updated = rows.map((r) => {
      const calc = computeRow(r.basicSalary, rules);
      return { ...r, ...calc, updatedAt: new Date().toISOString() };
    });
    setRows(updated);
    setCalculating(false);
  }

  async function handleSaveAll() {
    if (rows.length === 0) return;
    if (rows.some((r) => r.netSalary == null)) return; // require calculate first
    setSaving(true);
    const payload = rows.map((r) => ({
      empId: r.employee.empId,
      month,
      year,
      basicSalary: r.basicSalary,
      allowances: r.allowances || 0,
      loan: r.loan || 0,
      otWeekdayHours: 0,
      otHolidayHours: 0,
      epf: r.epf || 0,
      etf: r.etf || 0,
      gross: r.gross || 0,
      netSalary: r.netSalary || 0,
    }));
    try {
      await api.post("/payrolls/bulk", { items: payload });
    } finally {
      setSaving(false);
    }
  }

  // quick summary (no extra components)
  const valid = rows.filter((r) => r.netSalary != null && !r.error);
  const totalGross = valid.reduce((s, r) => s + (r.gross || 0), 0);
  const totalNet = valid.reduce((s, r) => s + (r.netSalary || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & controls */}
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
                className="border rounded-lg px-3 py-2 w-20 text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min="2020"
                max="2035"
              />
              <a
                href="/admin/finance/edit_rule"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium
             bg-emerald-600 text-white hover:bg-emerald-700
             transition-colors duration-200 shadow-sm"
              >
                Edit Rules
              </a>
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
                {calculating ? "Calculating..." : "Calculate All"}
              </button>
              <button
                onClick={handleSaveAll}
                disabled={
                  saving ||
                  rows.length === 0 ||
                  rows.some((r) => r.netSalary == null)
                }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save All"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary (minimal, no empty states) */}
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

        {/* Table only (no empty message block) */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Employee",
                  "Basic Salary",
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
              {rows.map((row, idx) => (
                <tr
                  key={`${row.employee.empId}-${idx}`}
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
                  <td className="px-4 py-3 text-right">
                    {row.allowances == null ? "—" : money(row.allowances)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.otTotal == null ? "—" : money(row.otTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {row.epf == null ? "—" : `(${money(row.epf)})`}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {row.etf == null ? "—" : `(${money(row.etf)})`}
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
                    {row.updatedAt ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-6 text-sm text-gray-500">Loading…</div>}
        </div>
      </div>
    </div>
  );
}
