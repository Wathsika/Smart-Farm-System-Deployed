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

// Per-field typing rules
const FIELD_RULES = {
  daysPerMonth: { integer: true, min: 1, max: 31 },
  hoursPerDay: { integer: true, min: 1, max: 24 },
  // “Suitable limited range”: adjust if you need different bounds
  otWeekdayMultiplier: { integer: false, min: 1, max: 5, maxDecimals: 2 },
  otHolidayMultiplier: { integer: false, min: 1, max: 5, maxDecimals: 2 },
  epfRate: { integer: false, min: 0, max: 1, maxDecimals: 2 },
  etfRate: { integer: false, min: 0, max: 1, maxDecimals: 2 },
};

// Block disallowed characters from keyboard input
function blockSpecialKeys(e) {
  const k = e.key;
  if (k === "e" || k === "E" || k === "+" || k === "-") {
    e.preventDefault();
  }
}

// Sanitize & validate a prospective new value _as text_ before committing it
function nextValue(prev, raw, rule) {
  // Only allow digits and dot
  let v = String(raw).replace(/[^\d.]/g, "");

  // No leading dot
  if (v.startsWith(".")) return prev;

  // Only one dot
  const parts = v.split(".");
  if (parts.length > 2) return prev;

  // Integer-only fields: remove any dot entirely
  if (rule.integer) {
    v = v.replace(/\./g, "");
  } else {
    // Decimal fields: cap decimals to maxDecimals
    if (parts.length === 2) {
      const [a, b] = parts;
      if (rule.maxDecimals != null && b.length > rule.maxDecimals) {
        v = `${a}.${b.slice(0, rule.maxDecimals)}`;
      }
    }
  }

  // Prevent absurd leading zero runs (but allow "0", "0.x")
  if (!rule.integer && (v === "" || v === ".")) {
    // already handled above; keep empty for user deleting
  }

  // Range guard: if numeric, make sure within [min, max]; otherwise allow empty
  if (v !== "") {
    const n = Number(v);
    if (Number.isNaN(n)) return prev;

    // Disallow values beyond bounds as user types (don’t auto-clamp; just block)
    if (rule.min != null && n < rule.min) {
      // Allow prefixes that could still become valid, e.g., typing "0." for rate fields
      // For integers, block anything < min unless they’re still typing (empty allowed separately).
      if (rule.integer) return prev;
    }
    if (rule.max != null && n > rule.max) {
      return prev;
    }
  }

  return v;
}

export default function PayrollSettingsPage() {
  // Keep inputs as strings for precise control; convert on save
  const [form, setForm] = useState(
    Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, String(v)]))
  );
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
        if (mounted && data) {
          const asStrings = Object.fromEntries(
            Object.entries(DEFAULTS).map(([k]) => [
              k,
              data[k] === 0 ? "0" : data[k] != null ? String(data[k]) : "",
            ])
          );
          setForm(asStrings);
        }
      } catch (e) {
        mounted &&
          setError("Failed to load settings. Check the API and DB connection.");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  function update(key, raw) {
    setSaved(false);
    setError("");
    const rule = FIELD_RULES[key];
    setForm((p) => ({ ...p, [key]: nextValue(p[key] ?? "", raw, rule) }));
  }

  // Basic validity (used only to enable/disable Save button)
  const errors = useMemo(() => {
    const e = {};
    for (const [k, rule] of Object.entries(FIELD_RULES)) {
      const v = form[k];
      if (v === "" || v === ".") {
        e[k] = "Required";
        continue;
      }
      const n = Number(v);
      if (Number.isNaN(n)) {
        e[k] = "Invalid number";
        continue;
      }
      if (rule.integer && !Number.isInteger(n)) {
        e[k] = "Must be an integer";
        continue;
      }
      if (rule.min != null && n < rule.min) e[k] = `Min ${rule.min}`;
      if (rule.max != null && n > rule.max) e[k] = `Max ${rule.max}`;
      if (!rule.integer && rule.maxDecimals != null) {
        const [, dec = ""] = v.split(".");
        if (dec.length > rule.maxDecimals)
          e[k] = `Max ${rule.maxDecimals} decimals`;
      }
    }
    return e;
  }, [form]);

  const canSave = useMemo(() => Object.keys(errors).length === 0, [errors]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v || 0)])
      );
      const { data } = await api.put("/payroll/settings", payload);
      const normalized = Object.fromEntries(
        Object.entries(DEFAULTS).map(([k]) => [
          k,
          data[k] === 0 ? "0" : data[k] != null ? String(data[k]) : "",
        ])
      );
      setForm(normalized);
      setSaved(true);
    } catch (e) {
      setError("Failed to save settings. Validate inputs and try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    setForm(
      Object.fromEntries(
        Object.entries(DEFAULTS).map(([k, v]) => [k, String(v)])
      )
    );
    setSaved(false);
    setError("");
  }

  const monthlyStdHours = useMemo(() => {
    const d = Number(form.daysPerMonth) || 0;
    const h = Number(form.hoursPerDay) || 0;
    return (d * h).toFixed(2);
  }, [form.daysPerMonth, form.hoursPerDay]);

  // Per-field inputMode (soft keyboard hints) & placeholders
  const UI_META = {
    daysPerMonth: {
      label: "Days per Month",
      hint: "1–31",
      inputMode: "numeric",
      placeholder: "28",
    },
    hoursPerDay: {
      label: "Hours per Day",
      hint: "1–24",
      inputMode: "numeric",
      placeholder: "8",
    },
    otWeekdayMultiplier: {
      label: "Weekday OT ×",
      hint: "1.00–5.00 (2 dp)",
      inputMode: "decimal",
      placeholder: "1.50",
    },
    otHolidayMultiplier: {
      label: "Holiday OT ×",
      hint: "1.00–5.00 (2 dp)",
      inputMode: "decimal",
      placeholder: "2.00",
    },
    epfRate: {
      label: "EPF Rate",
      hint: "0.00–1.00 (2 dp)",
      inputMode: "decimal",
      placeholder: "0.08",
    },
    etfRate: {
      label: "ETF Rate",
      hint: "0.00–1.00 (2 dp)",
      inputMode: "decimal",
      placeholder: "0.03",
    },
  };

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
              {Object.keys(FIELD_RULES).map((key) => {
                const meta = UI_META[key];
                const rule = FIELD_RULES[key];
                const hasError = !!errors[key];

                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {meta.label}
                    </label>
                    <input
                      // Use text + inputMode to fully control filtering (and mobile keypad)
                      type="text"
                      inputMode={meta.inputMode}
                      placeholder={meta.placeholder}
                      className={`w-full border rounded-lg px-3 py-2 outline-none ${
                        hasError
                          ? "border-red-300 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:ring-2 focus:ring-emerald-200"
                      }`}
                      value={form[key] ?? ""}
                      onKeyDown={blockSpecialKeys}
                      onBeforeInput={(e) => {
                        // Block leading '.' via beforeinput as well (some IMEs)
                        if (e.data === "." && (form[key] ?? "") === "") {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        // Clean pasted content
                        const text = (
                          e.clipboardData || window.clipboardData
                        ).getData("text");
                        const cleaned = text.replace(/[^\d.]/g, "");
                        if (cleaned !== text || cleaned.startsWith(".")) {
                          e.preventDefault();
                          update(key, cleaned);
                        }
                      }}
                      onChange={(e) => update(key, e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 mt-1">{meta.hint}</p>
                      {hasError && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
