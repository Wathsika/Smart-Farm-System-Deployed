import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaBirthdayCake,
  FaCalendarAlt,
  FaTag,
  FaVenus,
  FaMars,
  FaSyringe,
  FaHeartbeat,
  FaTint,
} from "react-icons/fa";
import { api } from "../../lib/api";

const genderStyles = {
  Female: { icon: FaVenus, color: "text-pink-500" },
  Male: { icon: FaMars, color: "text-blue-500" },
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateAge = (dob) => {
  if (!dob) return "Unknown";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "Unknown";
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return years > 0
    ? `${years} year${years > 1 ? "s" : ""}`
    : `${months} month${months > 1 ? "s" : ""}`;
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs uppercase text-gray-500 font-semibold">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function CowPublicPage() {
  const { id } = useParams();
  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/cows/${id}`);
        setCow(data);
      } catch (err) {
        setError("Failed to load cow details. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const ageText = useMemo(() => calculateAge(cow?.bday), [cow?.bday]);
   const isFemale = useMemo(
    () =>
      String(cow?.gender || cow?.sex || "")
        .trim()
        .toLowerCase()
        .startsWith("f"),
    [cow?.gender, cow?.sex]
  );
  const isMale = useMemo(
    () =>
      String(cow?.gender || cow?.sex || "")
        .trim()
        .toLowerCase()
        .startsWith("m"),
    [cow?.gender, cow?.sex]
  );
  const genderKey = isFemale ? "Female" : isMale ? "Male" : cow?.gender;
  const GenderIcon = genderKey ? genderStyles[genderKey]?.icon : null;
  const genderColor = genderStyles[genderKey]?.color || "text-gray-600";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-gray-600">
        Loading cow details...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 text-red-600">
        <p className="text-lg font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2 bg-red-100 text-red-700 rounded-full font-semibold"
        >
          Go Back
        </button>
      </div>
    );

  if (!cow)
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 text-gray-600">
        Cow not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-6">
          <h1 className="text-3xl font-bold">{cow.name}</h1>
          <p className="text-white/80 font-medium">Cow Profile</p>
        </div>

        {/* Details */}
        <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            {cow.photoUrl ? (
              <img
                src={cow.photoUrl}
                alt={cow.name}
                className="rounded-2xl shadow-lg border border-emerald-100 w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                No Photo Available
              </div>
            )}
          </div>

          <div className="space-y-5">
            <InfoItem icon={FaTag} label="Tag ID" value={cow.cowId || "N/A"} />
            <InfoItem
              icon={GenderIcon || FaMars}
              label="Gender"
              value={
                  <span className={genderColor}>
                    {cow.gender || cow.sex || "N/A"}
                  </span>
                }
               />
            <InfoItem
              icon={FaBirthdayCake}
              label="Birth Date"
              value={formatDate(cow.bday)}
            />
            <InfoItem icon={FaCalendarAlt} label="Age" value={ageText} />
            <InfoItem icon={FaTint} label="Breed" value={cow.breed || "N/A"} />
          </div>
        </div>

        {/* Extra Sections */}
        <div
          className={`p-8 border-t border-emerald-100 grid ${
              isFemale ? "md:grid-cols-3" : "md:grid-cols-2"
          } gap-6`}
        >
          {/* Upcoming Vaccination */}
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <h3 className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
              <FaSyringe /> Upcoming Vaccination
            </h3>
            {cow.upcomingVaccination ? (
              <>
                <p className="font-medium">
                  {cow.upcomingVaccination.vaccineName}
                </p>
                <p className="text-sm text-gray-600">
                  Scheduled on {formatDate(cow.upcomingVaccination.date)}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming vaccination</p>
            )}
          </div>

          {/* Today’s Milk → only show if female */}
          {isFemale && (
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
              <h3 className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                <FaTint /> Today’s Milk
              </h3>
              {cow.todayMilk > 0 ? (
                <>
                  <p className="text-3xl font-bold text-emerald-800">
                    {cow.todayMilk} L
                  </p>
                  <p className="text-sm text-gray-600">Collected today</p>
                </>
              ) : (
                <p className="text-gray-500 text-sm">
                  No milk record for today
                </p>
              )}
            </div>
          )}

          {/* Latest Health */}
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <h3 className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
              <FaHeartbeat /> Latest Health Record
            </h3>
            {cow.lastHealthRecord ? (
              <>
                <p className="font-medium">
                  {cow.lastHealthRecord.condition}
                </p>
                <p className="text-sm text-gray-600">
                  Checked on {formatDate(cow.lastHealthRecord.date)}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No recent health record</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-500 text-sm border-t border-emerald-100 bg-emerald-50">
          Smart Farm System © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
