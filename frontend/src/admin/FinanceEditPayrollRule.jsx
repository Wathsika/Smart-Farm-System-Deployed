import React, { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { api } from "../lib/api";

export default function PayrollSettingsPage() {
  const [form, setForm] = useState({
    daysPerMonth: 28,
    hoursPerDay: 8,
    otWeekdayMultiplier: 1.5,
    otHolidayMultiplier: 2.0,
    epfRate: 0.08,
    etfRate: 0.03,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/payroll/settings");
        if (mounted && data) setForm(data);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  function update(key, value) {
    const num = Number(value);
    setForm((p) => ({ ...p, [key]: Number.isNaN(num) ? 0 : num }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await api.put("/payroll/settings", form);
      setForm(data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Payroll Settings</h1>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              [
                "daysPerMonth",
                "Days per Month",
                "Working days in a month",
                "0.1",
              ],
              ["hoursPerDay", "Hours per Day", "Standard working hours", "0.1"],
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
                  className="w-full border rounded-lg px-3 py-2"
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">{hint}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 
                       bg-emerald-600 hover:bg-emerald-700 
                       disabled:bg-gray-400 text-white 
                       rounded-lg text-sm shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <a
            href="/admin/finance/payroll_management"
            className="px-4 py-2 text-sm rounded-lg 
                       bg-emerald-100 text-emerald-700 
                       hover:bg-emerald-200 transition-colors"
          >
            Back to Payroll
          </a>
        </div>
      </div>
    </div>
  );
}
