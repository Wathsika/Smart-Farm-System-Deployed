import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
// Recharts imports now include `LabelList` for on-bar labels
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// --- Enhanced Key Info Card Component ---
const InfoCard = ({ title, value, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 shadow-blue-200',
        green: 'from-green-500 to-green-600 shadow-green-200',
        purple: 'from-purple-500 to-purple-600 shadow-purple-200',
        orange: 'from-orange-500 to-orange-600 shadow-orange-200',
        teal: 'from-teal-500 to-teal-600 shadow-teal-200'
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {icon}
                        </svg>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Enhanced custom tooltip component for the chart ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border-0 rounded-xl shadow-2xl border border-gray-200">
                <p className="font-semibold text-gray-800 mb-1">{label}</p>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-2"></div>
                    <p className="text-green-600 font-medium">{`Total Amount: ${payload[0].value}`}</p>
                </div>
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                    <p className="text-center text-gray-600 text-lg font-medium">Loading Field Details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border-l-4 border-red-500">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="ml-3 text-lg font-semibold text-red-800">Error Loading Field</h3>
                    </div>
                    <p className="text-red-700 font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    if (!field) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border-l-4 border-gray-500">
                    <p className="text-center text-gray-600 text-lg font-medium">Field not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Enhanced Header */}
            <div className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{field.fieldName}</h1>
                                <p className="text-gray-600 mt-1 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {field.locationDescription}
                                </p>
                            </div>
                        </div>
                        <Link 
                            to={`/admin/fields/edit/${field._id}`} 
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Field
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Key Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <InfoCard 
                        title="Area" 
                        value={`${field.area.value} ${field.area.unit}`} 
                        color="blue"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />}
                    />
                    <InfoCard 
                        title="Soil Type" 
                        value={field.soilType || 'N/A'} 
                        color="green"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />}
                    />
                    <InfoCard 
                        title="Status" 
                        value={field.status} 
                        color="purple"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    />
                    <InfoCard 
                        title="Current Crop" 
                        value={field.currentCrop?.cropName || 'None'} 
                        color="teal"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />}
                    />
                </div>

                {/* Enhanced Tabs Container */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button 
                                onClick={() => setActiveTab('details')} 
                                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                                    activeTab === 'details' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Details
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')} 
                                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                                    activeTab === 'history' 
                                        ? 'border-green-500 text-green-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Usage History
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('analysis')} 
                                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                                    activeTab === 'analysis' 
                                        ? 'border-purple-500 text-purple-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Analysis
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Details Tab Content */}
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Additional Details</h3>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Field Code</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{field.fieldCode}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Irrigation System</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{field.irrigationSystem || 'Not specified'}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <div className="flex items-center mb-3">
                                        <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notes</span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{field.notes || 'No additional notes available.'}</p>
                                </div>
                            </div>
                        )}

                        {/* Usage History Tab Content */}
                        {activeTab === 'history' && (
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">Input Application History</h3>
                                        <p className="text-gray-500">Track all applications made to this field</p>
                                    </div>
                                </div>
                                
                                {usageHistory.length > 0 ? (
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Applied</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Used</th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {usageHistory.map((log, index) => (
                                                    <tr key={log._id} className={`transition-colors duration-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {new Date(log.date).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900">{log.product?.name || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">{log.product?.category || 'Unknown category'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {log.quantityUsed?.amount} {log.quantityUsed?.unit}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{log.remarks || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Usage History</h3>
                                        <p className="text-gray-500">No usage history found for this field yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                         
                        {/* Enhanced Analysis tab */}
                        {activeTab === 'analysis' && (
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">Usage Analysis</h3>
                                        <p className="text-gray-500">A summary of total input quantities used on this field, grouped by category.</p>
                                    </div>
                                </div>
                                
                                {usageHistory.length > 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div style={{ width: '100%', height: 400 }}>
                                            <ResponsiveContainer>
                                                <BarChart 
                                                    data={analysisData}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    barSize={60}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#6B7280', fontWeight: '500' }} 
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fill: '#6B7280', fontWeight: '500' }} 
                                                    />
                                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}/> 
                                                    <Legend 
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        iconType="rect"
                                                    />
                                                    <Bar 
                                                        dataKey="totalAmount" 
                                                        name="Total Amount Used" 
                                                        radius={[6, 6, 0, 0]} 
                                                        fill="url(#colorGradient)"
                                                    >
                                                        <LabelList 
                                                            dataKey="totalAmount" 
                                                            position="top" 
                                                            fill="#374151" 
                                                            fontWeight="600"
                                                            fontSize={12}
                                                        />
                                                    </Bar>
                                                    <defs>
                                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                                                            <stop offset="100%" stopColor="#059669" stopOpacity={0.6}/>
                                                        </linearGradient>
                                                    </defs>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Data</h3>
                                        <p className="text-gray-500">No usage data available to generate a chart.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldDetailsPage;