// ✅ src/pages/EditFieldPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export const STATUS_OPTIONS = ['In Use', 'Available', 'Planted', 'Under Preparation'];

// ---------------- Validators ----------------
// Updated decimalDraftPattern:
// - Allows integer part from 1 to 1000.
// - Allows an optional decimal part with up to two digits.
// This prevents typing numbers like '0.5' or '10000' directly in the area field.
const decimalDraftPattern = /^(?:[1-9]\d{0,2}|1000)(?:\.\d{0,2})?$/;

// New pattern for allowing only letters and spaces
const alphaSpacesPattern = /^[a-zA-Z\s]*$/;

const rules = {
  required: (msg = 'Required') => v =>
    v === undefined || v === null || String(v).trim() === '' ? msg : null,
  minLength: (n, msg = `Min ${n} chars`) => v =>
    String(v || '').length < n ? msg : null,
  maxLength: (n, msg = `Max ${n} chars`) => v =>
    String(v || '').length > n ? msg : null,
  number: (msg = 'Must be a number') => v =>
    v === '' || v === null || v === undefined || isNaN(Number(v)) ? msg : null,
  // New min rule added for numeric validation
  min: (n, msg = `Must be ≥ ${n}`) => v =>
    v === '' || v === null || v === undefined ? null : Number(v) >= n ? null : msg,
  max: (n, msg = `Must be ≤ ${n}`) => v =>
    v === '' || v === null || v === undefined ? null : Number(v) <= n ? null : msg,
  decimalPlaces: (places = 2, msg = `Use up to ${places} decimal places`) => v => {
    if (v === '' || v === null || v === undefined) return null;
    const re = new RegExp(`^\\d+(?:\\.\\d{1,${places}})?$`);
    return re.test(String(v)) ? null : msg;
  },
  gt: (n, msg = `Must be > ${n}`) => v => Number(v) > n ? null : msg,
  oneOf: (arr, msg = 'Invalid value') => v => arr.includes(v) ? null : msg,
  pattern: (re, msg = 'Invalid format') => v =>
    v == null || re.test(String(v)) ? null : msg,
  noSpaces: (msg = 'No spaces allowed') => v =>
    /\s/.test(String(v || '')) ? msg : null,
};

const validate = (schema, data) => {
  const read = (obj, path) =>
    path.split('.').reduce((o, k) => (o ?? {})[k], data);
  const errors = {};
  for (const [path, fns] of Object.entries(schema)) {
    const val = read(data, path);
    for (const fn of fns) {
      const err = fn(val, data);
      if (err) { errors[path] = err; break; }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
// --------------------------------------------------

const EditFieldPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fieldName: '',
    fieldCode: '',
    locationDescription: '',
    area: { value: '', unit: 'acres' },
    soilType: '',
    status: '',
    irrigationSystem: '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalFieldCode, setOriginalFieldCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFieldData = async () => {
      try {
        const response = await api.get(`/fields/${id}`);
        // Ensure area.value is a string for input field to control decimal places
        const fieldData = {
            ...response.data,
            area: {
                ...response.data.area,
                value: String(response.data.area.value) // Convert number to string for controlled input
            }
        };
        setFormData(fieldData);
        setOriginalFieldCode(response.data.fieldCode);
      } catch (err) {
        setError("Could not load field data.");
      } finally {
        setLoading(false);
      }
    };
    fetchFieldData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Real-time validation for Irrigation System: disallow numbers and special characters
    if (name === 'irrigationSystem') {
      if (value === '' || alphaSpacesPattern.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[name]; // Clear error if input is now valid
          return newErrors;
        });
      } else {
        // If it doesn't match the pattern, don't update formData, but set an error
        const errorMsg = 'Cannot contain numbers or special characters';
        if (errors[name] !== errorMsg) { // Prevent setting the same error repeatedly
          setErrors(prevErrors => ({
            ...prevErrors,
            [name]: errorMsg,
          }));
        }
      }
      return;
    }

    // For other fields, update formData and clear specific error on change
    setFormData(prevState => ({ ...prevState, [name]: value }));
    setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
    });
  };

  const handleAreaChange = (e) => {
    const { name, value } = e.target;
    if (name === 'value') {
      // Use the refined decimalDraftPattern to restrict typing large numbers and 0.xx
      if (value === '' || decimalDraftPattern.test(value)) {
        setFormData(prev => ({
          ...prev,
          area: { ...prev.area, value },
        }));
        // Clear area.value related errors that might be due to pattern mismatch
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors['area.value'];
          return newErrors;
        });
      } else {
        // If the value does not match the draft pattern, prevent setting the value
        // and set an immediate error for invalid input characters/format.
        const errorMsg = 'Invalid number format (1-1000, up to 2 decimals)';
        if (errors['area.value'] !== errorMsg) {
          setErrors(prevErrors => ({
            ...prevErrors,
            'area.value': errorMsg,
          }));
        }
      }
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      area: {
        ...prevState.area,
        [name]: value,
      }
    }));
    // Clear area.unit related errors on change
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors['area.unit'];
      return newErrors;
    });
  };

  const validateForm = () => {
    const schema = {
      // Field Name: Allows any characters, min 2, max 100
      fieldName: [rules.required(), rules.minLength(2), rules.maxLength(100)],
      // Field Code is read-only, so only a presence check is needed if desired, but typically not for readOnly fields in client-side validation for edits
      // For consistency with AddFieldPage, we'll keep it simple for read-only.
      // If it were editable, we'd add maxLength(50) here.
      // fieldCode: [rules.required(), rules.maxLength(50)], 
      
      // Location Description: Allows any characters, min 3, max 250
      locationDescription: [rules.required(), rules.minLength(3), rules.maxLength(250)],
      // Area Size: Required, 2 decimal places, min 1.00, max 1000.00
      'area.value': [
        rules.required(),
        rules.number('Must be a number'),
        rules.decimalPlaces(2, 'Allow up to two decimal places'),
        rules.min(1, 'Must be 1.00 or greater'), // Updated minimum limit
        rules.max(1000, 'Must be 1000.00 or less'), // Updated maximum limit
      ],
      'area.unit': [rules.oneOf(['acres', 'hectares', 'sqm'])],
      soilType: [rules.oneOf(['Loamy', 'Clay', 'Sandy'])],
      status: [rules.oneOf(STATUS_OPTIONS)], // Using STATUS_OPTIONS defined in this file
      // Irrigation System: Allows letters and spaces, max 60 (optional)
      irrigationSystem: [
        rules.maxLength(60),
        rules.pattern(alphaSpacesPattern, 'Cannot contain numbers or special characters'),
      ],
      // Notes: Allows any characters, max 500 (optional)
      notes: [rules.maxLength(500)],
    };
    const { valid, errors: errs } = validate(schema, formData);
    setErrors(prevErrors => ({ ...prevErrors, ...errs })); // Merge new errors with existing ones
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.put(`/fields/${id}`, {
        ...formData,
        area: { ...formData.area, value: Number(formData.area.value) } // Convert back to number for API
      });
      alert('Field updated successfully!');
      navigate('/admin/fields');
    } catch (err) {
      // Display server-side errors
      const serverError = err.response?.data?.message || 'Failed to update the field.';
      setErrors({ submit: serverError });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading field data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-4 border-green-600">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Field</h1>
          <p className="text-sm text-gray-600">{originalFieldCode}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {/* Field Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fieldName"
                value={formData.fieldName || ''}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border rounded-md ${
                  errors['fieldName']
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors['fieldName'] && (
                <p className="text-red-500 text-sm mt-1">{errors['fieldName']}</p>
              )}
            </div>

            {/* Field Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Field Code</label>
              <input
                type="text"
                name="fieldCode"
                value={formData.fieldCode || ''}
                readOnly
                className="block w-full px-4 py-3 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Location Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="locationDescription"
                value={formData.locationDescription || ''}
                onChange={handleChange}
                rows="3"
                className={`block w-full px-4 py-3 border rounded-md ${
                  errors['locationDescription']
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors['locationDescription'] && (
                <p className="text-red-500 text-sm mt-1">{errors['locationDescription']}</p>
              )}
            </div>

            {/* Area */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Area Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" // Changed to text to better control input with regex pattern
                  name="value"
                  step="0.01"
                  min="1.00" // HTML5 min attribute updated for better user experience
                  max="1000.00" // HTML5 max attribute updated
                  value={formData.area.value || ''}
                  inputMode="decimal"
                  pattern="^(?:[1-9]\d{0,2}|1000)(?:\.\d{0,2})?$" // HTML5 pattern for browser-level validation hint
                  onChange={handleAreaChange}
                  className={`block w-full px-4 py-3 border rounded-md ${
                    errors['area.value']
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                />
                {errors['area.value'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['area.value']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area Unit</label>
                <select
                  name="unit"
                  value={formData.area.unit || 'acres'}
                  onChange={handleAreaChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="sqm">Square Meters</option>
                </select>
              </div>
            </div>

            {/* Soil Type & Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType || ''}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>Select Soil Type</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                </select>
                {errors['soilType'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['soilType']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>Select Status</option>
                  {STATUS_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors['status'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['status']}</p>
                )}
              </div>
            </div>

            {/* Irrigation */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Irrigation System</label>
              <input
                type="text"
                name="irrigationSystem"
                value={formData.irrigationSystem || ''}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border rounded-md ${
                  errors['irrigationSystem']
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors['irrigationSystem'] && (
                <p className="text-red-500 text-sm mt-1">{errors['irrigationSystem']}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows="4"
                className={`block w-full px-4 py-3 border rounded-md ${
                  errors['notes']
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors['notes'] && (
                <p className="text-red-500 text-sm mt-1">{errors['notes']}</p>
              )}
            </div>

            {/* Server Error */}
            {errors.submit && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-red-800 font-semibold">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/admin/fields"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Field'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFieldPage;