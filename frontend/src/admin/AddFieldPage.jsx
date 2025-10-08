// ✅ FINAL: frontend/src/admin/AddFieldPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api'; // keep your team's axios instance

// ---------------- Shared inline validators (no extra files) ----------------
const todayISO = () => {
  const off = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - off).toISOString().slice(0, 10);
};

// Updated decimalDraftPattern:
// - Allows integer part from 1 to 1000.
// - Allows an optional decimal part with up to two digits.
// This prevents typing numbers like '0.5' or '10000' directly.
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
  max: (n, msg = `Must be ≤ ${n}`) => v =>
    v === '' || v === null || v === undefined ? null : Number(v) <= n ? null : msg,
  min: (n, msg = `Must be ≥ ${n}`) => v =>
    v === '' || v === null || v === undefined ? null : Number(v) >= n ? null : msg,
  decimalPlaces: (places = 2, msg = `Use up to ${places} decimal places`) => v => {
    if (v === '' || v === null || v === undefined) return null;
    // This regex ensures that if a decimal part exists, it has up to 'places' digits.
    // It also implicitly validates the overall number format after user input.
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

// helper to run schema (supports nested paths e.g. "area.value")
const validate = (schema, data) => {
  const read = (obj, path) =>
    path.split('.').reduce((o, k) => (o ?? {})[k], data);
  const errors = {};
  for (const [path, fns] of Object.entries(schema)) {
    const val = read(data, path);
    for (const fn of fns) {
      const err = fn(val, data);
      if (err) {
        errors[path] = err;
        break;
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
// --------------------------------------------------------------------------
export const STATUS_OPTIONS = ['Available', 'Planted', 'Fallow', 'Under Preparation'];
export const validateStatus = rules.oneOf(STATUS_OPTIONS);

const AddFieldPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fieldName: '',
    fieldCode: '',
    locationDescription: '',
    area: { value: '', unit: 'acres' },
    soilType: 'Loamy',
    status: STATUS_OPTIONS[0],
    irrigationSystem: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = e => {
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
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
    });
  };

  const handleAreaChange = e => {
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

    // For area unit, update formData and clear specific error on change
    setFormData(prev => ({ ...prev, area: { ...prev.area, [name]: value } }));
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
      // Field Code: Allows any characters, max 50 (removed space and pattern restrictions)
      fieldCode: [
        rules.required(),
        rules.maxLength(50),
      ],
      // Location Description: Allows any characters, min 3, max 250
      locationDescription: [rules.required(), rules.minLength(3), rules.maxLength(250)],
      // Area Size: Required, 2 decimal places, min 1.00, max 1000.00
      'area.value': [
        rules.required(),
        // The decimalPlaces rule is kept for final validation on submit.
        // The decimalDraftPattern in handleAreaChange provides real-time typing restriction.
        rules.decimalPlaces(2, 'Allow up to two decimal places'),
        rules.number('Must be a number'), // Ensure it's treated as a number
        rules.min(1, 'Must be 1.00 or greater'), // Updated minimum limit
        rules.max(1000, 'Must be 1000.00 or less'), // Updated maximum limit
      ],
      'area.unit': [rules.oneOf(['acres', 'hectares', 'sqm'])],
      soilType: [rules.oneOf(['Loamy', 'Clay', 'Sandy'])],
      status: [validateStatus],
      // Irrigation System: Allows letters and spaces, max 60 (optional)
      // The `alphaSpacesPattern` is used for real-time input restriction,
      // and also for final validation on submit.
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

  const handleSubmit = async e => {
    e.preventDefault();
    // Run full validation on submit
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
       const payload = {
        ...formData,
        area: { ...formData.area, value: Number(formData.area.value) },
      };
      // In a real application, you would send this payload to your API:
      // await api.post('/admin/fields', payload);
      alert('Field added successfully!');
      navigate('/admin/fields');
    } catch (err) {
      const serverError =
        err.response?.data?.message || 'Failed to add the field.';
      setErrors({ submit: serverError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/fields"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {/* Back button content */}
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Add New Field
                  </h1>
                  <p className="text-sm text-gray-500">
                    Create a new farm field in your system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* ✅ Basic Information Card now green */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg
                  className="mr-3 h-5 w-5 text-green-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Field Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Field Name *
                  </label>
                  <input
                    type="text"
                    name="fieldName"
                    value={formData.fieldName}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^A-Za-z0-9\s]/g, '');
                      handleChange({ target: { name: 'fieldName', value: sanitized } });
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key.length === 1 &&
                        /[^A-Za-z0-9\s]/.test(e.key) &&
                        !e.ctrlKey && !e.metaKey && !e.altKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                      const sanitized = text.replace(/[^A-Za-z0-9\s]/g, '');
                      if (sanitized !== text) {
                        e.preventDefault();
                        const target = e.target;
                        const start = target.selectionStart ?? 0;
                        const end = target.selectionEnd ?? 0;
                        const next = target.value.slice(0, start) + sanitized + target.value.slice(end);
                        handleChange({ target: { name: 'fieldName', value: next } });
                      }
                    }}
                    required
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-gray-50 focus:bg-white ${
                      errors['fieldName']
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="Enter field name"
                  />
                  {errors['fieldName'] && (
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
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
                      <p className="text-red-600 text-sm font-medium">
                        {errors['fieldName']}
                      </p>
                    </div>
                  )}
                </div>
                {/* Field Code */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Field Code (Unique) *
                  </label>
                  <input
                    type="text"
                    name="fieldCode"
                    value={formData.fieldCode}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^A-Za-z0-9\s]/g, '');
                      handleChange({ target: { name: 'fieldCode', value: sanitized } });
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key.length === 1 &&
                        /[^A-Za-z0-9\s]/.test(e.key) &&
                        !e.ctrlKey && !e.metaKey && !e.altKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                      const sanitized = text.replace(/[^A-Za-z0-9\s]/g, '');
                      if (sanitized !== text) {
                        e.preventDefault();
                        const target = e.target;
                        const start = target.selectionStart ?? 0;
                        const end = target.selectionEnd ?? 0;
                        const next = target.value.slice(0, start) + sanitized + target.value.slice(end);
                        handleChange({ target: { name: 'fieldCode', value: next } });
                      }
                    }}
                    required
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-gray-50 focus:bg-white ${
                      errors['fieldCode']
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="e.g., FIELD-001"
                  />
                  {errors['fieldCode'] && (
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
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
                      <p className="text-red-600 text-sm font-medium">
                        {errors['fieldCode']}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Field Details Card (still green) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg
                  className="mr-3 h-5 w-5 text-green-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Field Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Location Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Location Description *
                </label>
                <textarea
                  name="locationDescription"
                  value={formData.locationDescription}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-gray-50 focus:bg-white resize-none ${
                    errors['locationDescription']
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  }`}
                  rows="3"
                  placeholder="Describe the field location..."
                />
                {errors['locationDescription'] && (
                  <div className="flex items-center mt-2">
                    <svg
                      className="w-4 h-4 text-red-500 mr-2"
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
                    <p className="text-red-600 text-sm font-medium">
                      {errors['locationDescription']}
                    </p>
                  </div>
                )}
              </div>

              {/* Area */}
                <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Area Size *
                  </label>
                  <input
                    type="text"
                    name="value"
                    step="0.01"
                    min="1.00" // HTML5 min attribute updated for better user experience
                    max="1000.00" // HTML5 max attribute updated
                    value={formData.area.value}
                    inputMode="decimal"
                    // HTML5 pattern helps with some browser-level validation, but JS validation is primary.
                    pattern="^(?:[1-9]\d{0,2}|1000)(?:\.\d{0,2})?$"
                    onChange={handleAreaChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-gray-50 focus:bg-white ${
                      errors['area.value']
                        ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                    }`}
                    placeholder="0.00"
                    aria-describedby={errors['area.value'] ? 'area-error' : undefined}
                  />
                  {errors['area.value'] && (
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-4 h-4 text-red-500 mr-2"
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
                        <p id="area-error" className="text-red-600 text-sm font-medium">
                        {errors['area.value']}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Area Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.area.unit}
                    onChange={handleAreaChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="sqm">Square Meters (sqm)</option>
                  </select>
                </div>
              </div>

              {/* Soil + Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Soil Type
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                  {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Irrigation */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Irrigation System (e.g., Drip, Sprinkler, Manual)
                </label>
                <input
                  type="text"
                  name="irrigationSystem"
                  value={formData.irrigationSystem}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-gray-50 focus:bg-white ${
                    errors['irrigationSystem']
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  }`}
                  placeholder="e.g., Sprinkler, Drip, Manual..."
                />
                {errors['irrigationSystem'] && (
                  <div className="flex items-center mt-2">
                    <svg
                      className="w-4 h-4 text-red-500 mr-2"
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
                    <p className="text-red-600 text-sm font-medium">
                      {errors['irrigationSystem']}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-gray-50 focus:bg-white resize-none ${
                    errors['notes']
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  }`}
                  rows="3"
                  placeholder="Additional notes about this field..."
                />
                {errors['notes'] && (
                  <div className="flex items-center mt-2">
                    <svg
                      className="w-4 h-4 text-red-500 mr-2"
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
                    <p className="text-red-600 text-sm font-medium">
                      {errors['notes']}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
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

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/admin/fields"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={hasErrors || isSubmitting}
                className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 ${
                  hasErrors || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed transform-none'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving Field...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save New Field
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFieldPage;