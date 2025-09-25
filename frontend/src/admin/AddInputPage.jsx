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

    const [error, setError] = useState(null); // API errors සඳහා
    const [validationErrors, setValidationErrors] = useState({}); // Field validation errors සඳහා
    const [isSubmitting, setIsSubmitting] = useState(false);

    // තනි Field එකක් Validate කිරීම සඳහා වන Helper function එක
    const validateField = (name, value) => {
        let errorMessage = '';

        // "අකුරු සහ හිස්තැන් පමණක්" සඳහා Regex
        const lettersSpacesOnlyRegex = /^[A-Za-z\s]*$/;
        // "සංඛ්‍යා පමණක් (දශම සහිතව)" සඳහා Regex
        const numbersOnlyRegex = /^-?(?:\d+\.?\d*|\.?\d+)$/; // ඍණ අගයන් සඳහාද ඉඩ දෙයි, නමුත් අපගේ පාලනයන් ඒවා වළක්වයි.
        // "පූර්ණ සංඛ්‍යා පමණක්" සඳහා Regex
        const integersOnlyRegex = /^[0-9]*$/;

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
                } else if (!integersOnlyRegex.test(value.toString())) {
                    errorMessage = 'Stock Quantity must be a whole number (no decimals, letters, or special characters).';
                } else if (Number(value) < 0) {
                    errorMessage = 'Stock Quantity cannot be negative.';
                } else if (Number(value) > 100) { // Max value check for stockQty
                    errorMessage = 'Stock Quantity cannot exceed 100.';
                }
                break;
            case 'activeIngredient':
                if (value.trim() && !lettersSpacesOnlyRegex.test(value)) {
                    errorMessage = 'Active Ingredient can only contain letters and spaces (no numbers or special characters).';
                }
                break;
            case 'dilutionRate':
                if (value.toString().trim()) {
                    if (!numbersOnlyRegex.test(value.toString())) {
                        errorMessage = 'Dilution Rate must be a number (allowing decimals, no letters or special characters).';
                    } else if (parseFloat(value) <= 0) {
                        errorMessage = 'Dilution Rate must be a positive number.';
                    } else if (parseFloat(value) > 100) { // Max value updated to 100
                        errorMessage = 'Dilution Rate cannot exceed 100.';
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
                    if (!integersOnlyRegex.test(value.toString())) {
                        errorMessage = 'Pre-Harvest Interval must be a whole number (no decimals, letters, or special characters).';
                    } else if (Number(value) < 0) {
                        errorMessage = 'Pre-Harvest Interval cannot be negative.';
                    } else if (Number(value) > 100) {
                        errorMessage = 'Pre-Harvest Interval cannot exceed 100 days.';
                    }
                }
                break;
            case 'reEntryHours':
                if (value.toString().trim()) {
                    if (!integersOnlyRegex.test(value.toString())) {
                        errorMessage = 'Re-Entry Period must be a whole number (no decimals, letters, or special characters).';
                    } else if (Number(value) < 0) {
                        errorMessage = 'Re-Entry Period cannot be negative.';
                    } else if (Number(value) > 100) { // Max value updated to 100
                        errorMessage = 'Re-Entry Period cannot exceed 100 hours.';
                    }
                }
                break;
            case 'notes':
                // පරිශීලකයාගේ ඉල්ලීම අනුව Notes සඳහාද අකුරු සහ හිස්තැන් පමණක්.
                if (value.trim() && !lettersSpacesOnlyRegex.test(value)) {
                    errorMessage = 'Notes can only contain letters and spaces (no numbers or special characters).';
                }
                break;
            default:
                break;
        }
        return errorMessage;
    };

    // අක්ෂර ඇතුලත් කිරීම සීමා කිරීමට සහ අගයන් පරීක්ෂා කිරීමට නව පොදු key down handler එකක්
    const handleKeyDown = (e, fieldType, allowDecimal = false) => {
        const { key } = e;
        const currentValue = e.target.value;

        const isControlKey = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'
        ].includes(key) ||
        ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 'c' || key === 'v' || key === 'x'));

        if (isControlKey) {
            return; // Control keys වලට ඉඩ දෙන්න
        }

        // Potential new value if the key is allowed to be typed
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;
        const potentialValue = currentValue.substring(0, selectionStart) + key + currentValue.substring(selectionEnd);

        if (fieldType === 'lettersSpaces') {
            if (!/^[A-Za-z\s]$/.test(key)) {
                e.preventDefault(); // අකුරු හෝ හිස්තැන් නොවන දේ අවහිර කරන්න
            }
        } else { // Numeric fields
            // Determine max value for the field (all requested to be 100)
            const maxValue = 100;

            // Prevent non-digits and non-decimal-point characters
            if (!/^[0-9]$/.test(key) && !(allowDecimal && key === '.')) {
                e.preventDefault();
                return;
            }

            // Decimal point specific checks
            if (key === '.') {
                if (!allowDecimal || currentValue.includes('.')) {
                    e.preventDefault(); // Don't allow multiple decimals or decimals in non-decimal fields
                    return;
                }
            } else { // It's a digit
                // --- Maximum Value Check (e.g., preventing typing '101' if current is '10') ---
                if (potentialValue !== '' && !isNaN(parseFloat(potentialValue)) && parseFloat(potentialValue) > maxValue) {
                    e.preventDefault();
                    return;
                }

                // --- Character Length Check (3 digits max for integer part, 2 decimal places for dilutionRate) ---
                if (allowDecimal) { // dilutionRate (with decimals)
                    let parts = potentialValue.split('.');
                    let integerPart = parts[0];
                    let decimalPart = parts[1] || '';

                    if (integerPart.length > 3) { // Max 3 digits for integer part (e.g., for '100')
                        e.preventDefault();
                        return;
                    }
                    if (decimalPart.length > 2) { // Max 2 decimal places
                        e.preventDefault();
                        return;
                    }
                } else { // stockQty, preHarvestIntervalDays, reEntryHours (integers)
                    if (potentialValue.length > 3) { // Max 3 digits total for integers (e.g., '100')
                        e.preventDefault();
                        return;
                    }
                }
            }
        }
    };

    // handleChange function - Field errors ඉවත් කිරීමට සහ අංක පරිවර්තනය කිරීමට වැඩි දියුණු කර ඇත.
    const handleChange = (e) => {
        const { name, value } = e.target;

        // පරිශීලකයා ටයිප් කරන විට මෙම Field එකේ පෙර තිබූ දෝෂය ඉවත් කරන්න
        setValidationErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));

        let processedValue = value;
        // අංක විය යුතු නමුත් දැඩි input control සඳහා type="text" භාවිතා කරන Field
        const numericFields = ['stockQty', 'dilutionRate', 'preHarvestIntervalDays', 'reEntryHours'];

        if (numericFields.includes(name) && value !== '') {
            // අංකයකට පරිවර්තනය කරන්න, නමුත් හිස් string සඳහාද ඉඩ දෙන්න
            // parseFloat or parseInt based on whether it can be decimal
            if (name === 'dilutionRate') {
                processedValue = parseFloat(value);
                if (isNaN(processedValue)) processedValue = value; // Keep string if invalid float
            } else {
                processedValue = parseInt(value, 10);
                if (isNaN(processedValue)) processedValue = value; // Keep string if invalid int
            }
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: processedValue
        }));
    };

    // සම්පූර්ණ Form එක Validate කිරීමට Function එක
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

    // handleSubmit function - loading state සහ validation සමඟ වැඩි දියුණු කර ඇත.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // පොදු API දෝෂය ඉවත් කරන්න

        if (!validateForm()) {
            setError('Please correct the highlighted errors before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Submit කිරීම සඳහා දත්ත සකස් කරන්න, විකල්ප අංක සඳහා හිස් strings 'null' බවට පත් කරන්න
            const dataToSubmit = { ...formData };
            // හිස් string 'Number('')' බවට පරිවර්තනය කළ විට 0 ක් වන බැවින්, null බවට පත් කරන්න
            if (dataToSubmit.preHarvestIntervalDays === '') dataToSubmit.preHarvestIntervalDays = null;
            if (dataToSubmit.reEntryHours === '') dataToSubmit.reEntryHours = null;
            if (dataToSubmit.dilutionRate === '') dataToSubmit.dilutionRate = null;
            if (dataToSubmit.stockQty === '') dataToSubmit.stockQty = null; // Also handle stockQty if it could somehow be empty after validation (though it's required)

            await api.post('/inputs', dataToSubmit);
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
                                        onKeyDown={(e) => handleKeyDown(e, 'lettersSpaces')}
                                        required
                                        className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                        placeholder="e.g., Urea Fertilizer"
                                    />
                                    {validationErrors.name && <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                        required
                                    >
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="pesticide">Pesticide</option>
                                        <option value="herbicide">Herbicide</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {validationErrors.category && <p className="mt-1 text-xs text-red-600">{validationErrors.category}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Initial Stock Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text" // Strict input control සඳහා type="text"
                                            name="stockQty"
                                            value={formData.stockQty}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, 'digits')} // අංක සඳහා onKeyDown handler
                                            required
                                            className={`block w-full px-4 py-3 pr-16 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.stockQty ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            placeholder="500"
                                        />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">
                                            units
                                        </span>
                                    </div>
                                    {validationErrors.stockQty && <p className="mt-1 text-xs text-red-600">{validationErrors.stockQty}</p>}
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
                                            onKeyDown={(e) => handleKeyDown(e, 'lettersSpaces')}
                                            className={`block w-full px-4 py-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.activeIngredient ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            placeholder="e.g., Imidacloprid"
                                        />
                                        {validationErrors.activeIngredient && <p className="mt-1 text-xs text-red-600">{validationErrors.activeIngredient}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Application Method <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="method"
                                            value={formData.method}
                                            onChange={handleChange}
                                            className={`block w-full px-4 py-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.method ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            required
                                        >
                                            <option value="" disabled>-- Select a Method --</option>
                                            <option value="soil">Soil Application</option>
                                            <option value="foliar">Foliar Spray</option>
                                            <option value="drip">Drip Irrigation</option>
                                            <option value="spray">General Spray</option>
                                            <option value="seed">Seed Treatment</option>
                                        </select>
                                        {validationErrors.method && <p className="mt-1 text-xs text-red-600">{validationErrors.method}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Dilution Rate</label>
                                        <input
                                            type="text" // Strict input control සඳහා type="text"
                                            name="dilutionRate"
                                            value={formData.dilutionRate}
                                            onChange={handleChange}
                                            onKeyDown={(e) => handleKeyDown(e, 'numericWithDecimal', true)} // දශම සහිත අංක සඳහා onKeyDown handler
                                            className={`block w-full px-4 py-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.dilutionRate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                            placeholder="e.g., 0.3"
                                        />
                                        {validationErrors.dilutionRate && <p className="mt-1 text-xs text-red-600">{validationErrors.dilutionRate}</p>}
                                    </div>

                                    <div></div> {/* Grid layout එක පවත්වා ගැනීමට හිස් div එකක් */}

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Pre-Harvest Interval</label>
                                        <div className="relative">
                                            <input
                                                type="text" // Strict input control සඳහා type="text"
                                                name="preHarvestIntervalDays"
                                                value={formData.preHarvestIntervalDays}
                                                onChange={handleChange}
                                                onKeyDown={(e) => handleKeyDown(e, 'digits')} // අංක සඳහා onKeyDown handler
                                                className={`block w-full px-4 py-3 pr-16 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.preHarvestIntervalDays ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                                placeholder="7"
                                            />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">
                                                days
                                            </span>
                                        </div>
                                        {validationErrors.preHarvestIntervalDays && <p className="mt-1 text-xs text-red-600">{validationErrors.preHarvestIntervalDays}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Re-Entry Period</label>
                                        <div className="relative">
                                            <input
                                                type="text" // Strict input control සඳහා type="text"
                                                name="reEntryHours"
                                                value={formData.reEntryHours}
                                                onChange={handleChange}
                                                onKeyDown={(e) => handleKeyDown(e, 'digits')} // අංක සඳහා onKeyDown handler
                                                className={`block w-full px-4 py-3 pr-16 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 ${validationErrors.reEntryHours ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all`}
                                                placeholder="24"
                                            />
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">
                                                hours
                                            </span>
                                        </div>
                                        {validationErrors.reEntryHours && <p className="mt-1 text-xs text-red-600">{validationErrors.reEntryHours}</p>}
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
                                    onKeyDown={(e) => handleKeyDown(e, 'lettersSpaces')}
                                    className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 ${validationErrors.notes ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-transparent'} transition-all resize-none`}
                                    rows="4"
                                    placeholder="Add any supplier details, safety notes, or special instructions here..."
                                />
                                {validationErrors.notes && <p className="mt-1 text-xs text-red-600">{validationErrors.notes}</p>}
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