import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
  withCredentials: false,
});

//Crop management
export const addCropAPI = async (cropData) => {
  try {
    const response = await api.post('/crops/add', cropData);
    return response.data;
  } catch (error) {
    // A better error handling for consistency
    console.error("Error adding crop:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add crop.');
  }
};



//read crop    
export const getCropsAPI = async () => {
    try {
        // --- මෙන්න නිවැරදි කිරීම ---
        // 'axios.get' වෙනුවට, team එකේ standard 'api.get' පාවිච්චි කරනවා.
        const response = await api.get('/crops');
        return response.data;
    } catch (error) {
        // More descriptive error handling
        console.error("Error fetching crops:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch crops from the server.');
    }
};

 // Deletes a crop by its ID.
 
export const deleteCropAPI = async (cropId) => {
    try {
        // Template literal (` `) පාවිච්චි කරලා URL එකට ID එක දානවා
        const response = await api.delete(`/crops/${cropId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting crop:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete crop.');
    }
};
