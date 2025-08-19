// backend/models/Field.js
import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
    fieldName: { type: String, required: true, trim: true },
    fieldCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    locationDescription: { type: String, required: true },
    area: {
        value: { type: Number, required: true },
        unit: { type: String, required: true, enum: ['acres', 'hectares', 'sqm'] }
    },
    soilType: { type: String, enum: ['Loamy', 'Clay', 'Sandy', 'Silt', 'Chalky', 'Peaty'] },
    status: { 
        type: String, 
        required: true, 
        enum: ['Available', 'Planted', 'Fallow', 'Under Preparation'], 
        default: 'Available' 
    },
    currentCrop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop' // 'Crop' model එකට සම්බන්ධ කරනවා
    },
    irrigationSystem: { type: String, default: 'None' },
    notes: { type: String }
}, { timestamps: true });

const Field = mongoose.model('Field', fieldSchema);
export default Field;