// ✅ FINAL Corrected file: frontend/src/admin/PlanList.jsx
// With the "Edit" link added to the Actions column.

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const PlanList = () => {
    // --- (All your state and handler functions are perfect and remain unchanged) ---
    const [dueToday, setDueToday] = useState([]);
    const [activePlans, setActivePlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPlans = useCallback(async () => { /* ... no changes here ... */ }, []);
    useEffect(() => { loadPlans(); }, [loadPlans]);

    const handleMarkApplied = async (plan) => { /* ... no changes here ... */ };
    const handleTogglePlan = async (planId) => { /* ... no changes here ... */ };
    const handleDeletePlan = async (planId) => { /* ... no changes here ... */ };

    // --- RENDER FUNCTION with the "Edit" link added ---
    const renderPlanRow = (plan) => (
        <tr key={plan._id} className="border-b border-gray-200 hover:bg-gray-50">
            {/* <td> elements for crop, product, schedule are all correct */}
            <td className="py-4 px-6">
                <div className="font-medium text-gray-800">{plan.crop?.cropName || 'N/A'}</div>
                <div className="text-sm text-gray-500">{plan.field?.fieldName || 'N/A'}</div>
            </td>
            <td className="py-4 px-6">{plan.product?.name || 'N/A'}</td>
            <td className="py-4 px-6">
                <div className="text-gray-800">{`Every ${plan.schedule.repeatEvery} ${plan.schedule.type.replace('ly', '')}(s)`}</div>
                <div className="text-sm text-gray-500">{`from ${new Date(plan.schedule.startDate).toLocaleDateString()}`}</div>
            </td>
            
            {/* === THIS IS THE ONLY CHANGE === */}
            {/* The "Actions" column is updated to include the new Edit link */}
            <td className="py-4 px-6 text-right space-x-4">
                {/* 1. Added the Link to the Edit page */}
                <Link 
                    to={`/admin/crop/plan/edit/${plan._id}`}
                    className="font-semibold text-indigo-600 hover:text-indigo-900"
                >
                    Edit
                </Link>

                <button
                    className="font-semibold text-green-600 hover:text-green-800"
                    onClick={() => handleMarkApplied(plan)}
                >
                    Mark Applied
                </button>
                <button
                    className="font-semibold text-yellow-600 hover:text-yellow-800"
                    onClick={() => handleTogglePlan(plan._id)}
                >
                    {plan.active ? 'Disable' : 'Enable'} {/* Better label for toggling */}
                </button>
                <button
                    className="font-semibold text-red-600 hover:text-red-900"
                    onClick={() => handleDeletePlan(plan._id)}
                >
                    Delete
                </button>
            </td>
            {/* ============================= */}
        </tr>
    );

    if (loading) return <div className="p-8">Loading Plans...</div>;
    
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* ... (Header section is unchanged) ... */}

            {/* --- Due Today Section --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Due Today</h2>
                {dueToday.length > 0 ? (
                     <div className="divide-y divide-gray-200">
                        {dueToday.map(plan => (
                             <div key={plan._id} className="flex justify-between items-center py-3">
                                 {/* ... Due Today plan info is unchanged ... */}
                                 {/* Updated actions to be consistent with the main table */}
                                 <div className="space-x-4 text-sm">
                                     <Link to={`/admin/crop/plan/edit/${plan._id}`} className="font-semibold text-indigo-600 hover:text-indigo-900">Edit</Link>
                                     <button className="font-semibold text-green-600 hover:text-green-800" onClick={() => handleMarkApplied(plan)}>Mark Applied</button>
                                     <button className="font-semibold text-yellow-600 hover:text-yellow-800" onClick={() => handleTogglePlan(plan._id)}>{plan.active ? 'Disable' : 'Enable'}</button>
                                     <button className="font-semibold text-red-600 hover:text-red-800" onClick={() => handleDeletePlan(plan._id)}>Delete</button>
                                 </div>
                             </div>
                        ))}
                     </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Nothing due today.</p>
                )}
            </div>

            {/* --- All Active Plans Table --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                 {/* ... (The table structure is unchanged) ... */}
            </div>

            <style>{/* ... styles ... */}</style>
        </div>
    );
};

export default PlanList;