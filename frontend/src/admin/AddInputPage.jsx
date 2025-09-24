import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

const AddInputPage = () => {
    const navigate = useNavigate();

    // Form state - කිසිදු වෙනසක් කර නැත
    const [formData, setFormData] = useState({
        name: '',
        category: 'fertilizer', 
        stockQty: '',
        activeIngredient: '',
        dilutionRate: '',
        method: '', 
        preHarvestIntervalDays: '',
        reEntryHours: '',
        notes: '',
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // handleChange function - කිසිදු වෙනසක් කර නැත
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'number' && value !== '' ? Number(value) : value
        }));
    };

    // handleSubmit function - enhanced with loading state
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await api.post('/inputs', formData);
            alert('New farm input added successfully!');
            navigate('/admin/crop/inputs');
        } catch (err) {
            const serverError = err.response?.data?.message || 'Failed to add the input.';
            setError(serverError);
            console.error(serverError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - 10% accent color */}
            <div className="bg-white border-b-4 border-green-600">
                <div className="max-w-6xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Add New Farm Input</h1>
                            <p className="text-gray-600 text-sm">Enter product details and safety information</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/crop/inputs')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                        >
                            ← Back to Inputs
                        </button>
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        required 
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Urea Fertilizer" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        name="category" 
                                        value={formData.category} 
                                        onChange={handleChange} 
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        required
                                    >
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="pesticide">Pesticide</option>
                                        <option value="herbicide">Herbicide</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Initial Stock Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="stockQty" 
                                            min="0" 
                                            value={formData.stockQty} 
                                            onChange={handleChange} 
                                            required 
                                            className="block w-full px-4 py-3 pr-16 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="500" 
                                        />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">
                                            units
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 mb-12"></div>

                        {/* Section 2: Usage & Safety - 30% green accent */}
                        <div className="mb-12">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                <div className="flex items-center mb-6">
                                    <div className="w-1 h-6 bg-green-600 mr-3"></div>
                                    <h2 className="text-xl font-semibold text-gray-800">Usage & Safety Details</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Active Ingredient</label>
                                        <input 
                                            type="text" 
                                            name="activeIngredient" 
                                            value={formData.activeIngredient} 
                                            onChange={handleChange} 
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Imidacloprid" 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Application Method <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            name="method" 
                                            value={formData.method} 
                                            onChange={handleChange} 
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            required
                                        >
                                            <option value="" disabled>-- Select a Method --</option>
                                            <option value="soil">Soil Application</option>
                                            <option value="foliar">Foliar Spray</option>
                                            <option value="drip">Drip Irrigation</option>
                                            <option value="spray">General Spray</option>
                                            <option value="seed">Seed Treatment</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Dilution Rate</label>
                                        <input 
                                            type="text" 
                                            name="dilutionRate" 
                                            value={formData.dilutionRate} 
                                            onChange={handleChange} 
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="e.g., 0.3 ml/L" 
                                        />
                                    </div>

                                    <div></div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Pre-Harvest Interval</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                name="preHarvestIntervalDays" 
                                                min="0" 
                                                value={formData.preHarvestIntervalDays} 
                                                onChange={handleChange} 
                                                className="block w-full px-4 py-3 pr-16 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                placeholder="7"
                                            />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">
                                                days
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Re-Entry Period</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                name="reEntryHours" 
                                                min="0" 
                                                value={formData.reEntryHours} 
                                                onChange={handleChange} 
                                                className="block w-full px-4 py-3 pr-16 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                placeholder="24"
                                            />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">
                                                hours
                                            </span>
                                        </div>
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
                                <label className="block text-sm font-medium text-gray-700">Notes & Instructions</label>
                                <textarea 
                                    name="notes" 
                                    value={formData.notes} 
                                    onChange={handleChange} 
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                    rows="4" 
                                    placeholder="Add any supplier details, safety notes, or special instructions here..."
                                />
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-8">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Divider */}
                        <div className="border-t border-gray-200 mb-8"></div>

                        {/* Submit Section */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Required fields
                            </div>
                            <div className="flex items-center space-x-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate('/admin/crop/inputs')}
                                    className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
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
                                            Saving Input...
                                        </>
                                    ) : (
                                        'Save Input'
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

export default AddInputPage;