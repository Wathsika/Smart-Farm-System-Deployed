import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaPencilAlt, FaCalendarAlt, FaVenus, FaMars, FaBirthdayCake, FaEye, FaTrash } from 'react-icons/fa';

const API_HOST = "http://localhost:5001";

const resolvePhotoUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith("/") ? url : '/${url}';
  return '${API_HOST}${normalized}';
};

// Cow SVG Icon Component
const CowIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9v2c0 .55-.45 1-1 1s-1-.45-1-1V9c0-4.97 4.03-9 9-9s9 4.03 9 9v2c0 .55-.45 1-1 1s-1-.45-1-1V9c0-3.87-3.13-7-7-7z"/>
    <path d="M19 11c-.55 0-1 .45-1 1v4c0 3.31-2.69 6-6 6s-6-2.69-6-6v-4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 4.42 3.58 8 8 8s8-3.58 8-8v-4c0-.55-.45-1-1-1z"/>
    <circle cx="9" cy="13" r="1"/>
    <circle cx="15" cy="13" r="1"/>
    <path d="M12 17c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z"/>
  </svg>
);

// ActionsMenuPortal component (original functionality maintained)
export function ActionsMenuPortal({ openForId, position, onClose, onEdit, onView, onDelete }) {
  const shouldRender = Boolean(openForId && position);

  useEffect(() => {
    if (!shouldRender) return undefined;
    const handleClick = (e) => {
      const inside =
        e.target.closest?.('[data-actions-menu="true"]') ||
        e.target.closest?.('[data-actions-trigger="true"]');
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
  }, [onClose, shouldRender]);

  if (!shouldRender) return null;

  const style = { position: "fixed", top: position.top, left: position.left, zIndex: 9999 };

  return createPortal(
    <div
      data-actions-menu="true"
      style={style}
      className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm"
    >
      <ul className="py-2">
        <li>
          <button
            onClick={onView}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200"
            data-actions-trigger="true"
          >
            <FaEye className="w-4 h-4" /> View Profile
          </button>
        </li>
        <li>
          <button
            onClick={onEdit}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 transition-all duration-200"
            data-actions-trigger="true"
          >
            <FaPencilAlt className="w-4 h-4" /> Edit
          </button>
        </li>
        <li>
          <button
            onClick={onDelete}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200"
            data-actions-trigger="true"
          >
            <FaTrash className="w-4 h-4" /> Delete
          </button>
        </li>
      </ul>
    </div>,
    document.body
  );
}

// Enhanced CowFormModal with better UI
export function CowFormModal({ title, initial, saving, onClose, onSubmit }) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    name: "",
    breed: "",
    gender: "Female",
    bday: "",
    photoFile: null,
    photoPreviewUrl: "",
  });

  useEffect(() => {
    setForm({
      name: initial?.name || "",
      breed: initial?.breed || "",
      gender: initial?.gender || "Female",
      bday: initial?.bday ? new Date(initial.bday).toISOString().slice(0, 10) : "",
      photoFile: null,
      photoPreviewUrl: resolvePhotoUrl(initial?.photoUrl) || "",
    });
    setErrors({});
    setApiError("");
  }, [initial]);

  const validate = (draft) => {
    const e = {};
    const nameBreedRegex = /^[a-zA-Z0-9\s]+$/; 

    if (!draft.name.trim()) {
      e.name = "Name is required";
    } else if (!nameBreedRegex.test(draft.name.trim())) {
      e.name = "Name cannot contain symbols";
    }

    if (!draft.breed.trim()) {
      e.breed = "Breed is required";
    } else if (!nameBreedRegex.test(draft.breed.trim())) {
      e.breed = "Breed cannot contain symbols";
    }

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
    };
    const v = validate(draft);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      await onSubmit(draft);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save. Please try again.";
      setApiError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        {/* Simple header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
          <button 
            onClick={onClose} 
            className="ml-3 -mt-1 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
            • {apiError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">Name</label>
            <input
              value={form.name}
              onChange={(e) => {
                const val = e.target.value;
                // block symbols (only letters, numbers, spaces)
                if (/^[a-zA-Z0-9\s]*$/.test(val)) {
                  setForm({ ...form, name: val });
                }
              }}
              className={`w-full h-12 rounded-xl border-2 px-4 bg-white focus:outline-none transition-all duration-200 ${
                errors.name
                  ? "border-red-400 focus:border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-[#22c55e] focus:bg-green-50"
              }`}
              placeholder="e.g., Molly"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                {errors.name}
              </p>
            )}
          </div>

          {/* Birth date */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">Birth Date</label>
            <input
              data-field="bday"
              type="date"
              value={form.bday}
              onChange={(e) => setForm({ ...form, bday: e.target.value })}
              max={todayISO}
              className={`w-full h-12 rounded-xl border-2 px-4 bg-white focus:outline-none transition-all duration-200 ${
                errors.bday ? "border-red-400 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-[#22c55e] focus:bg-green-50"
              }`}
            />
            {errors.bday && <p className="mt-2 text-sm text-red-600 flex items-center gap-2">⚠️ {errors.bday}</p>}
          </div>

          {/* Gender & Breed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full h-12 rounded-xl border-2 border-gray-200 px-4 bg-white focus:outline-none focus:border-[#22c55e] focus:bg-green-50 transition-all duration-200"
              >
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
            {/* Breed */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">Breed</label>
              <input
                value={form.breed}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[a-zA-Z0-9\s]*$/.test(val)) {
                    setForm({ ...form, breed: val });
                  }
                }}
                className={`w-full h-12 rounded-xl border-2 px-4 bg-white focus:outline-none transition-all duration-200 ${
                  errors.breed
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-[#22c55e] focus:bg-green-50"
                }`}
                placeholder="e.g., Friesian"
              />
              {errors.breed && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  {errors.breed}
                </p>
              )}
            </div>
          </div>

          {/* Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Photo (optional)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={pickPhoto} 
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-[#22c55e] file:text-white file:font-semibold hover:file:bg-[#16a34a] file:cursor-pointer cursor-pointer" 
              />
            </div>
            {form.photoPreviewUrl && (
              <div className="flex justify-center md:justify-end">
                <img 
                  src={form.photoPreviewUrl} 
                  alt="Preview" 
                  className="h-24 w-24 object-cover rounded-xl border-2 border-gray-200 shadow-md" 
                />
              </div>
            )}
          </div>

          {/* buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-200 text-gray-900 font-bold py-2 px-5 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              disabled={saving} 
              className="bg-[#16a34a] text-white font-bold py-2 px-5 rounded-lg hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced ViewCowModal with better UI
export function ViewCowModal({ data, age, onClose, onEdit }) {
  if (!data) return null;

  const photo =
    resolvePhotoUrl(data.photoUrl) ||
    "https://dummyimage.com/200x200/f7fafc/4a5568.png&text=Cow";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl min-h-[420px] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-green-600 text-white">
          <h2 className="text-3xl font-semibold">Cow Profile</h2>
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white"
            aria-label="Close"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col sm:flex-row gap-10 items-center sm:items-start">
          {/* Photo */}
          <img
            src={photo}
            alt={data.name || "Cow"}
            className="w-44 h-44 rounded-xl object-cover border shadow-md"
          />

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tag ID</p>
              <p className="text-lg font-semibold text-gray-900">{data.cowId || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Name</p>
              <p className="text-lg font-semibold text-gray-900">{data.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Breed</p>
              <p className="text-lg font-semibold text-gray-900">{data.breed || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Gender</p>
              <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                {data.gender === "Female" ? (
                  <>
                    <FaVenus className="text-pink-500" /> Female
                  </>
                ) : (
                  <>
                    <FaMars className="text-blue-500" /> Male
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Age</p>
              <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {age || "—"}
                {data.bday && (
                  <>
                    <span className="text-gray-300">•</span>
                    <FaBirthdayCake className="text-rose-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(data.bday).toLocaleDateString()}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 font-medium py-1.5 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="bg-green-600 text-white font-medium py-1.5 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}



// Demo component to showcase the modal
export default function CowProfileDemo() {
  const [showModal, setShowModal] = useState(false);
  
  const sampleData = {
    name: "Bella",
    breed: "Holstein Friesian",
    gender: "Female",
    bday: "2021-05-15",
    photoUrl: "https://images.unsplash.com/photo-1560457079-9a6532ccb118?w=400&h=400&fit=crop&crop=face"
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Enhanced Cow Profile Modal</h1>
        <p className="text-gray-600 mb-8">Click the button below to view the enhanced modal design</p>
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          View Cow Profile
        </button>
      </div>

      {showModal && (
        <ViewCowModal
          data={sampleData}
          age={calculateAge(sampleData.bday)}
          onClose={() => setShowModal(false)}
          onEdit={() => {
            alert('Edit functionality would be implemented here');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}