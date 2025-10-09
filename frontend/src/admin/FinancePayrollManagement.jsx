import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Save,
  Calendar,
  Users,
  DollarSign,
  Loader2,
  Settings,
} from "lucide-react";
import { api } from "../lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PayrollPdfTemplate } from "../components/reports/PayrollPdfTemplate";

const money = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString("en", { month: "long" })
);

const getMonthName = (value) => {
  const monthNumber = Number(value);
  if (!Number.isFinite(monthNumber)) return "—";
  const index = monthNumber - 1;
  if (index < 0 || index >= MONTH_NAMES.length) return "—";
  return MONTH_NAMES[index];
};

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
  PAID: {
    label: "Paid",
    className: "bg-emerald-100 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-600",
  },
};

const mapEmployeeToRow = (employee, month, year) => ({
  employee: {
    id: employee._id || employee.id,
    empId:
      employee.empId ||
      (employee._id ? String(employee._id).slice(-6) : "Unknown"),
    name: employee.name || "Unknown",
  },
  month,
  year: year ?? null,
  basicSalary: Number(employee.basicSalary) || 0,
  workingHours: Number(employee.workingHours) || 0,
  allowances: Number(employee.allowances ?? employee.allowance ?? 0),
  loan: Number(employee.loan ?? 0),
  otTotal: null,
  epf: null,
  etf: null,
  gross: null,
  netSalary: null,
  status: "PENDING",
  updatedAt: null,
});

