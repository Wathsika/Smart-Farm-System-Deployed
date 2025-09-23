import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import { api } from '../lib/api.js';

// -------- Inline validators (no extra files) --------
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
  dateNotPast: (msg = 'Date cannot be in the past') => v =>
    !v ? msg : (v >= todayISO() ? null : msg),
  dateOnOrAfter: (field, msg) => (v, all) =>
    !v || !all[field] || v >= all[field] ? null : (msg || `Must be on/after ${field}`),
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
// ----------------------------------------------------

const AddCrop = () => {
  const [formData, setFormData] = useState({
    cropName: '',
    plantingDate: '',
    expectedHarvestDate: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate(); //New 

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const runValidation = (data = formData) => {
    const schema = {
      cropName: [
        rules.required('Crop Name is required'),
        rules.minLength(2),
        rules.maxLength(60),
        rules.pattern(/^[A-Za-z0-9()\-.\s]+$/, 'Only letters, numbers, (), -, . allowed')
      ],
      plantingDate: [
        rules.required('Planting Date is required'),
        rules.dateNotPast()
      ],
      expectedHarvestDate: [
        // optional; if present must be >= planting
        rules.dateOnOrAfter('plantingDate', 'Harvest must be after planting'),
      ],
    };
    const { valid, errors } = validate(schema, data);
    setErrors(errors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!runValidation()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/crops/add', formData);
      setMessage(res.data.message || 'Crop added successfully!');
      setFormData({ cropName: '', plantingDate: '', expectedHarvestDate: '' });
      setErrors({});
       

      // ✅ redirect to crop list after success
      navigate("/admin/crop", { replace: true });

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    formData.cropName &&
    formData.plantingDate &&
    Object.keys(errors).length === 0 &&
    !isSubmitting;

  // Get estimated harvest duration for display
  const getHarvestEstimate = () => {
    if (formData.plantingDate && formData.expectedHarvestDate) {
      const plantDate = new Date(formData.plantingDate);
      const harvestDate = new Date(formData.expectedHarvestDate);
      const diffTime = harvestDate - plantDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? `~${diffDays} days growing period` : '';
    }
    return '';
  };

  // Calculate form completion percentage
  const completionPercentage = () => {
    let completed = 0;
    if (formData.cropName) completed += 50;
    if (formData.plantingDate) completed += 50;
    return completed;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent flex items-center">
                <i className="fas fa-seedling text-green-600 mr-3"></i>
                Add New Crop
              </h1>
            </div>
          </div>
          
          {/* Compact Progress Indicator */}
          <div className="flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
            <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage()}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{completionPercentage()}%</span>
          </div>
        </div>

        {/* Main Content - Single Row Layout */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Form - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <i className="fas fa-edit mr-3 text-green-600"></i>
                    Crop Registration Form
                  </h2>
                  <div className="text-sm text-gray-600">
                    <i className="fas fa-calendar mr-1"></i>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Form Content - Expanded Layout */}
              <div className="p-8">
                <form onSubmit={handleSubmit} noValidate>
                  {/* Form Fields in Grid Layout */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Crop Name Field */}
                    <div className="md:col-span-2">
                      <label htmlFor="cropName" className="flex items-center text-gray-700 text-sm font-bold mb-3">
                        <i className="fas fa-leaf text-green-600 mr-2"></i>
                        Crop Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <i className="fas fa-seedling text-gray-400"></i>
                        </div>
                        <input
                          type="text"
                          id="cropName"
                          name="cropName"
                          value={formData.cropName}
                          onChange={handleChange}
                          onBlur={() => runValidation()}
                          className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-lg font-medium ${
                            errors['cropName'] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                          }`}
                          placeholder="e.g., Papaya, Mango, Rice, Coconut"
                          required
                        />
                        {formData.cropName && !errors['cropName'] && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <i className="fas fa-check-circle text-green-500 text-lg"></i>
                          </div>
                        )}
                      </div>
                      {errors['cropName'] && (
                        <div className="flex items-center mt-2 text-red-600 text-sm">
                          <i className="fas fa-exclamation-circle mr-2"></i>
                          {errors['cropName']}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <i className="fas fa-info-circle mr-1"></i>
                        Enter the type of crop you're planting (2-60 characters)
                      </div>
                    </div>

                    {/* Planting Date Field */}
                    <div>
                      <label htmlFor="plantingDate" className="flex items-center text-gray-700 text-sm font-bold mb-3">
                        <i className="fas fa-calendar-alt text-blue-600 mr-2"></i>
                        Planting Date
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <i className="fas fa-calendar text-gray-400"></i>
                        </div>
                        <input
                          type="date"
                          id="plantingDate"
                          name="plantingDate"
                          value={formData.plantingDate}
                          onChange={(e) => {
                            const v = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              plantingDate: v,
                              expectedHarvestDate:
                                prev.expectedHarvestDate && prev.expectedHarvestDate < v ? '' : prev.expectedHarvestDate
                            }));
                          }}
                          onBlur={() => runValidation()}
                          min={todayISO()}
                          className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-lg font-medium ${
                            errors['plantingDate'] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                          }`}
                          required
                        />
                        {formData.plantingDate && !errors['plantingDate'] && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <i className="fas fa-check-circle text-green-500 text-lg"></i>
                          </div>
                        )}
                      </div>
                      {errors['plantingDate'] && (
                        <div className="flex items-center mt-2 text-red-600 text-sm">
                          <i className="fas fa-exclamation-circle mr-2"></i>
                          {errors['plantingDate']}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <i className="fas fa-info-circle mr-1"></i>
                        Select when you plan to plant this crop
                      </div>
                    </div>

                    {/* Expected Harvest Date Field */}
                    <div>
                      <label htmlFor="expectedHarvestDate" className="flex items-center text-gray-700 text-sm font-bold mb-3">
                        <i className="fas fa-calendar-check text-orange-600 mr-2"></i>
                        Expected Harvest Date
                        <span className="text-gray-400 ml-2 text-xs font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <i className="fas fa-calendar-plus text-gray-400"></i>
                        </div>
                        <input
                          type="date"
                          id="expectedHarvestDate"
                          name="expectedHarvestDate"
                          value={formData.expectedHarvestDate}
                          onChange={handleChange}
                          onBlur={() => runValidation()}
                          min={formData.plantingDate || todayISO()}
                          className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-lg font-medium ${
                            errors['expectedHarvestDate'] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                          }`}
                        />
                        {formData.expectedHarvestDate && !errors['expectedHarvestDate'] && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <i className="fas fa-check-circle text-green-500 text-lg"></i>
                          </div>
                        )}
                      </div>
                      {errors['expectedHarvestDate'] && (
                        <div className="flex items-center mt-2 text-red-600 text-sm">
                          <i className="fas fa-exclamation-circle mr-2"></i>
                          {errors['expectedHarvestDate']}
                        </div>
                      )}
                      {getHarvestEstimate() && (
                        <div className="flex items-center mt-2 text-green-600 text-sm font-medium">
                          <i className="fas fa-clock mr-2"></i>
                          {getHarvestEstimate()}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <i className="fas fa-info-circle mr-1"></i>
                        Estimate when you expect to harvest this crop
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-8 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center text-lg ${
                      !canSubmit ? 'opacity-60 cursor-not-allowed transform-none hover:transform-none' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Adding Crop...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus-circle mr-3 text-xl"></i>
                        Add Crop to System
                      </>
                    )}
                  </button>
                </form>

                {/* Feedback Messages */}
                {message && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200 rounded-lg flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-3"></i>
                    <div>
                      <p className="font-semibold">Success!</p>
                      <p className="text-sm">{message}</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 rounded-lg flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                    <div>
                      <p className="font-semibold">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Info Sidebar - Takes 1 column */}
          <div className="lg:col-span-1">
            {/* Quick Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <i className="fas fa-tasks text-indigo-500 mr-2"></i>
                Form Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className={`flex items-center p-2 rounded-lg ${
                  formData.cropName ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <i className={`fas ${formData.cropName ? 'fa-check-circle text-green-600' : 'fa-circle text-gray-400'} mr-2`}></i>
                  <span>Crop Name</span>
                </div>
                <div className={`flex items-center p-2 rounded-lg ${
                  formData.plantingDate ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <i className={`fas ${formData.plantingDate ? 'fa-check-circle text-green-600' : 'fa-circle text-gray-400'} mr-2`}></i>
                  <span>Planting Date</span>
                </div>
                <div className={`flex items-center p-2 rounded-lg ${
                  formData.expectedHarvestDate ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
                }`}>
                  <i className={`fas ${formData.expectedHarvestDate ? 'fa-check-circle text-green-600' : 'fa-circle text-gray-400'} mr-2`}></i>
                  <span>Harvest Date <span className="opacity-75">(Optional)</span></span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                Quick Tips
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start p-2 bg-green-50 rounded-lg">
                  <i className="fas fa-leaf text-green-600 mr-2 mt-0.5 text-xs"></i>
                  <span>Use specific crop varieties for better tracking</span>
                </div>
                <div className="flex items-start p-2 bg-blue-50 rounded-lg">
                  <i className="fas fa-calendar text-blue-600 mr-2 mt-0.5 text-xs"></i>
                  <span>Consider seasonal timing for optimal growth</span>
                </div>
                <div className="flex items-start p-2 bg-orange-50 rounded-lg">
                  <i className="fas fa-chart-line text-orange-600 mr-2 mt-0.5 text-xs"></i>
                  <span>System will track growth automatically</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCrop;