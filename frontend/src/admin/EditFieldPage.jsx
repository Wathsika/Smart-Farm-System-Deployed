// src/pages/EditFieldPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js'; 
export const STATUS_OPTIONS = ['In Use', 'Available', 'Planted', 'Under Preparation'];

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
        [name]: name === 'value' ? Number(value) : value,
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/fields/${id}`, formData);
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
          </div>
          <p className="text-center text-gray-600">Loading field data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-800">Error Loading Field</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/admin/fields" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            ← Go Back to Fields
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - 10% accent color */}
      <div className="bg-white border-b-4 border-green-600">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/fields" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Field</h1>
                <p className="text-sm text-gray-600">{originalFieldCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 60% white background */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* Section 1: Basic Information */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-green-600 mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="fieldName" 
                    value={formData.fieldName || ''} 
                    onChange={handleChange} 
                    required 
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter field name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Field Code (Unique)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="fieldCode" 
                      value={formData.fieldCode || ''} 
                      readOnly 
                      className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-md text-sm bg-gray-100 cursor-not-allowed text-gray-600"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-12"></div>

            {/* Section 2: Field Details - 30% green accent */}
            <div className="mb-12">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-6 bg-green-600 mr-3"></div>
                  <h2 className="text-xl font-semibold text-gray-800">Field Details</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="locationDescription" 
                      value={formData.locationDescription || ''} 
                      onChange={handleChange} 
                      required 
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" 
                      rows="3"
                      placeholder="Describe the field location..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Area Size <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        name="value" 
                        step="0.01" 
                        value={formData.area.value || ''} 
                        onChange={handleAreaChange} 
                        required 
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Area Unit</label>
                      <select 
                        name="unit" 
                        value={formData.area.unit || 'acres'} 
                        onChange={handleAreaChange} 
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="sqm">Square Meters</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Soil Type</label>
                      <select 
                        name="soilType" 
                        value={formData.soilType || ''} 
                        onChange={handleChange} 
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="" disabled>Select Soil Type</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Clay">Clay</option>
                        <option value="Sandy">Sandy</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select 
                        name="status"
                        value={formData.status || ''}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      >
                        <option value="" disabled>Select Status</option>
                          {STATUS_OPTIONS.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Irrigation System</label>
                    <input 
                      type="text" 
                      name="irrigationSystem" 
                      value={formData.irrigationSystem || ''} 
                      onChange={handleChange} 
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., Sprinkler, Drip, Manual..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Notes */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-green-600 mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-800">Additional Notes</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes || ''} 
                  onChange={handleChange} 
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none" 
                  rows="4"
                  placeholder="Additional notes about this field..."
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-8"></div>

            {/* Submit Section */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/fields"
                  className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Field...
                    </>
                  ) : (
                    'Update Field'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFieldPage;