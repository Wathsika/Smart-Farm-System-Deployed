// src/pages/livestock/cow.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEllipsisV,
  FaVenus,
  FaMars,
} from "react-icons/fa";
import { ActionsMenuPortal, CowFormModal, ViewCowModal } from "./CowModals";
import { api } from "../../lib/api";

/*  UI bits  */
const StatusPill = ({ children, tone = "active" }) => (
  <span
    className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 ${
      tone === "active"
        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
        : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200"
    }`}
  >
    {children}
  </span>
);

/*  date helpers  */
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (isNaN(+birth)) return "Invalid Date";

  const today = new Date();
  const bUTC = Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const tUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  const ms = tUTC - bUTC;
  if (ms < 0) return "Invalid Date";

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days < 31) return days === 1 ? "1 day" : `${days} days`;

  const years = today.getFullYear() - birth.getFullYear();
  let months = years * 12 + (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;

  if (months < 12) return months === 1 ? "1 month" : `${months} months`;

  const fullYears = Math.floor(months / 12);
  return fullYears === 1 ? "1 year" : `${fullYears} years`;
};

const sortByCowIdAsc = (list = []) =>
  [...list].sort((a, b) => {
    const na = parseInt((a.cowId || "").replace(/\D/g, "")) || 0;
    const nb = parseInt((b.cowId || "").replace(/\D/g, "")) || 0;
    if (na !== nb) return na - nb;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

export default function CowProfilePage() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  // add/edit modal
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [initialForm, setInitialForm] = useState(null);

  // actions menu
  const [openMenuForId, setOpenMenuForId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const { totalCount, femaleCount, maleCount } = React.useMemo(() => {
    const female = cows.filter(c =>
      String(c.gender || "").toLowerCase().startsWith("f")
    ).length;
    const male = cows.filter(c =>
      String(c.gender || "").toLowerCase().startsWith("m")
    ).length;
    return { totalCount: cows.length, femaleCount: female, maleCount: male };
  }, [cows]);

  /*  load  */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cows");
        setCows(sortByCowIdAsc(Array.isArray(data) ? data : []));
      } catch (err) {
        setError("Failed to load cows. Please check API connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /*  filters  */
  const filteredCows = cows.filter((c) => {
    const matchesSearch = Object.values(c).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesGender =
      genderFilter === "All"
        ? true
        : String(c.gender).toLowerCase() === genderFilter.toLowerCase();
    return matchesSearch && matchesGender;
  });

  /*  actions menu  */
  function openMenu(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 192;
    const GAP = 6;
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    let top = rect.bottom + GAP;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const MENU_HEIGHT = 132;
    if (top + MENU_HEIGHT > viewportHeight - 8) {
      top = rect.top - MENU_HEIGHT - GAP;
    }
    setMenuPos({ top, left });
    setOpenMenuForId(id);
  }
  function closeMenu() {
    setOpenMenuForId(null);
    setMenuPos(null);
  }

  /*  add  */
  function openAddModal() {
    setInitialForm({
      name: "",
      breed: "",
      gender: "Female",
      bday: "",
      photoUrl: "",
    });
    setAddOpen(true);
  }
  async function submitAdd(values) {
    setSaving(true);
    try {
      const { data: created } = await api.post("/cows", values);
      setCows((prev) => [created, ...prev]);
      setAddOpen(false);
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }

  /*  edit  */
  function openEditModal(id) {
    const c = cows.find((x) => x._id === id);
    if (!c) return;
    const b = c.bday ? new Date(c.bday) : null;
    const bstr = b && !isNaN(+b) ? b.toISOString().slice(0, 10) : "";
    setEditId(id);
    setInitialForm({
      name: c.name || "",
      breed: c.breed || "",
      gender: c.gender || "Female",
      bday: bstr,
      photoUrl: c.photoUrl || "",
    });
    setEditOpen(true);
    closeMenu();
  }
  async function submitEdit(values) {
    setSaving(true);
    setError("");
    try {
      const { data: updated } = await api.put(`/cows/${editId}`, values);
      setCows((prev) => prev.map((c) => (c._id === editId ? updated : c)));
      setEditOpen(false);
      setEditId(null);
    } catch (err) {
      setError(err.message || "Could not update cow.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- delete ---------- */
  async function deleteCow(id) {
    if (!window.confirm("Are you sure you want to delete this cow?")) return;
    try {
      await api.delete(`/cows/${id}`);
      setCows((prev) => prev.filter((c) => c._id !== id));
      closeMenu();
    } catch {
      setError("Failed to delete cow.");
    }
  }

  /* ---------- view ---------- */
  function openViewModal(id) {
    const c = cows.find((x) => x._id === id);
    if (!c) return;
    setViewData(c);
    setViewOpen(true);
    closeMenu();
  }
  function closeViewModal() {
    setViewOpen(false);
    setViewData(null);
  }
  function editFromView() {
    if (!viewData?._id) return;
    const id = viewData._id;
    closeViewModal();
    setTimeout(() => openEditModal(id), 0);
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Cow Profiles</h1>
        <p className="text-gray-500">Manage and view details of all cows.</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Total: {totalCount}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-800 border border-pink-200">
            <FaVenus className="text-pink-500" /> {femaleCount} Female
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <FaMars className="text-blue-500" /> {maleCount} Male
          </span>
        </div>
      </header>

      <main className="relative">
      {/* Controls Bar */}
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search + Filter ekama row ekak */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
            />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-black"
          >
            <option>All</option>
            <option>Female</option>
            <option>Male</option>
          </select>
        </div>

        {/* Add button eka separate */}
        <button
          onClick={openAddModal}
          className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700"
        >
          + Add Cow
        </button>
      </div>

        {/*  Table */}
        <div className="bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/50 overflow-hidden">
          {error && (
            <div className="m-6 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center">
              <p className="text-gray-500 font-medium">Loading cow data…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="py-5 px-6 text-left text-sm font-bold text-green-800 uppercase tracking-wider">
                      Tag Number
                    </th>
                    <th className="py-5 px-6 text-left text-sm font-bold text-green-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-5 px-6 text-left text-sm font-bold text-green-800 uppercase tracking-wider">
                      Breed
                    </th>
                    <th className="py-5 px-6 text-left text-sm font-bold text-green-800 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="py-5 px-6 text-left text-sm font-bold text-green-800 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="py-5 px-6 text-left text-sm font-bold text-green-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-5 px-6 text-center text-sm font-bold text-green-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCows.map((cow) => (
                    <tr
                      key={cow._id}
                      className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                          <span className="font-bold text-gray-800">
                            {cow.cowId || cow.tagId || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800">
                          {cow.name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{cow.breed}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {cow.gender === "Female" ? (
                            <FaVenus className="text-pink-500 text-sm" />
                          ) : (
                            <FaMars className="text-blue-500 text-sm" />
                          )}
                          <span className="text-gray-700">{cow.gender}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700 font-medium">
                          {calculateAge(cow.bday)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusPill tone={cow.status}>{cow.status}</StatusPill>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          data-actions-trigger="true"
                          onClick={(e) => openMenu(e, cow._id)}
                          className="group/btn relative p-3 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-100 transition-all duration-200 transform hover:scale-110"
                          aria-label={`Open actions for ${cow.name}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200"></div>
                          <FaEllipsisV className="relative z-10" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredCows.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 px-6 text-center">
                        <p className="text-gray-500 font-medium text-lg">
                          No cows found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Try adjusting your search or filter criteria
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ActionsMenuPortal
        openForId={openMenuForId}
        position={menuPos}
        onClose={closeMenu}
        onView={() => openViewModal(openMenuForId)}
        onEdit={() => openEditModal(openMenuForId)}
        onDelete={() => deleteCow(openMenuForId)}
      />

      {addOpen && (
        <CowFormModal
          title="Add New Cow"
          initial={initialForm}
          saving={saving}
          onClose={() => setAddOpen(false)}
          onSubmit={submitAdd}
        />
      )}

      {editOpen && (
        <CowFormModal
          title="Edit Cow"
          initial={initialForm}
          saving={saving}
          onClose={() => setEditOpen(false)}
          onSubmit={submitEdit}
        />
      )}

      {viewOpen && viewData && (
        <ViewCowModal
          data={viewData}
          age={calculateAge(viewData.bday)}
          onClose={closeViewModal}
          onEdit={editFromView}
        />
      )}
    </div>
  );
}