import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlus, FaSearch, FaCalendarAlt, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import {
  AddHealthModal, EditHealthModal, ViewHealthModal,
  AddVaccModal, EditVaccModal, ViewVaccModal,
} from "./HealthModals.jsx";

/*  Config  */
const DAYS_WINDOW = 180;

/*  Utils  */
const pad = (n) => String(n).padStart(2, "0");
const liso = (d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`; };
const fmtDate = (x) => new Date(x).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
const toLiso = (d) => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.toISOString().slice(0,10); };
const isDueReached = (d) => {
  if (!d) return false;
  const today = toLiso(new Date());
  return new Date(today) >= new Date(toLiso(d));
};

// Vaccination row 
const vaccToHealthEditable = (r) => {
  const today = toLiso(new Date());
  const due = r.nextDueDate ? toLiso(r.nextDueDate) : today;
  const adminDate = new Date(today) > new Date(due) ? today : due; // max(today, due)

  return {
    ...r,
    __completeVacc: true, 
    _id: r._id,
    cow: r.cow?._id || r.cow,
    date: adminDate,
    type: "VACCINATION",
    nextDueDate: "", 
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

/*  Kebab (portal + safe buttons)  */
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
      onClick={(e) => e.stopPropagation()}   
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


/*  Page  */
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
      try {
        const r = await api.get("/cows");
        setCows(Array.isArray(r.data) ? r.data : []);
      } catch {
        setCows([]);
      }
    })();
  }, []);

  /* load health*/
  async function loadHealth() {
    try {
      const params = { limit: "200", page: "1" };
      if (cowId !== "all") params.cow = cowId;
      if (dateFilter) { params.from = dateFilter; params.to = dateFilter; }
      const r = await api.get("/health", { params });
      let items = Array.isArray(r.data?.items) ? r.data.items : [];
      items = items.filter(x => (x.type || "").toUpperCase() !== "VACCINATION");
      const q = search.trim().toLowerCase();
      if (q) {
        items = items.filter(x =>
          [x.type, x.vet, x.diagnosis, x.notes, ...(x.symptoms || [])].join(" ").toLowerCase().includes(q)
        );
      }
      items.sort((a,b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt||0) - new Date(a.createdAt||0));
      setHealth(items);
    } catch {
      setHealth([]);
    }
  }
  useEffect(() => { loadHealth(); }, [cowId, dateFilter]);
  useEffect(() => { const t = setTimeout(loadHealth, 250); return () => clearTimeout(t); }, [search]);

  /* load vaccinations */
  async function loadVaccs() {
    try {
      const params = { limit: "400", page: "1" };
      if (cowId !== "all") params.cow = cowId;
      const r = await api.get("/health", { params });
      let rows = Array.isArray(r.data?.items) ? r.data.items : [];
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
    } catch {
      setVaccs([]);
    }
  }
  useEffect(() => { loadVaccs(); }, [cowId, dateFilter]);
  useEffect(() => { const t = setTimeout(loadVaccs, 250); return () => clearTimeout(t); }, [search]);

  /* helpers */
  const onDeleteRecord = async (row) => {
    if (!confirm(`Delete record for ${(row.cow?.name || row.cow?.tagId || "cow")} on ${fmtDate(row.date)}?`)) return;
    try {
      await api.delete(`/health/${row._id}`);
      await Promise.all([loadHealth(), loadVaccs()]);
    } catch {
      alert("Failed to delete");
    }
  };

  const soonestVacc = useMemo(() => {
    if (!vaccs.length) return null;
    const v = vaccs[0];
    return { title:`VACCINATION due for ${v.cow?.name || v.cow?.tagId || "Cow"}`, when:fmtDate(v.nextDueDate) };
  }, [vaccs]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Health Records</h1>
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

        {/* Controls Bar */}
        <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search + Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Cow Filter */}
            <div className="relative">
              <select
                value={cowId}
                onChange={(e) => setCowId(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 bg-white border border-gray-300 
                          rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter || ""}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Buttons */}
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

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full table-fixed text-base border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 text-left font-bold text-green-700">Due Date</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Cow</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Medication</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Vet</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Notes</th>
                <th className="py-3 px-6 text-center font-bold text-green-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vaccs.map((r) => (
                <tr key={r._id} className="hover:bg-green-50 transition">
                  <td className="py-3 px-6">{fmtDate(r.nextDueDate)}</td>
                  <td className="py-3 px-6">
                    <span className="font-semibold text-gray-800">{r.cow?.name || r.cow?.tagId || "—"}</span>
                    {r.cow?.tagId && <span className="text-gray-500 text-sm"> ({r.cow.tagId})</span>}
                  </td>
                  <td className="py-3 px-6">{r.medication || r.diagnosis || "—"}</td>
                  <td className="py-3 px-6">{r.vet || "—"}</td>
                  <td className="py-3 px-6">{r.notes || "—"}</td>
                  <td className="py-3 px-6 text-center">
                    <KebabMenu items={[
                      { label: "View Details", onClick: () => setViewVaccRow(r) },
                      { label: "Edit", onClick: () => setEditVaccRow(r) },
                      ...(isDueReached(r.nextDueDate)
                        ? [{ label: "Add to Health Record", onClick: () => setEditHealthRow(vaccToHealthEditable(r)) }]
                        : []),
                      { label: "Delete", danger: true, onClick: () => onDeleteRecord(r) },
                    ]}/>
                  </td>
                </tr>
              ))}
              {!vaccs.length && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">No upcoming vaccinations</td>
                </tr>
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

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full table-fixed text-base border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 text-left font-bold text-green-700">Date</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Cow</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Type</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Vitals</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Notes</th>
                <th className="py-3 px-6 text-left font-bold text-green-700">Vet</th>
                <th className="py-3 px-6 text-center font-bold text-green-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {health.map((r) => (
                <tr key={r._id} className="hover:bg-green-50 transition">
                  <td className="py-3 px-6">{fmtDate(r.date)}</td>
                  <td className="py-3 px-6">
                    <span className="font-semibold text-gray-800">{r.cow?.name || r.cow?.tagId || "—"}</span>
                    {r.cow?.tagId && <span className="text-gray-500 text-sm"> ({r.cow.tagId})</span>}
                  </td>
                  <td className="py-3 px-6">{r.type}</td>
                  <td className="py-3 px-6 text-gray-700">
                    {r.temperatureC ? `Temp: ${Number(r.temperatureC).toFixed(1)}°C` : ""}
                    {r.weightKg ? `${r.temperatureC ? " • " : ""}Wt: ${Number(r.weightKg).toFixed(1)} kg` : ""}
                  </td>
                  <td className="py-3 px-6 text-gray-700">
                    {r.diagnosis || r.notes || (r.symptoms?.length ? r.symptoms.join(", ") : "—")}
                  </td>
                  <td className="py-3 px-6">{r.vet || "—"}</td>
                  <td className="py-3 px-6 text-center">
                    <KebabMenu items={[
                      { label: "View Details", onClick: () => setViewHealthRow(r) },
                      { label: "Edit", onClick: () => setEditHealthRow(r) },
                      { label: "Delete", danger:true, onClick: () => onDeleteRecord(r) },
                    ]}/>
                  </td>
                </tr>
              ))}
              {!health.length && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">No records found</td>
                </tr>
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
