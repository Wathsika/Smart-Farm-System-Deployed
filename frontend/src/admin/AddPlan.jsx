import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// ---------------- Shared inline validators ----------------
// Pattern for dosage amount input: Allows up to 4 digits before decimal, up to 2 decimal places.
// Specifically tailored for 1.00 to 1000.00 range during live input.
const dosageAmountDraftPattern = /^(?:[1-9]\d{0,2}|1000)(?:\.\d{0,2})?$/;

// Pattern for Repeat Every input: Allows 1-9 or 10, or empty string.
const repeatEveryDraftPattern = /^(?:[1-9]|10)?$/;

// Pattern for Total Occurrences input: Allows 1-9, 10-59, or 60, or empty string.
const occurrencesDraftPattern = /^(?:[1-9]|[1-5]\d|60)?$/;

// Pattern for Dosage Unit input: Allows only letters and '/'
const dosageUnitDraftPattern = /^[A-Za-z/]*$/;


// Utility to get today's date in YYYY-MM-DD format (local timezone)
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
  number: (msg = 'Must be a number') => v =>
    v === '' || v === null || v === undefined || isNaN(Number(v)) ? msg : null,
  integer: (msg = 'Must be a whole number') => v =>
    v === '' || v === null || v === undefined ? null : Number.isInteger(Number(v)) ? null : msg,
  max: (n, msg = `Must be ≤ ${n}`) => v =>
    v === '' || v === null || v === undefined ? null : Number(v) <= n ? null : msg,
  min: (n, msg = `Must be ≥ ${n}`) => v =>
    v === '' || v === null || v === undefined ? null : Number(v) >= n ? null : msg,
  decimalPlaces: (places = 2, msg = `Use up to ${places} decimal places`) => v => {
    if (v === '' || v === null || v === undefined) return null;
    const re = new RegExp(`^\\d+(?:\\.\\d{1,${places}})?$`);
    return re.test(String(v)) ? null : msg;
  },
  gt: (n, msg = `Must be > ${n}`) => v => Number(v) > n ? null : msg,
  oneOf: (arr, msg = 'Invalid value') => v => arr.includes(v) ? null : msg,
  pattern: (re, msg = 'Invalid format') => v =>
    v == null || re.test(String(v)) ? null : msg,
  notPastDate: (msg = 'Cannot be a past date') => v => {
    if (v === '' || v === null || v === undefined) return null;
    const selectedDate = new Date(v);
    const today = new Date(todayISO()); // Compare with today's date at midnight
    return selectedDate >= today ? null : msg;
  },
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

