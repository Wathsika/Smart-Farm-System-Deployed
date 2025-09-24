// ✅ Your file with professional UI styling: frontend/src/admin/AddPlan.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

export default function AddPlan() {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [dropdownData, setDropdownData] = useState({
    fertilizers: [],
    pesticides: [],
    crops: [],
    fields: []
  });
  const [loading, setLoading] = useState(true);

  // Initial state for the form
  const initialFormState = {
    crop: '', field: '', product: '',
    dosage: { amount: '', unit: 'ml/L' },
    schedule: { 
      type: 'weekly', 
      startDate: new Date().toISOString().slice(0, 10), 
      repeatEvery: 1, 
      occurrences: 4 
    },
    notes: ''
  };
  const [form, setForm] = useState(initialFormState);

  // --- DATA FETCHING for dropdowns ---
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [fzRes, psRes, csRes, fsRes] = await Promise.all([
          api.get('/inputs', { params: { category: 'fertilizer' }}),
          api.get('/inputs', { params: { category: 'pesticide' }}),
          api.get('/crops'),
          api.get('/fields'),
        ]);

        // --- ADDED CONSOLE.LOGS TO VERIFY API RESPONSE ---
        // These will appear in your browser's developer console (F12)
        console.log("Data received for Fertilizers:", fzRes.data);
        console.log("Data received for Pesticides:", psRes.data);
        // --- END OF ADDED LINES ---
        
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

  // --- GENERALIZED CHANGE HANDLER ---
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const keys = name.split('.'); 

    if (keys.length === 1) {
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    }
  };

  // --- FORM SUBMISSION ---
  const submit = async (e) => {
    e.preventDefault();
    if (!form.crop || !form.field || !form.product) {
      return alert('Please select a Crop, Field, and Product.');
    }
    try {
      await api.post('/plans', form);
      alert('Plan saved successfully!');
      setForm(initialFormState); 
      navigate('/admin/crop/plans');
    } catch (error) {
      console.error("Failed to save plan:", error);
      alert(`Error: ${error.response?.data?.message || 'Could not save the plan.'}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 border border-slate-200 flex items-center space-x-4">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-slate-200 border-t-emerald-500" />
          <span className="text-slate-700 font-medium">Loading form data...</span>
        </div>
      </div>
    );
  }
  
  // --- COMPONENT RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Add Application Plan</h1>
            <p className="text-slate-600 mt-2">
              Create a new application schedule for fertilizers and pesticides.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/crop/plans')}
              className="inline-flex items-center px-5 py-3 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold shadow-sm hover:shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Plans
            </button>
          </div>
        </header>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={submit} className="p-8 space-y-8">

            {/* --- SECTION 1: TARGET (CROP & FIELD) --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Define Target</h2>
                  <p className="text-sm text-slate-500">Select the crop and field for this application plan</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Crop <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    name="crop" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    value={form.crop} 
                    onChange={handleFormChange} 
                    required
                  >
                    <option value="" disabled>-- Choose a Crop --</option>
                    {dropdownData.crops.map(c => <option key={c._id} value={c._id}>{c.cropName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Field <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    name="field" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    value={form.field} 
                    onChange={handleFormChange} 
                    required
                  >
                    <option value="" disabled>-- Choose a Field --</option>
                    {dropdownData.fields.map(f => <option key={f._id} value={f._id}>{f.fieldName} ({f.fieldCode})</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* --- SECTION 2: PRODUCT & DOSAGE --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Define Input</h2>
                  <p className="text-sm text-slate-500">Choose the product and specify the dosage amount</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Select Product <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    name="product" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    value={form.product} 
                    onChange={handleFormChange} 
                    required
                  >
                    <option value="" disabled>-- Choose a Product --</option>
                    <optgroup label="Fertilizers" className="font-medium text-slate-600">
                      {dropdownData.fertilizers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </optgroup>
                    <optgroup label="Pesticides" className="font-medium text-slate-600">
                      {dropdownData.pesticides.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Dosage Amount <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    name="dosage.amount" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    type="number" 
                    step="0.01" 
                    placeholder="Enter amount"
                    value={form.dosage.amount} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    name="dosage.unit" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    placeholder="e.g. ml/L" 
                    value={form.dosage.unit} 
                    onChange={handleFormChange} 
                    required 
                  />
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-slate-200" />
            
            {/* --- SECTION 3: SCHEDULE --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  3
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Define Schedule</h2>
                  <p className="text-sm text-slate-500">Set up the application frequency and timing</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-6 pl-11">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Frequency</label>
                  <select 
                    name="schedule.type" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    value={form.schedule.type} 
                    onChange={handleFormChange}
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
                    name="schedule.startDate" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    type="date" 
                    value={form.schedule.startDate} 
                    onChange={handleFormChange} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Repeat Every</label>
                  <div className="relative">
                    <input 
                      name="schedule.repeatEvery" 
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                      type="number" 
                      min="1" 
                      value={form.schedule.repeatEvery} 
                      onChange={handleFormChange} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">
                        {form.schedule.type === 'daily' ? 'day(s)' : 
                         form.schedule.type === 'weekly' ? 'week(s)' : 
                         form.schedule.type === 'monthly' ? 'month(s)' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Total Occurrences</label>
                  <input 
                    name="schedule.occurrences" 
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150" 
                    type="number" 
                    min="1"
                    placeholder="No. of times" 
                    value={form.schedule.occurrences || ''} 
                    onChange={handleFormChange} 
                  />
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* --- SECTION 4: NOTES --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                  4
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Additional Notes</h2>
                  <p className="text-sm text-slate-500">Add any relevant instructions or observations</p>
                </div>
              </div>
              
              <div className="pl-11">
                <textarea 
                  name="notes" 
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors duration-150 resize-y" 
                  rows={4} 
                  placeholder="Add any relevant notes, special instructions, or observations here..." 
                  value={form.notes} 
                  onChange={handleFormChange} 
                />
              </div>
            </section>

            {/* Divider */}
            <hr className="border-slate-200" />
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => setForm(initialFormState)}
                className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-colors duration-150"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 104.582 9" />
                </svg>
                Reset Form
              </button>
              
              <button 
                type="submit" 
                className="inline-flex items-center px-8 py-3 border border-transparent rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300 transition-colors duration-150"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Plan
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>All plans start as active and will appear in the due list according to their schedule.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Use specific dosage amounts with appropriate units (e.g., ml/L, g/m², kg/ha).</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Leave occurrences empty for ongoing schedules without a set end date.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}