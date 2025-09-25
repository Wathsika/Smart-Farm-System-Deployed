// ✅ FINAL FIXED: frontend/src/admin/EditPlanPage.jsx
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
      if (!id) {
        setError("Plan identifier is missing from the URL.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
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
          crop: plan.crop?._id ?? "",
          field: plan.field?._id ?? "",
          product: plan.product?._id ?? "",
          dosage: {
            amount: parseNumberOrEmpty(plan.dosage?.amount),
            unit: plan.dosage?.unit || "ml/L",
          },
          schedule: {
            type: plan.schedule?.type || "weekly",
            startDate: formatDate(plan.schedule?.startDate),
            repeatEvery:
              typeof plan.schedule?.repeatEvery === "number"
                ? Math.max(1, plan.schedule.repeatEvery)
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
        if (mounted) setLoading(false);
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
        return { ...prev, [field]: nextValue };
      }
      const [parent, child] = keys;
      return { ...prev, [parent]: { ...prev[parent], [child]: nextValue } };
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

  const submit = async (event) => {
    event.preventDefault();
    if (!form?.crop || !form?.field || !form?.product) {
      window.alert("Please select a Crop, Field, and Product before saving.");
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
          form.schedule.occurrences === "" ? undefined : Number(form.schedule.occurrences),
      },
    };

    try {
      setSaving(true);
      await api.put(`/plans/${id}`, payload);
      window.alert("Plan updated successfully!");
      navigate("/admin/crop/plans");
    } catch (err) {
      console.error("Failed to update plan:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not update the plan.";
      window.alert(`Error: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 px-4">
        <div className="animate-spin h-6 w-6 rounded-full border-2 border-slate-200 border-t-emerald-500" />
        <span className="ml-3 text-slate-700 text-sm font-medium">Loading plan details...</span>
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

  if (!form) return null;

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
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Plans
          </button>
        </header>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
            {/* Step 1 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">1</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Define Target</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Select the crop and field</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:pl-11">
                {/* Crop */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Select Crop *</label>
                  <select
                    value={form.crop}
                    onChange={(e) => handleFormChange(e, "crop")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  >
                    <option value="" disabled>-- Choose a Crop --</option>
                    {dropdownData.crops.map((c) => (
                      <option key={c._id} value={c._id}>{c.cropName}</option>
                    ))}
                  </select>
                </div>
                {/* Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Select Field *</label>
                  <select
                    value={form.field}
                    onChange={(e) => handleFormChange(e, "field")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  >
                    <option value="" disabled>-- Choose a Field --</option>
                    {dropdownData.fields.map((f) => (
                      <option key={f._id} value={f._id}>{f.fieldName} ({f.fieldCode})</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Step 2 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">2</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Define Input</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Choose the product & dosage</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:pl-11">
                {/* Product */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Select Product *</label>
                  <select
                    value={form.product}
                    onChange={(e) => handleFormChange(e, "product")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  >
                    <option value="" disabled>-- Choose a Product --</option>
                    <optgroup label="Fertilizers">
                      {fertilizerOptions.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Pesticides">
                      {pesticideOptions.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                {/* Dosage */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Dosage Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.dosage.amount}
                    onChange={(e) => handleFormChange(e, "dosage.amount", parseNumberOrEmpty)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Unit</label>
                  <input
                    value={form.dosage.unit}
                    onChange={(e) => handleFormChange(e, "dosage.unit")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g., ml/L"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Step 3 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">3</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Define Schedule</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Frequency & timing</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 md:pl-11">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Frequency</label>
                  <select
                    value={form.schedule.type}
                    onChange={(e) => handleFormChange(e, "schedule.type")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={form.schedule.startDate}
                    onChange={(e) => handleFormChange(e, "schedule.startDate")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Repeat Every</label>
                  <input
                    type="number"
                    min="1"
                    value={form.schedule.repeatEvery}
                    onChange={(e) =>
                      handleFormChange(e, "schedule.repeatEvery", (val) => {
                        const parsed = parseNumberOrEmpty(val);
                        return parsed === "" ? 1 : Math.max(1, parsed);
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Occurrences</label>
                  <input
                    type="number"
                    min="1"
                    value={form.schedule.occurrences}
                    onChange={(e) =>
                      handleFormChange(e, "schedule.occurrences", (val) => {
                        const parsed = parseNumberOrEmpty(val);
                        return parsed === "" ? "" : Math.max(1, parsed);
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Step 4 */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">4</div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Additional Notes</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Optional instructions</p>
                </div>
              </div>
              <div className="md:pl-11">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => handleFormChange(e, "notes")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Add notes..."
                />
              </div>
            </section>

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
                className="px-8 py-2 rounded-lg bg-emerald-600 text-white"
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
