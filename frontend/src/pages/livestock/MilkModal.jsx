// src/pages/livestock/MilkModal.jsx
import React from "react";
import { api } from "../../lib/api";

const pad = (n) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date(); d.setHours(0,0,0,0);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
};

// typing-time: allow up to 2 decimals (empty allowed)
const allowTwoDp   = (s) => /^\d{0,10}(?:\.\d{0,2})?$/.test(String(s));
// submit-time: number with up to 2 dp (must have digits)
const twoDpStrict  = (s) => /^\d+(?:\.\d{1,2})?$/.test(String(s));
// display exactly 1 decimal
const oneDp        = (n) => (Number.isFinite(+n) ? (+n).toFixed(1) : "");


/*  Add Modal  */
export function AddRecordModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = React.useState({
    cowId: cows[0]?._id || "",
    date: todayKey(),
    shift: "AM",
    liters: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const base =
  "w-full rounded-xl border px-4 py-3 text-[15px] placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  React.useEffect(() => {
    if (open) {
      setForm({
        cowId: cows[0]?._id || "",
        date: todayKey(),
        shift: "AM",
        liters: "",
      });
    }
  }, [open, cows]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    // cow
    if (!form.cowId) e.cowId = "Please choose a cow";

    // date
    if (!form.date) e.date = "Date is required";
    else {
      const d = new Date(form.date + "T00:00:00");
      const t = new Date(); t.setHours(0,0,0,0);
      if (isNaN(+d)) e.date = "Invalid date";
      else if (d > t) e.date = "Date cannot be in the future";
    }

    // liters
    const s = String(form.liters ?? "").trim();
    if (s === "") e.liters = "Liters is required";
    else if (s.startsWith("-")) e.liters = "Liters cannot be negative";
    else if (!twoDpStrict(s)) e.liters = "Use up to 2 decimal places (e.g., 12.34)";
    else if (Number(s) > 100) e.liters = "Liters cannot exceed 100";

    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const body = {
        cow: form.cowId,
        date: form.date,
        shift: form.shift,
        volumeLiters: Math.round(Number(form.liters || 0) * 100) / 100,
      };
      await api.post("/milk", body);
      onSaved?.();
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const inputCls ="w-full rounded-xl border px-4 py-3 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white px-7 py-5 border-b">
          <div className="flex items-start justify-between">
            <h3 className="text-2xl font-bold">Add Milk Record</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-7 py-6 space-y-5">
          {/* Cow */}
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-1 block">Cow</span>
              <select
                value={form.cowId}
                onChange={(e) => setForm({ ...form, cowId: e.target.value })}
                className={`${base} bg-white ${errors.cowId ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select cow…</option>
                {cows.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || c.tagId || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
                  </option>
                ))}
              </select>
              {errors.cowId && <p className="text-red-600 text-xs mt-1">{errors.cowId}</p>}
          </label>

          {/* Date */}
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-1 block">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              max={todayKey()}
              className={`${base} ${errors.date ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
          </label>

          {/* Shift + Liters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-1 block">Shift</span>
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                className={`${inputCls} bg-white border-gray-300`}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </label>

            <label className="text-sm block">
              <span className="block mb-1 text-gray-600 font-semibold">Liters</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={form.liters}
                onChange={(e) => {
                  const v = e.target.value.replace(",", ".");
                  if (v === "" || (allowTwoDp(v) && !v.startsWith("-"))) {
                    // block >100
                    if (Number(v) <= 100) setForm({ ...form, liters: v });
                  }
                }}
                onBlur={() => {
                  if (form.liters !== "") {
                    let n = Math.min(100, Math.max(0, Number(form.liters))); // clamp 0–100
                    let formatted =
                      Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
                    setForm((f) => ({ ...f, liters: formatted }));
                  }
                }}
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                }}
                className={`${base} ${errors.liters ? "border-red-500" : "border-gray-300"}`}
                placeholder="e.g., 23.5"
              />
              {errors.liters && <p className="text-red-600 text-xs mt-1">{errors.liters}</p>}            
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-white px-7 py-4 border-t">
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Cancel
            </button>
            <button disabled={saving} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save Record"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


/*  Edit Modal  */
export function EditRecordModal({ open, row, cows, onClose, onSaved }) {
  const [form, setForm] = React.useState({
    cowId: row?.cowId || "",
    date: row?.date || todayKey(),
    morning: row?.morning || "",
    evening: row?.evening || "",
  });
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const originalRef = React.useRef({ cowId: "", date: "" });
  const baseEdit =
  "w-full rounded-xl border px-4 py-3 text-[15px] " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  
  React.useEffect(() => {
    if (open && row) {
      setForm({
        cowId: row.cowId,
        date: row.date,
        morning: row.morning || "",
        evening: row.evening || "",
      });
      originalRef.current = { cowId: row.cowId, date: row.date };
    }
  }, [open, row]);

  if (!open || !row) return null;

   const validate = () => {
    const e = {};

    if (!form.cowId) e.cowId = "Please choose a cow";

    if (!form.date) e.date = "Date is required";
    else {
      const d = new Date(form.date + "T00:00:00");
      const t = new Date(); t.setHours(0,0,0,0);
      if (isNaN(+d)) e.date = "Invalid date";
      else if (d > t) e.date = "Date cannot be in the future";
    }

    const check = (val, key) => {
      const s = String(val ?? "").trim();
      if (s === "") return; // treat empty as 0
      if (s.startsWith("-")) e[key] = "Cannot be negative";
      else if (!twoDpStrict(s)) e[key] = "Use up to 2 decimal places";
      else if (Number(s) > 100) e[key] = "Liters cannot exceed 100";
    };

    check(form.morning, "morning");
    check(form.evening, "evening");

    return e;
  };


  // --- API helpers ---
  const postOne = (cowId, date, shift, liters) =>
    api.post("/milk", { cow: cowId, date, shift, volumeLiters: Number(liters) });
  const putOne = (id, date, shift, liters) =>
    api.put(`/milk/${id}`, { date, shift, volumeLiters: Number(liters) });
  const delOne = (id) => api.delete(`/milk/${id}`);

  async function saveBoth() {
    const { cowId: oldCow, date: oldDate } = originalRef.current;
    const newCow = form.cowId;
    const newDate = form.date;

    let oldItems = [];
    try {
      const r0 = await api.get("/milk", {
        params: { cow: oldCow, from: oldDate, to: oldDate, limit: 10 },
      });
      oldItems = r0.data?.items || [];
    } catch {}

    const amOld = oldItems.find((i) => i.shift === "AM");
    const pmOld = oldItems.find((i) => i.shift === "PM");

    const amVal = Number(form.morning || 0);
    const pmVal = Number(form.evening || 0);

    const identityChanged = newCow !== oldCow || newDate !== oldDate;

    if (identityChanged) {
      for (const it of oldItems) await delOne(it._id);
      if (amVal > 0) await postOne(newCow, newDate, "AM", amVal);
      if (pmVal > 0) await postOne(newCow, newDate, "PM", pmVal);
      return;
    }

    if (amOld) await putOne(amOld._id, newDate, "AM", amVal);
    else if (amVal > 0) await postOne(newCow, newDate, "AM", amVal);

    if (pmOld) await putOne(pmOld._id, newDate, "PM", pmVal);
    else if (pmVal > 0) await postOne(newCow, newDate, "PM", pmVal);

    if (amVal <= 0 && amOld) await delOne(amOld._id);
    if (pmVal <= 0 && pmOld) await delOne(pmOld._id);
  }

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      await saveBoth();
      onSaved?.();
      onClose();
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };


  const inputCls = "w-full border rounded-lg px-3 py-2";
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-4">
     <form onSubmit={submit} className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white px-7 py-5 border-b">
          <div className="flex items-start justify-between">
            <h3 className="text-2xl font-bold">Edit Milk Record</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-7 py-6 space-y-5">
          {/* Cow */}
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-1 block">Cow</span>
            <select
              value={form.cowId}
              onChange={(e) => setForm({ ...form, cowId: e.target.value })}
              className={`${baseEdit} bg-white ${errors.cowId ? "border-red-500" : "border-gray-300"}`}
            >
              {cows.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name || c.tagId || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
                </option>
              ))}
            </select>
            {errors.cowId && <p className="text-red-600 text-xs mt-1">{errors.cowId}</p>}
          </label>

          {/* Date */}
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-1 block">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              max={todayKey()}
              className={`${baseEdit} ${errors.date ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
          </label>

          {/* Morning + Evening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="text-sm block">
              <span className="block mb-1 text-gray-600 font-semibold">Morning (AM)</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={form.morning}
                onChange={(e) => {
                  const v = e.target.value.replace(",", ".");
                  if (v === "" || (allowTwoDp(v) && !v.startsWith("-"))) {
                    // block >100
                    if (Number(v) <= 100) setForm({ ...form, morning: v });
                  }
                }}
                onBlur={() => {
                  if (form.morning !== "") {
                    let n = Math.min(100, Math.max(0, Number(form.morning))); // clamp 0–100
                    let formatted =
                      Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
                    setForm((f) => ({ ...f, morning: formatted }));
                  }
                }}
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                }}
                className={`${baseEdit} ${errors.morning ? "border-red-500" : "border-gray-300"}`}
                placeholder="0.0"
              />
              {errors.morning && <p className="text-red-600 text-xs mt-1">{errors.morning}</p>}
            </label>

            <label className="text-sm block">
              <span className="block mb-1 text-gray-600 font-semibold">Evening (PM)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={form.evening}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    if (v === "" || (allowTwoDp(v) && !v.startsWith("-"))) {
                      // block >100
                      if (Number(v) <= 100) setForm({ ...form, evening: v });
                    }
                  }}
                  onBlur={() => {
                    if (form.evening !== "") {
                      let n = Math.min(100, Math.max(0, Number(form.evening))); // clamp 0–100
                      let formatted =
                        Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
                      setForm((f) => ({ ...f, evening: formatted }));
                    }
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                  }}
                  className={`${baseEdit} ${errors.evening ? "border-red-500" : "border-gray-300"}`}
                  placeholder="0.0"
                />
                {errors.evening && <p className="text-red-600 text-xs mt-1">{errors.evening}</p>}              
              </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-white px-7 py-4 border-t">
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Cancel
            </button>
            <button disabled={saving} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? "Save…" : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
