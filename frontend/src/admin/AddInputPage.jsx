import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function AddInput() {
  const navigate = useNavigate();

  // --- VALIDATION CONSTANTS ---
  const MAX_NAME_LENGTH = 100;
  const MAX_STOCK_QUANTITY = 2000; // integer only (no decimals)
  const MIN_STOCK_QUANTITY = 0.01;
  const MAX_PRICE = 100000.00; // up to two decimals
  const MIN_PRICE = 0.01;
  const MAX_ALERT_VALUE = 99999.99;
  const MIN_ALERT_VALUE = 0.01;
  const MAX_DILUTION_RATE = 100.00; // New constant
  const MIN_DILUTION_RATE = 0.50;   // New constant
  const MAX_NOTES_LENGTH = 500;

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const initialFormState = {
    name: "",
    category: "",
    unit: "",
    stockQuantity: "",
    price: "",
    minStockAlert: "",
    reorderPoint: "",
    dilutionRate: "", // New field
    supplier: "",
    notes: "",
  };
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // --- FETCH CATEGORY DATA ---
  useEffect(() => {
    setCategories([
      { value: "fertilizer", label: "Fertilizer" },
      { value: "pesticide", label: "Pesticide" },
      { value: "other", label: "Other" },
    ]);
    setLoading(false);
  }, []);

  // --- VALIDATION LOGIC ---
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Product name is required.";
        } else if (value.trim().length > MAX_NAME_LENGTH) {
          error = `Name cannot exceed ${MAX_NAME_LENGTH} characters.`
        }
        break;

      case "category":
        if (!value) {
          error = "Please select a category.";
        }
        break;

      case "unit":
        if (!value.trim()) {
          error = "Unit is required.";
        } else if (!/^[a-zA-Z/]*$/.test(value)) {
          error = "Only letters and '/' are allowed.";
        }
        break;

      case "stockQuantity":
        if (value === "") {
          error = "Stock quantity is required.";
        } else {
          if (!/^\d+$/.test(value)) {
            error = "No decimals allowed.";
          } else {
            const qty = parseInt(value, 10);
            if (isNaN(qty) || qty <= 0) {
              error = "Must be a positive number.";
            } else if (qty > MAX_STOCK_QUANTITY) {
              error = `Quantity cannot exceed ${MAX_STOCK_QUANTITY}.`;
            }
          }
        }
        break;

      case "price":
        if (value === "") {
          error = "Price is required.";
        } else {
          const p = parseFloat(value);
          if (isNaN(p) || p <= 0) {
            error = "Must be a positive number.";
          } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
            error = "No more than 2 decimal places allowed.";
          } else if (p > MAX_PRICE) {
            error = `Price cannot exceed ${MAX_PRICE}.`;
          }
        }
        break;

      case "minStockAlert":
        if (value !== "") {
          if (!/^\d+$/.test(value)) {
            error = "No decimals allowed.";
            break;
          }
          const alert = parseInt(value, 10);
           const stock = parseFloat(form.stockQuantity);
          if (isNaN(alert) || alert <= 0) {
            error = "Must be a positive number.";
          } else if (alert > 10) {
            error = "Value cannot exceed 10.";
          } else if (!isNaN(stock) && alert >= stock) {
            error = "Should be less than stock quantity.";
          }
        }
        break;

      case "reorderPoint":
        if (value !== "") {
          if (!/^\d+$/.test(value)) {
            error = "No decimals allowed.";
            break;
          }
          const reorder = parseInt(value, 10);
           const minAlert = parseFloat(form.minStockAlert);
           if (isNaN(reorder) || reorder <= 0) {
             error = "Must be a positive number.";
          } else if (reorder > 100) {
            error = "Value cannot exceed 100.";
           } else if (!isNaN(minAlert) && reorder >= minAlert) {
             error = "Should be less than minimum stock alert.";
           }
        }
        break;

      case "dilutionRate": // New validation case
        if (value !== "") {
          const rate = parseFloat(value);
          if (isNaN(rate) || rate < MIN_DILUTION_RATE) {
            error = `Must be a number between ${MIN_DILUTION_RATE.toFixed(2)} and ${MAX_DILUTION_RATE.toFixed(2)}.`;
          } else if (rate > MAX_DILUTION_RATE) {
            error = `Must be a number between ${MIN_DILUTION_RATE.toFixed(2)} and ${MAX_DILUTION_RATE.toFixed(2)}.`;
          } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
            error = "No more than 2 decimal places allowed.";
          }
        }
        break;

      case "notes":
        if (value.length > MAX_NOTES_LENGTH) {
          error = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters.`;
        }
        break;

      case "supplier":
        if (value && !/^[A-Za-z\s]+$/.test(value)) {
          error = "Only letters and spaces are allowed.";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  // --- HANDLE FORM CHANGES ---
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;

    // Price and dilutionRate: allow up to two decimals + clamp to bounds
    if (name === "price" || name === "dilutionRate") {
      if (newValue !== "") {
        newValue = newValue.replace(/[^0-9.]/g, "");
        const parts = newValue.split(".");
        if (parts[1] && parts[1].length > 2) {
          newValue = parts[0] + "." + parts[1].substring(0, 2);
        }
        if (newValue.startsWith(".")) newValue = "0" + newValue;
        if (newValue.length > 1 && newValue.startsWith("0") && !newValue.includes(".")) {
          newValue = parseFloat(newValue).toString();
        }
        const v = parseFloat(newValue);
        if (!isNaN(v)) {
          if (name === "price" && v > MAX_PRICE) newValue = MAX_PRICE.toFixed(2);
          if (name === "dilutionRate") {
            if (v > MAX_DILUTION_RATE) newValue = MAX_DILUTION_RATE.toFixed(2);
            if (v < MIN_DILUTION_RATE) newValue = MIN_DILUTION_RATE.toFixed(2);
          }
        }
      }
    // Integers only: stockQuantity, minStockAlert, reorderPoint + clamp to max
    } else if (name === "stockQuantity" || name === "minStockAlert" || name === "reorderPoint") {
      newValue = newValue.replace(/\D/g, "");
      if (newValue.length > 1 && newValue.startsWith("0")) {
        newValue = String(parseInt(newValue, 10));
      }
      const v = parseInt(newValue || "0", 10);
      if (!isNaN(v)) {
        if (name === "stockQuantity" && v > MAX_STOCK_QUANTITY) newValue = String(MAX_STOCK_QUANTITY);
        if (name === "minStockAlert" && v > 10) newValue = "10";
        if (name === "reorderPoint" && v > 100) newValue = "100";
      }
    } else if (name === "unit") {
      newValue = newValue.replace(/[^a-zA-Z/]/g, "");
    } else if (name === "name") {
      // Product name: letters, numbers, spaces only (no symbols)
      newValue = newValue.replace(/[^A-Za-z0-9\s]/g, "");
      if (newValue.length > MAX_NAME_LENGTH) newValue = newValue.substring(0, MAX_NAME_LENGTH);
    } else if (name === "supplier") {
      // Supplier: letters and spaces only
      newValue = newValue.replace(/[^A-Za-z\s]/g, "");
    } else if (name === "notes" && newValue.length > MAX_NOTES_LENGTH) {
      newValue = newValue.substring(0, MAX_NOTES_LENGTH);
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
    validateField(name, newValue);

    if (name === "stockQuantity" || name === "minStockAlert") {
      validateField("minStockAlert", form.minStockAlert);
      validateField("reorderPoint", form.reorderPoint);
    }
    if (name === "minStockAlert") {
      validateField("reorderPoint", form.reorderPoint);
    }
  };

  // --- SUBMIT HANDLER ---
  const submit = async (e) => {
    e.preventDefault();

    const currentErrors = {};
    let hasErrors = false;

    const fieldsToValidate = [
      "name",
      "category",
      "unit",
      "stockQuantity",
      "price",
      "minStockAlert",
      "reorderPoint",
      "dilutionRate", // Add dilutionRate to fields to validate
      "supplier",
      "notes",
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) {
        currentErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(currentErrors);

    if (hasErrors) {
      alert("Please fix the errors before submitting the form.");
      return;
    }

    const payload = {
      ...form,
      stockQuantity: parseFloat(form.stockQuantity),
      price: parseFloat(form.price),
      minStockAlert: form.minStockAlert ? parseFloat(form.minStockAlert) : undefined,
      reorderPoint: form.reorderPoint ? parseFloat(form.reorderPoint) : undefined,
      dilutionRate: form.dilutionRate ? parseFloat(form.dilutionRate) : undefined, // Parse dilutionRate to float
    };

    try {
      await api.post("/inputs", payload);
      alert("Input saved successfully!");
      setForm(initialFormState);
      setErrors({});
      navigate("/admin/inventory");
    } catch (error) {
      console.error("Failed to save input:", error);
      alert(
        `Error: ${
          error.response?.data?.message || "Unable to save input."
        }`
      );
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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Add New Input
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Add your crop-related inputs (fertilizers, pesticides, etc.) to the inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/inventory")}
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
            Back to Inventory
          </button>
        </header>

        {/* Form */}
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g., Urea Fertilizer"
                className={`w-full border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                maxLength={MAX_NAME_LENGTH}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className={`w-full border ${errors.category ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Unit */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={form.unit}
                onChange={handleFormChange}
                placeholder="e.g., kg, L, bags"
                className={`w-full border ${errors.unit ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
            </div>

            {/* Stock Quantity */}
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-slate-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="stockQuantity"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleFormChange}
                placeholder="e.g., 100.50"
                className={`w-full border ${errors.stockQuantity ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.stockQuantity && <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                Price (per unit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="e.g., 750.25"
                className={`w-full border ${errors.price ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Minimum Stock Alert */}
            <div>
              <label htmlFor="minStockAlert" className="block text-sm font-medium text-slate-700 mb-1">
                Min. Stock Alert (optional)
              </label>
              <input
                type="text"
                id="minStockAlert"
                name="minStockAlert"
                value={form.minStockAlert}
                onChange={handleFormChange}
                placeholder="e.g., 20.00"
                className={`w-full border ${errors.minStockAlert ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.minStockAlert && <p className="mt-1 text-sm text-red-600">{errors.minStockAlert}</p>}
            </div>

            {/* Reorder Point */}
            <div>
              <label htmlFor="reorderPoint" className="block text-sm font-medium text-slate-700 mb-1">
                Reorder Point (optional)
              </label>
              <input
                type="text"
                id="reorderPoint"
                name="reorderPoint"
                value={form.reorderPoint}
                onChange={handleFormChange}
                placeholder="e.g., 10.00"
                className={`w-full border ${errors.reorderPoint ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.reorderPoint && <p className="mt-1 text-sm text-red-600">{errors.reorderPoint}</p>}
            </div>

            {/* Dilution Rate (New Field) */}
            <div>
              <label htmlFor="dilutionRate" className="block text-sm font-medium text-slate-700 mb-1">
                Dilution Rate (optional)
              </label>
              <input
                type="text"
                id="dilutionRate"
                name="dilutionRate"
                value={form.dilutionRate}
                onChange={handleFormChange}
                placeholder="e.g., 2.50 (between 0.50 - 100.00)"
                className={`w-full border ${errors.dilutionRate ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.dilutionRate && <p className="mt-1 text-sm text-red-600">{errors.dilutionRate}</p>}
            </div>

            {/* Supplier */}
            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-slate-700 mb-1">
                Supplier (optional)
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={form.supplier}
                onChange={handleFormChange}
                placeholder="e.g., AgroTech Supplies"
                className="w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleFormChange}
              rows={4}
              placeholder="Any additional information about the product..."
              className={`w-full border ${errors.notes ? 'border-red-500' : 'border-slate-300'} rounded-lg shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              maxLength={MAX_NOTES_LENGTH}
            ></textarea>
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Add Input
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}