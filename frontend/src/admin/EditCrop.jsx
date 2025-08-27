// ✅ නිවැරදි කරන ලද file එක: frontend/src/admin/EditCrop.jsx

import React, { useState, useEffect } from 'react';
// --- 1. මෙන්න අලුතෙන් එකතු කළ import එක ---
// 'useParams' සහ 'useNavigate' එක්කම, 'Link' එකත් import කරගන්නවා.
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const EditCrop = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        cropName: '',
        plantingDate: '',
        expectedHarvestDate: '',
        status: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCrop = async () => {
            try {
                // Backend එකෙන් අදාළ crop එකේ data ටික ගෙන්නගන්නවා
                const response = await api.get(`/crops/${id}`);
                const crop = response.data.crop; // Backend response structure එකට අනුව වෙනස් වෙන්න පුළුවන්
                
                if (crop) {
                    setFormData({
                        cropName: crop.cropName || '',
                        plantingDate: crop.plantingDate ? crop.plantingDate.slice(0, 10) : '',
                        expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.slice(0, 10) : '',
                        status: crop.status || 'Seeding'
                    });
                } else {
                    setError('Crop not found.');
                }
            } catch (err) {
                setError(err.message || 'Failed to load crop data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCrop();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            // Update API call එක කරනවා
            await api.put(`/crops/${id}`, formData);

            setMessage('Crop updated successfully!');
            setTimeout(() => navigate('/admin/crop'), 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage || 'Failed to update crop.');
        }
    };

    if (loading) {
        return <p className="p-8">Loading crop data...</p>;
    }

    if (error) {
        // දැන් මේ Link component එක හරියටම වැඩ කරයි
        return (
            <div className="p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Link to="/admin/crop" className="text-blue-600 hover:underline">Go Back to Crop List</Link>
            </div>
        )
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Crop: {formData.cropName}</h1>

            <div className="max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="cropName" className="block text-gray-700 text-sm font-bold mb-2">Crop Name</label>
                        <input
                            type="text" name="cropName" value={formData.cropName} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="plantingDate" className="block text-gray-700 text-sm font-bold mb-2">Planting Date</label>
                        <input
                            type="date" name="plantingDate" value={formData.plantingDate} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="expectedHarvestDate" className="block text-gray-700 text-sm font-bold mb-2">Expected Harvest Date (Optional)</label>
                        <input
                            type="date" name="expectedHarvestDate" value={formData.expectedHarvestDate} onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>
                    
                    <div className="mb-6">
                         <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                         <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-md">
                             <option value="Seeding">Seeding</option>
                             <option value="Flowering">Flowering</option>
                             <option value="Harvest Ready">Harvest Ready</option>
                             <option value="Harvested">Harvested</option>
                         </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700"
                    >
                        Update Crop
                    </button>
                </form>

                {message && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">{message}</div>}
            </div>
        </div>
    );
};

export default EditCrop;