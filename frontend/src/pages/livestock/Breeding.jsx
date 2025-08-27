// src/pages/livestock/Breeding.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { createPortal } from "react-dom";
import { api } from "../../lib/api";

/* helpers */
const isFemale = (c) =>
  String(c?.gender || c?.sex || "").toLowerCase().startsWith("f");

const EVENT_TYPES = ["insemination", "pregnancyCheck", "calving", "heat"];
const STATUS = ["planned", "done", "missed", "cancelled"];

/* ---------- Tiny modal primitives (inline) ---------- */
function BaseModal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 grid place-items-center"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

/* ---------- Add / Edit Modals (inline) ---------- */
function AddBreedingModal({ open, onClose, cows, onSaved }) {
  const [form, setForm] = useState({
    cow: "",
    eventType: "insemination",
    status: "planned",
    serviceDate: "",
    nextDueDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setErr("");
      setForm((f) => ({ ...f, cow: cows?.[0]?._id || "" }));
    }
  }, [open, cows]);

  if (!open) return null;

  async function submit() {
    setSaving(true);
    setErr("");
    try {
      const body = { ...form };
      Object.keys(body).forEach((k) => body[k] === "" && delete body[k]);
      await api.post("/breeding", body);
      onSaved?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add record");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BaseModal open={open} onClose={onClose} title="Add Breeding Record">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Cow">
          <select
            value={form.cow}
            onChange={(e) => setForm({ ...form, cow: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
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
            className="w-full border rounded-lg px-3 py-2 capitalize"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 capitalize"
          >
            {STATUS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Service/Event Date">
          <input
            type="date"
            value={form.serviceDate}
            onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="Next Due Date (optional)">
          <input
            type="date"
            value={form.nextDueDate || ""}
            onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>
      </div>

      {err && (
        <div className="mt-3 rounded-md bg-yellow-50 text-yellow-800 px-4 py-2">
          {err}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border">
          Cancel
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </BaseModal>
  );
}

function EditBreedingModal({ open, onClose, cows, row, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open && row) {
      setForm({
        cow: row.cow?._id || row.cow || "",
        eventType: row.eventType || "insemination",
        status: row.status || "planned",
        serviceDate: row.serviceDate ? row.serviceDate.slice(0, 10) : "",
        nextDueDate: row.nextDueDate ? row.nextDueDate.slice(0, 10) : "",
        notes: row.notes || "",
      });
      setErr("");
    }
  }, [open, row]);

  if (!open || !row || !form) return null;

  async function submit() {
    setSaving(true);
    setErr("");
    try {
      const body = { ...form };
      Object.keys(body).forEach((k) => body[k] === "" && delete body[k]);
      await api.put(`/breeding/${row._id}`, body);
      onSaved?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BaseModal open={open} onClose={onClose} title="Edit Breeding Record">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Cow">
          <select
            value={form.cow}
            onChange={(e) => setForm({ ...form, cow: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
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
            className="w-full border rounded-lg px-3 py-2 capitalize"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 capitalize"
          >
            {STATUS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Service/Event Date">
          <input
            type="date"
            value={form.serviceDate || ""}
            onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="Next Due Date (optional)">
          <input
            type="date"
            value={form.nextDueDate || ""}
            onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={3}
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>
      </div>

      {err && (
        <div className="mt-3 rounded-md bg-yellow-50 text-yellow-800 px-4 py-2">
          {err}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border">
          Cancel
        </button>
        <button
          disabled={saving}
          onClick={submit}
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </BaseModal>
  );
}

/* ---------- Actions menu ---------- */
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
        data-actions-btn
        onClick={(e) => {
          computePos(e.currentTarget);
          setOpen((v) => !v);
        }}
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 grid place-items-center"
        aria-label="Actions"
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
              onClick={() => { setOpen(false); onEdit?.(); }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              ✏️ <span>Edit</span>
            </button>
            <button
              onClick={() => { setOpen(false); onDelete?.(); }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              🗑️ <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

/* ---------- Page ---------- */
function Breeding() {
  const [search, setSearch] = useState("");
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [status, setStatus] = useState("all");

  const [rows, setRows] = useState([]);
  const [visible, setVisible] = useState(15);
  const hasMore = visible < rows.length;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [due, setDue] = useState([]);
  const [repeat, setRepeat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
    setLoading(true);
    setErr("");
    try {
      const params = { limit: 120, page: 1 };
      if (cowId !== "all") params.cow = cowId;
      if (eventType !== "all") params.eventType = eventType;
      if (status !== "all") params.status = status;

      const { data } = await api.get("/breeding", { params });
      const arr = Array.isArray(data) ? data : [];
      setRows(arr);
      setVisible(Math.min(15, arr.length));
    } catch {
      setErr("Failed to load breeding records.");
      setRows([]);
      setVisible(0);
    } finally {
      setLoading(false);
    }
  }

  async function loadSidePanels() {
    try {
      const [{ data: dueData }, { data: repeatData }] = await Promise.all([
        api.get("/breeding/due", { params: { days: 30 } }),
        api.get("/breeding/repeat"),
      ]);
      setDue(Array.isArray(dueData) ? dueData : []);
      setRepeat(Array.isArray(repeatData) ? repeatData : []);
    } catch {
      setDue([]);
      setRepeat([]);
    }
  }

  useEffect(() => {
    loadRows();
    loadSidePanels();
  }, [cowId, eventType, status]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const cowName = r.cow?.name || "";
      const tag = r.cow?.cowId || r.cow?.tagId || "";
      const note = r.notes || "";
      return (
        cowName.toLowerCase().includes(q) ||
        tag.toLowerCase().includes(q) ||
        (r.eventType || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q) ||
        note.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const onLoadMore = () => setVisible((v) => Math.min(v + 15, filtered.length));

  async function handleDelete(row) {
    if (!confirm("Delete this breeding record?")) return;
    try {
      await api.delete(`/breeding/${row._id}`);
      await loadRows();
      await loadSidePanels();
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Breeding Records</h1>
        <p className="text-gray-500">
          Track inseminations, pregnancy checks, calvings, and next dues
        </p>

        {/* toolbar */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-72">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadRows()}
                placeholder="Search cow / tag / notes…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* cow filter */}
            <div className="relative">
              <select
                value={cowId}
                onChange={(e) => setCowId(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 rounded-lg"
                title="Filter by cow"
              >
                <option value="all">All Cows</option>
                {cows.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || c.cowId || "Cow"}{" "}
                    {c.cowId ? `(${c.cowId})` : c.tagId ? `(${c.tagId})` : ""}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>

            {/* event type */}
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 rounded-lg"
              >
                <option value="all">All Events</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>

            {/* status */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 rounded-lg"
              >
                <option value="all">Any Status</option>
                {STATUS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </span>
            </div>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="self-start md:self-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus /> Add Breeding
          </button>
        </div>
      </header>

      {/* content */}
      <div className="grid lg:grid-cols-[1fr_20rem] gap-6">
        <section className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Records</h2>
            <p className="text-sm text-gray-500">{filtered.length} shown</p>
          </div>

          {err && (
            <div className="mb-4 rounded-md bg-yellow-50 text-yellow-800 px-4 py-2">
              {err}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Cow</th>
                  <th className="py-3 px-3">Event</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Next Due</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, visible).map((r) => {
                  const date = r.serviceDate || r.eventDate || r.createdAt;
                  const cowLabel =
                    r.cow?.name || r.cow?.cowId || r.cow?.tagId || "Cow";
                  return (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="py-3 px-3 whitespace-nowrap">
                        {date ? new Date(date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-3">{cowLabel}</td>
                      <td className="py-3 px-3 capitalize">
                        {r.eventType || "—"}
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            r.status === "done"
                              ? "bg-green-100 text-green-800"
                              : r.status === "missed"
                              ? "bg-red-100 text-red-700"
                              : r.status === "planned"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r.status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {r.nextDueDate
                          ? new Date(r.nextDueDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td
                        className="py-3 px-3 max-w-[20rem] truncate"
                        title={r.notes || ""}
                      >
                        {r.notes || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <ActionMenu
                          onEdit={() => {
                            setEditRow(r);
                            setEditOpen(true);
                          }}
                          onDelete={() => handleDelete(r)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No breeding records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="pt-4 flex justify-center">
              <button
                onClick={onLoadMore}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Show more
              </button>
            </div>
          )}
        </section>

        {/* sidebar panels */}
        <aside className="w-full lg:w-80 bg-white shadow-md rounded-lg p-6 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800">
              Upcoming Dues (30d)
            </h3>
            <ul className="mt-3 space-y-2">
              {(due || []).slice(0, 6).map((d) => (
                <li
                  key={d._id}
                  className="text-sm flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">
                      {d.cow?.name || d.cow?.cowId || "Cow"}
                    </div>
                    <div className="text-gray-500">
                      {d.eventType} →{" "}
                      <span className="capitalize">{d.status || "planned"}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    {d.nextDueDate
                      ? new Date(d.nextDueDate).toLocaleDateString()
                      : "-"}
                  </span>
                </li>
              ))}
              {!due?.length && (
                <li className="text-sm text-gray-500">No upcoming items.</li>
              )}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800">Repeat Breeders</h3>
            <ul className="mt-3 space-y-2">
              {(repeat || []).slice(0, 6).map((r) => (
                <li
                  key={r._id || r.cow?._id}
                  className="text-sm flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">
                      {r.cow?.name || r.cow?.cowId || "Cow"}
                    </div>
                    <div className="text-gray-500">Services: {r.count}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">
                    {r.lastService
                      ? new Date(r.lastService).toLocaleDateString()
                      : "-"}
                  </span>
                </li>
              ))}
              {!repeat?.length && (
                <li className="text-sm text-gray-500">No repeat breeders.</li>
              )}
            </ul>
          </section>
        </aside>
      </div>

      {/* modals */}
      <AddBreedingModal
        open={addOpen}
        cows={cows}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          loadRows();
          loadSidePanels();
        }}
      />
      <EditBreedingModal
        open={editOpen}
        cows={cows}
        row={editRow}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          loadRows();
          loadSidePanels();
        }}
      />
    </div>
  );
}

export default Breeding;
