// src/admin/StaffAttendance.jsx

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { api } from "../lib/api";

// Reusable Modal Component
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default function StaffAttendance() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    userId: "all",
    startDate: "",
    endDate: "",
  });

  const [editingRecord, setEditingRecord] = useState(null);

  // --- Fetch Data ---
  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.userId !== 'all') params.userId = filters.userId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const { data } = await api.get("/attendance", { params });
      setRecords(data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Load users for the filter dropdown
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data.items || []);
      } catch (err) {
        console.error("Failed to load users for filter");
      }
    };

    loadUsers();
    loadAttendance();
  }, [loadAttendance]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ userId: "all", startDate: "", endDate: "" });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
        try {
            await api.delete(`/attendance/${id}`);
            loadAttendance(); // Refresh list
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to delete record.");
        }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const { _id, ...updateData } = editingRecord;
        await api.patch(`/attendance/${_id}`, updateData);
        setEditingRecord(null);
        loadAttendance();
    } catch (err) {
        alert(err?.response?.data?.message || "Failed to update record.");
    }
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone offset before converting to ISO string
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Staff Attendance</h1>
          <button onClick={loadAttendance} className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-md border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* User Filter */}
          <div>
            <label className="text-sm font-medium text-gray-600">Employee</label>
            <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md">
              <option value="all">All Employees</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
            </select>
          </div>
          {/* Start Date */}
          <div>
            <label className="text-sm font-medium text-gray-600">Start Date</label>
            <input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md" />
          </div>
          {/* End Date */}
          <div>
            <label className="text-sm font-medium text-gray-600">End Date</label>
            <input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md" />
          </div>
          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={loadAttendance} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Filter</button>
            <button onClick={handleResetFilters} className="w-full px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Reset</button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading records...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : records.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No attendance records found for the selected filters.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                {records.map((rec) => (
                  <motion.tr 
                    key={rec._id} 
                    className="hover:bg-gray-50"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.user?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rec.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rec.checkIn).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rec.status === 'Present' ? 'bg-green-100 text-green-800' :
                            rec.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                            rec.status === 'On Leave' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {rec.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <button onClick={() => setEditingRecord(rec)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(rec._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      <Modal show={!!editingRecord} onClose={() => setEditingRecord(null)} title="Edit Attendance Record">
        {editingRecord && (
            <form onSubmit={handleUpdate} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Check-In Time</label>
                    <input type="datetime-local" value={formatDateForInput(editingRecord.checkIn)} onChange={e => setEditingRecord({...editingRecord, checkIn: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Check-Out Time</label>
                    <input type="datetime-local" value={formatDateForInput(editingRecord.checkOut)} onChange={e => setEditingRecord({...editingRecord, checkOut: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={editingRecord.status} onChange={e => setEditingRecord({...editingRecord, status: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                        <option>Present</option>
                        <option>Late</option>
                        <option>Absent</option>
                        <option>On Leave</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea value={editingRecord.remarks || ''} onChange={e => setEditingRecord({...editingRecord, remarks: e.target.value})} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setEditingRecord(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save Changes</button>
                </div>
            </form>
        )}
      </Modal>
    </>
  );
}