export default function AddPlan() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [dropdownData, setDropdownData] = useState({
    fertilizers: [],
    pesticides: [],
    crops: [],
    fields: [],
  });
  const [loading, setLoading] = useState(true);

  // Initial form state
  const initialFormState = {
    crop: "",
    field: "",
    product: "",
    dosage: { amount: "", unit: "ml/L" },
    schedule: {
      type: "weekly",
      startDate: todayISO(), // Set default to today's date
      repeatEvery: 1,
      occurrences: null, // Default to null for optional field
    },
    notes: "",
  };
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({}); // State to hold validation errors
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage submission status

  // --- FETCH DATA ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [fzRes, psRes, csRes, fsRes] = await Promise.all([
          api.get("/inputs", { params: { category: "fertilizer" } }),
          api.get("/inputs", { params: { category: "pesticide" } }),
          api.get("/crops"),
          api.get("/fields"),
        ]);

        setDropdownData({
          fertilizers: fzRes.data,
          pesticides: psRes.data,
          crops: csRes.data,
          fields: fsRes.data,
        });
      } catch (error) {
        console.error("Failed to fetch form data:", error);
        // Display user-friendly error
        setErrors({ submit: "Could not load necessary data. Please refresh the page." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- HANDLE FORM CHANGE ---
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const keys = name.split(".");

    setErrors(prev => ({ ...prev, [name]: undefined, submit: undefined })); // Clear specific error and submit error

    if (keys.length === 1) {
      setForm((prev) => ({ ...prev, [name]: value }));
    } else if (keys[0] === 'dosage' && keys[1] === 'amount') {
      // Live validation for dosage.amount using dosageAmountDraftPattern
      if (value === '' || dosageAmountDraftPattern.test(value)) {
        setForm((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        }));
      }
    } else if (keys[0] === 'dosage' && keys[1] === 'unit') {
      // Live validation for dosage.unit using dosageUnitDraftPattern and maxLength
      if (value === '' || (dosageUnitDraftPattern.test(value) && value.length <= 10)) {
        setForm((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        }));
      }
    } else if (keys[0] === 'schedule' && keys[1] === 'repeatEvery') {
      // Live validation for repeatEvery using repeatEveryDraftPattern
      if (value === '' || repeatEveryDraftPattern.test(value)) {
        setForm((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        }));
      }
    } else if (keys[0] === 'schedule' && keys[1] === 'occurrences') {
      // Live validation for occurrences using occurrencesDraftPattern
      if (value === '' || occurrencesDraftPattern.test(value)) {
        setForm((prev) => ({
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    }
  };

  // --- VALIDATE FORM ---
  const validateForm = () => {
    const schema = {
      // Crop: Required
      crop: [rules.required('Please select a crop')],
      // Field: Required
      field: [rules.required('Please select a field')],
      // Product: Required
      product: [rules.required('Please select a product')],
      
      // Dosage Amount: Required, number, 2 decimal places, min 0.01, max 1000
      'dosage.amount': [
        rules.required('Dosage amount is required'),
        rules.number('Must be a number'),
        rules.decimalPlaces(2, 'Use up to two decimal places'),
        rules.min(0.01, 'Must be at least 0.01'),
        rules.max(1000, 'Must be 1000 or less'),
      ],
      // Dosage Unit: Optional, letters and '/', max 10 chars
      'dosage.unit': [
        rules.maxLength(10, 'Max 10 characters'),
        rules.pattern(/^[A-Za-z/]*$/, 'Use letters and / only'),
      ],

      // Schedule Start Date: Required, not a past date
      'schedule.startDate': [
        rules.required('Start date is required'),
        rules.notPastDate('Cannot be a past date'),
      ],
      // Schedule Repeat Every: Required, integer, min 1, max 10
      'schedule.repeatEvery': [
        rules.required('Repeat frequency is required'),
        rules.number('Must be a number'),
        rules.integer('Must be a whole number'),
        rules.min(1, 'Must be at least 1'),
        rules.max(10, 'Must be 10 or less'),
      ],
      // Schedule Total Occurrences: Optional, integer, min 1, max 60
      'schedule.occurrences': [
        rules.number('Must be a number'), // Allows empty string to be valid here, Number('') is 0
        rules.integer('Must be a whole number'),
        rules.min(1, 'Must be at least 1'),
        rules.max(60, 'Must be 60 or less'),
      ],

      // Notes: Optional, max 500 characters
      notes: [rules.maxLength(500, 'Max 500 characters')],
    };
    const { valid, errors: errs } = validate(schema, form);
    setErrors(errs);
    return valid;
  };

  // --- SUBMIT HANDLER ---
  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error if validation fails
      // Ensure errors object is populated by validateForm before trying to read it
      const currentErrors = validate(schema, form).errors; // Re-validate to get current errors
      const firstErrorField = Object.keys(currentErrors)[0];
      if (firstErrorField) {
        // Find the input element by name, including nested names (e.g., dosage.amount)
        const inputElement = document.querySelector(`[name="${firstErrorField}"]`);
        inputElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        dosage: {
          ...form.dosage,
          amount: form.dosage.amount !== "" ? Number(form.dosage.amount) : null, // Convert to number if not empty
        },
        schedule: {
          ...form.schedule,
          repeatEvery: Number(form.schedule.repeatEvery),
          occurrences: form.schedule.occurrences !== "" && form.schedule.occurrences !== null ? Number(form.schedule.occurrences) : null, // Convert to number if not empty/null
        },
      };

      await api.post("/plans", payload);
      alert("Plan saved successfully!");
      setForm(initialFormState);
      setErrors({}); // Clear errors on successful submission
      navigate("/admin/crop/plans");
    } catch (error) {
      console.error("Failed to save plan:", error);
      const serverError =
        error.response?.data?.message || "Could not save the plan.";
      setErrors({ submit: serverError });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border border-slate-200 flex items-center gap-3 w-full max-w-sm">
          <div className="animate-spin h-6 w-6 rounded-full border-2 border-slate-200 border-t-emerald-500" />
          <span className="text-slate-700 text-sm font-medium">
            Loading form data...
          </span>
        </div>
      </div>
    );
  }

  // Helper to get error class for input fields
  const getInputBorderClass = (fieldName) =>
    errors[fieldName]
      ? 'border-rose-300 focus:ring-rose-500'
      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200';

  // --- COMPONENT RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Add Application Plan
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Create a new application schedule for fertilizers and pesticides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/crop/plans")}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm sm:text-base font-medium shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Plans
          </button>
        </header>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
            {/* --- SECTION 1: Target --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Define Target
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Select the crop and field for this application plan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:pl-11">
                {/* Crop */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Crop <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="crop"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('crop')}`}
                    value={form.crop}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Crop --
                    </option>
                    {dropdownData.crops.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.cropName}
                      </option>
                    ))}
                  </select>
                  {errors['crop'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['crop']}</p>
                  )}
                </div>

                {/* Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Field <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="field"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('field')}`}
                    value={form.field}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Field --
                    </option>
                    {dropdownData.fields.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.fieldName} ({f.fieldCode})
                      </option>
                    ))}
                  </select>
                  {errors['field'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['field']}</p>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* --- SECTION 2: Product & Dosage --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Define Input
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Choose the product and specify the dosage
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:pl-11">
                {/* Product */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Product <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="product"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('product')}`}
                    value={form.product}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Product --
                    </option>
                    <optgroup label="Fertilizers">
                      {dropdownData.fertilizers.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Pesticides">
                      {dropdownData.pesticides.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {errors['product'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['product']}</p>
                  )}
                </div>

                {/* Dosage Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Dosage Amount <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="dosage.amount"
                    type="text" // Changed to text to better control input with regex pattern
                    step="0.01"
                    min="0.01"
                    max="1000"
                    placeholder="Enter amount"
                    inputMode="decimal"
                    pattern="^(?:[1-9]\d{0,2}|1000)(?:\.\d{0,2})?$" // HTML5 pattern for browser-level validation hint
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('dosage.amount')}`}
                    value={form.dosage.amount}
                    onChange={handleFormChange}
                  />
                  {errors['dosage.amount'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['dosage.amount']}</p>
                  )}
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Unit
                  </label>
                  <input
                    name="dosage.unit"
                    placeholder="e.g. ml/L"
                    type="text" // Ensure type is text for pattern validation
                    pattern="^[A-Za-z/]*$" // HTML5 pattern
                    maxLength="10" // HTML5 maxLength
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('dosage.unit')}`}
                    value={form.dosage.unit}
                    onChange={handleFormChange}
                  />
                  {errors['dosage.unit'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['dosage.unit']}</p>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* --- SECTION 3: Schedule --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Define Schedule
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Set up the application frequency and timing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 md:pl-11">
                {/* Frequency */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Frequency
                  </label>
                  <select
                    name="schedule.type"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('schedule.type')}`}
                    value={form.schedule.type}
                    onChange={handleFormChange}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="schedule.startDate"
                    min={todayISO()} // HTML5 min attribute
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('schedule.startDate')}`}
                    value={form.schedule.startDate}
                    onChange={handleFormChange}
                  />
                  {errors['schedule.startDate'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['schedule.startDate']}</p>
                  )}
                </div>

                {/* Repeat Every */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Repeat Every <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" // Changed to text for stricter validation
                    min="1"
                    max="10" // HTML5 max attribute
                    name="schedule.repeatEvery"
                    inputMode="numeric" // Hint for mobile keyboards
                    pattern="^(?:[1-9]|10)?$" // HTML5 pattern for browser-level validation hint
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('schedule.repeatEvery')}`}
                    value={form.schedule.repeatEvery}
                    onChange={handleFormChange}
                  />
                  {errors['schedule.repeatEvery'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['schedule.repeatEvery']}</p>
                  )}
                </div>

                {/* Total Occurrences */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Total Occurrences
                  </label>
                  <input
                    type="text" // Changed to text for stricter validation
                    min="1"
                    max="60" // HTML5 max attribute
                    name="schedule.occurrences"
                    placeholder="No. of times"
                    inputMode="numeric" // Hint for mobile keyboards
                    pattern="^(?:[1-9]|[1-5]\d|60)?$" // HTML5 pattern for browser-level validation hint
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none text-sm sm:text-base ${getInputBorderClass('schedule.occurrences')}`}
                    value={form.schedule.occurrences === null ? "" : form.schedule.occurrences} // Handle null for empty state
                    onChange={handleFormChange}
                  />
                  {errors['schedule.occurrences'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['schedule.occurrences']}</p>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* --- SECTION 4: Notes --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  4
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Additional Notes
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Add any relevant instructions or observations
                  </p>
                </div>
              </div>

              <div className="md:pl-11">
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Add notes or instructions..."
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-white text-slate-900 shadow-sm focus:outline-none resize-y text-sm sm:text-base ${getInputBorderClass('notes')}`}
                  value={form.notes}
                  onChange={handleFormChange}
                />
                {errors['notes'] && (
                  <p className="text-rose-500 text-sm mt-1">{errors['notes']}</p>
                )}
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Server Error */}
            {errors.submit && (
              <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-rose-500 mr-3"
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
                  <p className="text-rose-800 font-semibold">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                    setForm(initialFormState);
                    setErrors({}); // Clear errors on reset
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8 8 0 104.582 9"
                  />
                </svg>
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isSubmitting} // Disable button during submission
                className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 border border-transparent rounded-lg text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300 text-sm sm:text-base ${
                    isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Plan...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li>All plans start as active and will appear in the due list.</li>
            <li>Use specific dosage amounts with appropriate units.</li>
            <li>
              Leave occurrences empty for ongoing schedules without an end date.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}