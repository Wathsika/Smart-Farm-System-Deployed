// frontend/src/admin/pages/AddCrop.jsx

import React, { useState } from 'react';
// --- 1. වැදගත්ම වෙනස: api.js එකෙන් පොදු 'api' instance එක import කරගන්නවා ---
// අපි දැන් addCropAPI කියලා function එකක් import කරන්නේ නෑ.
import { api } from '../lib/api.js';

const AddCrop = () => {
    const [formData, setFormData] = useState({
        cropName: '',
        plantingDate: '',
        expectedHarvestDate: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!formData.cropName || !formData.plantingDate) {
            setError('Please fill in both Crop Name and Planting Date.');
            return;
        }

        try {
            // --- 2. API Call එක කෙලින්ම මෙතන කරනවා ---
            // 'addCropAPI(formData)' වෙනුවට, 'api.post' පාවිච්චි කරනවා.
            const response = await api.post('/crops/add', formData);

            // Backend එකෙන් එන response එකේ structure එකට අනුව message එක ගන්න
            setMessage(response.data.message || 'Crop added successfully!'); 
            
            // Form එක clear කරනවා
            setFormData({
                cropName: '',
                plantingDate: '',
                expectedHarvestDate: ''
            });
        } catch (err) {
            // Error handling එක තවත් දියුණු කරලා, backend එකෙන් එන message එක පෙන්නනවා
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Add New Crop
            </h1>

            <div className="max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="cropName" className="block text-gray-700 text-sm font-bold mb-2">Crop Name</label>
                        <input
                            type="text"
                            id="cropName"
                            name="cropName"
                            value={formData.cropName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Papaya, Mango"
                            required // HTML validation එකක් එකතු කළා
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="plantingDate" className="block text-gray-700 text-sm font-bold mb-2">Planting Date</label>
                        <input
                            type="date"
                            id="plantingDate"
                            name="plantingDate"
                            value={formData.plantingDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required // HTML validation එකක් එකතු කළා
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="expectedHarvestDate" className="block text-gray-700 text-sm font-bold mb-2">Expected Harvest Date (Optional)</label>
                        <input
                            type="date"
                            id="expectedHarvestDate"
                            name="expectedHarvestDate"
                            value={formData.expectedHarvestDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition duration-300"
                    >
                        Add Crop
                    </button>
                </form>

                {/* --- Feedback Messages --- */}
                {message && <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-md">{message}</div>}
                {error && <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">{error}</div>}
            </div>
        </div>
    );
};

export default AddCrop;