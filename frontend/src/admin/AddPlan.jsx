// ✅ Your file with console.log added: frontend/src/admin/AddPlan.jsx

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
  
  if (loading) return <div className="p-6">Loading form data...</div>;
  
  // --- COMPONENT RENDER ---
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Add Application Plan</h1>
      
      <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">

        {/* --- SECTION 1: TARGET (CROP & FIELD) --- */}
        <fieldset className="border p-6 rounded-lg">
          <legend className="text-xl font-semibold px-2 text-gray-700">Step 1: Define Target</legend>
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="label-style">Select Crop</label>
              <select name="crop" className="input-style" value={form.crop} onChange={handleFormChange} required>
                <option value="" disabled>-- Choose a Crop --</option>
                {dropdownData.crops.map(c => <option key={c._id} value={c._id}>{c.cropName}</option>)}
              </select>
            </div>
            <div>
              <label className="label-style">Select Field</label>
              <select name="field" className="input-style" value={form.field} onChange={handleFormChange} required>
                <option value="" disabled>-- Choose a Field --</option>
                {dropdownData.fields.map(f => <option key={f._id} value={f._id}>{f.fieldName} ({f.fieldCode})</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        {/* --- SECTION 2: PRODUCT & DOSAGE --- */}
        <fieldset className="border p-6 rounded-lg">
          <legend className="text-xl font-semibold px-2 text-gray-700">Step 2: Define Input</legend>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="md:col-span-1">
              <label className="label-style">Select Product</label>
              <select name="product" className="input-style" value={form.product} onChange={handleFormChange} required>
                <option value="" disabled>-- Choose a Product --</option>
                <optgroup label="Fertilizers">
                  {dropdownData.fertilizers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </optgroup>
                <optgroup label="Pesticides">
                  {dropdownData.pesticides.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="label-style">Dosage Amount</label>
              <input name="dosage.amount" className="input-style" type="number" step="0.01" value={form.dosage.amount} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="label-style">Unit</label>
              <input name="dosage.unit" className="input-style" placeholder="e.g. ml/L" value={form.dosage.unit} onChange={handleFormChange} required />
            </div>
          </div>
        </fieldset>
        
        {/* --- SECTION 3: SCHEDULE --- */}
        <fieldset className="border p-6 rounded-lg">
          <legend className="text-xl font-semibold px-2 text-gray-700">Step 3: Define Schedule</legend>
          <div className="grid md:grid-cols-4 gap-6 mt-4 items-end">
            <div>
              <label className="label-style">Frequency</label>
              <select name="schedule.type" className="input-style" value={form.schedule.type} onChange={handleFormChange}>
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="label-style">Start Date</label>
              <input name="schedule.startDate" className="input-style" type="date" value={form.schedule.startDate} onChange={handleFormChange} />
            </div>
            <div>
              <label className="label-style">Repeat Every...</label>
              <input name="schedule.repeatEvery" className="input-style" type="number" min="1" value={form.schedule.repeatEvery} onChange={handleFormChange} />
            </div>
            <div>
              <label className="label-style">Occurrences</label>
              <input name="schedule.occurrences" className="input-style" type="number" placeholder="No. of times" value={form.schedule.occurrences || ''} onChange={handleFormChange} />
            </div>
          </div>
        </fieldset>

        {/* --- SECTION 4: NOTES --- */}
        <fieldset className="border p-6 rounded-lg">
          <legend className="text-xl font-semibold px-2 text-gray-700">Step 4: Additional Notes</legend>
          <textarea name="notes" className="input-style mt-4" rows={4} placeholder="Add any relevant notes here..." value={form.notes} onChange={handleFormChange} />
        </fieldset>
        
        <div className="flex justify-end">
          <button type="submit" className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700">Save Plan</button>
        </div>
      </form>

      <style>{`
          .label-style { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
          .input-style { width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
          .input-style:focus { border-color: #2563EB; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); outline: none; }
      `}</style>
    </div>
  );
}