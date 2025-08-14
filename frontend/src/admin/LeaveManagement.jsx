// src/admin/LeaveManagement.jsx

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { api } from "../lib/api";

export default function LeaveManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/leave-requests");
      setRequests(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleUpdateStatus = async (requestId, status) => {
    let remarks = "";
    if (status === 'Rejected') {
      remarks = window.prompt("Please provide a reason for rejection (optional):");
      if (remarks === null) { // User clicked cancel
        return; 
      }
    }

    try {
      // API එකට request එක යවනවා
      await api.patch(`/leave-requests/${requestId}/status`, { status, adminRemarks: remarks });
      // සාර්ථක නම්, list එක refresh කරනවා
      loadRequests();
    } catch (err) {
      alert(`Failed to update status: ${err?.response?.data?.message || "Server Error"}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leave Request Management</h1>
        <button 
          onClick={loadRequests} 
          className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i> 
          Refresh
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-gray-600">Loading requests...</p>
        ) : error ? (
          <p className="p-6 text-center text-red-600">{error}</p>
        ) : requests.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No leave requests found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {requests.map((req) => (
                  <motion.tr 
                    key={req._id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{req.user?.fullName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{req.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.leaveType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{req.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {req.status === 'Pending' ? (
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => handleUpdateStatus(req._id, 'Approved')} className="text-white bg-green-500 hover:bg-green-600 font-bold py-1 px-3 rounded-full text-xs">
                            Approve
                          </button>
                          <button onClick={() => handleUpdateStatus(req._id, 'Rejected')} className="text-white bg-red-500 hover:bg-red-600 font-bold py-1 px-3 rounded-full text-xs">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Action Taken</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}