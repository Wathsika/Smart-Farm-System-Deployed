import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

const EditInputPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // Form data state
    const [formData, setFormData] = useState({
        name: '', category: 'fertilizer', stockQty: '',
        activeIngredient: '', dilutionRate: '', method: '',
        preHarvestIntervalDays: '', reEntryHours: '', notes: '',
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gather data to the back end if while page is loading
    useEffect(() => {
        const fetchInputData = async () => {
            try {
                const response = await api.get(`/inputs/${id}`);
                // form sate
                setFormData(response.data);
            } catch (err) {
                setError("Could not load data for this input.");
            } finally {
                setLoading(false);
            }
        };

        fetchInputData();
    }, [id]);

    // Handling the Input Field Function
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevState => ({
            ...prevState,
         [name]: type === 'number' && value !== '' ? Number(value) : value}));
    };

    // Form submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await api.put(`/inputs/${id}`, formData);
            alert('Farm input updated successfully!'); //new
            navigate('/admin/crop/inputs', {
                replace: true,
                state: {
                    updatedInput: response.data,
                },
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update input.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-slate-700 font-medium">Loading Input Data...</span>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-red-700 font-medium">{error}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-6 w-px bg-slate-300"></div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Edit Farm Input</h1>
                                <p className="text-slate-600 mt-1">Update information for: <span className="font-semibold text-slate-800">{formData.name}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                formData.category === 'fertilizer' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                formData.category === 'pesticide' 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                                    'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    formData.category === 'fertilizer' ? 'bg-emerald-500' :
                                    formData.category === 'pesticide' ? 'bg-amber-500' : 'bg-slate-500'
                                }`}></div>
                                {formData.category}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Section 1: Basic Information */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                                    <p className="text-sm text-slate-600">Essential details about the farm input</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name || ''} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Enter product name"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select 
                                            name="category" 
                                            value={formData.category || 'other'} 
                                            onChange={handleChange} 
                                            required
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                                        >
                                            <option value="fertilizer">Fertilizer</option>
                                            <option value="pesticide">Pesticide</option>
                                            <option value="herbicide">Herbicide</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Stock Quantity(kg) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="stockQty" 
                                            min="0" 
                                            value={formData.stockQty || ''} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Enter quantity"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Usage & Safety Details */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center">
                                <div className="p-2 bg-amber-100 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Usage & Safety Details</h2>
                                    <p className="text-sm text-slate-600">Application methods and safety information</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Active Ingredient</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="activeIngredient" 
                                            value={formData.activeIngredient || ''} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Enter active ingredient"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Application Method</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="method" 
                                            value={formData.method || ''} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="e.g., Foliar spray, Soil application"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 11a1 1 0 001 1h8a1 1 0 001-1V8H7v7zM10 6h4v5h-4V6z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Dilution Rate</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="dilutionRate" 
                                            value={formData.dilutionRate || ''} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="e.g., 1:100, 2ml per liter"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div></div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Pre-Harvest Interval</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="preHarvestIntervalDays" 
                                            min="0" 
                                            value={formData.preHarvestIntervalDays || ''} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Days before harvest"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-sm text-slate-500">days</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Re-Entry Period</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="reEntryHours" 
                                            min="0" 
                                            value={formData.reEntryHours || ''} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400"
                                            placeholder="Hours before re-entry"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-sm text-slate-500">hours</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Notes */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center">
                                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Additional Notes</h2>
                                    <p className="text-sm text-slate-600">Any additional information or special instructions</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Notes</label>
                                <textarea 
                                    name="notes" 
                                    value={formData.notes || ''} 
                                    onChange={handleChange} 
                                    rows="4"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 resize-none"
                                    placeholder="Enter any additional notes, storage instructions, or special considerations..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/crop/inputs')}
                            className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Update Input
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInputPage;