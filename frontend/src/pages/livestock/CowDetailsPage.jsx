// src/pages/livestock/CowDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { FaArrowLeft, FaVenus, FaMars, FaBirthdayCake, FaEdit, FaTimes, FaSave, FaQrcode, FaDownload } from "react-icons/fa";

// helper for age 
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (isNaN(+birth)) return "Invalid Date";

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) return `${years} year(s)`;
  if (months > 0) return `${months} month(s)`;
  return `${days} day(s)`;
};

export default function CowDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    gender: "Female",
    bday: "",
  });

  // check query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setEditMode(params.get("edit") === "true");
  }, [location.search]);

  // fetch cow by id
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/cows/${id}`);
        setCow(data);
      } catch (err) {
        setError("Failed to load cow profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (editMode && cow) {
      setFormData({
        name: cow.name || "",
        breed: cow.breed || "",
        gender: cow.gender || "Female",
        bday: cow.bday ? cow.bday.slice(0, 10) : "",
      });
      setErrors({}); 
    }
  }, [editMode, cow]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name" || name === "breed") {
      const regex = /^[A-Za-z\s]*$/; 
      if (regex.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  function validateForm(data) {
    const errs = {};
    const { name, breed, bday } = data;

    if (!name.trim()) errs.name = "Name is required";
    if (!breed.trim()) errs.breed = "Breed is required";

    if (!bday) errs.bday = "Birth date is required";
    else {
      const d = new Date(bday);
      const today = new Date();
      if (d > today) errs.bday = "Birth date cannot be in the future";
    }
    return errs;
  }

  async function submitEdit(e) {
    e.preventDefault();
    // Validate from the state
    const errs = validateForm(formData);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("breed", formData.breed);
      apiFormData.append("gender", formData.gender);
      apiFormData.append("bday", formData.bday);
      
      const photoFile = e.target.elements.photo.files[0];
      if (photoFile) {
        apiFormData.append("photo", photoFile);
      }

      const { data } = await api.put(`/cows/${id}`, apiFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setCow(data);
      setEditMode(false);
      navigate(`/admin/livestock/${id}`);
    } catch (err) {
      alert("Failed to update cow");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadQR() {
  if (!cow?.qrUrl) {
    alert("No QR code available to download.");
    return;
  }

  const qrUrl = cow.qrUrl.startsWith("http")
    ? cow.qrUrl
    : `${window.location.origin}${cow.qrUrl}`;

  try {
    // Fetch the image data as a blob
    const response = await fetch(qrUrl, { mode: "cors" });
    const blob = await response.blob();

    // Create a temporary download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cow.name || "cow"}_QR.png`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("QR download failed:", error);
    alert("Failed to download QR image. Please try again.");
  }
}

    
  if (loading) { 
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
            <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
            </div>
        </div>
    );
  }

  if (error) { 
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin/livestock")}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Livestock
          </button>
        </div>
      </div>
    );
  }

  if (!cow) { 
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <p className="text-xl text-gray-600">Cow not found</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/admin/livestock")}
          className="group flex items-center gap-2 mb-6 text-green-700 hover:text-green-900 transition-all duration-300 font-medium"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="group-hover:underline">Back to Livestock</span>
        </button>

        {!editMode ? (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
            {/* Display View */}
            <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-8 py-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
                  {cow.name || "Cow Profile"}
                </h1>
                <p className="text-sm text-gray-100">Cow Profile</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/3 flex flex-col gap-6 items-center">
                  <div className="relative group w-72 h-72">
                    {cow.photoUrl ? (
                        <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                        <img
                            src={cow.photoUrl}
                            alt={cow.name}
                            className="relative w-72 h-72 object-cover rounded-xl shadow-2xl border-4 border-white transform transition-all duration-300 group-hover:scale-105"
                        />
                        </>
                    ) : (
                        <div className="w-72 h-72 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 rounded-xl border-2 border-dashed border-gray-300">
                        <svg className="w-20 h-20 mb-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                            />
                        </svg>
                        <p className="font-medium">No Photo Available</p>
                        </div>
                    )}
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg w-72">
                    <div className="flex items-center gap-2 mb-3">
                        <FaQrcode className="text-blue-600 text-xl" />
                        <p className="text-sm font-semibold text-blue-700 uppercase">Profile QR Code</p>
                    </div>
                    {cow.qrUrl ? (
                      <div className="bg-white p-4 rounded-xl shadow-inner flex flex-col items-center">
                        <img
                          src={cow.qrUrl?.startsWith("http") ? cow.qrUrl : `${window.location.origin}${cow.qrUrl}`}
                          alt={`${cow.name} QR`}
                          className="w-full h-40 object-contain mb-3"
                        />
                        <button
                          onClick={handleDownloadQR}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all"
                        >
                          <FaDownload className="text-xs" /> Download QR
                        </button>
                      </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center bg-white rounded-xl text-gray-400 border-2 border-dashed border-gray-300">
                        <FaQrcode className="text-3xl mb-2" />
                        <p className="text-sm">No QR Code</p>
                        </div>
                    )}
                    </div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tag ID</p>
                    <p className="text-lg font-semibold text-gray-900">{cow.cowId || "—"}</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Breed</p>
                    <p className="text-lg font-semibold text-gray-900">{cow.breed || "—"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Gender</p>
                        <div className="flex items-center gap-2">
                        {cow.gender === "Female" ? (
                            <div className="bg-pink-500 p-2 rounded-full">
                            <FaVenus className="text-white text-lg" />
                            </div>
                        ) : (
                            <div className="bg-blue-500 p-2 rounded-full">
                            <FaMars className="text-white text-lg" />
                            </div>
                        )}
                        <span className="text-base font-semibold text-gray-900">{cow.gender}</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Age</p>
                        <p className="text-base font-semibold text-gray-900">{calculateAge(cow.bday)}</p>
                        {cow.bday && (
                        <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                            <FaBirthdayCake className="text-rose-500" />
                            {new Date(cow.bday).toLocaleDateString()}
                        </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end mt-4 gap-3">
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium">
                        <FaEdit className="text-sm" />Edit Profile
                    </button>    
                    <button
                        onClick={() => {
                        if (window.confirm("Are you sure you want to delete this cow profile?")) {
                            // TODO: api.delete(`/cows/${id}`)
                            alert("Cow deleted (connect API here)");
                            navigate("/admin/livestock");
                        }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium">
                        <FaTimes className="text-sm" />Delete
                    </button>
                    </div>
                </div>
                </div>
              </div>
            </div>
        </div>
        ) : (
          //edit form  
          <form
            onSubmit={submitEdit}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 space-y-8 transform transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Edit Cow Profile</h2>
              <FaEdit className="text-green-600 text-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                <input
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-200"}`}
                  required
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Breed */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Breed</label>
                <input
                  name="breed"
                  value={formData.breed} 
                  onChange={handleInputChange}
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none ${errors.breed ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-200"}`}
                  required
                />
                {errors.breed && <p className="text-xs text-red-600">{errors.breed}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Gender</label>
                <select
                  name="gender"
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-200 outline-none"
                >
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>

              {/* Birth Date */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Birth Date</label>
                <input
                  type="date"
                  name="bday"
                  value={formData.bday} 
                  onChange={handleInputChange} 
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm outline-none ${errors.bday ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-200"}`}
                  required
                />
                {errors.bday && <p className="text-xs text-red-600">{errors.bday}</p>}
              </div>
            </div>

            {/* Photo  */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors duration-300">
                <div className="flex items-center gap-6">
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    className="text-sm text-gray-600  file:mr-4 file:py-3 file:px-6   file:rounded-lg file:border-0 file:bg-green-600 file:text-white  hover:file:bg-green-700  cursor-pointer"
                  />
                  {cow.photoUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={cow.photoUrl}
                        alt="Current Cow"
                        className="h-24 w-24 object-cover rounded-lg border shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current Photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => { setEditMode(false); navigate(`/admin/livestock/${id}`); }}
                className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
              >
                <FaTimes />Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}