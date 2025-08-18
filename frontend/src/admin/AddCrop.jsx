// frontend/src/admin/pages/AddCrop.jsx

import React, { useState } from 'react';
import { addCropAPI } from '../lib/api'; // උඩ හදපු API function එක

// ඔයා FontAwesome use කරනවා නම් මෙහෙම icon import කරන්න පුළුවන්
// import { faSeedling } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
        e.preventDefault(); // Page එක refresh වෙන එක නවත්තනවා
        setMessage('');
        setError('');

        if (!formData.cropName || !formData.plantingDate) {
            setError('Please fill in both Crop Name and Planting Date.');
            return;
        }

        try {
            const result = await addCropAPI(formData);
            setMessage(result.message); // Backend එකෙන් එන success message එක
            // Form එක clear කරනවා
            setFormData({
                cropName: '',
                plantingDate: '',
                expectedHarvestDate: ''
            });
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                {/* <FontAwesomeIcon icon={faSeedling} className="mr-3" /> */}
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