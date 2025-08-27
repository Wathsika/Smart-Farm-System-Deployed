import React, { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { api } from "../lib/api";

const DEFAULTS = {
  daysPerMonth: 28,
  hoursPerDay: 8,
  otWeekdayMultiplier: 1.5,
  otHolidayMultiplier: 2.0,
  epfRate: 0.08, // 8%
  etfRate: 0.03, // 3%
};

export default function PayrollSettingsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError("");
        const { data } = await api.get("/payroll/settings");
        if (mounted && data) setForm(data);
      } catch (e) {
        mounted &&
          setError("Failed to load settings. Check the API and DB connection.");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  function toNum(v) {
    if (v === "" || v === null || v === undefined) return "";
    const n = Number(v);
    return Number.isNaN(n) ? "" : n;
  }

  function update(key, value) {
    setSaved(false);
    setError("");
    // keep empty string while typing; convert to number when valid
    setForm((p) => ({ ...p, [key]: toNum(value) }));
  }

  // simple validations to mirror backend rules
  const errors = useMemo(() => {
    const e = {};
    const nonNeg = [
      "daysPerMonth",
      "hoursPerDay",
      "otWeekdayMultiplier",
      "otHolidayMultiplier",
    ];
    nonNeg.forEach((k) => {
      if (form[k] === "" || form[k] < 0) e[k] = "Must be a non‑negative number";
    });
    if (form.epfRate === "" || form.epfRate < 0 || form.epfRate > 1)
      e.epfRate = "0–1 (e.g., 0.08 for 8%)";
    if (form.etfRate === "" || form.etfRate < 0 || form.etfRate > 1)
      e.etfRate = "0–1 (e.g., 0.03 for 3%)";
    return e;
  }, [form]);

  const canSave = useMemo(() => Object.keys(errors).length === 0, [errors]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? 0 : Number(v)])
      );
      const { data } = await api.put("/payroll/settings", payload);
      setForm(data);
      setSaved(true);
    } catch (e) {
      setError("Failed to save settings. Validate inputs and try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    setForm(DEFAULTS);
    setSaved(false);
    setError("");
  }

  // small live helpers
  const monthlyStdHours = useMemo(() => {
    const d = Number(form.daysPerMonth) || 0;
    const h = Number(form.hoursPerDay) || 0;
    return (d * h).toFixed(2);
  }, [form.daysPerMonth, form.hoursPerDay]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Payroll Settings
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 text-emerald-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </span>
            )}
            <button
              onClick={resetDefaults}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                [
                  "daysPerMonth",
                  "Days per Month",
                  "Working days in a month",
                  "1",
                ],
                [
                  "hoursPerDay",
                  "Hours per Day",
                  "Standard working hours",
                  "0.5",
                ],
                ["otWeekdayMultiplier", "Weekday OT ×", "e.g. 1.5", "0.1"],
                ["otHolidayMultiplier", "Holiday OT ×", "e.g. 2.0", "0.1"],
                ["epfRate", "EPF Rate", "0.08 → 8%", "0.01"],
                ["etfRate", "ETF Rate", "0.03 → 3%", "0.01"],
              ].map(([key, label, hint, step]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    step={step}
                    min="0"
                    className={`w-full border rounded-lg px-3 py-2 outline-none ${
                      errors[key]
                        ? "border-red-300 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-emerald-200"
                    }`}
                    value={form[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 mt-1">{hint}</p>
                    {errors[key] && (
                      <p className="text-xs text-red-600 mt-1">{errors[key]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Helpful computed summary */}
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
              <p>
                <span className="font-medium">Monthly standard hours:</span>{" "}
                {monthlyStdHours} hrs
              </p>
              <p className="mt-1">
                Rates are decimals (e.g.,{" "}
                <span className="font-mono">0.08</span> = 8%). Overtime
                multipliers apply to hourly basic.
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm shadow-sm text-white ${
                  saving || !canSave
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <a
                href="/admin/finance/payroll_management"
                className="px-4 py-2 text-sm rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                Back to Payroll
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
