// ✅ FINAL AND CORRECTED file with PDF feature working: frontend/src/admin/pages/InputListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- THIS IS THE CORRECT IMPORT METHOD FOR JSPDF WITH AUTOTABLE ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

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
    
    // --- PDF Generation Logic (CORRECTED) ---
    const generatePDF = () => {
        if (inputs.length === 0) {
            alert("No data available to export.");
            return;
        }
        
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(20);
        doc.text('Farm Inputs Inventory Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Report Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        const tableColumn = ["Product Name", "Category", "Stock Quantity"];
        const tableRows = [];

        inputs.forEach(input => {
            const inputData = [
                input.name,
                input.category ? (input.category.charAt(0).toUpperCase() + input.category.slice(1)) : 'N/A',
                input.stockQty || 0
            ];
            tableRows.push(inputData);
        });

        // The 'doc.autoTable' is replaced with 'autoTable(doc, ...)'
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            alternateRowStyles: { fillColor: [240, 240, 240] }
        });
        
        doc.save('farm_inputs_report.pdf');
    };

    // --- Render Logic ---
    if (loading) return <div className="p-8">Loading Inventory...</div>;
    if (error) return <div className="p-8 text-red-500 font-semibold">{error}</div>;

    const chartData = inputs.slice().sort((a, b) => (b.stockQty || 0) - (a.stockQty || 0)).slice(0, 10);
        
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Farm Inputs Inventory</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={generatePDF}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700"
                    >
                       <i className="fas fa-file-pdf mr-2"></i> Export PDF
                    </button>
                    <Link to="/admin/crop/inputs/add" className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700">
                        + Add New Input
                    </Link>
                </div>
            </div>
            
            {/* Table Section */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                       <thead className="bg-gray-50">
                            <tr>
                                <th className="th-style">Product Name</th>
                                <th className="th-style">Category</th>
                                <th className="th-style">Stock Quantity</th>
                                <th className="th-style">Actions</th>
                            </tr>
                        </thead>
                       <tbody className="divide-y divide-gray-200">
                           {inputs.length > 0 ? (
                                inputs.map((input) => (
                                    <tr key={input._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{input.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                input.category === 'fertilizer' ? 'bg-green-100 text-green-800' :
                                                input.category === 'pesticide' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {input.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{input.stockQty || 0}</td>
                                        <td className="px-6 py-4 text-right space-x-4">
                                            <Link to={`/admin/crop/inputs/edit/${input._id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold">Edit</Link>
                                            <button onClick={() => handleDelete(input._id, input.name)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500">
                                        No farm inputs found.
                                    </td>
                                </tr>
                            )}
                       </tbody>
                    </table>
                </div>
            </div>

            {/* Graph Section */}
            {inputs.length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Top 10 Inputs by Stock Quantity
                    </h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" /> 
                            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                            <Tooltip wrapperStyle={{ zIndex: 1000 }}/>
                            <Legend />
                            <Bar dataKey="stockQty" name="Stock Quantity" fill="#22C55E" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <style>{`.th-style { text-align: left; padding: 12px 24px; font-weight: 600; color: #4A5568; text-transform: uppercase; }`}</style>
        </div>
    );
};

export default InputListPage;