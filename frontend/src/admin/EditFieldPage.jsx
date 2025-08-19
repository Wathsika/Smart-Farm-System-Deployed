// ✅ අලුතෙන් හදන file එක: frontend/src/admin/EditFieldPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js'; // Team එකේ common API client එක

const EditFieldPage = () => {
  const { id } = useParams(); // URL එකෙන් (:id) අදාළ field එකේ ID එක ගන්නවා
  const navigate = useNavigate(); // Update කළාට පස්සේ ආපහු list එකට යන්න

  // Form එකේ දත්ත තියාගන්න state එක
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldCode: '',
    locationDescription: '',
    area: { value: '', unit: 'acres' },
    soilType: 'Loamy',
    status: 'Available',
    irrigationSystem: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- "වේටර්" Functions (API Calls) ---
  const getFieldByIdAPI = async (fieldId) => {
    const response = await api.get(`/fields/${fieldId}`);
    return response.data;
  };
  const updateFieldAPI = async (fieldId, updatedData) => {
    const response = await api.put(`/fields/${fieldId}`, updatedData);
    return response.data;
  };
  
  // Component එක load වෙනකොටම, අදාළ ID එක තියෙන field එකේ data ගෙන්නගන්නවා
  useEffect(() => {
    const fetchFieldData = async () => {
      try {
        const data = await getFieldByIdAPI(id);
        setFormData({
            fieldName: data.fieldName,
            fieldCode: data.fieldCode,
            locationDescription: data.locationDescription,
            area: data.area,
            soilType: data.soilType,
            status: data.status,
            irrigationSystem: data.irrigationSystem,
            notes: data.notes
        });
      } catch (err) {
        setError("Failed to load field data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFieldData();
  }, [id]); // id එක වෙනස් උනොත් ආයෙත් මේක run වෙනවා.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, area: { ...prevState.area, [name]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateFieldAPI(id, formData);
      alert('Field updated successfully!');
      navigate('/admin/fields');
    } catch (err) {
      alert(`Error updating field: ${err.message}`);
    }
  };

  if (loading) return <p className="p-8">Loading field data...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  // Form එකේ JSX (මේක AddFieldPage එකට ගොඩක්ම සමානයි)
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Edit Field: {formData.fieldName}</h1>
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-8 rounded-2xl shadow-lg space-y-6">
        {/* Input fields ටික මෙතනට එනවා (values ටික formData එකෙන් bind වෙලා) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Field Name</label>
            <input type="text" name="fieldName" value={formData.fieldName} onChange={handleChange} required className="input-style"/>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Field Code (Unique)</label>
            <input type="text" name="fieldCode" value={formData.fieldCode} readOnly className="input-style bg-gray-200 cursor-not-allowed" />
          </div>
        </div>
        {/* ... (අනිත් inputs ටිකත් මෙතනට දාන්න AddFieldPage එකේ වගේම) ... */}

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
          Update Field
        </button>
      </form>
      <style>{`.input-style { width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; }`}</style>
    </div>
  );
};

export default EditFieldPage;