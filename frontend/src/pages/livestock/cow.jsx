// src/pages/livestock/cow.jsx
import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaEllipsisV,
  FaVenus,
  FaMars,
  FaEye, FaPencilAlt, FaTrash
} from "react-icons/fa";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

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

const ActionsMenuPortal = React.forwardRef(
  function ActionsMenuPortal({ openForId, position, onClose, onView, onEdit, onDelete, container }, ref) {
    if (!openForId || !position) return null;

    return createPortal(
      <div
        ref={ref}
        style={{ position: "absolute", top: position.top, left: position.left, zIndex: 9999 }}
        className="w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <ul className="py-2">
          <li>
            <button onClick={onView} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50">
              <FaEye className="w-4 h-4" /> View Profile
            </button>
          </li>
          <li>
            <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50">
              <FaPencilAlt className="w-4 h-4" /> Edit Profile
            </button>
          </li>
          <li>
            <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50">
              <FaTrash className="w-4 h-4" /> Delete Cow
            </button>
          </li>
        </ul>
      </div>,
      container || document.body
    );
  }
);


function CowFormModal({ title, initial, saving, onClose, onSubmit }) {
  const todayISO = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [errors, setErrors] = React.useState({});
  const [apiError, setApiError] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    breed: "",
    gender: "Female",
    bday: "",
    photoFile: null,
    photoPreviewUrl: "",
  });

  React.useEffect(() => {
    setForm({
      name: initial?.name || "",
      breed: initial?.breed || "",
      gender: initial?.gender || "Female",
      bday: initial?.bday
        ? new Date(initial.bday).toISOString().slice(0, 10)
        : "",
      photoFile: null,
      photoPreviewUrl: initial?.photoUrl || "",
    });
    setErrors({});
    setApiError("");
  }, [initial]);

  const validate = (draft) => {
    const e = {};
    const regex = /^[a-zA-Z0-9\s]+$/;
    if (!draft.name.trim()) e.name = "Name is required";
    else if (!regex.test(draft.name.trim())) e.name = "Name cannot contain symbols";
    if (!draft.breed.trim()) e.breed = "Breed is required";
    else if (!regex.test(draft.breed.trim())) e.breed = "Breed cannot contain symbols";
    if (!draft.bday) {
      e.bday = "Birth date is required";
    } else {
      const d = new Date(draft.bday + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(+d)) e.bday = "Invalid birth date";
      else if (d > today) e.bday = "Birth date cannot be in the future";
    }
    return e;
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((f) => ({ ...f, photoFile: null, photoPreviewUrl: "" }));
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photoFile: file, photoPreviewUrl: url }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError("");
    const draft = {
      name: form.name.trim(),
      breed: form.breed.trim(),
      gender: form.gender,
      bday: form.bday,
      photoFile: form.photoFile,
      photoUrl: !form.photoFile ? initial?.photoUrl : undefined,
    };
    const v = validate(draft);
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      await onSubmit(draft);
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || "Failed to save cow.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
          <button onClick={onClose} className="ml-3 -mt-1 text-gray-500 hover:text-gray-700" aria-label="Close"> × </button>
        </div>
        {apiError && <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm"> • {apiError} </div>}
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-bold mb-2">Name</label>
            <input value={form.name} onChange={(e) => { const val = e.target.value; if (/^[a-zA-Z0-9\s]*$/.test(val)) { setForm({ ...form, name: val }); } }} className={`w-full h-12 rounded-xl border-2 px-4 transition-all outline-none ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-green-500 focus:bg-green-50"}`} placeholder="e.g., Molly" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Birth Date</label>
            <input type="date" value={form.bday} max={todayISO} onChange={(e) => setForm({ ...form, bday: e.target.value })} className={`w-full h-12 rounded-xl border-2 px-4 transition-all outline-none ${errors.bday ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-green-500 focus:bg-green-50"}`} />
            {errors.bday && <p className="mt-1 text-sm text-red-600">{errors.bday}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={`w-full h-12 rounded-xl border-2 px-4 transition-all outline-none ${errors.gender ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-green-500 focus:bg-green-50"}`} >
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Breed</label>
              <input value={form.breed} onChange={(e) => { const val = e.target.value; if (/^[a-zA-Z0-9\s]*$/.test(val)) { setForm({ ...form, breed: val }); } }} className={`w-full h-12 rounded-xl border-2 px-4 transition-all outline-none ${errors.breed ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-green-500 focus:bg-green-50"}`} placeholder="e.g., Friesian" />
              {errors.breed && <p className="mt-1 text-sm text-red-600">{errors.breed}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-sm font-bold mb-2">Photo (optional)</label>
              <input type="file" accept="image/*" onChange={pickPhoto} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer" />
            </div>
            {form.photoPreviewUrl && (<div className="flex justify-center md:justify-end"> <img src={form.photoPreviewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-xl border shadow-md" /> </div>)}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-900 font-bold py-2 px-5 rounded-lg hover:bg-gray-300" > Cancel </button>
            <button disabled={saving} className="bg-green-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-700 disabled:opacity-50" > {saving ? "Saving..." : "Save"} </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function CowProfilePage() {
  const containerRef = React.useRef(null);  
  const menuRef = React.useRef(null);

  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [initialForm, setInitialForm] = useState(null);

  const [openMenuForId, setOpenMenuForId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  const navigate = useNavigate();

  const { totalCount, femaleCount, maleCount } = React.useMemo(() => {
    const female = cows.filter(c => String(c.gender || "").toLowerCase().startsWith("f")).length;
    const male = cows.filter(c => String(c.gender || "").toLowerCase().startsWith("m")).length;
    return { totalCount: cows.length, femaleCount: female, maleCount: male };
  }, [cows]);

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

  const filteredCows = React.useMemo(() => {
    return cows.filter((c) => {
      const matchesSearch = Object.values(c).some((v) =>
        String(v).toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesGender = genderFilter === "All" ? true : String(c.gender).toLowerCase() === genderFilter.toLowerCase();
      return matchesSearch && matchesGender;
    });
  }, [cows, searchQuery, genderFilter]);

  function closeMenu() {
    setOpenMenuForId(null);
    setMenuPos(null);
  }

  /*  actions menu  */
  function openMenu(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 192; 
    const MENU_HEIGHT = 132; 
    const GAP = 6;
    let top = rect.bottom + window.scrollY + GAP;
    let left = rect.right + window.scrollX - MENU_WIDTH;
    if (top - window.scrollY + MENU_HEIGHT > window.innerHeight - 8) {
      top = rect.top + window.scrollY - MENU_HEIGHT - GAP;
    }
    if (left - window.scrollX < 8) {
      left = rect.left + window.scrollX;
    }
    setMenuPos({ top, left });
    setOpenMenuForId(id);
  }

  useEffect(() => {
    if (!openMenuForId) return;

    const handleClose = (e) => {
      if (
        (e && e.target && e.target.closest('[data-actions-trigger="true"]')) ||
        (menuRef.current && menuRef.current.contains(e.target))
      ) {
        return;
      }
      closeMenu();
    };

    window.addEventListener('scroll', handleClose, true);
    document.addEventListener('mousedown', handleClose);

    return () => {
      window.removeEventListener('scroll', handleClose, true);
      document.removeEventListener('mousedown', handleClose);
    };
  }, [openMenuForId]);

  /*  add  */
  function openAddModal() {
    setInitialForm({ name: "", breed: "", gender: "Female", bday: "", photoUrl: "" });
    setAddOpen(true);
  }

  const buildCowPayload = (values) => {
    const payload = new FormData();
    if (values.name !== undefined) payload.append("name", values.name);
    if (values.breed !== undefined) payload.append("breed", values.breed);
    if (values.gender !== undefined) payload.append("gender", values.gender);
    if (values.bday !== undefined) payload.append("bday", values.bday);
    if (values.photoFile) payload.append("photo", values.photoFile);
    return payload;
  };
  
  async function submitAdd(values) {
   setSaving(true);
    setError("");
    try {
      // 1) create cow (backend also generates the QR)
      const payload = buildCowPayload(values);
      const { data: created } = await api.post("/cows", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2) update local list with server response
      setCows((prev) => sortByCowIdAsc([created, ...prev]));
      setAddOpen(false);
    } catch (err) {
      setError(err.message || "Could not add the new cow.");
      console.error("Failed to add cow:", err);
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

  /* ---------- view/edit navigation ---------- */
  function handleView(id) {
    navigate(`/admin/livestock/${id}`);
  }
  function handleEdit(id) {
    navigate(`/admin/livestock/${id}?edit=true`);
  }

  return (
    <div ref={containerRef} className="relative min-h-screen w-full px-4 sm:px-6 md:px-8">
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
        <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cows..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[a-zA-Z0-9\s-]*$/.test(val)) {
                      setSearchQuery(val);
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black text-sm"
                />
            </div>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-black text-sm" >
              <option>All</option>
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
          <button onClick={openAddModal} className="w-full sm:w-auto px-5 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 text-sm" >
            + Add Cow
          </button>
        </div>
        <div className="bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/50">
          {error && (<div className="m-6 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 shadow-sm"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div>{error}</div></div>)}
          {loading ? (<div className="p-16 text-center"><p className="text-gray-500 font-medium">Loading cow data…</p></div>) : (<div className="overflow-x-auto"><table className="min-w-full"><thead><tr className="bg-white border-b border-gray-200"><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Tag Number</th><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Name</th><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Breed</th><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Gender</th><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Age</th><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Status</th><th className="px-2 py-3 sm:px-6 sm:py-5 text-left text-xs sm:text-sm font-bold text-green-800 uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredCows.map((cow) => (<tr key={cow._id} className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200"><td className="px-2 py-3 sm:px-6 sm:py-4"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-200"></div><span className="font-bold text-gray-800">{cow.cowId || cow.tagId || "N/A"}</span></div></td><td className="px-2 py-3 sm:px-6 sm:py-4"><span className="font-medium text-gray-800">{cow.name}</span></td><td className="px-2 py-3 sm:px-6 sm:py-4"><span className="text-gray-700">{cow.breed}</span></td><td className="px-2 py-3 sm:px-6 sm:py-4"><div className="flex items-center gap-2">{cow.gender === "Female" ? (<FaVenus className="text-pink-500 text-sm" />) : (<FaMars className="text-blue-500 text-sm" />)}<span className="text-gray-700">{cow.gender}</span></div></td><td className="px-2 py-3 sm:px-6 sm:py-4"><span className="text-gray-700 font-medium">{calculateAge(cow.bday)}</span></td><td className="px-2 py-3 sm:px-6 sm:py-4"><StatusPill tone={cow.status}>{cow.status}</StatusPill></td><td className="px-2 py-3 sm:px-6 sm:py-4 text-center"><div className="flex justify-center"><button data-actions-trigger="true" onClick={(e) => openMenu(e, cow._id)} className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-100 transition-all duration-200" aria-label={`Open actions for ${cow.name}`}><div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-200"></div><FaEllipsisV className="relative z-10 w-4 h-4" /></button></div></td></tr>))}{filteredCows.length === 0 && (<tr><td colSpan="7" className="py-16 px-6 text-center"><p className="text-gray-500 font-medium text-lg">No cows found</p><p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p></td></tr>)}</tbody></table></div>)}
        </div>
      </main>
      {/* Actions menu */}
      <ActionsMenuPortal
        ref={menuRef} 
        container={document.body} 
        openForId={openMenuForId}
        position={menuPos}
        onClose={closeMenu}
        onView={() => handleView(openMenuForId)}
        onEdit={() => handleEdit(openMenuForId)}
        onDelete={() => deleteCow(openMenuForId)}
      />
      {addOpen && (<CowFormModal title="Add New Cow" initial={initialForm} saving={saving} onClose={() => setAddOpen(false)} onSubmit={submitAdd} />)}
    </div>
  );
}