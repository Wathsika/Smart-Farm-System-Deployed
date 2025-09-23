// src/pages/livestock/Breeding.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrashAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import { api } from "../../lib/api";

const isFemale = (c) =>
  String(c?.gender || c?.sex || "").toLowerCase().startsWith("f");

const EVENT_TYPES = ["pregnancyCheck", "calving"];

/* ---------- Modal Base ---------- */
function BaseModal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center px-4">
      <form className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="sticky top-0 bg-white px-7 py-5 border-b flex items-center justify-between">
          <h3 className="text-2xl font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-7 py-6 space-y-5">
          {children}
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      <span className="block mb-1">{label}</span>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </label>
  );
}

/* ---------- Add Modal ---------- */
function AddBreedingModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = useState({
    cow: "",
    eventType: "pregnancyCheck",
    serviceDate: "",
    nextDueDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        cow: cows?.[0]?._id || "",
        eventType: "pregnancyCheck",
        serviceDate: "",
        nextDueDate: "",
        notes: "",
      });
      setErrors({});
    }
  }, [open, cows]);

  if (!open) return null;

  const validate = (form) => {
    const e = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.cow) e.cow = "Please choose a cow";

    if (!form.serviceDate) {
      e.serviceDate = "Service/Event Date is required";
    } else {
      const d = new Date(form.serviceDate + "T00:00:00");
      if (d > today) e.serviceDate = "Must be today or before today";
    }

    if (!form.nextDueDate) {
      e.nextDueDate = "Next Due Date is required";
    } else {
      const d = new Date(form.nextDueDate + "T00:00:00");
      if (d <= today) e.nextDueDate = "Must be after today";
    }

    // notes 
    if (!form.notes.trim()) {
      e.notes = "Notes are required";
    } else {
      const allowed = /^[A-Za-z0-9\s(),.'/-]+$/;
      if (!allowed.test(form.notes.trim())) {
        e.notes =
          "Only letters, numbers, spaces, and symbols ( ) , . ' / - are allowed";
      }
    }
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await api.post("/breeding", form);
      onSaved?.();
      onClose();
    } catch {
      alert("Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500";

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  return (
    <BaseModal open={open} onClose={onClose} title="Add Breeding Record">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Cow" error={errors.cow}>
          <select
            value={form.cow}
            onChange={(e) => setForm({ ...form, cow: e.target.value })}
            className={inputCls}
          >
            {cows.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name || c.cowId || "Cow"}{" "}
                {c.cowId ? `(${c.cowId})` : c.tagId ? `(${c.tagId})` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Event Type">
          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            className={inputCls}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Service/Event Date" error={errors.serviceDate}>
          <input
            type="date"
            value={form.serviceDate}
            max={todayStr}
            onChange={(e) =>
              setForm({ ...form, serviceDate: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Next Due Date" error={errors.nextDueDate}>
          <input
            type="date"
            value={form.nextDueDate}
            min={tomorrowStr}
            onChange={(e) =>
              setForm({ ...form, nextDueDate: e.target.value })
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className={inputCls}
          placeholder="Only letters, numbers, spaces, and symbols ( ) , . ' / - are allowed"
        />
      </Field>
      <div className="sticky bottom-0 bg-white pt-4 flex justify-end gap-3 border-t mt-5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Record"}
        </button>
      </div>
    </BaseModal>
  );
}

/* ---------- Edit Modal ---------- */
function EditBreedingModal({ open, onClose, cows, row, onSaved }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && row) {
      setForm({
        cow: row.cow?._id || row.cow || "",
        eventType: row.eventType || "pregnancyCheck",
        serviceDate: row.serviceDate?.slice(0, 10) || "",
        nextDueDate: row.nextDueDate?.slice(0, 10) || "",
        notes: row.notes || "",
      });
      setErrors({});
    }
  }, [open, row]);

  if (!open || !form) return null;

  const validate = (form) => {
    const e = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.cow) e.cow = "Please choose a cow";

    if (!form.serviceDate) {
      e.serviceDate = "Service/Event Date is required";
    } else {
      const d = new Date(form.serviceDate + "T00:00:00");
      if (d > today) e.serviceDate = "Must be today or before today";
    }

    if (!form.nextDueDate) {
      e.nextDueDate = "Next Due Date is required";
    } else {
      const d = new Date(form.nextDueDate + "T00:00:00");
      if (d <= today) e.nextDueDate = "Must be after today";
    }

    if (!form.notes.trim()) {
      e.notes = "Notes are required";
    } else {
      const allowed = /^[A-Za-z0-9\s(),.'/-]+$/;
      if (!allowed.test(form.notes)) {
        e.notes =
          "Only letters, numbers, spaces, and symbols ( ) , . ' / - are allowed";
      }
    }
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await api.put(`/breeding/${row._id}`, form);
      onSaved?.();
      onClose();
    } catch {
      alert("Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500";
  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  return (
    <BaseModal open={open} onClose={onClose} title="Edit Breeding Record">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Cow" error={errors.cow}>
          <select
            value={form.cow}
            onChange={(e) => setForm({ ...form, cow: e.target.value })}
            className={inputCls}
          >
            {cows.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name || c.cowId || "Cow"}{" "}
                {c.cowId ? `(${c.cowId})` : c.tagId ? `(${c.tagId})` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Event Type">
          <select
            value={form.eventType}
            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
            className={inputCls}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Service/Event Date" error={errors.serviceDate}>
          <input
            type="date"
            value={form.serviceDate}
            max={todayStr}
            onChange={(e) =>
              setForm({ ...form, serviceDate: e.target.value })
            }
            className={inputCls}
          />
        </Field>
        <Field label="Next Due Date" error={errors.nextDueDate}>
          <input
            type="date"
            value={form.nextDueDate}
            min={tomorrowStr}
            onChange={(e) =>
              setForm({ ...form, nextDueDate: e.target.value })
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Notes" error={errors.notes}>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className={inputCls}
        />
      </Field>
      <div className="sticky bottom-0 bg-white pt-4 flex justify-end gap-3 border-t mt-5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </BaseModal>
  );
}

/* ---------- Action Menu ---------- */
function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const width = 224;
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (menuRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const computePos = (btn) => {
    const r = btn.getBoundingClientRect();
    let left = Math.min(window.innerWidth - width - 8, r.right - width);
    if (left < 8) left = 8;
    const top = Math.min(window.innerHeight - 8, r.bottom + 8);
    setPos({ top, left });
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => {
          computePos(e.currentTarget);
          setOpen((v) => !v);
        }}
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center"
      >
        <span className="text-gray-600">⋮</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 w-56 rounded-xl border bg-white shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onEdit?.();
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <FaEdit className="text-gray-600" /> Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <FaTrashAlt className="text-red-600" /> Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

/* ---------- Main Page ---------- */
function Breeding() {
  const [search, setSearch] = useState("");
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [rows, setRows] = useState([]);
  const [visible, setVisible] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cows");
        setCows((Array.isArray(data) ? data : []).filter(isFemale));
      } catch {
        setCows([]);
      }
    })();
  }, []);

  async function loadRows() {
    try {
      const params = { limit: 100, page: 1 };
      if (cowId !== "all") params.cow = cowId;
      if (eventType !== "all") params.eventType = eventType;
      const { data } = await api.get("/breeding", { params });
      setRows(Array.isArray(data) ? data : []);
      setVisible(10);
    } catch {
      setRows([]);
      setVisible(0);
    }
  }
  useEffect(() => {
    loadRows();
  }, [cowId, eventType]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (r.cow?.name || "").toLowerCase().includes(q) ||
        (r.cow?.cowId || "").toLowerCase().includes(q) ||
        (r.eventType || "").toLowerCase().includes(q) ||
        (r.notes || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  async function handleDelete(row) {
    if (!confirm("Delete this breeding record?")) return;
    try {
      await api.delete(`/breeding/${row._id}`);
      await loadRows();
    } catch {
      alert("Delete failed");
    }
  }

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "—";

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Breeding Records</h1>
        <p className="text-gray-500">
          Track pregnancy checks, calvings, and next due dates
        </p>

        <div className="w-full bg-white rounded-xl shadow-md border p-4 mt-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={cowId}
              onChange={(e) => setCowId(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="all">All Cows</option>
              {cows.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name || c.cowId || "Cow"}{" "}
                  {c.cowId ? `(${c.cowId})` : c.tagId ? `(${c.tagId})` : ""}
                </option>
              ))}
            </select>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 bg-white capitalize"
            >
              <option value="all">All Events</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaPlus /> Add Breeding
          </button>
        </div>
      </header>

      <section className="bg-white shadow-lg rounded-2xl border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Records</h2>
          <p className="text-sm text-gray-500">{filtered.length} shown</p>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-base border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-6 text-left font-bold text-green-700">
                  Date
                </th>
                <th className="py-3 px-6 text-left font-bold text-green-700">
                  Cow
                </th>
                <th className="py-3 px-6 text-left font-bold text-green-700">
                  Event
                </th>
                <th className="py-3 px-6 text-left font-bold text-green-700">
                  Next Due
                </th>
                <th className="py-3 px-6 text-left font-bold text-green-700">
                  Notes
                </th>
                <th className="py-3 px-6 text-center font-bold text-green-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.slice(0, visible).map((r) => (
                <tr key={r._id} className="hover:bg-green-50 transition">
                  <td className="py-3 px-6">{fmtDate(r.serviceDate)}</td>
                  <td className="py-3 px-6">
                    {r.cow?.name || r.cow?.cowId || r.cow?.tagId || "—"}
                  </td>
                  <td className="py-3 px-6 capitalize">{r.eventType}</td>
                  <td className="py-3 px-6">{fmtDate(r.nextDueDate)}</td>
                  <td className="py-3 px-6 max-w-[16rem] truncate" title={r.notes}>
                    {r.notes || "—"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <ActionMenu
                      onEdit={() => {
                        setEditRow(r);
                        setEditOpen(true);
                      }}
                      onDelete={() => handleDelete(r)}
                    />
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No breeding records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {visible < filtered.length && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + 10)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Show more
            </button>
          </div>
        )}
      </section>

      <AddBreedingModal
        open={addOpen}
        cows={cows}
        onClose={() => setAddOpen(false)}
        onSaved={loadRows}
      />
      <EditBreedingModal
        open={editOpen}
        cows={cows}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSaved={loadRows}
      />
    </div>
  );
}

export default Breeding;
