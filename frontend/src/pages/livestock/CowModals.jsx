// src/components/livestock/CowModals.jsx
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";

/* ----- Right‑click / kebab actions menu via portal ----- */
export function ActionsMenuPortal({ openForId, position, onClose, onEdit, onView, onDelete }) {
  if (!openForId || !position) return null;

  useEffect(() => {
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
  }, [onClose]);

  const style = { position: "fixed", top: position.top, left: position.left, zIndex: 9999 };

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

/* ----- Reusable Add/Edit modal ----- */
export function CowFormModal({ title, initial, saving, onClose, onSubmit }) {
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
      bday: initial?.bday || "",
      photoFile: null,
      photoPreviewUrl: initial?.photoUrl || "",
    });
  }, [initial]);

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((f) => ({ ...f, photoFile: null, photoPreviewUrl: "" }));
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photoFile: file, photoPreviewUrl: url }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      breed: form.breed.trim(),
      gender: form.gender,
      bday: form.bday,
      photoFile: form.photoFile,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Photo (optional) :</label>
            <input
              type="file"
              accept="image/*"
              onChange={pickPhoto}
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
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}  

  /* ----- Read‑only View modal ----- */
export function ViewCowModal({ data, age, onClose, onEdit }) {
  if (!data) return null;
  const photo =
    data.photoUrl ||
    "https://dummyimage.com/160x160/edf2f7/68727d.png&text=Cow";

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Cow Profile</h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <img
              src={photo}
              alt={data.name || "Cow"}
              className="w-32 h-32 rounded-xl object-cover border"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-base font-semibold text-gray-800">{data.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Breed</p>
                <p className="text-base font-semibold text-gray-800">{data.breed || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-base font-semibold text-gray-800">{data.gender || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="text-base font-semibold text-gray-800">{age || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500">Birthday</p>
                <p className="text-base font-semibold text-gray-800">
                  {data.bday ? new Date(data.bday).toISOString().slice(0, 10) : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="rounded-md px-4 py-2 bg-green-600 text-white hover:bg-green-700"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


