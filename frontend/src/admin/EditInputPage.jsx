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
    const [error, setError] = useState(null); // For API errors and general form errors
    const [validationErrors, setValidationErrors] = useState({}); // For field validation errors
    const [isSubmitting, setIsSubmitting] = useState(false); // To manage button state during submission

    // Set page title for Edit page
    useEffect(() => {
        document.title = 'Edit Farm Input';
    }, []);

    // Helper function to validate a single field
    const validateField = (name, value) => {
        let errorMessage = '';

        // Regex for "letters, numbers, and spaces only" (no symbols)
        const lettersSpacesOnlyRegex = /^[A-Za-z0-9\s]*$/;
        // Regex for "positive numbers only (with decimals)"
        const positiveNumbersOnlyRegex = /^(?:\d+\.?\d*|\.?\d+)$/; // Does not allow negative values
        // Regex for "positive integers only"
        const positiveIntegersOnlyRegex = /^[0-9]*$/; // Matches empty string and positive integers

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Product Name is required.';
                } else if (!lettersSpacesOnlyRegex.test(value)) {
                    errorMessage = 'Product Name can only contain letters, numbers, and spaces (no special characters).';
                }
                break;
            case 'stockQty':
                if (!value.toString().trim()) {
                    errorMessage = 'Initial Stock Quantity is required.';
                } else if (!positiveIntegersOnlyRegex.test(value.toString())) {
                    errorMessage = 'Stock Quantity must be a whole number (no decimals, letters, or special characters).';
                } else if (Number(value) < 1 || Number(value) > 2000) { // Range 1-2000
                    errorMessage = 'Stock Quantity must be between 1 and 2000.';
                }
                break;
            case 'activeIngredient':
                // No specific validation required for Active Ingredient - allows all characters as per user request.
                break;
            case 'dilutionRate':
                if (value.toString().trim()) {
                    const parsedValue = parseFloat(value);
                    if (isNaN(parsedValue)) {
                        errorMessage = 'Dilution Rate must be a valid number.';
                    } else if (parsedValue < 0.50 || parsedValue > 100.00) { // Range 0.50-100.00
                        errorMessage = 'Dilution Rate must be between 0.50 and 100.00.';
                    } else if (value.includes('.') && value.split('.')[1].length > 2) {
                        errorMessage = 'Dilution Rate can have a maximum of 2 decimal places.';
                    }
                }
                break;
            case 'method':
                if (!value) {
                    errorMessage = 'Application Method is required.';
                }
                break;
            case 'preHarvestIntervalDays':
                if (value.toString().trim()) {
                    if (!positiveIntegersOnlyRegex.test(value.toString())) {
                        errorMessage = 'Pre-Harvest Interval must be a whole number (no decimals, letters, or special characters).';
                    } else if (Number(value) < 1 || Number(value) > 30) { // Range 1-30
                        errorMessage = 'Pre-Harvest Interval must be between 1 and 30 days.';
                    }
                }
                break;
            case 'reEntryHours':
                if (value.toString().trim()) {
                    if (!positiveIntegersOnlyRegex.test(value.toString())) {
                        errorMessage = 'Re-Entry Period must be a whole number (no decimals, letters, or special characters).';
                    } else if (Number(value) < 0 || Number(value) > 72) { // Range 0-72, allows 0
                        errorMessage = 'Re-Entry Period must be between 0 and 72 hours.';
                    }
                }
                break;
            case 'notes':
                // No specific validation required for Notes - allows all characters as per user request.
                break;
            default:
                break;
        }
        return errorMessage;
    };

    // New common key down handler to restrict character input and check values
    const handleKeyDown = (e, fieldName) => {
        const { key } = e;
        const currentValue = e.target.value;

        const isControlKey = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'
        ].includes(key) ||
        ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 'c' || key === 'v' || key === 'x'));

        if (isControlKey) {
            return; // Allow control keys
        }

        let allowDecimal = false;
        let maxValue = 0;
        let maxIntegerDigits = 0;

        switch (fieldName) {
            case 'name':
                if (!/^[A-Za-z0-9\s]$/.test(key)) {
                    e.preventDefault(); // Block anything that is not a letter or space
                }
                return; // No further numeric checks needed for this field
            case 'stockQty':
                maxValue = 2000;
                maxIntegerDigits = 4; // Max 4 digits for '1000'
                if (!/^[0-9]$/.test(key)) { // Only digits
                    e.preventDefault();
                    return;
                }
                break;
            case 'dilutionRate':
                // Allow only digits and a single dot
                if (!/^[0-9.]$/.test(key)) {
                    e.preventDefault();
                    return;
                }
                // Only one decimal point
                if (key === '.' && currentValue.includes('.')) {
                    e.preventDefault();
                    return;
                }
                // Enforce at most 2 decimal places and max 100.00 while typing
                const sStart = e.target.selectionStart ?? currentValue.length;
                const sEnd = e.target.selectionEnd ?? currentValue.length;
                const potential = currentValue.slice(0, sStart) + key + currentValue.slice(sEnd);
                if (potential.includes('.')) {
                    const [, dec = ''] = potential.split('.');
                    if (dec.length > 2) {
                        e.preventDefault();
                        return;
                    }
                }
                const num = parseFloat(potential);
                if (!isNaN(num) && num > 100) {
                    e.preventDefault();
                    return;
                }
                return;
            case 'preHarvestIntervalDays':
                maxValue = 30;
                maxIntegerDigits = 2; // Max 2 digits for '30'
                if (!/^[0-9]$/.test(key)) { // Only digits
                    e.preventDefault();
                    return;
                }
                break;
            case 'reEntryHours':
                maxValue = 72;
                maxIntegerDigits = 2; // Max 2 digits for '72'
                if (!/^[0-9]$/.test(key)) { // Only digits
                    e.preventDefault();
                    return;
                }
                break;
            case 'activeIngredient':
            case 'notes':
                // No keydown restrictions for Active Ingredient and Notes as per user request.
                return;
            default:
                return;
        }

        // Common numeric field checks (for stockQty, preHarvestIntervalDays, reEntryHours)
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;
        const potentialValue = currentValue.substring(0, selectionStart) + key + currentValue.substring(selectionEnd);

        if (potentialValue !== '') {
            const numericPotentialValue = parseFloat(potentialValue);
            if (!isNaN(numericPotentialValue)) {
                if (numericPotentialValue > maxValue) {
                    // Allow '0' if it's a valid minimum (like for reEntryHours)
                    if (!(numericPotentialValue === 0 && fieldName === 'reEntryHours')) {
                        e.preventDefault();
                        return;
                    }
                }
            }
            if (potentialValue.length > maxIntegerDigits) {
                e.preventDefault();
                return;
            }
        }
    };

    // Gather data to the back end if while page is loading
    useEffect(() => {
        const fetchInputData = async () => {
            try {
                const response = await api.get(`/inputs/${id}`);
                // Ensure null values from API are converted to empty strings for controlled inputs
                const data = response.data;
                setFormData({
                    name: data.name || '',
                    category: data.category || 'fertilizer',
                    stockQty: data.stockQty !== null ? data.stockQty : '',
                    activeIngredient: data.activeIngredient || '',
                    dilutionRate: data.dilutionRate !== null ? data.dilutionRate : '',
                    method: data.method || '',
                    preHarvestIntervalDays: data.preHarvestIntervalDays !== null ? data.preHarvestIntervalDays : '',
                    reEntryHours: data.reEntryHours !== null ? data.reEntryHours : '',
                    notes: data.notes || '',
                });
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
        const { name, value } = e.target; // Removed 'type' as we're using custom handling

        // Clear previous error for this field when user types
        setValidationErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));

        let processedValue = value;
        // Fields that should be numbers but use type="text" for stricter input control
        const numericFields = ['stockQty', 'dilutionRate', 'preHarvestIntervalDays', 'reEntryHours'];

        if (numericFields.includes(name) && value !== '') {
            // For dilutionRate, keep as string during input to allow flexible typing before final validation
            if (name === 'dilutionRate') {
                processedValue = value;
            } else { // For other integer fields, parse to int
                processedValue = parseInt(value, 10);
                if (isNaN(processedValue)) processedValue = value; // Keep string if invalid int
            }
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: processedValue
        }));
    };

    // Function to validate the entire form
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        Object.keys(formData).forEach(fieldName => {
            const errorMessage = validateField(fieldName, formData[fieldName]);
            if (errorMessage) {
                errors[fieldName] = errorMessage;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    // Form submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear generic API error

        if (!validateForm()) {
            setError('Please correct the highlighted errors before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare data for submission, convert empty strings for optional numbers to 'null'
            const dataToSubmit = { ...formData };

            // Convert empty strings for optional numeric fields to null
            if (dataToSubmit.preHarvestIntervalDays === '') dataToSubmit.preHarvestIntervalDays = null;
            if (dataToSubmit.reEntryHours === '') dataToSubmit.reEntryHours = null;
            if (dataToSubmit.dilutionRate === '') dataToSubmit.dilutionRate = null;
            // stockQty is required, so it shouldn't be empty after validation, but adding a check for robustness
            if (dataToSubmit.stockQty === '') dataToSubmit.stockQty = null;

            // Ensure numeric fields are actually numbers before sending, as `handleChange` might keep them as string for validation
            dataToSubmit.stockQty = dataToSubmit.stockQty !== null ? Number(dataToSubmit.stockQty) : null;
            dataToSubmit.dilutionRate = dataToSubmit.dilutionRate !== null ? Number(dataToSubmit.dilutionRate) : null;
            dataToSubmit.preHarvestIntervalDays = dataToSubmit.preHarvestIntervalDays !== null ? Number(dataToSubmit.preHarvestIntervalDays) : null;
            dataToSubmit.reEntryHours = dataToSubmit.reEntryHours !== null ? Number(dataToSubmit.reEntryHours) : null;

            const response = await api.put(`/inputs/${id}`, dataToSubmit);
            alert('Farm input updated successfully!');
            navigate('/admin/crop/inputs', {
                replace: true,
                state: {
                    updatedInput: response.data,
                },
            });
        } catch (err) {
            const serverError = err.response?.data?.message || 'Failed to update input.';
            setError(serverError);
            console.error(serverError);
        } finally {
            setIsSubmitting(false);
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

    if (error && !isSubmitting) return ( // Only show error if not currently submitting
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
                                            onKeyDown={(e) => handleKeyDown(e, 'name')}
                                            required 
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.name ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="Enter product name"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </div>
                                    {validationErrors.name && <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>}
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none ${validationErrors.category ? 'border-red-500' : 'border-slate-300'}`}
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
                                    {validationErrors.category && <p className="mt-1 text-xs text-red-600">{validationErrors.category}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Stock Quantity(kg) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" // Changed to text for strict input control
                                            name="stockQty" 
                                            value={formData.stockQty || ''} 
                                            onChange={handleChange} 
                                            onKeyDown={(e) => handleKeyDown(e, 'stockQty')}
                                            required 
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.stockQty ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="Enter quantity"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-1a9 9 0 00-18 0v1a2 2 0 002 2h2a2 2 0 002-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {validationErrors.stockQty && <p className="mt-1 text-xs text-red-600">{validationErrors.stockQty}</p>}
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
                                            onKeyDown={(e) => handleKeyDown(e, 'activeIngredient')} // No specific keydown restrictions.
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.activeIngredient ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="Enter active ingredient"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {validationErrors.activeIngredient && <p className="mt-1 text-xs text-red-600">{validationErrors.activeIngredient}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Application Method <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="method" 
                                            value={formData.method || ''} 
                                            onChange={handleChange} 
                                            required
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.method ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="e.g., Foliar spray, Soil application"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 11a1 1 0 001 1h8a1 1 0 001-1V8H7v7zM10 6h4v5h-4V6z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {validationErrors.method && <p className="mt-1 text-xs text-red-600">{validationErrors.method}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Dilution Rate</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            name="dilutionRate" 
                                            value={formData.dilutionRate || ''} 
                                            onChange={handleChange} 
                                            onKeyDown={(e) => handleKeyDown(e, 'dilutionRate')} // onKeyDown handler for numbers, letters, '/'
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.dilutionRate ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="e.g., 0.50"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 012 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {validationErrors.dilutionRate && <p className="mt-1 text-xs text-red-600">{validationErrors.dilutionRate}</p>}
                                </div>
                                <div></div> {/* Empty div to maintain grid layout */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Pre-Harvest Interval</label>
                                    <div className="relative">
                                        <input 
                                            type="text" // Changed to text for strict input control
                                            name="preHarvestIntervalDays" 
                                            value={formData.preHarvestIntervalDays || ''} 
                                            onChange={handleChange} 
                                            onKeyDown={(e) => handleKeyDown(e, 'preHarvestIntervalDays')} // onKeyDown handler for numbers
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.preHarvestIntervalDays ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="Days before harvest"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-sm text-slate-500">days</span>
                                        </div>
                                    </div>
                                    {validationErrors.preHarvestIntervalDays && <p className="mt-1 text-xs text-red-600">{validationErrors.preHarvestIntervalDays}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Re-Entry Period</label>
                                    <div className="relative">
                                        <input 
                                            type="text" // Changed to text for strict input control
                                            name="reEntryHours" 
                                            value={formData.reEntryHours || ''} 
                                            onChange={handleChange} 
                                            onKeyDown={(e) => handleKeyDown(e, 'reEntryHours')} // onKeyDown handler for numbers
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 ${validationErrors.reEntryHours ? 'border-red-500' : 'border-slate-300'}`}
                                            placeholder="Hours before re-entry"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-sm text-slate-500">hours</span>
                                        </div>
                                    </div>
                                    {validationErrors.reEntryHours && <p className="mt-1 text-xs text-red-600">{validationErrors.reEntryHours}</p>}
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
                                    onKeyDown={(e) => handleKeyDown(e, 'notes')} // No specific keydown restrictions.
                                    rows="4"
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-slate-400 resize-none ${validationErrors.notes ? 'border-red-500' : 'border-slate-300'}`}
                                    placeholder="Enter any additional notes, storage instructions, or special considerations..."
                                ></textarea>
                            </div>
                            {validationErrors.notes && <p className="mt-1 text-xs text-red-600">{validationErrors.notes}</p>}
                        </div>
                    </div>
                    
                    {/* Error Display for form-level errors */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
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
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/crop/inputs')}
                            className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all duration-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-200 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Update Input
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditInputPage;