import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

const AddInputPage = () => {
    const navigate = useNavigate();

    // Form state - No changes made
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

<<<<<<< Updated upstream
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // handleChange function - කිසිදු වෙනසක් කර නැත
    const handleChange = (e) => {
        const { name, value, type } = e.target;
=======
    const [error, setError] = useState(null); // For API errors
    const [validationErrors, setValidationErrors] = useState({}); // For field validation errors
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper function to validate a single field
    const validateField = (name, value) => {
        let errorMessage = '';

        // Regex for "letters and spaces only"
        const lettersSpacesOnlyRegex = /^[A-Za-z\s]*$/;
        // Regex for "positive numbers only (with decimals)"
        const positiveNumbersOnlyRegex = /^(?:\d+\.?\d*|\.?\d+)$/; // Does not allow negative values
        // Regex for "positive integers only"
        const positiveIntegersOnlyRegex = /^[0-9]*$/; // Matches empty string and positive integers

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Product Name is required.';
                } else if (!lettersSpacesOnlyRegex.test(value)) {
                    errorMessage = 'Product Name can only contain letters and spaces (no numbers or special characters).';
                }
                break;
            case 'stockQty':
                if (!value.toString().trim()) {
                    errorMessage = 'Initial Stock Quantity is required.';
                } else if (!positiveIntegersOnlyRegex.test(value.toString())) {
                    errorMessage = 'Stock Quantity must be a whole number (no decimals, letters, or special characters).';
                } else if (Number(value) < 1 || Number(value) > 1000) { // Range 1-1000
                    errorMessage = 'Stock Quantity must be between 1 and 1000.';
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
                if (!/^[A-Za-z\s]$/.test(key)) {
                    e.preventDefault(); // Block anything that is not a letter or space
                }
                return; // No further numeric checks needed for this field
            case 'stockQty':
                maxValue = 1000;
                maxIntegerDigits = 4; // Max 4 digits for '1000'
                if (!/^[0-9]$/.test(key)) { // Only digits
                    e.preventDefault();
                    return;
                }
                break;
            case 'dilutionRate':
                // For dilutionRate, allow digits, '.', letters, and '/'
                // We'll rely on validateField for numeric range and decimal precision
                if (!/^[0-9.A-Za-z/]$/.test(key)) {
                    e.preventDefault();
                    return;
                }
                if (key === '.' && currentValue.includes('.')) {
                    e.preventDefault(); // Only one decimal point
                    return;
                }
                // No max value/length checks here, as letters are allowed and it complicates the logic.
                // The main validation will happen in validateField.
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

    // handleChange function - Improved to clear field errors and handle number conversion.
    const handleChange = (e) => {
        const { name, value } = e.target;

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

>>>>>>> Stashed changes
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'number' && value !== '' ? Number(value) : value
        }));
    };

<<<<<<< Updated upstream
    // handleSubmit function - enhanced with loading state
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await api.post('/inputs', formData);
=======
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

    // handleSubmit function - Improved with loading state and validation.
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

            await api.post('/inputs', dataToSubmit);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        required 
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Urea Fertilizer" 
=======
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onKeyDown={(e) => handleKeyDown(e, 'name')}
                                        required
                                        className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                        placeholder="e.g., Urea Fertilizer"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                        <input 
                                            type="number" 
                                            name="stockQty" 
                                            min="0" 
                                            value={formData.stockQty} 
                                            onChange={handleChange} 
                                            required 
                                            className="block w-full px-4 py-3 pr-16 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="500" 
=======
                                        <input
                                            type="text" // Using type="text" for strict input control
                                            name="stockQty"
                                            value={formData.stockQty}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, 'stockQty')} // onKeyDown handler for numbers
                                            required
                                            className={`block w-full px-4 py-3 pr-16 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.stockQty ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            placeholder="500"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                        <input 
                                            type="text" 
                                            name="activeIngredient" 
                                            value={formData.activeIngredient} 
                                            onChange={handleChange} 
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Imidacloprid" 
=======
                                        <input
                                            type="text"
                                            name="activeIngredient"
                                            value={formData.activeIngredient}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, 'activeIngredient')} // No specific keydown restrictions.
                                            className={`block w-full px-4 py-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.activeIngredient ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            placeholder="e.g., Imidacloprid"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                        <input 
                                            type="text" 
                                            name="dilutionRate" 
                                            value={formData.dilutionRate} 
                                            onChange={handleChange} 
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            placeholder="e.g., 0.3 ml/L" 
=======
                                        <input
                                            type="text" // Using type="text" for strict input control
                                            name="dilutionRate"
                                            value={formData.dilutionRate}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, 'dilutionRate')} // onKeyDown handler for numbers, letters, '/'
                                            className={`block w-full px-4 py-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.dilutionRate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            placeholder="e.g., 0.50"
>>>>>>> Stashed changes
                                        />
                                    </div>

<<<<<<< Updated upstream
                                    <div></div>
=======
                                    <div></div> {/* Empty div to maintain grid layout */}
>>>>>>> Stashed changes

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Pre-Harvest Interval</label>
                                        <div className="relative">
<<<<<<< Updated upstream
                                            <input 
                                                type="number" 
                                                name="preHarvestIntervalDays" 
                                                min="0" 
                                                value={formData.preHarvestIntervalDays} 
                                                onChange={handleChange} 
                                                className="block w-full px-4 py-3 pr-16 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
=======
                                            <input
                                                type="text" // Using type="text" for strict input control
                                                name="preHarvestIntervalDays"
                                                value={formData.preHarvestIntervalDays}
                                                onChange={handleChange}
                                                onKeyDown={(e) => handleKeyDown(e, 'preHarvestIntervalDays')} // onKeyDown handler for numbers
                                                className={`block w-full px-4 py-3 pr-16 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.preHarvestIntervalDays ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                            <input 
                                                type="number" 
                                                name="reEntryHours" 
                                                min="0" 
                                                value={formData.reEntryHours} 
                                                onChange={handleChange} 
                                                className="block w-full px-4 py-3 pr-16 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
=======
                                            <input
                                                type="text" // Using type="text" for strict input control
                                                name="reEntryHours"
                                                value={formData.reEntryHours}
                                                onChange={handleChange}
                                                onKeyDown={(e) => handleKeyDown(e, 'reEntryHours')} // onKeyDown handler for numbers
                                                className={`block w-full px-4 py-3 pr-16 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.reEntryHours ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                <textarea 
                                    name="notes" 
                                    value={formData.notes} 
                                    onChange={handleChange} 
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                    rows="4" 
=======
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'notes')} // No specific keydown restrictions.
                                    className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.notes ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all resize-none`}
                                    rows="4"
>>>>>>> Stashed changes
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