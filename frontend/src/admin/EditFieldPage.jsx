// ✅ src/pages/EditFieldPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export const STATUS_OPTIONS = ['In Use', 'Available', 'Planted', 'Under Preparation'];

// ---------------- Validators ----------------
const rules = {
  required: (msg = 'Required') => v =>
    v === undefined || v === null || String(v).trim() === '' ? msg : null,
  minLength: (n, msg = `Min ${n} chars`) => v =>
    String(v || '').length < n ? msg : null,
  maxLength: (n, msg = `Max ${n} chars`) => v =>
    String(v || '').length > n ? msg : null,
  number: (msg = 'Must be a number') => v =>
    v === '' || v === null || v === undefined || isNaN(Number(v)) ? msg : null,
  gt: (n, msg = `Must be > ${n}`) => v => Number(v) > n ? null : msg,
  oneOf: (arr, msg = 'Invalid value') => v => arr.includes(v) ? null : msg,
  pattern: (re, msg = 'Invalid format') => v =>
    v == null || re.test(String(v)) ? null : msg,
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
        setFormData(response.data);
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
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      area: {
        ...prevState.area,
        [name]: name === 'value' ? value : value,
      }
    }));
  };

  const validateForm = () => {
    const schema = {
      fieldName: [rules.required(), rules.minLength(2), rules.maxLength(60)],
      locationDescription: [rules.required(), rules.minLength(3)],
      'area.value': [
        rules.required(),
        rules.number(),
        rules.gt(0),
        rules.pattern(/^\d+(\.\d{1,2})?$/, 'Max 2 decimal places only')
      ],
      'area.unit': [rules.oneOf(['acres', 'hectares', 'sqm'])],
      soilType: [rules.oneOf(['Loamy', 'Clay', 'Sandy'])],
      status: [rules.oneOf(STATUS_OPTIONS)],
      irrigationSystem: [rules.maxLength(60)],
      notes: [rules.maxLength(500)],
    };
    const { valid, errors } = validate(schema, formData);
    setErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.put(`/fields/${id}`, {
        ...formData,
        area: { ...formData.area, value: Number(formData.area.value) }
      });
      alert('Field updated successfully!');
      navigate('/admin/fields');
    } catch (err) {
      alert(`Error updating field: ${err.response?.data?.message || err.message}`);
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
                  type="number"
                  name="value"
                  step="0.01"
                  min="0.01"
                  value={formData.area.value || ''}
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
