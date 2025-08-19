// file: frontend/src/admin/CropPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// --- 1. වැදගත්ම වෙනස: api.js එකෙන් පොදු 'api' instance එක import කරගන්නවා ---
import { api } from '../lib/api'; 

// මේ තමයි Crop Management වල ප්‍රධාන Page එක.
const CropPage = () => {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        // --- 2. API Call එක කෙලින්ම මෙතන කරනවා ('getCropsAPI' වෙනුවට) ---
        const response = await api.get('/crops'); 
        
        // Backend එකෙන් array එකක් එනවද කියලා check කරනවා
        if (Array.isArray(response.data)) {
            setCrops(response.data);
        } else {
            console.error("API did not return an array, setting empty array.", response.data);
            setCrops([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleDelete = async (cropId, cropName) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the crop "${cropName}"? This action cannot be undone.`);
    if (isConfirmed) {
      try {
        // --- 3. Delete API Call එකත් කෙලින්ම මෙතන කරනවා ---
        await api.delete(`/crops/${cropId}`);

        // UI එක update කරනවා
        setCrops(currentCrops => currentCrops.filter(crop => crop._id !== cropId));
      } catch (error) {
        alert(`Failed to delete crop: ${error.message}`);
      }
    }
  };


  const renderCropContent = () => {
    if (isLoading) {
      return <p className="text-gray-500 text-center py-10">Loading crop data...</p>;
    }

    if (error) {
      return <p className="text-red-500 text-center py-10">Error fetching data: {error}</p>;
    }

    if (!crops || crops.length === 0) {
      return (
        <p className="text-gray-500 text-center py-10 border-2 border-dashed rounded-lg">
          Currently, there are no crops to display. <br />
          Click the 'Add New Crop' button to get started!
        </p>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600 uppercase tracking-wider">Crop Name</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600 uppercase tracking-wider">Planting Date</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {crops.map((crop) => (
              <tr key={crop._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-6">{crop.cropName}</td>
                <td className="py-4 px-6">{new Date(crop.plantingDate).toLocaleDateString()}</td>
                <td className="py-4 px-6">
                  <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-medium">{crop.status}</span>
                </td>
                <td className="py-4 px-6">
                  
                  {/* --- 4. Edit button එක නිවැරදි කරා --- */}
                  {/* <button> එකක් ඇතුළේ <Link> එකක් දාන්නේ නැතුව, කෙලින්ම <Link> එක දානවා */}
                  <Link
                    to={`/admin/crop/edit/${crop._id}`} // නිවැරදි edit path එක (අපි App.jsx එකේ හදනවා)
                    className="text-indigo-600 hover:text-indigo-900 font-semibold mr-4"
                  >
                    Edit
                  </Link>

                  <button 
                    onClick={() => handleDelete(crop._id, crop.cropName)}
                    className="text-red-600 hover:text-red-900 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Crop Management
        </h1>
        <Link 
          to="/admin/crop/add" 
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 flex items-center"
        >
          <span className="text-2xl mr-2">+</span> 
          Add New Crop
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Existing Crop Fields
        </h2>
        {renderCropContent()}
      </div>
    </div>
  );
};

export default CropPage;