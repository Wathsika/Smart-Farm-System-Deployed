import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- 1. වැදගත්ම වෙනස: api.js එකෙන් පොදු 'api' instance එක import කරගන්නවා ---
import { api } from '../lib/api';

const EditCrop = () => {
    const { id } = useParams(); // URL එකෙන් crop ID එක ගන්නවා
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        cropName: '',
        plantingDate: '',
        expectedHarvestDate: '',
        status: '' // Status එකත් handle කරන්න state එකට add කරා
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchCrop = async () => {
            try {
                // --- 2. වඩාත් කාර්යක්ෂම API Call එක ---
                // කලින් වගේ bütün crops list එකම ගන්නේ නැතුව,
                // අදාළ ID එක තියෙන crop එක විතරක් backend එකෙන් කෙලින්ම ඉල්ලනවා.
                const response = await api.get(`/crops/${id}`);
                const crop = response.data; // Backend එකෙන් එන්නේ එක crop object එකක්
                
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
    }, [id]); // id එක වෙනස් උනොත් ආයෙත් මේක run වෙනවා.

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
            // --- 3. Update API Call එක කෙලින්ම මෙතන කරනවා ---
            await api.put(`/crops/${id}`, formData);

            setMessage('Crop updated successfully!');
            // සාර්ථක උනාම ටික වෙලාවකින් ආපහු list page එකට යවනවා
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
        // Error එකක් ආවොත්, ආපහු යන්න link එකක් එක්ක පෙන්නනවා.
        return <div className="p-8"><p className="text-red-500">{error}</p><Link to="/admin/crop">Go Back</Link></div>
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Crop: {formData.cropName}</h1>

            <div className="max-w-2xl bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    {/* Input fields ටික එහෙමමයි, value එක state එකෙන් එනවා */}
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
                {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}
            </div>
        </div>
    );
};

export default EditCrop;