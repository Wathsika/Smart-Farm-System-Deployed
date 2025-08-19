// ✅ නිවැරදි කරන ලද file එක: frontend/src/admin/FieldPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// පියවර 1: පොදු 'api' instance එක axios.js එකෙන් import කරගන්න, api.js එකෙන් functions import කරන්නේ නෑ
import { api } from '../lib/axios'; // වැදගත්: ඔයාගේ axios.js එකේ path එක හරියටම දෙන්න

const FieldPage = () => {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- පියවර 2: "වේටර්" Functions ටික Component එක ඇතුළේ Define කිරීම ---
  // මේවා API CALLS. මේවා backend logic නෙවෙයි.

  /**
   * Backend එකට කතා කරලා සියලුම fields ගෙන්නගන්නවා.
   */
  const getFieldsAPI = async () => {
      // Import කරගත්තු 'api' එක පාවිච්චි කරලා network request එක යවනවා.
      const response = await api.get('/fields');
      return response.data;
  };

  /**
   * Backend එකට කතා කරලා field එකක් delete කරනවා.
   */
  const deleteFieldAPI = async (fieldId) => {
      const response = await api.delete(`/fields/${fieldId}`);
      return response.data;
  };


  // --- මෙතැන් සිට, ඉතිරි code එක කලින් වගේමයි ---

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getFieldsAPI(); // දැන් උඩ define කරපු function එක call කරනවා
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
        await deleteFieldAPI(fieldId); // දැන් උඩ define කරපු function එක call කරනවා
        setFields(currentFields => currentFields.filter(field => field._id !== fieldId));
      } catch (err) {
        alert(`Failed to delete field: ${err.message}`);
      }
    }
  };
    
    
  // ඔයාගේ renderContent function එක සහ අවසාන return JSX එක වෙනස් වෙන්නේ නෑ.
  // ... (කරුණාකර ඔයාගේ renderContent function එක සහ return JSX කොටස මෙතනට paste කරන්න) ...
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
                <td className="td-style font-medium">{field.fieldName}</td>
                <td className="td-style">{field.fieldCode}</td>
                <td className="td-style">{`${field.area.value} ${field.area.unit}`}</td>
                <td className="td-style">{field.locationDescription}</td>
                <td className="td-style">
                  <span className="bg-blue-200 text-blue-800 py-1 px-3 rounded-full text-xs font-medium">
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
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 flex items-center"
        >
          <span className="text-2xl mr-2">+</span> Add New Field
        </Link>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Existing Farm Fields</h2>
        {/* CSS එක clean තියාගන්න, Tailwind's @apply directive එක CSS file එකේ use කරන්න පුළුවන්. */}
        {/* ඒ වෙනුවට tạm thời මෙහෙම style දාමු. */}
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