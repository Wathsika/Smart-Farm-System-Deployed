// ✅ ENHANCED AND COMPLETE file: frontend/src/admin/pages/FieldDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
// Recharts imports now include `LabelList` for on-bar labels
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// --- Key Info Card Component ---
// This small component helps display key data in a visually appealing way.
const InfoCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <i className={`fas ${icon} text-3xl text-green-500 mr-4`}></i>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- A custom, professional-looking tooltip component for the chart ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border rounded-lg shadow-lg">
                <p className="font-semibold text-gray-800">{`${label}`}</p>
                <p className="text-green-600">{`Total Amount: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const FieldDetailsPage = () => {
    const { id } = useParams();
    const [field, setField] = useState(null);
    const [usageHistory, setUsageHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [fieldRes, usageRes] = await Promise.all([
                    api.get(`/fields/${id}`),
                    api.get(`/applications/field/${id}`)
                ]);
                
                setField(fieldRes.data);
                setUsageHistory(usageRes.data);
            } catch (err) {
                console.error("Failed to fetch field details:", err);
                setError("Could not load field data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8">Loading Field Details...</div>;
    if (error) return <div className="p-8 text-red-500 font-semibold">{error}</div>;
    if (!field) return <div className="p-8">Field not found.</div>;
    
    // Data processing logic for the chart
    const analysisData = usageHistory.reduce((accumulator, log) => {
        const category = log.product?.category || 'Unknown';
        const amount = log.quantityUsed?.amount || 0;
        
        const existingCategory = accumulator.find(item => item.name === category);

        if (existingCategory) {
            existingCategory.totalAmount += amount;
        } else {
            accumulator.push({ name: category.charAt(0).toUpperCase() + category.slice(1), totalAmount: amount });
        }
        return accumulator;
    }, []);

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{field.fieldName}</h1>
                    <p className="text-gray-500 mt-1">{field.locationDescription}</p>
                </div>
                <Link to={`/admin/fields/edit/${field._id}`} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
                    Edit Field
                </Link>
            </div>
            
            {/* Key Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InfoCard title="Area" value={`${field.area.value} ${field.area.unit}`} icon="fa-ruler-combined" />
                <InfoCard title="Soil Type" value={field.soilType || 'N/A'} icon="fa-spa" />
                <InfoCard title="Status" value={field.status} icon="fa-check-circle" />
                <InfoCard title="Current Crop" value={field.currentCrop?.cropName || 'None'} icon="fa-seedling" />
            </div>

            {/* Tabs */}
            <div className="bg-white p-2 rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('details')} className={`tab-button ${activeTab === 'details' && 'tab-active'}`}>Details</button>
                        <button onClick={() => setActiveTab('history')} className={`tab-button ${activeTab === 'history' && 'tab-active'}`}>Usage History</button>
                        <button onClick={() => setActiveTab('analysis')} className={`tab-button ${activeTab === 'analysis' && 'tab-active'}`}>Analysis (Graphs)</button>
                    </nav>
                </div>

                <div className="py-6">
                    {/* Details Tab Content */}
                    {activeTab === 'details' && (
                        <div className="space-y-4 px-4">
                            <h3 className="text-xl font-semibold mb-4">Additional Details</h3>
                            <p><strong>Field Code:</strong> {field.fieldCode}</p>
                            <p><strong>Irrigation System:</strong> {field.irrigationSystem}</p>
                            <p><strong>Notes:</strong> {field.notes || 'No additional notes.'}</p>
                        </div>
                    )}

                    {/* Usage History Tab Content */}
                    {activeTab === 'history' && (
                        <div>
                             <h3 className="text-xl font-semibold mb-4 px-4">Input Application History</h3>
                             {usageHistory.length > 0 ? (
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="th-style">Date</th>
                                            <th className="th-style">Product Applied</th>
                                            <th className="th-style">Quantity Used</th>
                                            <th className="th-style">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {usageHistory.map(log => (
                                            <tr key={log._id}>
                                                <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-medium">{log.product?.name || 'N/A'}</td>
                                                <td className="px-6 py-4">{log.quantityUsed?.amount} {log.quantityUsed?.unit}</td>
                                                <td className="px-6 py-4">{log.remarks || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             ) : (
                                <p className="text-center text-gray-500 py-10">No usage history found for this field.</p>
                             )}
                        </div>
                    )}
                     
                     {/* The enhanced and professional Analysis tab */}
                    {activeTab === 'analysis' && (
                         <div className="px-4">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Usage Analysis</h3>
                            <p className="text-gray-500 mb-6">A summary of total input quantities used on this field, grouped by category.</p>
                            
                            {usageHistory.length > 0 ? (
                                <div style={{ width: '100%', height: 400 }}>
                                    <ResponsiveContainer>
                                        <BarChart 
                                            data={analysisData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            barSize={50}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.8)' }}/> 
                                            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                            <Bar dataKey="totalAmount" name="Total Amount Used" radius={[4, 4, 0, 0]} fill="rgba(34, 197, 94, 0.8)">
                                                <LabelList dataKey="totalAmount" position="top" fill="#1F2937" fontWeight="bold" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <i className="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500">No usage data available to generate a chart.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Styles */}
            <style>{`
              .tab-button { padding: 1rem; border-bottom: 2px solid transparent; font-weight: 600; color: #6B7280; }
              .tab-button:hover { border-bottom-color: #D1D5DB; }
              .tab-active { color: #10B981; border-bottom-color: #10B981; }
              .th-style { text-align: left; padding: 12px 24px; font-weight: 600; color: #4A5568; }
            `}</style>
        </div>
    );
};

export default FieldDetailsPage;