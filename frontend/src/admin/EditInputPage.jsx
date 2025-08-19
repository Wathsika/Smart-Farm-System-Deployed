// ✅ සම්පූර්ණ කරන ලද file එක: frontend/src/admin/pages/EditInputPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

const EditInputPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Form එකේ දත්ත තියාගන්න state
    const [formData, setFormData] = useState({
        name: '', category: 'fertilizer', stockQty: '',
        activeIngredient: '', dilutionRate: '', method: '',
        preHarvestIntervalDays: '', reEntryHours: '', notes: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Page එක load වෙනකොට අදාළ data ටික backend එකෙන් ගෙන්නගන්නවා
    useEffect(() => {
        const fetchInputData = async () => {
            try {
                const response = await api.get(`/inputs/${id}`);
                // form එකේ state එක, ගෙන්නගත්තු data වලින් update කරනවා
                setFormData(response.data);
            } catch (err) {
                setError("Could not load data for this input.");
            } finally {
                setLoading(false);
            }
        };

        fetchInputData();
    }, [id]);

    // Input fields වල වෙනස්කම් handle කරන function එක
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    // Form එක submit කරන function එක
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await api.put(`/inputs/${id}`, formData);
            alert('Farm input updated successfully!');
            navigate('/admin/crop/inputs');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update input.');
        }
    };

    if (loading) return <div className="p-8">Loading Input Data...</div>;
    if (error) return <div className="p-8 text-red-500 font-semibold">{error}</div>;

    // --- මෙන්න අලුතෙන් සම්පූර්ණ කරපු Form JSX එක ---
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Edit Farm Input: {formData.name}</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-4xl mx-auto">
                
                {/* --- Section 1: Basic Information --- */}
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Basic Information</legend>
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div>
                            <label className="label-style">Product Name</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="input-style" />
                        </div>
                        <div>
                            <label className="label-style">Category</label>
                            <select name="category" value={formData.category || 'other'} onChange={handleChange} className="input-style" required>
                                <option value="fertilizer">Fertilizer</option>
                                <option value="pesticide">Pesticide</option>
                                <option value="herbicide">Herbicide</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-style">Stock Quantity</label>
                            <input type="number" name="stockQty" min="0" value={formData.stockQty || ''} onChange={handleChange} required className="input-style" />
                        </div>
                    </div>
                </fieldset>

                {/* --- Section 2: Usage & Safety Details --- */}
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Usage & Safety Details</legend>
                     <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="label-style">Active Ingredient</label>
                            <input type="text" name="activeIngredient" value={formData.activeIngredient || ''} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label className="label-style">Application Method</label>
                            <input type="text" name="method" value={formData.method || ''} onChange={handleChange} className="input-style" />
                        </div>
                        <div>
                            <label className="label-style">Dilution Rate</label>
                            <input type="text" name="dilutionRate" value={formData.dilutionRate || ''} onChange={handleChange} className="input-style" />
                        </div>
                         <div></div>
                        <div className="flex items-end gap-2">
                             <div className="flex-grow">
                                <label className="label-style">Pre-Harvest Interval (Days)</label>
                                <input type="number" name="preHarvestIntervalDays" min="0" value={formData.preHarvestIntervalDays || ''} onChange={handleChange} className="input-style" />
                             </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <label className="label-style">Re-Entry Period (Hours)</label>
                                <input type="number" name="reEntryHours" min="0" value={formData.reEntryHours || ''} onChange={handleChange} className="input-style" />
                            </div>
                        </div>
                     </div>
                </fieldset>

                {/* --- Section 3: Notes --- */}
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Notes</legend>
                     <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="input-style mt-4" rows="4"></textarea>
                </fieldset>
                
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700">
                        Update Input
                    </button>
                </div>
            </form>

            <style>{`.label-style { display: block; margin-bottom: 0.5rem; font-weight: 500; } .input-style { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; }`}</style>
        </div>
    );
};

export default EditInputPage;