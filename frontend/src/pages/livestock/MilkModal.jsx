import React from "react";
import { api } from "../../lib/api";
const todayKey = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* ==================== Add Modal ==================== */
export function AddRecordModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = React.useState({
    cowId: cows[0]?._id || "",
    date: todayKey(),
    shift: "AM",
    liters: "",
  });
  const [saving, setSaving] = React.useState(false);

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

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!form.cowId) throw new Error("Please choose a cow");
      const body = {
        cow: form.cowId,
        date: form.date, // YYYY-MM-DD
        shift: form.shift,
        volumeLiters: Number(form.liters || 0),
      };
      await api.post("/milk", body);
      onSaved?.();
      onClose();
    } catch (err) {
      alert(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-bold">Add Milk Record</h3>

        {/* Cow first */}
        <label className="text-sm">
          <span className="block mb-1 text-gray-600">Cow</span>
          <select
            value={form.cowId}
            onChange={(e) => setForm({ ...form, cowId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 bg-white"
            required
          >
            <option value="">Select cow…</option>
            {cows.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name || c.tagId || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Date (auto today) */}
        <label className="text-sm">
          <span className="block mb-1 text-gray-600">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-gray-600">Shift</span>
            <select
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-gray-600">Liters</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., 23.5"
              required
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Cancel
          </button>
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            {saving ? "Saving…" : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ==================== Edit Modal (move/update AM/PM) ==================== */
export function EditRecordModal({ open, row, cows, onClose, onSaved }) {
  const [form, setForm] = React.useState({
    cowId: row?.cowId || "",
    date: row?.date || todayKey(),
    morning: Number(row?.morning || 0),
    evening: Number(row?.evening || 0),
  });
  const [saving, setSaving] = React.useState(false);

  
  const originalRef = React.useRef({ cowId: "", date: "" });

  React.useEffect(() => {
    if (open && row) {
      setForm({
        cowId: row.cowId,
        date: row.date,
        morning: Number(row.morning || 0),
        evening: Number(row.evening || 0),
      });
      originalRef.current = { cowId: row.cowId, date: row.date };
    }
  }, [open, row]);

  if (!open || !row) return null;

  // --- helper upserts ---
  const postOne = (cowId, date, shift, liters) =>
    api.post("/milk", { cow: cowId, date, shift, volumeLiters: Number(liters) });

  const putOne = (id, date, shift, liters) =>
    api.put(`/milk/${id}`, { date, shift, volumeLiters: Number(liters) });

  const delOne = (id) => api.delete(`/milk/${id}`);

  async function saveBoth() {
    const { cowId: oldCow, date: oldDate } = originalRef.current;   // ← use ORIGINAL
    const newCow = form.cowId;
    const newDate = form.date;

    // fetch existing AM/PM docs for the ORIGINAL identity
    let oldItems = [];
    try {
      const r0 = await api.get("/milk", {
        params: { cow: oldCow, from: oldDate, to: oldDate, limit: 10 },
      });
      oldItems = r0.data?.items || [];
    } catch {
      oldItems = [];
    }
    const amOld = oldItems.find((i) => i.shift === "AM");
    const pmOld = oldItems.find((i) => i.shift === "PM");

    const amVal = Number(form.morning || 0);
    const pmVal = Number(form.evening || 0);

    const identityChanged = newCow !== oldCow || newDate !== oldDate;

    if (identityChanged) {
      // move: delete old docs, then create new docs at new identity
      for (const it of oldItems) await delOne(it._id);

      if (amVal > 0) await postOne(newCow, newDate, "AM", amVal);
      if (pmVal > 0) await postOne(newCow, newDate, "PM", pmVal);
      return;
    }

    // same cow+date → update or create
    if (amOld) {
      await putOne(amOld._id, newDate, "AM", amVal);
    } else if (amVal > 0) {
      await postOne(newCow, newDate, "AM", amVal);
    }

    if (pmOld) {
      await putOne(pmOld._id, newDate, "PM", pmVal);
    } else if (pmVal > 0) {
      await postOne(newCow, newDate, "PM", pmVal);
    }

    // if user set both to 0 → delete any existing
    if (amVal <= 0 && amOld) await delOne(amOld._id);
    if (pmVal <= 0 && pmOld) await delOne(pmOld._id);
  }

  const submit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-bold">Edit Milk Record</h3>

        <label className="text-sm">
          <span className="block mb-1 text-gray-600">Cow</span>
          <select
            value={form.cowId}
            onChange={(e) => setForm({ ...form, cowId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 bg-white"
            required
          >
            {cows.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name || c.tagId || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="block mb-1 text-gray-600">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-gray-600">Morning (AM)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.morning}
              onChange={(e) => setForm({ ...form, morning: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-gray-600">Evening (PM)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.evening}
              onChange={(e) => setForm({ ...form, evening: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Cancel
          </button>
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
