import Field from '../models/Field.js';

/**
 * @desc    Create a new field
 * @route   POST /api/fields
 */
export const addField = async (req, res) => {
  try {
    const { 
      fieldName, 
      fieldCode, 
      locationDescription, 
      area, 
      soilType,
      status, 
      irrigationSystem, 
      notes 
    } = req.body;

    // fieldCode එක දැනටමත් තියෙනවද කියලා බලනවා
    const fieldExists = await Field.findOne({ fieldCode });
    if (fieldExists) {
      return res.status(400).json({ message: 'A field with this code already exists.' });
    }  
    
    const newField = new Field({
      fieldName,
      fieldCode,
      locationDescription,
      area,
      soilType,
      status,
      irrigationSystem,
      notes,
    });
    
    const savedField = await newField.save();
    res.status(201).json(savedField);
  } catch (error) {
    // Validation error එකක්ද කියලා බලලා, ඒ අනුව message එක දෙනවා
    res.status(400).json({ message: 'Failed to add field.', error: error.message });
  }
};

/**
 * @desc    Get all fields
 * @route   GET /api/fields
 */
export const getAllFields = async (req, res) => {
  try {
    // අලුතෙන්ම add කරපුවා උඩින් එන්න sort කරනවා.
    const fields = await Field.find({}).sort({ createdAt: -1 });
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching fields.' });
  }
};

/**
 * @desc    Get a single field by its ID
 * @route   GET /api/fields/:id
 */
export const getFieldById = async (req, res) => {
  try {
    // ID එක අනුව field එක හොයනවා.
    // .populate('currentCrop') එකෙන් කරන්නේ, currentCrop ID එකට අදාළ සම්පූර්ණ crop document එකම ගෙනත් දෙන එක.
    const field = await Field.findById(req.params.id).populate('currentCrop', 'cropName status');
    
    if (field) {
      res.json(field);
    } else {
      res.status(404).json({ message: 'Field not found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching field data.' });
  }
};

/**
 * @desc    Update a field by its ID
 * @route   PUT /api/fields/:id
 */
export const updateField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);

    if (field) {
       const {
        fieldName,
        locationDescription,
        soilType,
        status,
        irrigationSystem,
        notes,
        currentCrop,
      } = req.body;

      if (typeof fieldName !== 'undefined') field.fieldName = fieldName;
      if (typeof locationDescription !== 'undefined') field.locationDescription = locationDescription;
      if (typeof soilType !== 'undefined') field.soilType = soilType;
      if (typeof status !== 'undefined') field.status = status;
      if (typeof irrigationSystem !== 'undefined') field.irrigationSystem = irrigationSystem;
      if (typeof notes !== 'undefined') field.notes = notes;
      if (typeof currentCrop !== 'undefined') field.currentCrop = currentCrop;

      // Nested area object requires special handling so we don't lose values
      if (req.body.area && typeof req.body.area === 'object') {
        const { value, unit } = req.body.area;
        if (typeof value !== 'undefined') field.area.value = value;
        if (typeof unit !== 'undefined') field.area.unit = unit;
      }

      const updatedField = await field.save();
      res.json(updatedField);
    } else {
      res.status(404).json({ message: 'Field not found.' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Failed to update field.', error: error.message });
  }
};

/**
 * @desc    Delete a field by its ID
 * @route   DELETE /api/fields/:id
 */
export const deleteField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ message: 'Field not found.' });
    }

    await Field.findByIdAndDelete(req.params.id);
    res.json({ message: 'Field deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting field.' });
  }
};


// ... ඔයාගේ කලින් හදපු CROP MANAGEMENT API FUNCTIONS වලට පසුව, මේ කොටස add කරන්න ...

// =======================================================
//            FIELD MANAGEMENT API FUNCTIONS
// =======================================================

/**
 * Fetches all fields from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of fields.
 */
export const getFieldsAPI = async () => {
    try {
        const response = await api.get('/fields');
        return response.data;
    } catch (error) {
        console.error("Error fetching fields:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch fields from the server.');
    }
};

/**
 * Adds a new field to the database.
 * @param {object} fieldData - The data for the new field.
 * @returns {Promise<object>} A promise that resolves to the saved field data.
 */
export const addFieldAPI = async (fieldData) => {
    try {
        // backend එකේ POST /api/fields එකට කතා කරනවා
        const response = await api.post('/fields', fieldData);
        return response.data;
    } catch(error){
        console.error("Error adding field:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to add field.');
    }
};

/**
 * Deletes a field by its ID.
// file: frontend/src/lib/api.js

// ... ඔයාගේ කලින් තිබුණු getCropsAPI, addCropAPI, deleteCropAPI, getFieldsAPI functions ...

/**
 * Deletes a field by its ID.
 * @param {string} fieldId - The ID of the field to delete.
 */
// --- මෙන්න මේ function එක ADD කරන්න (නැත්නම් තියෙන එක EXPORT කරන්න) ---
export const deleteFieldAPI = async (fieldId) => {
    try {
        // backend එකේ DELETE /api/fields/:id එකට කතා කරනවා
        const response = await api.delete(`/fields/${fieldId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting field:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to delete field.');
    }
};

// ... අනිත් අලුත් field functions (getFieldByIdAPI, updateFieldAPI) ...

/**
 * Fetches a single field by its ID for the edit page.
 * @param {string} fieldId - The ID of the field to fetch.
 */
export const getFieldByIdAPI = async (fieldId) => {
    try {
        const response = await api.get(`/fields/${fieldId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching field by ID:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch field data.');
    }
};

/**
 * Updates an existing field by its ID.
 * @param {string} fieldId - The ID of the field to update.
 * @param {object} fieldData - The new data for the field.
 */
export const updateFieldAPI = async (fieldId, fieldData) => {
    try {
        const response = await api.put(`/fields/${fieldId}`, fieldData);
        return response.data;
    } catch (error) {
        console.error("Error updating field:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update field.');
    }
};