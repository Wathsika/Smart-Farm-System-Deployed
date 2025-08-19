import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlus, FaSearch, FaCalendarAlt, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  AddHealthModal, EditHealthModal, ViewHealthModal,
  AddVaccModal, EditVaccModal, ViewVaccModal,
} from "./HealthModals";

/* ================== Config ================== */
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
const DAYS_WINDOW = 180;

/* ================== Utils ================== */
const pad = (n) => String(n).padStart(2, "0");
const liso = (d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`; };
const fmtDate = (x) => new Date(x).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
const toLiso = (d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.toISOString().slice(0,10); };
const isDueReached = (d) => {
  if (!d) return false;
  const today = toLiso(new Date());
  return new Date(today) >= new Date(toLiso(d));
};

// Vaccination row -> prefilled object for Health Edit modal
const vaccToHealthEditable = (r) => {
  const today = toLiso(new Date());
  const due = r.nextDueDate ? toLiso(r.nextDueDate) : today;
  const adminDate = new Date(today) > new Date(due) ? today : due; // max(today, due)

  return {
    ...r,
    __completeVacc: true, // flag: we are completing a vaccination via health edit
    _id: r._id,
    cow: r.cow?._id || r.cow,
    date: adminDate,
    type: "VACCINATION",
    nextDueDate: "", // clear upcoming
    temperatureC: r.temperatureC ?? "",
    weightKg: r.weightKg ?? "",
    symptoms: r.symptoms?.join(", ") || "",
    diagnosis: r.diagnosis || "",
    medication: r.medication || "",
    dosage: r.dosage || "",
    vet: r.vet || "",
    notes: r.notes || "",
  };
};

/* ================== Kebab (portal + safe buttons) ================== */
function KebabMenu({ items }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 240 });
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const onDocClick = (e) => {
      // If the click is on the button or inside the menu, do nothing
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("click", onDocClick);     // <-- use click, not mousedown
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const openMenu = () => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return setOpen(v => !v);

    const H = 48 * items.length, GAP = 8;
    const openUp = (window.innerHeight - b.bottom) < H + 12;
    const top = openUp ? b.top - GAP - H : b.bottom + GAP;
    const width = pos.width ?? 240;
    let left = b.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setPos({ top, left, width });
    setOpen(true);
  };

  const Menu = (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 10000 }}
      className="rounded-2xl bg-white shadow-xl border overflow-hidden"
      onClick={(e) => e.stopPropagation()}   // clicks inside menu shouldn’t bubble to doc
    >
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          onClick={() => { setOpen(false); it.onClick?.(); }}
          className={[
            "w-full px-4 py-3 text-left hover:bg-gray-50",
            it.danger ? "text-red-600 hover:bg-red-50" : ""
          ].join(" ")}
        >
          {it.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        onClick={openMenu}
        type="button"
        aria-label="Actions"
        className="w-9 h-9 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
      >
        <FaEllipsisV className="text-gray-600" />
      </button>
      {open && createPortal(Menu, document.body)}
    </div>
  );
}


/* ================== Page ================== */
export default function Health() {
  const navigate = useNavigate();

  // filters
  const [cows, setCows] = useState([]);
  const [cowId, setCowId] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  // data
  const [health, setHealth] = useState([]);   // non-vaccination
  const [vaccs, setVaccs] = useState([]);     // vaccination only

  // modals state
  const [viewHealthRow, setViewHealthRow] = useState(null);
  const [addHealthOpen, setAddHealthOpen] = useState(false);
  const [editHealthRow, setEditHealthRow] = useState(null);

  const [viewVaccRow, setViewVaccRow] = useState(null);
  const [addVaccOpen, setAddVaccOpen] = useState(false);
  const [editVaccRow, setEditVaccRow] = useState(null);

  /* load cows */
  useEffect(() => {
    (async () => {
      try { const r = await fetch(`${API}/api/cows`); const j = await r.json(); setCows(Array.isArray(j)? j: []); }
      catch { setCows([]); }
    })();
  }, []);

  /* load health (not vaccination) */
  async function loadHealth() {
    try {
      const url = new URL(`${API}/api/health`);
      if (cowId !== "all") url.searchParams.set("cow", cowId);
      if (dateFilter) { url.searchParams.set("from", dateFilter); url.searchParams.set("to", dateFilter); }
      url.searchParams.set("limit","200"); url.searchParams.set("page","1");
      const r = await fetch(url.toString()); const j = await r.json();
      let items = Array.isArray(j?.items) ? j.items : [];
      items = items.filter(x => (x.type || "").toUpperCase() !== "VACCINATION");
      const q = search.trim().toLowerCase();
      if (q) {
        items = items.filter(x =>
          [x.type, x.vet, x.diagnosis, x.notes, ...(x.symptoms || [])].join(" ").toLowerCase().includes(q)
        );
      }
      items.sort((a,b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt||0) - new Date(a.createdAt||0));
      setHealth(items);
    } catch { setHealth([]); }
  }
  useEffect(() => { loadHealth(); }, [cowId, dateFilter]);
  useEffect(() => { const t = setTimeout(loadHealth, 250); return () => clearTimeout(t); }, [search]);

  /* load vaccinations (type VACCINATION only) */
  async function loadVaccs() {
    try {
      const url = new URL(`${API}/api/health`);
      if (cowId !== "all") url.searchParams.set("cow", cowId);
      url.searchParams.set("limit","400"); url.searchParams.set("page","1");
      const r = await fetch(url.toString()); const j = await r.json();
      let rows = Array.isArray(j?.items) ? j.items : [];
      rows = rows
        .filter(x => (x.type || "").toUpperCase() === "VACCINATION" && x.nextDueDate)
        .sort((a,b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
      const end = new Date(); end.setDate(end.getDate()+DAYS_WINDOW);
      rows = rows.filter(x => { const d = new Date(x.nextDueDate); return !isNaN(d) && d <= end; });

      const q = search.trim().toLowerCase();
      if (q) {
        rows = rows.filter(x =>
          [x.medication, x.diagnosis, x.notes, x.vet, x.cow?.name, x.cow?.tagId].join(" ").toLowerCase().includes(q)
        );
      }
      setVaccs(rows);
    } catch { setVaccs([]); }
  }
  useEffect(() => { loadVaccs(); }, [cowId, dateFilter]);
  useEffect(() => { const t = setTimeout(loadVaccs, 250); return () => clearTimeout(t); }, [search]);

  /* helpers */
  const onDeleteRecord = async (row) => {
    if (!confirm(`Delete record for ${(row.cow?.name || row.cow?.tagId || "cow")} on ${fmtDate(row.date)}?`)) return;
    try {
      const r = await fetch(`${API}/api/health/${row._id}`, { method:"DELETE" });
      if (!r.ok) throw new Error("delete");
      await Promise.all([loadHealth(), loadVaccs()]);
    } catch { alert("Failed to delete"); }
  };

  const soonestVacc = useMemo(() => {
    if (!vaccs.length) return null;
    const v = vaccs[0];
    return { title:`VACCINATION due for ${v.cow?.name || v.cow?.tagId || "Cow"}`, when:fmtDate(v.nextDueDate) };
  }, [vaccs]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cow Health</h1>
        <p className="text-gray-500">Add records, manage vaccinations, and review visits</p>

        {soonestVacc && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
            <FaCalendarAlt className="text-yellow-600" />
            <div className="text-sm">
              <span className="font-semibold">{soonestVacc.title}</span>
              <span className="text-gray-700"> • {soonestVacc.when}</span>
            </div>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white border border-yellow-200 text-yellow-800">
              {vaccs.length} due
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search (type/diagnosis/notes/vet/cow)…"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="relative">
              <select
                value={cowId} onChange={(e)=>setCowId(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Filter by cow"
              >
                <option value="all">All Cows</option>
                {cows.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || "Cow"} {c.tagId ? `(${c.tagId})` : ""}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
            </div>

            <input
              type="date" value={dateFilter || ""} onChange={(e)=>setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" title="Filter by date"
            />
            {dateFilter && (
              <button onClick={()=>setDateFilter("")} className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50">
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAddVaccOpen(true)}
              className="bg-amber-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-700 transition flex items-center gap-2"
            >
              <FaPlus /> Add Vaccination
            </button>
            <button
              onClick={() => setAddHealthOpen(true)}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FaPlus /> Add Health Record
            </button>
          </div>
        </div>
      </header>

      {/* Vaccinations */}
      <section className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Upcoming Vaccinations</h2>
            <p className="text-sm text-gray-500">{vaccs.length} due (next {DAYS_WINDOW} days)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-600 border-b">
              <tr>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Cow</th>
                <th className="py-3 px-3">Vaccine / Medication</th>
                <th className="py-3 px-3">Vet</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccs.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-3 px-3 whitespace-nowrap">{fmtDate(r.nextDueDate)}</td>
                  <td className="py-3 px-3">{r.cow?.name || r.cow?.tagId || "—"} {r.cow?.tagId ? <span className="text-gray-500">({r.cow.tagId})</span> : null}</td>
                  <td className="py-3 px-3">{r.medication || r.diagnosis || "—"}</td>
                  <td className="py-3 px-3">{r.vet || "—"}</td>
                  <td className="py-3 px-3">{r.notes || "—"}</td>
                  <td className="py-3 px-3">
                    {(() => {
                      const items = [
                        { label: "View Details", onClick: () => setViewVaccRow(r) },
                        { label: "Edit", onClick: () => setEditVaccRow(r) },
                        ...(isDueReached(r.nextDueDate)
                          ? [{ label: "Add to Health Record", onClick: () => setEditHealthRow(vaccToHealthEditable(r)) }]
                          : []),
                        { label: "Delete", danger: true, onClick: () => onDeleteRecord(r) },
                      ];
                      return <KebabMenu items={items} />;
                    })()}
                  </td>
                </tr>
              ))}
              {!vaccs.length && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No upcoming vaccinations.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Health Records */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-800">Health Records</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-gray-600 border-b">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Cow</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Vitals</th>
                <th className="py-3 px-3">Diagnosis / Notes</th>
                <th className="py-3 px-3">Vet</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {health.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-3 px-3 whitespace-nowrap">{fmtDate(r.date)}</td>
                  <td className="py-3 px-3">{r.cow?.name || r.cow?.tagId || "—"} {r.cow?.tagId ? <span className="text-gray-500">({r.cow.tagId})</span> : null}</td>
                  <td className="py-3 px-3">{r.type}</td>
                  <td className="py-3 px-3 text-gray-700">
                    {r.temperatureC ? `Temp: ${Number(r.temperatureC).toFixed(1)}°C` : ""}
                    {r.weightKg ? `${r.temperatureC ? " • " : ""}Wt: ${Number(r.weightKg).toFixed(1)} kg` : ""}
                  </td>
                  <td className="py-3 px-3 text-gray-700">
                    {r.diagnosis || r.notes || (r.symptoms?.length ? r.symptoms.join(", ") : "—")}
                  </td>
                  <td className="py-3 px-3">{r.vet || "—"}</td>
                  <td className="py-3 px-3">
                    <KebabMenu
                      items={[
                        { label: "View Details", onClick: () => setViewHealthRow(r) },
                        { label: "Edit", onClick: () => setEditHealthRow(r) },
                        { label: "Delete", danger:true, onClick: () => onDeleteRecord(r) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {!health.length && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      <AddHealthModal
        open={addHealthOpen}
        onClose={() => setAddHealthOpen(false)}
        cows={cows}
        onSaved={() => { setAddHealthOpen(false); loadHealth(); }}
      />
      <EditHealthModal
        open={!!editHealthRow}
        onClose={() => setEditHealthRow(null)}
        cows={cows}
        record={editHealthRow}
        onSaved={() => { setEditHealthRow(null); Promise.all([loadHealth(), loadVaccs()]); }}
      />
      <ViewHealthModal
        open={!!viewHealthRow}
        onClose={() => setViewHealthRow(null)}
        record={viewHealthRow}
      />

      <AddVaccModal
        open={addVaccOpen}
        onClose={() => setAddVaccOpen(false)}
        cows={cows}
        onSaved={() => { setAddVaccOpen(false); loadVaccs(); }}
      />
      <EditVaccModal
        open={!!editVaccRow}
        onClose={() => setEditVaccRow(null)}
        cows={cows}
        record={editVaccRow}
        onSaved={() => { setEditVaccRow(null); loadVaccs(); }}
      />
      <ViewVaccModal
        open={!!viewVaccRow}
        onClose={() => setViewVaccRow(null)}
        record={viewVaccRow}
      />
    </div>
  );
}
