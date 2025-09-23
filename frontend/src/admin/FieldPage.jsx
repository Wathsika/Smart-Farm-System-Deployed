

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


import { api } from '../lib/api.js'; 


const FieldPage = () => {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API Calls defined inside the component (Team's style) ---
  const getFieldsAPI = async () => {
      const response = await api.get('/fields');
      return response.data;
  };
  const deleteFieldAPI = async (fieldId) => {
      await api.delete(`/fields/${fieldId}`);
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getFieldsAPI();
        if (Array.isArray(data)) {
          setFields(data);
        } else {
          setFields([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFields();
  }, []);

  const handleDelete = async (fieldId, fieldName) => {
    if (window.confirm(`Are you sure you want to delete "${fieldName}"?`)) {
      try {
        await deleteFieldAPI(fieldId);
        setFields(currentFields => currentFields.filter(field => field._id !== fieldId));
      } catch (err) {
        alert(`Failed to delete field: ${err.message}`);
      }
    }
  };
    
  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) return <p className="text-center py-10">Loading field data...</p>;
    if (error) return <p className="text-center text-red-500 py-10">Error: {error}</p>;
    if (fields.length === 0) {
      return (
        <p className="text-gray-500 text-center py-10 border-2 border-dashed rounded-lg">
          No fields found. <br />
          Click the 'Add New Field' button to get started!
        </p>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="th-style">Field Name</th>
              <th className="th-style">Code</th>
              <th className="th-style">Area</th>
              <th className="th-style">Location</th>
              <th className="th-style">Status</th>
              <th className="th-style">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {fields.map((field) => (
              <tr key={field._id} className="border-b border-gray-200 hover:bg-gray-50">
                
                {/* === මෙන්න සිදු කළ එකම වැදගත් වෙනස === */}
                {/* Field Name එක දැන් click කරන්න පුළුවන් Link එකක් */}
                <td className="td-style font-medium">
                  <Link to={`/admin/fields/${field._id}`} className="text-blue-600 hover:underline">
                    {field.fieldName}
                  </Link>
                </td>
                {/* ======================================= */}

                <td className="td-style">{field.fieldCode}</td>
                <td className="td-style">{`${field.area.value} ${field.area.unit}`}</td>
                <td className="td-style">{field.locationDescription}</td>
                <td className="td-style">
                  <span className={`py-1 px-3 rounded-full text-xs font-medium ${
                      field.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {field.status}
                  </span>
                </td>
                <td className="td-style">
                  <Link to={`/admin/fields/edit/${field._id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold mr-4">Edit</Link>
                  <button onClick={() => handleDelete(field._id, field.fieldName)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
    
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Field Management</h1>
        <Link 
          to="/admin/fields/add" 
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700"
        >
          <span className="text-2xl mr-2">+</span> Add New Field
        </Link>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Existing Farm Fields</h2>
        <style>{`
          .th-style { text-align: left; padding: 12px 24px; font-weight: 600; font-size: 0.875rem; color: #4A5568; text-transform: uppercase; letter-spacing: wider; }
          .td-style { padding: 16px 24px; }
        `}</style>
        {renderContent()}
      </div>
    </div>
  );
};

export default FieldPage;