// quick UUID for draftKey (browser-only ok)
const uuid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export default function PayrollRunPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [rows, setRows] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [draftKey] = useState(uuid);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfRef = useRef(null);

  const isYearValid = Number.isInteger(year) && year >= 2020 && year <= 2100;

  // 1) Load employees (pre-calc source data)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/employees/min");
        const emps = Array.isArray(res.data) ? res.data : [];
        if (active) {
          setEmployees(emps);
        }
      } catch (err) {
        console.error("Failed to load employees", err);
        if (active) {
          setEmployees([]);
        }
      } finally {
        active && setLoadingEmployees(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const loadSlips = useCallback(
    async (selectedMonth, selectedYear) => {
      setLoading(true);
      try {
        const params = {};
        if (
          Number.isInteger(selectedMonth) &&
          selectedMonth >= 1 &&
          selectedMonth <= 12
        ) {
          params.month = selectedMonth;
        }
        if (
          Number.isInteger(selectedYear) &&
          selectedYear >= 2025 &&
          selectedYear <= 2100
        ) {
          params.year = selectedYear;
        }

        const res = await api.get("/payrolls", { params });
        const slips = Array.isArray(res.data) ? res.data : [];

        const slipRows = slips.map((slip) => {
          const employee = slip.employee || {};
          const employeeId = employee.id || employee._id || null;

          return {
            slipId: slip.slipId || null,
            employee: {
              id: employeeId,
              empId:
                employee.empId ||
                (employeeId ? String(employeeId).slice(-6) : "Unknown"),
              name: employee.name || "Unknown",
            },
            month:
              slip.month != null ? Number(slip.month) : selectedMonth ?? null,
            year: slip.year != null ? Number(slip.year) : selectedYear ?? null,
            basicSalary: Number(slip.basicSalary) || 0,
            workingHours: Number(slip.workingHours) || 0,
            allowances: Number(slip.allowances ?? 0),
            loan: Number(slip.loan ?? 0),
            otTotal:
              slip.otTotal === null || slip.otTotal === undefined
                ? null
                : Number(slip.otTotal),
            epf:
              slip.epf === null || slip.epf === undefined
                ? null
                : Number(slip.epf),
            etf:
              slip.etf === null || slip.etf === undefined
                ? null
                : Number(slip.etf),
            gross:
              slip.gross === null || slip.gross === undefined
                ? null
                : Number(slip.gross),
            netSalary:
              slip.netSalary === null || slip.netSalary === undefined
                ? null
                : Number(slip.netSalary),
            status: String(slip.status || "PENDING").toUpperCase(),
            updatedAt: slip.updatedAt || null,
          };
        });

        if (slipRows.length > 0) {
          if (employees.length > 0) {
            const slipByEmployee = new Map();
            const orphanRows = [];

            slipRows.forEach((row) => {
              const key = row.employee?.id;
              if (key) {
                slipByEmployee.set(String(key), row);
              } else {
                orphanRows.push(row);
              }
            });

            const merged = employees.map((emp) => {
              const empId = emp._id || emp.id;
              const key = empId ? String(empId) : null;
              if (key && slipByEmployee.has(key)) {
                const row = slipByEmployee.get(key);
                slipByEmployee.delete(key);
                return row;
              }
              return mapEmployeeToRow(emp, selectedMonth, selectedYear);
            });

            const remaining = Array.from(slipByEmployee.values());
            setRows([...merged, ...remaining, ...orphanRows]);
          } else {
            setRows(slipRows);
          }
        } else {
          setRows(
            employees.map((emp) =>
              mapEmployeeToRow(emp, selectedMonth, selectedYear)
            )
          );
        }
        setDraftId(null);
      } catch (err) {
        console.error("Failed to load payment slips", err);
        setRows(
          employees.map((emp) =>
            mapEmployeeToRow(emp, selectedMonth, selectedYear)
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [employees]
  );

  useEffect(() => {
    if (loadingEmployees) return;

    if (!isYearValid) {
      setDraftId(null);
      setRows(employees.map((emp) => mapEmployeeToRow(emp, month, null)));
      setLoading(false);
      return;
    }

    loadSlips(month, year);
  }, [employees, isYearValid, loadSlips, loadingEmployees, month, year]);

  // 2) Calculate (backend preview → draft)
  async function handleCalculateAll() {
    if (!isYearValid) return;

    // only include employees with workingHours > 0
    const employeeIds = rows
      .filter(
        (r) => Number(r.workingHours) > 0 && (r.employee?.id || r.employee?._id)
      )
      .map((r) => r.employee?.id || r.employee?._id)
      .filter(Boolean);

    if (employeeIds.length === 0) {
      // nothing to calculate
      alert("No employees with working hours > 0 to calculate.");
      return;
    }
    setCalculating(true);
    try {
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
          employee: {
            id: it.employee?.id || it.employee?._id || null,
            empId:
              it.employee?.empId ||
              (it.employee?.id ? String(it.employee.id).slice(-6) : "Unknown"),
            name: it.employee?.name || "Unknown",
          },
          month,
          year,
          basicSalary: Number(it.basicSalary) || 0,
          workingHours: Number(it.workingHours) || 0,
          allowances: Number(it.allowances ?? 0),
          loan: Number(it.loan ?? 0),
          otTotal:
            it.otTotal === null || it.otTotal === undefined
              ? null
              : Number(it.otTotal),
          epf: it.epf === null || it.epf === undefined ? null : Number(it.epf),
          etf: it.etf === null || it.etf === undefined ? null : Number(it.etf),
          gross:
            it.gross === null || it.gross === undefined
              ? null
              : Number(it.gross),
          netSalary:
            it.net === null || it.net === undefined ? null : Number(it.net),
          status: "READY",
          updatedAt: null,
        }))
      );
    } finally {
      setCalculating(false);
    }
  }

  // 3) Commit (save to PaymentSlip)
  async function handleSaveAll() {
    if (!draftId || !isYearValid) return;
    setSaving(true);
    try {
      await api.post("/payrolls/commit", { draftId });
      await loadSlips(month, year);
    } finally {
      setSaving(false);
    }
  }

  // Build printable data for a single row
  const buildPdfData = useCallback((row) => {
    if (!row) return null;
    return {
      slipNumber:
        row?.slipId ||
        `SLP${new Date().getFullYear()}${new Date().getMonth() + 1}1`,
      generatedAt: new Date(),
      employee: {
        name: row?.employee?.name || "Unknown",
        empId:
          row?.employee?.empId ||
          (row?.employee?.id ? String(row.employee.id).slice(-6) : "—"),
      },
      month: row?.month,
      year: row?.year,
      basicSalary: row?.basicSalary,
      workingHours: row?.workingHours,
      allowances: row?.allowances,
      loan: row?.loan,
      otTotal: row?.otTotal ?? 0,
      epf: row?.epf ?? 0,
      etf: row?.etf ?? 0,
      gross: row?.gross ?? 0,
      netSalary: row?.netSalary ?? 0,
    };
  }, []);

  // Trigger PDF download after pdfData renders
  useEffect(() => {
    if (!pdfData) return;
    const el = pdfRef.current;
    if (!el) return;
    let cancelled = false;
    (async () => {
      await new Promise((r) => requestAnimationFrame(r));
      if (cancelled) return;
      try {
        const canvas = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
        const filename = `${pdfData.slipNumber || "Payslip"}.pdf`;
        pdf.save(filename);
      } catch (err) {
        console.error("Payslip PDF export failed", err);
        alert("Failed to generate payslip PDF");
      } finally {
        setPdfData(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfData]);

  const handleDownloadSlip = useCallback(
    (row) => {
      if (!row || row.netSalary == null) {
        alert("Please calculate and save before downloading the payslip.");
        return;
      }
      setPdfData(buildPdfData(row));
    },
    [buildPdfData]
  );

  // whether there are any rows eligible for calculation
  const hasWorkable = rows.some(
    (r) =>
      Number(r.workingHours) > 0 && Boolean(r.employee?.id || r.employee?._id)
  );

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
                {MONTH_NAMES.map((label, index) => (
                  <option key={index + 1} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="border rounded-lg px-3 py-2 w-24 text-sm"
                value={year}
                onChange={(e) => {
                  let val = e.target.value;

                  // Allow empty (so user can clear)
                  if (val === "") {
                    setYear("");
                    return;
                  }

                  // Only digits & max 4 characters
                  if (!/^\d*$/.test(val) || val.length > 4) return;

                  // First digit must be 2
                  if (val.length === 1 && val[0] !== "2") return;

                  setYear(Number(val));
                }}
                min="2025"
                max="2100"
                onKeyDown={(e) => {
                  // Block invalid characters in number input
                  if (["e", "E", ".", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/finance/edit_rule")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                Payroll Settings
              </button>

              <button
                onClick={handleCalculateAll}
                disabled={calculating || !hasWorkable || !isYearValid}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400"
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
                disabled={saving || !draftId || !isYearValid}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
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
        <div className="bg-white rounded-lg shadow-sm">
          <div className="table-container">
            <table className="table-fixed w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Employee",
                    "Month",
                    "Year",
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
                    "Payslip",
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
                      key={`${row.employee.id ?? "row"}-${idx}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{row.employee.name}</div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {row.month ? getMonthName(row.month) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.year != null ? row.year : "—"}
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {money(row.basicSalary)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.workingHours}
                      </td>
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
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={row.netSalary == null}
                          onClick={() => handleDownloadSlip(row)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 hover:bg-gray-50"
                          title={
                            row.netSalary == null
                              ? "Calculate & Save first"
                              : "Download payslip PDF"
                          }
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loading && <div className="p-6 text-sm text-gray-500">Loading…</div>}
        </div>
        {/* Hidden PDF template renderer */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          {pdfData ? <PayrollPdfTemplate ref={pdfRef} data={pdfData} /> : null}
        </div>
      </div>
    </div>
  );
}
