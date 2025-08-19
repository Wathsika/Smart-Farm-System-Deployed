// frontend/src/admin/PlanList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const PlanList = () => {
    const [dueToday, setDueToday] = useState([]);
    const [activePlans, setActivePlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                // Get plans due today
                const dueTodayRes = await api.get('/plans/due');
                // Get all active plans
                const activePlansRes = await api.get('/plans', { params: { active: true } });
                
                setDueToday(dueTodayRes.data);
                setActivePlans(activePlansRes.data);
            } catch (error) {
                console.error("Failed to fetch plans:", error);
                alert("Could not load plans.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const renderPlanRow = (plan) => (
        <tr key={plan._id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-4 px-6">
                <div className="font-medium text-gray-800">{plan.crop?.cropName || 'N/A'}</div>
                <div className="text-sm text-gray-500">{plan.field?.fieldName || 'N/A'}</div>
            </td>
            <td className="py-4 px-6">{plan.product?.name || 'N/A'}</td>
            <td className="py-4 px-6">
                <div className="text-gray-800">{`Every ${plan.schedule.repeatEvery} ${plan.schedule.type.replace('ly', '')}(s)`}</div>
                <div className="text-sm text-gray-500">{`from ${new Date(plan.schedule.startDate).toLocaleDateString()}`}</div>
            </td>
            <td className="py-4 px-6 space-x-4">
                <button className="text-green-600 font-semibold hover:text-green-800">Mark Applied</button>
                <button className="text-yellow-600 font-semibold hover:text-yellow-800">Disable</button>
                <button className="text-red-600 font-semibold hover:text-red-800">Delete</button>
            </td>
        </tr>
    );

    if (loading) return <div className="p-8">Loading Plans...</div>;
    
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* --- 1. මෙන්න අලුතෙන් add කරපු Header එක --- */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Application Plans</h1>
                <Link 
                    to="/admin/crop/plan/new" 
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition"
                >
                    + Add New Plan
                </Link>
            </div>

            {/* --- Due Today Section --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Due Today</h2>
                {dueToday.length > 0 ? (
                     <div className="divide-y divide-gray-200">
                        {dueToday.map(plan => (
                             <div key={plan._id} className="flex justify-between items-center py-3">
                                 <div>
                                     <span className="font-medium">{plan.product?.name}</span> • <span className="text-gray-600">{plan.dosage?.amount} {plan.dosage?.unit}</span>
                                     <span className="text-sm text-gray-500 block">{plan.field?.fieldName} - {plan.crop?.cropName}</span>
                                 </div>
                                 <div className="space-x-4">
                                     <button className="text-green-600 font-semibold hover:text-green-800">Mark Applied</button>
                                     <button className="text-yellow-600 font-semibold hover:text-yellow-800">Disable</button>
                                     <button className="text-red-600 font-semibold hover:text-red-800">Delete</button>
                                 </div>
                             </div>
                        ))}
                     </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Nothing due today.</p>
                )}
            </div>

            {/* --- 2. මෙන්න නිවැරදි කරන ලද, Alignment හදපු Table එක --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">All Active Plans</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="th-style">Crop/Field</th>
                                <th className="th-style">Product</th>
                                <th className="th-style">Schedule</th>
                                <th className="th-style">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {activePlans.length > 0 ? (
                                activePlans.map(plan => renderPlanRow(plan))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">No active plans found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
              .th-style { text-align: left; padding: 12px 24px; font-weight: 600; color: #4A5568; }
            `}</style>
        </div>
    );
};

export default PlanList;