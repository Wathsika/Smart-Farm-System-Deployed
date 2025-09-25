import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

    const emptyDropdowns = {
  fertilizers: [],
  pesticides: [],
  crops: [],
  fields: [],
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
  return Number.isNaN(numeric) ? "" : numeric;
};

    export default function EditPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [dropdownData, setDropdownData] = useState(emptyDropdowns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fertilizerOptions = dropdownData.fertilizers;
  const pesticideOptions = dropdownData.pesticides;

  useEffect(() => {
    let mounted = true;

    const fetchPlan = async () => {
      try {
        setLoading(true);
        const [planRes, fertilizers, pesticides, crops, fields] = await Promise.all([
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
        setForm({
          crop: plan.crop?._id || "",
          field: plan.field?._id || "",
          product: plan.product?._id || "",
          dosage: {
            amount: parseNumberOrEmpty(plan.dosage?.amount),
            unit: plan.dosage?.unit || "ml/L",
          },
          schedule: {
            type: plan.schedule?.type || "weekly",
            startDate: formatDate(plan.schedule?.startDate),
            repeatEvery:
              typeof plan.schedule?.repeatEvery === "number"
                ? plan.schedule.repeatEvery
                : 1,
            occurrences: parseNumberOrEmpty(plan.schedule?.occurrences),
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
        if (mounted) {
          setLoading(false);
        }
          }
    };

    fetchPlan();

    return () => {
      mounted = false; 
    };
 }, [id]);
const handleFormChange = (event, field, transform) => {
    const { value } = event.target;
    const nextValue = transform ? transform(value) : value;
     setForm((prev) => {
      if (!prev) return prev;
      const keys = field.split(".");
      if (keys.length === 1) {
        return {
          ...prev,
          [field]: nextValue,
        };
      }
    const [parent, child] = keys;
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: nextValue,
        },
      };
    });
  };

  const planTitle = useMemo(() => {
    if (!form) return "";
    const cropName = dropdownData.crops.find((c) => c._id === form.crop)?.cropName;
    const fieldName = dropdownData.fields.find((f) => f._id === form.field)?.fieldName;
    if (cropName && fieldName) {
      return `${cropName} — ${fieldName}`;
    }
    if (cropName) return cropName;
    return "Application Plan";
  }, [dropdownData, form]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form?.crop || !form?.field || !form?.product) {
      alert("Please select a Crop, Field, and Product before saving.");
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
        occurrences:
          form.schedule.occurrences === ""
            ? undefined
            : Number(form.schedule.occurrences),
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
      alert(`Error: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border border-slate-200 flex items-center gap-3 w-full max-w-sm">
          <div className="animate-spin h-6 w-6 rounded-full border-2 border-slate-200 border-t-emerald-500" />
          <span className="text-slate-700 text-sm font-medium">Loading plan details...</span>
        </div>
        </div>
    
};
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

  if (!form) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Edit Application Plan</h1>
            {planTitle && (
              <p className="text-slate-600 mt-1 text-sm sm:text-base">{planTitle}</p>
            )}
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

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
            {/* --- SECTION 1: Target --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Define Target</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Select the crop and field for this application plan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Crop <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.crop}
                    onChange={(event) => handleFormChange(event, "crop")}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Crop --
                    </option>
                    {dropdownData.crops.map((crop) => (
                      <option key={crop._id} value={crop._id}>
                        {crop.cropName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Field <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.field}
                    onChange={(event) => handleFormChange(event, "field")}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Field --
                    </option>
                    {dropdownData.fields.map((field) => (
                      <option key={field._id} value={field._id}>
                        {field.fieldName} ({field.fieldCode})
                      </option>
                    ))}
                  </select>
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
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Define Input</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Choose the product and specify the dosage</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Product <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.product}
                    onChange={(event) => handleFormChange(event, "product")}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    required
                  >
                    <option value="" disabled>
                      -- Choose a Product --
                    </option>
                    <optgroup label="Fertilizers">
                      {fertilizerOptions.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Pesticides">
                      {pesticideOptions.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Dosage Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.dosage.amount}
                    onChange={(event) =>
                      handleFormChange(event, "dosage.amount", parseNumberOrEmpty)
                    }
                    placeholder="Enter amount"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                  />
                </div>

export default EditPlanPage;
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Unit</label>
                  <input
                    value={form.dosage.unit}
                    onChange={(event) => handleFormChange(event, "dosage.unit")}
                    placeholder="e.g. ml/L"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                  />
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
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Define Schedule</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Set up the application frequency and timing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 md:pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Frequency</label>
                  <select
                    value={form.schedule.type}
                    onChange={(event) => handleFormChange(event, "schedule.type")}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={form.schedule.startDate}
                    onChange={(event) => handleFormChange(event, "schedule.startDate")}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Repeat Every</label>
                  <input
                    type="number"
                    min="1"
                    value={form.schedule.repeatEvery}
                    onChange={(event) =>
                      handleFormChange(event, "schedule.repeatEvery", (val) => {
                        const parsed = parseNumberOrEmpty(val);
                        return parsed === "" ? 1 : Math.max(1, parsed);
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Total Occurrences</label>
                  <input
                    type="number"
                    min="1"
                    value={form.schedule.occurrences}
                    onChange={(event) =>
                      handleFormChange(event, "schedule.occurrences", (val) => {
                        const parsed = parseNumberOrEmpty(val);
                        return parsed === "" ? "" : Math.max(1, parsed);
                      })
                    }
                    placeholder="No. of times"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                  />
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
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Additional Notes</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Add any relevant instructions or observations</p>
                </div>
              </div>

              <div className="md:pl-11">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => handleFormChange(event, "notes")}
                  placeholder="Add notes or instructions..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-y text-sm sm:text-base"
                />
              </div>
            </section>

            <hr className="border-slate-200" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/crop/plans")}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 text-sm sm:text-base"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 border border-transparent rounded-lg bg-emerald-600 text-white font-medium shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300 text-sm sm:text-base disabled:opacity-70"
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Plan"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Quick Tips</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li>Review the schedule to ensure it reflects the latest field conditions.</li>
            <li>Dosage values can be left empty if the application uses the product default.</li>
            <li>Set total occurrences only when the plan has a defined end.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
