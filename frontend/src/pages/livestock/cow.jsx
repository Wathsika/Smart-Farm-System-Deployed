// src/pages/livestock/cow.jsx
import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEllipsisV } from "react-icons/fa";
import { ActionsMenuPortal, CowFormModal, ViewCowModal  } from "./CowModals";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const StatusPill = ({ children, tone = "active" }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      tone === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
    }`}
  >
    {children}
  </span>
);

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (isNaN(+birth)) return "Invalid Date";
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) months -= 1;
  const totalMonths = years * 12 + months;
  if (totalMonths < 0) return "Invalid Date";
  if (totalMonths < 12) return totalMonths === 1 ? "1 month" : `${totalMonths} months`;
  const fullYears = Math.floor(totalMonths / 12);
  return fullYears === 1 ? "1 year" : `${fullYears} years`;
};

export default function CowProfilePage() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  // add/edit modal toggles + data
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


  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/cows`);
        if (!r.ok) throw new Error("Could not fetch data");
        const data = await r.json();
        setCows(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load cows. Please check API connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  function openMenu(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 192;
    const GAP = 6;
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    let top = rect.bottom + GAP;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
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

  // ----- Add -----
  function openAddModal() {
    setInitialForm({ name: "", breed: "", gender: "Female", bday: "", photoUrl: "" });
    setAddOpen(true);
  }
  async function submitAdd(values) {
    setSaving(true);
    setError("");
    try {
      // JSON only for now. Switch to FormData if you add file upload.
      const r = await fetch(`${API}/api/cows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!r.ok) throw new Error("Backend validation failed");
      const created = await r.json();
      setCows((prev) => [created, ...prev]);
      setAddOpen(false);
    } catch (err) {
      setError(err.message || "Could not add cow.");
    } finally {
      setSaving(false);
    }
  }

  // ----- Edit -----
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
      const r = await fetch(`${API}/api/cows/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!r.ok) throw new Error("Failed to update cow");
      const updated = await r.json();
      setCows((prev) => prev.map((c) => (c._id === editId ? updated : c)));
      setEditOpen(false);
      setEditId(null);
    } catch (err) {
      setError(err.message || "Could not update cow.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCow(id) {
    if (!window.confirm("Are you sure you want to delete this cow?")) return;
    try {
      await fetch(`${API}/api/cows/${id}`, { method: "DELETE" });
      setCows((prev) => prev.filter((c) => c._id !== id));
      closeMenu();
    } catch {
      setError("Failed to delete cow.");
    }
  }

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

// From the View modal, jump to Edit prefilled
function editFromView() {
  if (!viewData?._id) return;
  const id = viewData._id;
  closeViewModal();
  // tiny delay to ensure state toggles don’t clash visually
  setTimeout(() => openEditModal(id), 0);
}

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cow Profiles</h1>
          <p className="text-gray-500 mt-1">
            <span className="font-medium">Total:</span> {filteredCows.length}{" "}
            <span className="font-medium">cows</span>
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-36 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            title="Filter by gender"
          >
            <option>All</option>
            <option>Female</option>
            <option>Male</option>
          </select>

          <button
            onClick={openAddModal}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2"
          >
            <FaPlus />
            <span>Add Cow</span>
          </button>
        </div>
      </header>

      <main className="bg-white shadow-md rounded-lg p-6">
        {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-3">{error}</div>}

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading cow data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm">
                  <th className="py-3 px-4 font-semibold">Tag Number</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Breed</th>
                  <th className="py-3 px-4 font-semibold">Gender</th>
                  <th className="py-3 px-4 font-semibold">Age</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredCows.map((cow) => (
                  <tr key={cow._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{cow.tagId || "N/A"}</td>
                    <td className="py-3 px-4">{cow.name}</td>
                    <td className="py-3 px-4">{cow.breed}</td>
                    <td className="py-3 px-4">{cow.gender}</td>
                    <td className="py-3 px-4">{calculateAge(cow.bday)}</td>
                    <td className="py-3 px-4">
                      <StatusPill tone={cow.status}>{cow.status}</StatusPill>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        data-actions-trigger="true"
                        onClick={(e) => openMenu(e, cow._id)}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
                        aria-label={`Open actions for ${cow.name}`}
                      >
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-6 px-4 text-center text-gray-500">
                      No cows found for this search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

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
