import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBirthdayCake,
  FaCalendarAlt,
  FaDownload,
  FaQrcode,
  FaShareAlt,
  FaTag,
  FaVenus,
  FaMars,
} from "react-icons/fa";
import { api } from "../../lib/api";

const genderStyles = {
  Female: { icon: FaVenus },
  Male: { icon: FaMars },
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
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
  const days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearText = years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "";
  const monthText = months > 0 ? `${months} ${months === 1 ? "month" : "months"}` : "";

  return [yearText, monthText].filter(Boolean).join(" ") || "Less than a month";
};

const InfoItem = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 rounded-full bg-emerald-100 text-emerald-700 p-2">
        {Icon ? <Icon className="w-4 h-4" /> : null}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
        <p className="text-base text-gray-800 font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default function CowPublicPage() {
  const { id } = useParams();
  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [qrDownloading, setQrDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/cows/${id}`);
        setCow(data);
      } catch (_err) {
        setPageError("Failed to load cow details. Please scan the QR code again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const ageText = useMemo(() => calculateAge(cow?.bday), [cow?.bday]);
  const genderMeta = cow?.gender ? genderStyles[cow.gender] || genderStyles.Female : null;
  const shareSupported = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleDownloadQr = async () => {
    if (!cow?.qrUrl) return;
    try {
      setActionError("");
      setQrDownloading(true);
      const response = await fetch(cow.qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cow.name || "cow"}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR", err);
      setActionError("Unable to download the QR code right now. Please try again later.");
    } finally {
      setQrDownloading(false);
    }
  };

  const handleShareProfile = async () => {
    if (!cow || !shareSupported) return;
    try {
      await navigator.share({
        title: `${cow.name} • Smart Farm Cow Profile`,
        text: `View the public profile of ${cow.name}.`,
        url: window.location.href,
      });
    } catch (err) {
      console.warn("Share cancelled or failed", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-emerald-50 text-gray-600">
        Loading cow details...
      </div>
    );

  if (pageError)
    return (
      <div className="min-h-screen flex flex-col gap-4 justify-center items-center bg-rose-50 text-red-600 p-6 text-center">
        <p className="text-lg font-semibold">{pageError}</p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );

  if (!cow)
    return (
      <div className="min-h-screen flex justify-center items-center bg-emerald-50 text-gray-600">
        Cow not found
      </div>
    );

  const GenderIcon = genderMeta?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 py-12 px-4">
      <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-700 font-semibold shadow hover:shadow-md transition"
            >
              <FaArrowLeft /> Back
            </button>
            <div className="flex flex-wrap items-center gap-3">
            {shareSupported && (
              <button
                onClick={handleShareProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 transition"
              >
                <FaShareAlt className="w-4 h-4" /> Share profile
              </button>
            )}
            {cow.qrUrl && (
              <button
                onClick={handleDownloadQr}
                disabled={qrDownloading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition ${
                  qrDownloading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-emerald-700 hover:shadow-md"
                }`}
              >
                <FaDownload className="w-4 h-4" /> {qrDownloading ? "Preparing QR..." : "Download QR"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white flex flex-col items-center justify-center gap-6">
              <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/40 shadow-lg bg-white/20">
                {cow.photoUrl ? (
                  <img src={cow.photoUrl} alt={cow.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center px-6 text-white/80 font-semibold">
                    No photo available
                  </div>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">Cow Profile</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">{cow.name}</h1>
                {cow.cowId && (
                  <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 border border-white/40 text-white text-sm font-semibold tracking-wide">
                    <FaTag /> {cow.cowId}
                  </span>
                )}
                {GenderIcon && (
                  <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold bg-white/20 border border-white/40 text-white">
                    <GenderIcon className="w-4 h-4" /> {cow.gender}
                  </span>
                )}
              </div>
            </div>

            <div className="md:w-1/2 p-8 space-y-8">
              {actionError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {actionError}
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoItem icon={FaBirthdayCake} label="Birth date" value={formatDate(cow.bday)} />
                <InfoItem icon={FaCalendarAlt} label="Age" value={ageText} />
                <InfoItem icon={FaTag} label="Breed" value={cow.breed || "Unknown"} />
                <InfoItem icon={FaQrcode} label="QR status" value={cow.qrUrl ? "QR linked" : "QR not generated"} />
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-emerald-700">Profile insights</h2>
                <ul className="space-y-3 text-sm text-emerald-900">
                  <li>
                    • This page is shareable with anyone who scans the cow's QR code.
                  </li>
                  <li>
                    • Keep the profile updated from the admin dashboard to reflect the latest breeding and milk records.
                  </li>
                  <li>
                    • Download the QR code and display it near the cow's stall for quick access.
                  </li>
                </ul>
              </div>

              <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-gray-800">Created</p>
                  <p>{formatDate(cow.createdAt)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Last updated</p>
                  <p>{formatDate(cow.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {cow.qrUrl && (
            <div className="border-t border-emerald-100 bg-emerald-50/60 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow">
                  <FaQrcode className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">Scan & Learn</p>
                  <p className="text-lg text-emerald-900 font-bold">Scan this QR to view {cow.name}'s story</p>
                </div>
              </div>
              <img
                src={cow.qrUrl}
                alt={`${cow.name} QR code`}
                className="w-32 h-32 rounded-xl border border-emerald-200 bg-white shadow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}