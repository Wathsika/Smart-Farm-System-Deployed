// ✅ frontend/src/admin/EditCrop.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

// ---------- Inline validators ----------
const todayISO = () => {
  const off = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - off).toISOString().slice(0, 10);
};

const rules = {
  required: (msg = 'Required') => v =>
    v === undefined || v === null || String(v).trim() === '' ? msg : null,
  minLength: (n, msg = `Min ${n} chars`) => v =>
    String(v || '').length < n ? msg : null,
  maxLength: (n, msg = `Max ${n} chars`) => v =>
    String(v || '').length > n ? msg : null,
  pattern: (re, msg = 'Invalid format') => v =>
    v == null || re.test(String(v)) ? null : msg,
  dateOnOrAfter: (field, msg) => (v, all) =>
    !v || !all[field] || v >= all[field] ? null : (msg || `Must be on/after ${field}`),
  dateNotPast: (msg = 'Date cannot be in the past') => v =>
    !v || v >= todayISO() ? null : msg, // ✅ prevent selecting past dates
  oneOf: (arr, msg = 'Invalid value') => v => (arr.includes(v) ? null : msg),
};

const validate = (schema, data) => {
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ?? {})[k], data);
  const errors = {};
  for (const [path, fns] of Object.entries(schema)) {
    const val = get(data, path);
    for (const fn of fns) {
      const err = fn(val, data);
      if (err) { errors[path] = err; break; }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

// ---------- Icons ----------
const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SaveIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
  </svg>
);

const AlertCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ExclamationTriangleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

// ---------- Loading ----------
const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-16 text-center max-w-md w-full backdrop-blur-sm">
      <div className="relative mx-auto mb-8 w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center">
          <EditIcon className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">Loading Crop Data</h3>
      <p className="text-slate-500">Please wait while we fetch the information...</p>
    </div>
  </div>
);

const EditCrop = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cropName: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'Seeding'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const { data } = await api.get(`/crops/${id}`);
        const crop = data?.crop || data;
        if (!crop) return setError('Crop not found.');

        setFormData({
          cropName: crop.cropName || '',
          plantingDate: crop.plantingDate ? crop.plantingDate.slice(0, 10) : '',
          expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.slice(0, 10) : '',
          status: crop.status || 'Seeding'
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load crop data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCrop();
  }, [id]);

  const runValidation = (data = formData) => {
    const schema = {
      cropName: [
        rules.required('Crop Name is required'),
        rules.minLength(2),
        rules.maxLength(60),
        rules.pattern(/^[A-Za-z0-9()\-.\s]+$/, 'Only letters, numbers, (), -, . allowed')
      ],
      expectedHarvestDate: [
        rules.dateOnOrAfter('plantingDate', 'Harvest must be after planting'),
        rules.dateNotPast('Expected harvest date cannot be in the past') // ✅ added
      ],
      status: [
        rules.required(),
        rules.oneOf(['Seeding','Flowering','Harvest Ready','Harvested'])
      ]
    };
    const { valid, errors } = validate(schema, data);
    setErrors(errors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!runValidation()) return;

    try {
      await api.put(`/crops/${id}`, formData);
      setMessage('Crop updated successfully!');
      setTimeout(() => navigate('/admin/crop', { state: { cropUpdated: true } }), 1200); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage || 'Failed to update crop.');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-red-200/60 p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Unable to Load Crop</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <Link 
            to="/admin/crop" 
            className="inline-flex items-center space-x-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Return to Crop Management</span>
          </Link>
        </div>
      </div>
    );
  }

  const canSubmit = formData.cropName && Object.keys(errors).length === 0;

  const statusConfig = {
    'Seeding': { color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', icon: '🌱', label: 'Seeding Phase' },
    'Flowering': { color: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '🌸', label: 'Flowering Stage' },
    'Harvest Ready': { color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', icon: '🌾', label: 'Ready for Harvest' },
    'Harvested': { color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', icon: '✅', label: 'Harvest Complete' }
  };

  const currentStatus = statusConfig[formData.status] || statusConfig['Seeding'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between p-8">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 ${currentStatus.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <EditIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Edit Crop</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-slate-600 font-medium">{formData.cropName || 'Loading crop data...'}</span>
                  {formData.status && (
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
                      <span>{currentStatus.icon}</span>
                      <span>{currentStatus.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link 
              to="/admin/crop" 
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Crops</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60 p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Crop Information</h2>
            <p className="text-slate-600">Update the details for this crop entry</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              
              {/* Crop Name */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Crop Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cropName"
                    value={formData.cropName}
                    onChange={handleChange}
                    onBlur={() => runValidation()}
                    placeholder="Enter the crop name"
                    className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 focus:bg-white hover:bg-white text-slate-900 placeholder-slate-400 ${
                      errors['cropName'] ? 'border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors['cropName'] && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                      <AlertCircleIcon />
                      <span>{errors['cropName']}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Planting Date (read-only) */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Planting Date <span className="text-slate-400 font-normal ml-2">(Fixed)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <CalendarIcon className="text-slate-400" />
                    </div>
                    <input
                      type="date"
                      name="plantingDate"
                      value={formData.plantingDate}
                      readOnly
                      disabled
                      className="w-full pl-12 pr-5 py-4 bg-slate-100 border-2 rounded-2xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Expected Harvest Date */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Expected Harvest Date 
                    <span className="text-slate-400 font-normal ml-2">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <CalendarIcon className="text-slate-400" />
                    </div>
                    <input
                      type="date"
                      name="expectedHarvestDate"
                      value={formData.expectedHarvestDate}
                      onChange={handleChange}
                      onBlur={() => runValidation()}
                      min={formData.plantingDate || todayISO()} // ✅ prevent past in UI
                      className={`w-full pl-12 pr-5 py-4 bg-slate-50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 focus:bg-white hover:bg-white text-slate-900 ${
                        errors['expectedHarvestDate'] ? 'border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400' : 'border-slate-200'
                      }`}
                    />
                    {errors['expectedHarvestDate'] && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                        <AlertCircleIcon />
                        <span>{errors['expectedHarvestDate']}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Crop Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    onBlur={() => runValidation()}
                    className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 focus:bg-white hover:bg-white text-slate-900 appearance-none cursor-pointer ${
                      errors['status'] ? 'border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400' : 'border-slate-200'
                    }`}
                  >
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                    <ChevronDownIcon className="text-slate-400" />
                  </div>
                  {errors['status'] && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                      <AlertCircleIcon />
                      <span>{errors['status']}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                <Link 
                  to="/admin/crop"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all duration-200 font-medium"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </Link>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                    canSubmit 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <SaveIcon />
                  <span>Update Crop</span>
                </button>
              </div>

            </form>

            {/* Success Message */}
            {message && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900 mb-1">Success!</h4>
                    <p className="text-emerald-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCrop;
