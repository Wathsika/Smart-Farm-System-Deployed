// ✅ FINAL VALIDATED FILE: frontend/src/admin/EditPlanPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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


const emptyDropdowns = {
  fertilizers: [],
  pesticides: [],
  crops: [],
  fields: [],
};

const todayISO = () => {
  const off = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - off).toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseNumberOrEmpty = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const numeric = Number(value);
  return Number.isNaN(numeric) ? "" : numeric; // Return "" if NaN, otherwise the number
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


export default function EditPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [dropdownData, setDropdownData] = useState(emptyDropdowns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({}); // State to hold validation errors

  const fertilizerOptions = dropdownData.fertilizers;
  const pesticideOptions = dropdownData.pesticides;

  useEffect(() => {
    let mounted = true;

    const fetchPlan = async () => {
      if (!id) {
        setError("Plan identifier is missing from the URL.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(""); // Clear previous errors
        setErrors({}); // Clear validation errors

        const [planRes, fertilizers, pesticides, crops, fields] =
          await Promise.all([
            api.get(`/plans/${id}`),
            api.get("/inputs", { params: { category: "fertilizer" } }),
            api.get("/inputs", { params: { category: "pesticide" } }),
            api.get("/crops"),
            api.get("/fields"),
          ]);

        if (!mounted) return;

        const plan = planRes.data;
        if (!plan) {
          setError("Plan not found.");
          return;
        }

        // Convert numbers to strings for input fields to allow controlled input with patterns
        setForm({
          crop: plan.crop?._id ?? "",
          field: plan.field?._id ?? "",
          product: plan.product?._id ?? "",
          dosage: {
            amount: String(parseNumberOrEmpty(plan.dosage?.amount)), // Convert to string
            unit: plan.dosage?.unit || "", // Default to empty string for consistent validation
          },
          schedule: {
            type: plan.schedule?.type || "weekly",
            startDate: formatDate(plan.schedule?.startDate) || todayISO(),
            repeatEvery: String(
              typeof plan.schedule?.repeatEvery === "number"
                ? Math.max(1, plan.schedule.repeatEvery)
                : 1
            ), // Convert to string
            occurrences: String(parseNumberOrEmpty(plan.schedule?.occurrences)), // Convert to string
          },
          notes: plan.notes || "",
        });

        setDropdownData({
          fertilizers: fertilizers.data,
          pesticides: pesticides.data,
          crops: crops.data,
          fields: fields.data,
        });
      } catch (err) {
        console.error("Failed to load plan for editing:", err);
        if (!mounted) return;
        const status = err.response?.status;
        setError(
          status === 404
            ? "Could not find the requested plan. It may have been deleted."
            : "Could not load plan data. Please try again."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlan();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const keys = name.split(".");

    setErrors(prev => ({ ...prev, [name]: undefined, submit: undefined })); // Clear specific error and submit error

    setForm((prev) => {
      if (!prev) return prev; // Should not happen after loading, but safe check

      const newFormState = { ...prev };
      let updatedValue = value;

      // Apply live input patterns
      if (name === 'dosage.amount') {
        if (value !== '' && !dosageAmountDraftPattern.test(value)) {
            updatedValue = prev.dosage.amount; // Revert to previous valid state
        }
      } else if (name === 'dosage.unit') {
        if (value !== '' && (!dosageUnitDraftPattern.test(value) || value.length > 10)) {
            updatedValue = prev.dosage.unit;
        }
      } else if (name === 'schedule.repeatEvery') {
        if (value !== '' && !repeatEveryDraftPattern.test(value)) {
            updatedValue = prev.schedule.repeatEvery;
        }
      } else if (name === 'schedule.occurrences') {
        if (value !== '' && !occurrencesDraftPattern.test(value)) {
            updatedValue = prev.schedule.occurrences;
        }
      } else if (name === 'notes') {
        if (value.length > 500) {
          updatedValue = value.slice(0, 500); // Truncate if too long
        }
      }


      if (keys.length === 1) {
        newFormState[name] = updatedValue;
      } else {
        const [parent, child] = keys;
        newFormState[parent] = { ...newFormState[parent], [child]: updatedValue };
      }
      return newFormState;
    });
  };

  const planTitle = useMemo(() => {
    if (!form) return "";
    const cropName = dropdownData.crops.find((c) => c._id === form.crop)?.cropName;
    const fieldName = dropdownData.fields.find((f) => f._id === form.field)?.fieldName;
    if (cropName && fieldName) return `${cropName} — ${fieldName}`;
    if (cropName) return cropName;
    return "Application Plan";
  }, [dropdownData, form]);

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

  const submit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      // Scroll to the first error if validation fails
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const inputElement = document.querySelector(`[name="${firstErrorField}"]`);
        inputElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement?.focus();
      }
      return;
    }

    const payload = {
      ...form,
      dosage: {
        amount: form.dosage.amount === "" ? undefined : Number(form.dosage.amount),
        unit: form.dosage.unit,
      },
      schedule: {
        ...form.schedule,
        repeatEvery: Number(form.schedule.repeatEvery) || 1,
        occurrences: form.schedule.occurrences === "" ? undefined : Number(form.schedule.occurrences), // Send undefined if empty
      },
    };

    try {
      setSaving(true);
      await api.put(`/plans/${id}`, payload);
      alert("Plan updated successfully!");
      navigate("/admin/crop/plans");
    } catch (err) {
      console.error("Failed to update plan:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not update the plan.";
      setErrors({ submit: message }); // Set server error to the state
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 px-4">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-slate-200 border-t-emerald-500" />
        <span className="ml-3 text-slate-700 text-sm font-medium">
          Loading plan details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-rose-200 text-rose-600 rounded-2xl shadow-lg px-6 py-6 max-w-lg text-center space-y-3">
          <h1 className="text-lg font-semibold">Unable to load plan</h1>
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/admin/crop/plans")}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow hover:bg-emerald-700"
          >
            Back to plans
          </button>
        </div>
      </div>
    );
  }

  if (!form) return null; // Should not happen if loading and error are handled

  // Helper to get error class for input fields
  const getInputBorderClass = (fieldName) =>
    errors[fieldName]
      ? 'border-rose-300 focus:ring-rose-500'
      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Edit Application Plan
            </h1>
            {planTitle && (
              <p className="text-slate-600 mt-1 text-sm sm:text-base">{planTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/crop/plans")}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-700 text-sm sm:text-base font-medium shadow-sm hover:bg-slate-50"
          >
            Back to Plans
          </button>
        </header>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
            {/* Step 1 */}
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
                    Select the crop and field
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
                    value={form.crop}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('crop')}`}
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
                    value={form.field}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('field')}`}
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

            {/* Step 2 */}
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
                    Choose the product & dosage
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
                    value={form.product}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('product')}`}
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Product --
                    </option>
                    <optgroup label="Fertilizers">
                      {fertilizerOptions.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Pesticides">
                      {pesticideOptions.map((p) => (
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
                {/* Dosage */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Dosage Amount <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" // Changed to text to better control input with regex pattern
                    name="dosage.amount"
                    step="0.01"
                    min="0.01"
                    max="1000"
                    value={form.dosage.amount}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('dosage.amount')}`}
                    placeholder="Enter amount"
                    inputMode="decimal"
                    pattern="^(?:[1-9]\d{0,2}|1000)(?:\.\d{0,2})?$" // HTML5 pattern for browser-level validation hint
                  />
                  {errors['dosage.amount'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['dosage.amount']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Unit
                  </label>
                  <input
                    name="dosage.unit"
                    value={form.dosage.unit}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('dosage.unit')}`}
                    placeholder="e.g., ml/L"
                    type="text" // Ensure type is text for pattern validation
                    pattern="^[A-Za-z/]*$" // HTML5 pattern
                    maxLength="10" // HTML5 maxLength
                  />
                  {errors['dosage.unit'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['dosage.unit']}</p>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Step 3 */}
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
                    Frequency & timing
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 md:pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Frequency
                  </label>
                  <select
                    name="schedule.type"
                    value={form.schedule.type}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('schedule.type')}`}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="schedule.startDate"
                    min={todayISO()}
                    value={form.schedule.startDate}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('schedule.startDate')}`}
                    required
                  />
                  {errors['schedule.startDate'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['schedule.startDate']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Repeat Every <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text" // Changed to text for stricter validation
                    name="schedule.repeatEvery"
                    min="1"
                    max="10"
                    value={form.schedule.repeatEvery}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('schedule.repeatEvery')}`}
                    inputMode="numeric" // Hint for mobile keyboards
                    pattern="^(?:[1-9]|10)?$" // HTML5 pattern for browser-level validation hint
                  />
                  {errors['schedule.repeatEvery'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['schedule.repeatEvery']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Total Occurrences
                  </label>
                  <input
                    type="text" // Changed to text for stricter validation
                    name="schedule.occurrences"
                    min="1"
                    max="60" // Max changed to 60 for consistency with AddPlanPage
                    step="1"
                    value={form.schedule.occurrences}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('schedule.occurrences')}`}
                    placeholder="Enter a whole number"
                    inputMode="numeric" // Hint for mobile keyboards
                    pattern="^(?:[1-9]|[1-5]\d|60)?$" // HTML5 pattern for browser-level validation hint
                  />
                  {errors['schedule.occurrences'] && (
                    <p className="text-rose-500 text-sm mt-1">{errors['schedule.occurrences']}</p>
                  )}
                   <p className="text-xs text-slate-500 mt-1">
                    Enter a whole number (1 – 60)
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Step 4 */}
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
                    Optional instructions
                  </p>
                </div>
              </div>
              <div className="md:pl-11">
                <textarea
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg ${getInputBorderClass('notes')}`}
                  placeholder="Add notes..."
                />
                {errors['notes'] && (
                  <p className="text-rose-500 text-sm mt-1">{errors['notes']}</p>
                )}
              </div>
            </section>

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

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/crop/plans")}
                className="px-6 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-8 py-2 rounded-lg text-white ${
                  saving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}