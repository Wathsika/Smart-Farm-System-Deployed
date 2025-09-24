// ✅ FINAL AND CORRECTED file with PDF feature working: frontend/src/admin/pages/InputListPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- THIS IS THE CORRECT IMPORT METHOD FOR JSPDF WITH AUTOTABLE ---
import { pdf } from '@react-pdf/renderer';
import { InputInventoryReport } from './templates/InputInventoryReport';

const InputListPage = () => {
    // --- State and Data Fetching (No Change) ---
    const [inputs, setInputs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInputs = async () => {
            try {
                setLoading(true);
                const response = await api.get('/inputs');
                setInputs(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                setError("Could not load farm inputs.");
            } finally {
                setLoading(false);
            }
        };
        fetchInputs();
    }, []);

    // --- Delete Logic (No Change) ---
    const handleDelete = async (inputId, inputName) => {
        if (window.confirm(`Are you sure you want to delete "${inputName}"?`)) {
            try {
                await api.delete(`/inputs/${inputId}`);
                setInputs(currentInputs => currentInputs.filter(input => input._id !== inputId));
            } catch (err) {
                alert(`Failed to delete input: ${err.message}`);
            }
        }
    };
    
    const summary = useMemo(() => {
        if (!inputs.length) {
            return {
                totalProducts: 0,
                totalStockQty: 0,
                lowStock: 0,
                outOfStock: 0,
                categoryBreakdown: [],
            };
        }

        const totalProducts = inputs.length;
        const totalStockQty = inputs.reduce((sum, item) => sum + Number(item?.stockQty || 0), 0);
        const lowStock = inputs.filter((item) => {
            const reorderLevel = Number(item?.reorderLevel || 0);
            const qty = Number(item?.stockQty || 0);
            return reorderLevel > 0 && qty <= reorderLevel;
        }).length;
        const outOfStock = inputs.filter((item) => Number(item?.stockQty || 0) <= 0).length;

        const categoryMap = inputs.reduce((acc, item) => {
            const key = item?.category || 'other';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
            name,
            count,
        }));

        return { totalProducts, totalStockQty, lowStock, outOfStock, categoryBreakdown };
    }, [inputs]);

    // --- PDF Generation Logic (React-PDF) ---
    const generatePDF = async () => {
        if (inputs.length === 0) {
            alert("No data available to export.");
            return;
        }
        try {
            const doc = (
                <InputInventoryReport
                    inputs={inputs}
                    summary={summary}
                    generatedAt={new Date()}
                />
            );

            // The 'doc.autoTable' is replaced with 'autoTable(doc, ...)'
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Farm_Inputs_Inventory_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // --- Render Logic ---
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="text-slate-700 font-medium">Loading Inventory...</span>
                </div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-red-700 font-medium">{error}</span>
                </div>
            </div>
        </div>
    );

    const chartData = inputs.slice().sort((a, b) => (b.stockQty || 0) - (a.stockQty || 0)).slice(0, 10);
        
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                                Farm Inputs Inventory
                            </h1>
                            <p className="text-slate-600">Manage and monitor your agricultural input supplies</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={generatePDF}
                                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export PDF
                            </button>
                            <Link 
                                to="/admin/crop/inputs/add" 
                                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-700 hover:to-emerald-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add New Input
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">Total Products</p>
                                <p className="text-3xl font-bold text-slate-900">{summary.totalProducts}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">Total Stock</p>
                                <p className="text-3xl font-bold text-slate-900">{summary.totalStockQty}</p>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">Low Stock</p>
                                <p className="text-3xl font-bold text-amber-600">{summary.lowStock}</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">Out of Stock</p>
                                <p className="text-3xl font-bold text-red-600">{summary.outOfStock}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-xl">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="text-xl font-semibold text-slate-900">Inventory Overview</h2>
                        <p className="text-sm text-slate-600 mt-1">Complete list of all farm inputs</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Stock Quantity</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {inputs.length > 0 ? (
                                    inputs.map((input, index) => (
                                        <tr key={input._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors duration-150`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                                            <span className="text-white font-semibold text-sm">
                                                                {input.name?.charAt(0)?.toUpperCase() || 'I'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-semibold text-slate-900">{input.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    input.category === 'fertilizer' 
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                                    input.category === 'pesticide' 
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                                                        'bg-slate-100 text-slate-800 border border-slate-200'
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                                        input.category === 'fertilizer' ? 'bg-emerald-500' :
                                                        input.category === 'pesticide' ? 'bg-amber-500' : 'bg-slate-500'
                                                    }`}></div>
                                                    {input.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-sm font-semibold ${
                                                        (input.stockQty || 0) <= 0 ? 'text-red-600' :
                                                        (input.reorderLevel && (input.stockQty || 0) <= input.reorderLevel) ? 'text-amber-600' :
                                                        'text-slate-900'
                                                    }`}>
                                                        {input.stockQty || 0}
                                                    </span>
                                                    {(input.stockQty || 0) <= 0 && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                    {input.reorderLevel && (input.stockQty || 0) <= input.reorderLevel && (input.stockQty || 0) > 0 && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link 
                                                    to={`/admin/crop/inputs/edit/${input._id}`} 
                                                    className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors duration-150 border border-indigo-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(input._id, input.name)} 
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors duration-150 border border-red-200"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <h3 className="text-lg font-medium text-slate-600 mb-1">No farm inputs found</h3>
                                                <p className="text-slate-500 mb-4">Get started by adding your first farm input</p>
                                                <Link 
                                                    to="/admin/crop/inputs/add" 
                                                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-150"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Add Input
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Graph Section */}
                {inputs.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-xl font-semibold text-slate-900">Stock Analysis</h2>
                            <p className="text-sm text-slate-600 mt-1">Top 10 inputs by stock quantity</p>
                        </div>
                        <div className="p-6">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /> 
                                    <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                            fontSize: '14px'
                                        }}
                                        cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                                    />
                                    <Bar 
                                        dataKey="stockQty" 
                                        name="Stock Quantity" 
                                        fill="url(#colorGradient)"
                                        radius={[0, 8, 8, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#34d399" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputListPage;