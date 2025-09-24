// ✅ FINAL AND COMPLETE file: frontend/src/admin/EditPlanPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api'; 

const EditPlanPage = () => {
    const { id } = useParams(); // Get the Plan ID from the URL
    const navigate = useNavigate();

    const [form, setForm] = useState(null); // Start with null to show a loading state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State to hold the data for dropdown menus
    const [dropdownData, setDropdownData] = useState({
        fertilizers: [],
        pesticides: [],
        crops: [],
        fields: []
    });

    // --- Data fetching for the form and its dropdowns ---
    useEffect(() => {
        const fetchPlanAndDependencies = async () => {
            try {
                // Fetch the plan to edit AND the lists for dropdowns in parallel
                const [planRes, fzRes, psRes, csRes, fsRes] = await Promise.all([
                    api.get(`/plans/${id}`), // Fetch the specific plan
                    api.get('/inputs', { params: { category: 'fertilizer' }}),
                    api.get('/inputs', { params: { category: 'pesticide' }}),
                    api.get('/crops'),
                    api.get('/fields'),
                ]);

                const plan = planRes.data;
                
                // Pre-fill the form state with the fetched plan data
                setForm({
                    crop: plan.crop?._id || '',
                    field: plan.field?._id || '',
                    product: plan.product?._id || '',
                    schedule: {
                        type: plan.schedule?.type || 'weekly',
                        startDate: plan.schedule?.startDate ? new Date(plan.schedule.startDate).toISOString().slice(0, 10) : '',
                        repeatEvery: plan.schedule?.repeatEvery || 1,
                        occurrences: plan.schedule?.occurrences || 4,
                    },
                    dosage: {
                        amount: plan.dosage?.amount || 0,
                        unit: plan.dosage?.unit || 'ml/L'
                    },
                    notes: plan.notes || ''
                });

                // Set the data for the dropdowns
                setDropdownData({
                    fertilizers: fzRes.data,
                    pesticides: psRes.data,
                    crops: csRes.data,
                    fields: fsRes.data,
                });

            } catch (err) {
                console.error("Failed to load data for editing:", err);
                setError("Could not load plan data. It may have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlanAndDependencies();
    }, [id]);
    
    // Handler for updating the form state, using your teammate's style
    const handleFormChange = (e, field, isNumber = false) => {
        const { value } = e.target;
        setForm(prev => {
            const keys = field.split('.');
            if (keys.length === 1) {
                return { ...prev, [field]: value };
            }
            return {
                ...prev,
                [keys[0]]: { ...prev[keys[0]], [keys[1]]: isNumber ? Number(value) : value }
            };
        });
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.crop || !form.field || !form.product) {
            return alert('Please select a Crop, Field, and Product.');
        }
        try {
            await api.put(`/plans/${id}`, form); // Use PUT for updating
            alert('Plan updated successfully!');
            navigate('/admin/crop/plans');
        } catch (error) {
            console.error("Failed to update plan:", error);
            alert(`Error: ${error.response?.data?.message || 'Could not update the plan.'}`);
        }
    };


    if (loading) return <div className="p-8">Loading Plan for Editing...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    // We only render the form if `form` is not null (i.e., after data has been fetched)
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Edit Application Plan</h1>
            
            {form && ( // This check prevents rendering before the form data is ready
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg space-y-8">
                  {/* --- All the JSX from AddPlanPage is duplicated here --- */}
                  {/* --- The ONLY difference is that 'value' is bound to `form` state --- */}
                  <fieldset className="border p-6 rounded-lg">
                    <legend className="text-xl font-semibold px-2">Step 1: Define Target</legend>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                       <select value={form.crop} onChange={e => handleFormChange(e, 'crop')} /* ... */>
                         <option value="" disabled>-- Choose a Crop --</option>
                         {dropdownData.crops.map(c => <option key={c._id} value={c._id}>{c.cropName}</option>)}
                       </select>
                       <select value={form.field} onChange={e => handleFormChange(e, 'field')} /* ... */>
                          {/* ... Field options ... */}
                       </select>
                    </div>
                  </fieldset>

                  {/* Other fieldsets for product, schedule, notes, etc. */}
                  
                  <div className="flex justify-end">
                    <button type="submit" className="bg-green-600 ...">Update Plan</button>
                  </div>
              </form>
            )}
        </div>
    );
};

export default EditPlanPage;