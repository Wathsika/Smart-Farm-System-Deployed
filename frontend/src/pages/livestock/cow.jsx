// src/pages/livestock/cow.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaPlus, FaSearch, FaEllipsisV, FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";

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

/* ---------- Portal Menu ---------- */
function ActionsMenuPortal({ openForId, position, onClose, onEdit, onView, onDelete }) {
  if (!openForId || !position) return null;

  // Close on outside click / ESC / scroll / resize
  useEffect(() => {
    const handleClick = (e) => {
      const inside = e.target.closest?.('[data-actions-menu="true"]') || e.target.closest?.('[data-actions-trigger="true"]');
      if (!inside) onClose();
    };
    const handleKey = (e) => e.key === "Escape" && onClose();
    const handleScroll = () => onClose();
    const handleResize = () => onClose();

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  const style = {
    position: "fixed",
    top: position.top,
    left: position.left,
    zIndex: 9999,
  };

  return createPortal(
    <div
      data-actions-menu="true"
      style={style}
      className="w-48 bg-white rounded-md shadow-lg border border-gray-200"
    >
      <ul className="py-1">
        <li>
          <button
            onClick={onView}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaEye /> View Profile
          </button>
        </li>
        <li>
          <button
            onClick={onEdit}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaPencilAlt /> Edit
          </button>
        </li>
        <li>
          <button
            onClick={onDelete}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <FaTrash /> Delete
          </button>
        </li>
      </ul>
    </div>,
    document.body
  );
}

export default function CowProfilePage() {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Portal menu state
  const [openMenuForId, setOpenMenuForId] = useState(null);
  const [menuPos, setMenuPos] = useState(null); // { top, left }

  const [form, setForm] = useState({
    name: "",
    breed: "",
    gender: "Female",
    bday: "",
    photoFile: null,
    photoPreviewUrl: "",
  });

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

  // search + gender filter
  const filteredCows = cows.filter((c) => {
    const matchesSearch = Object.values(c).some((v) =>
      String(v).toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesGender =
      genderFilter === "All" ? true : String(c.gender).toLowerCase() === genderFilter.toLowerCase();
    return matchesSearch && matchesGender;
  });

  function openMenu(e, id) {
    // Coordinates for fixed-position menu (avoid clipping)
    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 192; // w-48
    const GAP = 6;

    let left = rect.right - MENU_WIDTH; // align right of button to menu right
    if (left < 8) left = 8; // keep inside viewport
    let top = rect.bottom + GAP;

    // If near bottom, flip upward
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const MENU_HEIGHT = 132; // approx; enough for 3 items
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

  async function addCow(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name.trim(),
        breed: form.breed.trim(),
        gender: form.gender,
        bday: form.bday,
      };
      const r = await fetch(`${API}/api/cows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Backend validation failed");
      const created = await r.json();
      setCows((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setForm({ name: "", breed: "", gender: "Female", bday: "", photoFile: null, photoPreviewUrl: "" });
    } catch (err) {
      setError(err.message || "Could not add cow.");
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

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((f) => ({ ...f, photoFile: null, photoPreviewUrl: "" }));
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photoFile: file, photoPreviewUrl: url }));
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cow Profiles</h1>
          <p className="text-gray-500 mt-1">
            <span className="font-medium">Total:</span> {filteredCows.length} <span className="font-medium">cows</span>
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
            onClick={() => setIsModalOpen(true)}
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
                        onClick={(e) =>
                          openMenu(e, cow._id)
                        }
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

      {/* Actions Menu */}
      <ActionsMenuPortal
        openForId={openMenuForId}
        position={menuPos}
        onClose={closeMenu}
        onView={() => {
          // TODO: navigate to profile page
          alert("View profile (coming soon)");
          closeMenu();
        }}
        onEdit={() => {
          alert("Edit " + (cows.find((c) => c._id === openMenuForId)?.name || ""));
          closeMenu();
        }}
        onDelete={() => deleteCow(openMenuForId)}
      />

      {/* Add Cow Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Cow</h2>
            <form onSubmit={addCow} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Name :</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Gender :</label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Breed :</label>
                <input
                  required
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Birth Date :</label>
                <input
                  type="date"
                  required
                  value={form.bday}
                  onChange={(e) => setForm({ ...form, bday: e.target.value })}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              {/* Optional Photo */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Photo (optional) :</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return setForm((f) => ({ ...f, photoFile: null, photoPreviewUrl: "" }));
                    const url = URL.createObjectURL(file);
                    setForm((f) => ({ ...f, photoFile: file, photoPreviewUrl: url }));
                  }}
                  className="mt-1 block w-full text-sm text-gray-700"
                />
                {form.photoPreviewUrl && (
                  <img
                    src={form.photoPreviewUrl}
                    alt="Preview"
                    className="mt-2 h-20 w-20 object-cover rounded-md border"
                  />
                )}
              </div>

              <div className="sm:col-span-2 flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Cow"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
