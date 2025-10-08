import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/api";

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
        setError("Failed to load cow details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading cow details...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    );

  if (!cow)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Cow not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-emerald-700 mb-4">{cow.name}</h1>
        {cow.photoUrl && (
          <img
            src={cow.photoUrl}
            alt={cow.name}
            className="w-64 h-64 mx-auto object-cover rounded-xl border-4 border-emerald-200 shadow-lg mb-4"
          />
        )}
        <p><strong>Tag ID:</strong> {cow.cowId}</p>
        <p><strong>Breed:</strong> {cow.breed}</p>
        <p><strong>Gender:</strong> {cow.gender}</p>
        <p><strong>Birth Date:</strong> {new Date(cow.bday).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
