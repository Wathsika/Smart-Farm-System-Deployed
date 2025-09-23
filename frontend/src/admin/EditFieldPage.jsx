// ✅ FINAL corrected file: frontend/src/admin/EditFieldPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// --- ✅ THIS IS THE ONLY CORRECTION ---
// The filename is now corrected from 'axios.js' to 'api.js' to match your project.
import { api } from '../lib/api.js';

const EditFieldPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fieldName: '',
        fieldCode: '',
        locationDescription: '',
        area: { value: '', unit: 'acres' },
        soilType: '',
        status: '',
        irrigationSystem: '',
        notes: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [originalFieldCode, setOriginalFieldCode] = useState('');

    useEffect(() => {
        const fetchFieldData = async () => {
            try {
                const response = await api.get(`/fields/${id}`);
                setFormData(response.data);
                setOriginalFieldCode(response.data.fieldCode);
            } catch (err) {
                setError("Could not load field data.");
            } finally {
                setLoading(false);
            }
        };
        fetchFieldData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAreaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            area: {
                ...prevState.area,
                [name]: name === 'value' ? Number(value) : value,
            }
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/fields/${id}`, formData);
            alert('Field updated successfully!');
            navigate('/admin/fields');
        } catch (err) {
            alert(`Error updating field: ${err.response?.data?.message || err.message}`);
        }
    };
    
    if (loading) return <div className="p-8">Loading field data...</div>;
    if (error) return <div className="p-8"><p className="text-red-500">{error}</p><Link to="/admin/fields">Go Back</Link></div>;

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Edit Field: {originalFieldCode}</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-4xl mx-auto">
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Basic Information</legend>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="label-style">Field Name</label>
                            <input type="text" name="fieldName" value={formData.fieldName || ''} onChange={handleChange} required className="input-style"/>
                        </div>
                        <div>
                            <label className="label-style">Field Code (Unique)</label>
                            <input type="text" name="fieldCode" value={formData.fieldCode || ''} readOnly className="input-style bg-gray-200 cursor-not-allowed"/>
                        </div>
                    </div>
                </fieldset>
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Details</legend>
                    <div className="space-y-6 mt-4">
                        <div>
                            <label className="label-style">Location Description</label>
                            <textarea name="locationDescription" value={formData.locationDescription || ''} onChange={handleChange} required className="input-style" rows="3"></textarea>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label-style">Area Size</label>
                                <input type="number" name="value" step="0.01" value={formData.area.value || ''} onChange={handleAreaChange} required className="input-style"/>
                            </div>
                            <div>
                                <label className="label-style">Area Unit</label>
                                <select name="unit" value={formData.area.unit || 'acres'} onChange={handleAreaChange} className="input-style">
                                    <option value="acres">Acres</option>
                                    <option value="hectares">Hectares</option>
                                    <option value="sqm">Square Meters</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label-style">Soil Type</label>
                                <select name="soilType" value={formData.soilType || ''} onChange={handleChange} className="input-style">
                                    <option value="" disabled>Select Soil Type</option>
                                    <option value="Loamy">Loamy</option>
                                    <option value="Clay">Clay</option>
                                    <option value="Sandy">Sandy</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-style">Status</label>
                                <select name="status" value={formData.status || ''} onChange={handleChange} className="input-style">
                                     <option value="" disabled>Select Status</option>
                                     <option value="Available">Available</option>
                                     <option value="Planted">Planted</option>
                                     <option value="Fallow">Fallow</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label-style">Irrigation System</label>
                            <input type="text" name="irrigationSystem" value={formData.irrigationSystem || ''} onChange={handleChange} className="input-style"/>
                        </div>
                        <div>
                            <label className="label-style">Notes</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="input-style" rows="3"></textarea>
                        </div>
                    </div>
                </fieldset>
                <div className="flex justify-end">
                    <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700">
                        Update Field
                    </button>
                </div>
            </form>

            <style>{`.label-style { display: block; margin-bottom: 0.5rem; } .input-style { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; }`}</style>
        </div>
    );
};

export default EditFieldPage;