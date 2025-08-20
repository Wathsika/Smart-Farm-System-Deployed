// ✅ අවසාන සහ නිවැරදි file එක: frontend/src/admin/pages/AddInputPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

const AddInputPage = () => {
    const navigate = useNavigate();

    // Form state - කිසිදු වෙනසක් කර නැත
    const [formData, setFormData] = useState({
        name: '',
        category: 'fertilizer', 
        stockQty: '',
        activeIngredient: '',
        dilutionRate: '',
        method: '', 
        preHarvestIntervalDays: '',
        reEntryHours: '',
        notes: '',
    });

    const [error, setError] = useState(null);

    // handleChange function - කිසිදු වෙනසක් කර නැත
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'number' && value !== '' ? Number(value) : value
        }));
    };

    // handleSubmit function - කිසිදු වෙනසක් කර නැත
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await api.post('/inputs', formData);
            alert('New farm input added successfully!');
            navigate('/admin/crop/inputs');
        } catch (err) {
            const serverError = err.response?.data?.message || 'Failed to add the input.';
            setError(serverError);
            console.error(serverError);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Add New Farm Input</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-6 max-w-4xl mx-auto">
                
                {/* --- Section 1: Basic Information --- */}
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Basic Information</legend>
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        {/* Product Name */}
                        <div>
                            <label className="label-style">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" placeholder="e.g., Urea Fertilizer" />
                        </div>
                        {/* Category Dropdown */}
                        <div>
                            <label className="label-style">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="input-style" required>
                                <option value="fertilizer">Fertilizer</option>
                                <option value="pesticide">Pesticide</option>
                                <option value="herbicide">Herbicide</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        {/* Stock Quantity */}
                        <div>
                            <label className="label-style">Initial Stock Quantity</label>
                            <input type="number" name="stockQty" min="0" value={formData.stockQty} onChange={handleChange} required className="input-style" placeholder="e.g., 500" />
                        </div>
                    </div>
                </fieldset>

                {/* --- Section 2: Professional Details --- */}
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Usage & Safety Details</legend>
                     <div className="grid md:grid-cols-2 gap-6 mt-4">
                        {/* Active Ingredient */}
                        <div>
                            <label className="label-style">Active Ingredient</label>
                            <input type="text" name="activeIngredient" value={formData.activeIngredient} onChange={handleChange} className="input-style" placeholder="e.g., Imidacloprid" />
                        </div>

                        {/* ======================= එකම වෙනස මෙතනයි ======================= */}
                        <div>
                            <label className="label-style">Application Method</label>
                            <select 
                                name="method" 
                                value={formData.method} 
                                onChange={handleChange} 
                                className="input-style"
                                required
                            >
                                <option value="" disabled>-- Select a Method --</option>
                                <option value="soil">Soil Application</option>
                                <option value="foliar">Foliar Spray</option>
                                <option value="drip">Drip Irrigation</option>
                                <option value="spray">General Spray</option>
                                <option value="seed">Seed Treatment</option>
                            </select>
                        </div>
                        {/* ================================================================= */}

                         {/* Dilution Rate */}
                        <div>
                            <label className="label-style">Dilution Rate</label>
                            <input type="text" name="dilutionRate" value={formData.dilutionRate} onChange={handleChange} className="input-style" placeholder="e.g., 0.3 ml/L" />
                        </div>
                         <div></div>

                        {/* Pre-Harvest Interval */}
                        <div className="flex items-end gap-2">
                             <div className="flex-grow">
                                <label className="label-style">Pre-Harvest Interval</label>
                                <input type="number" name="preHarvestIntervalDays" min="0" value={formData.preHarvestIntervalDays} onChange={handleChange} className="input-style" />
                             </div>
                             <span className="pb-3 text-gray-600">Days</span>
                        </div>
                        {/* Re-Entry Hours */}
                        <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <label className="label-style">Re-Entry Period</label>
                                <input type="number" name="reEntryHours" min="0" value={formData.reEntryHours} onChange={handleChange} className="input-style" />
                            </div>
                            <span className="pb-3 text-gray-600">Hours</span>
                        </div>
                     </div>
                </fieldset>

                {/* Notes */}
                <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Notes</legend>
                     <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-style mt-4" rows="4" placeholder="Add any supplier details or safety notes here..."></textarea>
                </fieldset>

                {/* Error Display */}
                {error && <p className="text-red-600 text-center">{error}</p>}
                
                {/* --- Submit Button - SYNTAX ERROR එක මෙතනයි හදලා තියෙන්නේ --- */}
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700">
                        Save Input
                    </button>
                </div>
            </form>
             {/* Local CSS styles */}
            <style>{`
                .label-style { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
                .input-style { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .input-style:focus { border-color: #2563EB; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); outline: none; }
            `}</style>
        </div>
    );
};

export default AddInputPage;