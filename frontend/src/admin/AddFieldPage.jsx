import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// අපි දැන් team එකේ common axios instance එක විතරක් import කරනවා
import { api } from '../lib/axios.js';

const AddFieldPage = () => {
  const navigate = useNavigate();

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

  const [error, setError] = useState(null);

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
    setError(null);
    try {
      // --- මෙන්න වැදගත් වෙනස ---
      // අපි 'addFieldAPI' කියලා වෙනම function එකක් නැතුව,
      // කෙලින්ම 'api.post' එක මෙතනම call කරනවා.
      // මේකෙන් කිසිම common file එකකට බලපෑමක් නෑ.
      await api.post('/fields', formData);

      alert('Field added successfully!');
      navigate('/admin/fields');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Add New Farm Field</h1>
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-8 rounded-2xl shadow-lg space-y-6">
        
        {/* --- Form එකේ ඉතිරි කොටස කිසිම වෙනසක් නැතුව කලින් වගේමයි --- */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Field Name</label>
            <input type="text" name="fieldName" onChange={handleChange} required className="input-style" placeholder="e.g., Hilltop Field A" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Field Code (Unique)</label>
            <input type="text" name="fieldCode" onChange={handleChange} required className="input-style" placeholder="e.g., HT-A" />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Location Description</label>
          <textarea name="locationDescription" onChange={handleChange} required className="input-style" rows="3" placeholder="e.g., North-West corner, adjacent to the main road"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Area Size</label>
            <input type="number" name="value" step="0.01" onChange={handleAreaChange} required className="input-style" placeholder="e.g., 2.5" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Area Unit</label>
            <select name="unit" onChange={handleAreaChange} value={formData.area.unit} className="input-style">
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="sqm">Square Meters (sqm)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Soil Type</label>
            <select name="soilType" onChange={handleChange} value={formData.soilType} className="input-style">
              <option value="Loamy">Loamy</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Silt">Silt</option>
              <option value="Chalky">Chalky</option>
              <option value="Peaty">Peaty</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Initial Status</label>
            <select name="status" onChange={handleChange} value={formData.status} className="input-style">
              <option value="Available">Available</option>
              <option value="Under Preparation">Under Preparation</option>
              <option value="Fallow">Fallow</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Irrigation System</label>
          <input type="text" name="irrigationSystem" onChange={handleChange} className="input-style" placeholder="e.g., Drip Irrigation" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Notes</label>
          <textarea name="notes" onChange={handleChange} className="input-style" rows="3" placeholder="e.g., Soil pH tested at 6.8 on [date]"></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
          Save New Field
        </button>

        {error && <p className="text-red-500 text-center pt-4">{error}</p>}
      </form>
      <style>{`.input-style { width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; }`}</style>
    </div>
  );
};

export default AddFieldPage;
