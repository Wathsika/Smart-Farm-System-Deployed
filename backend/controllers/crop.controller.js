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