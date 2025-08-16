// file: frontend/src/admin/CropPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// --- 1. අලුතෙන් deleteCropAPI එක Import කරගන්න ---
import { getCropsAPI, deleteCropAPI } from '../lib/api';

// මේ තමයි Crop Management වල ප්‍රධාන Page එක.
const CropPage = () => {
  // --- State Variables (වෙනසක් නෑ) ---
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching Logic (වෙනසක් නෑ) ---
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await getCropsAPI();
        if (Array.isArray(data)) {
            setCrops(data);
        } else {
            console.error("API did not return an array, setting empty array.", data);
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

  // --- 2. අලුතෙන් handleDelete Function එක එකතු කරන්න ---
  // මේ function එක "Delete" button එක click කලාම run වෙනවා.
  const handleDelete = async (cropId, cropName) => {
    // User ගෙන් අනිවාර්යයෙන්ම confirm කරගන්නවා, වැරදීමකින් delete වෙන එක නවත්තන්න.
    const isConfirmed = window.confirm(`Are you sure you want to delete the crop "${cropName}"? This action cannot be undone.`);

    if (isConfirmed) {
      try {
        // API එකට call කරලා crop එක database එකෙන් delete කරනවා.
        await deleteCropAPI(cropId);

        // සාර්ථකව delete උනාට පස්සේ, page එක reload කරන්නේ නැතුව UI එක update කරනවා.
        // දැනට තියෙන crops list එකෙන්, delete කරපු crop එක විතරක් අයින් කරනවා.
        setCrops(currentCrops => currentCrops.filter(crop => crop._id !== cropId));
        
        // Optional: Userට සාර්ථක පණිවිඩයක් පෙන්වීම.
        // alert('Crop deleted successfully!'); 
      } catch (error) {
        // Error එකක් ආවොත් user ට පණිවිඩයක් දෙනවා.
        alert(`Failed to delete crop: ${error.message}`);
      }
    }
  };


  // --- Dynamic Content Rendering Function (Table එක ඇතුළේ පොඩි වෙනසක් තියෙනවා) ---
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

    // Data තියෙනවා නම්, මේ Table එක render කරනවා.
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
                  <button className="text-indigo-600 hover:text-indigo-900 font-semibold mr-4"><Link
                    to={`/admin/crop/${crop._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 font-semibold mr-4"
                  >
                    Edit
                  </Link>
</button>
                  
                  {/* --- 3. Delete Button එකට onClick Event එක එකතු කරන්න --- */}
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