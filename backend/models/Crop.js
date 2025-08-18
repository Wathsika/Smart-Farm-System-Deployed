// backend/models/Crop.js

import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
    cropName: {
        type: String,
        required: true,
        trim: true 
    },
    plantingDate: {
        type: Date,
        required: true,
    },
    expectedHarvestDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Seeding', 'Flowering', 'Harvest Ready', 'Harvested'], 
        default: 'Seeding'
    },
    
}, { timestamps: true }); 

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;