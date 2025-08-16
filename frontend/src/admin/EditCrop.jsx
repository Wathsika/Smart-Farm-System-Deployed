import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCropsAPI, updateCropAPI } from '../lib/api';

const EditCrop = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        cropName: '',
        plantingDate: '',
        expectedHarvestDate: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCrop = async () => {
            try {
                const crops = await getCropsAPI();
                const crop = Array.isArray(crops) ? crops.find(c => c._id === id) : null;
                if (crop) {
                    setFormData({
                        cropName: crop.cropName || '',
                        plantingDate: crop.plantingDate ? crop.plantingDate.slice(0, 10) : '',
                        expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.slice(0, 10) : ''
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
            await updateCropAPI(id, formData);
            setMessage('Crop updated successfully.');
            navigate('/admin/crop');
        } catch (err) {
            setError(err.message || 'Failed to update crop.');
        }
    };

    if (loading) {
        return <p className="p-8">Loading...</p>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Crop</h1>

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
                        Update Crop
                    </button>
                </form>

                {message && <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded-md">{message}</div>}
                {error && <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">{error}</div>}
            </div>
        </div>
    );
};

export default EditCrop;