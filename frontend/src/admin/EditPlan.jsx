// ✅ NEW file: frontend/src/admin/EditPlanPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const EditPlanPage = () => {
    const { id } = useParams(); // Get the Plan ID from the URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null); // Start with null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // We still need these for the dropdowns
    const [dropdownData, setDropdownData] = useState({
        crops: [], fields: [], products: []
    });

    useEffect(() => {
        const fetchPlanAndDependencies = async () => {
            try {
                // Fetch the specific plan to edit AND all the dropdown data
                const [planRes, cropsRes, fieldsRes, productsRes] = await Promise.all([
                    api.get(`/plans/${id}`), // A new backend endpoint might be needed for this
                    api.get('/crops'),
                    api.get('/fields'),
                    api.get('/inputs')
                ]);

                const plan = planRes.data;
                // Pre-fill the form with data from the specific plan
                setFormData({
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

                setDropdownData({
                    crops: cropsRes.data,
                    fields: fieldsRes.data,
                    products: productsRes.data
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
    
    // You would add handleChange and handleSubmit functions here similar to AddPlanPage
    const handleSubmit = async (e) => { /* ... submit logic with api.put(`/plans/${id}`, formData) ... */ };


    if (loading) return <div className="p-8">Loading Plan for Editing...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-semibold mb-4">Edit Application Plan</h1>
            {/* The form from AddPlanPage would be duplicated here, */}
            {/* but the input values would be bound to the `formData` state. */}
            <p>Form to edit the plan will be here.</p>
        </div>
    );
};

export default EditPlanPage;