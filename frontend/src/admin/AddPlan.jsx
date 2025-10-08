import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

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
      startDate: new Date().toISOString().slice(0, 10),
      repeatEvery: 1,
      occurrences: 4,
    },
    notes: "",
  };
  const [form, setForm] = useState(initialFormState);

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
        alert("Could not load necessary data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- HANDLE FORM CHANGE ---
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const keys = name.split(".");

    if (keys.length === 1) {
      setForm((prev) => ({ ...prev, [name]: value }));
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

  // --- SUBMIT HANDLER ---
  const submit = async (e) => {
    e.preventDefault();
    if (!form.crop || !form.field || !form.product) {
      return alert("Please select a Crop, Field, and Product.");
    }
    try {
      await api.post("/plans", form);
      alert("Plan saved successfully!");
      setForm(initialFormState);
      navigate("/admin/crop/plans");
    } catch (error) {
      console.error("Failed to save plan:", error);
      alert(
        `Error: ${
          error.response?.data?.message || "Could not save the plan."
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
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
                </div>

                {/* Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Field <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="field"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
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
                </div>

                {/* Dosage Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Dosage Amount
                  </label>
                  <input
                    name="dosage.amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    value={form.dosage.amount}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Unit */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Unit
                  </label>
                  <input
                    name="dosage.unit"
                    placeholder="e.g. ml/L"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    value={form.dosage.unit}
                    onChange={handleFormChange}
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
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
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="schedule.startDate"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    value={form.schedule.startDate}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Repeat Every */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Repeat Every
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="schedule.repeatEvery"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    value={form.schedule.repeatEvery}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Total Occurrences */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Total Occurrences
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="schedule.occurrences"
                    placeholder="No. of times"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-sm sm:text-base"
                    value={form.schedule.occurrences || ""}
                    onChange={handleFormChange}
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-y text-sm sm:text-base"
                  value={form.notes}
                  onChange={handleFormChange}
                />
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={() => setForm(initialFormState)}
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
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 border border-transparent rounded-lg bg-emerald-600 text-white font-medium shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300 text-sm sm:text-base"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Plan
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
