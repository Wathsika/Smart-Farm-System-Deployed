// backend/controllers/cropController.js

import Crop from '../models/Crop.js';

// @desc   Add a new crop
// @route  POST /api/crops/add
// @access Private/Admin
export const addCrop = async (req, res) => {
    try {
        const { cropName, plantingDate, expectedHarvestDate } = req.body;

        // Basic validation   
        if (!cropName || !plantingDate) {
            return res.status(400).json({ message: 'Crop name and planting date are required.' });
        }

        const newCrop = new Crop({
            cropName,
            plantingDate,
            expectedHarvestDate,
        });  

        const savedCrop = await newCrop.save();

        res.status(201).json({
            message: "Crop added successfully!",
            crop: savedCrop
        });

    } catch (error) {
        console.error("Error adding crop:", error);
        res.status(500).json({ message: "Server error. Could not add crop." });
    }
};


// backend/controllers/cropController.js

// ...  after addCrop function...
// @desc   Update a crop by ID
// @route  PUT /api/crops/:id
// @access Private/Admin
export const updateCrop = async (req, res) => {
    try {
        const { cropName, plantingDate, expectedHarvestDate, status } = req.body;

        const updates = {};
        if (cropName) updates.cropName = cropName;
        if (plantingDate) updates.plantingDate = plantingDate;
        if (expectedHarvestDate) updates.expectedHarvestDate = expectedHarvestDate;
        if (status) updates.status = status;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'At least one field is required to update.' });
        }

        const updatedCrop = await Crop.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedCrop) {
            return res.status(404).json({ message: 'Crop not found.' });
        }

        res.status(200).json({
            message: 'Crop updated successfully.',
            crop: updatedCrop,
        });

    } catch (error) {
        console.error('Error updating crop:', error);
        res.status(500).json({ message: 'Server error. Could not update crop.' });
    }
};


// @desc   Get all crops
// @route  GET /api/crops
// @access Private/Admin
export const getAllCrops = async (req, res) => {
    try {
        const crops = await Crop.find({}).sort({ createdAt: -1 }); // newly added items display from above and sort it
        res.status(200).json(crops);
    } catch (error) {
        console.error("Error fetching crops:", error);
        res.status(500).json({ message: "Server error. Could not fetch crops." });
    }
};


// backend/controllers/cropController.js

// ... addCrop, getAllCrops functions ...

// @desc   Delete a crop by ID
// @route  DELETE /api/crops/:id
// @access Private/Admin
export const deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);

        if (crop) {
            await Crop.findByIdAndDelete(req.params.id);
            res.json({ message: "Crop removed successfully." });
        } else {
            res.status(404).json({ message: "Crop not found." });
        }
    } catch (error) {
        console.error("Error deleting crop:", error);
        res.status(500).json({ message: "Server error. Could not delete crop." });
    }
};

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


// Updates an existing crop by its ID.
export const updateCropAPI = async (cropId, cropData) => {
    try {
        const response = await api.put(`/crops/${cropId}`, cropData);
        return response.data;
    } catch (error) {
        console.error("Error updating crop:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update crop.');
    }
};