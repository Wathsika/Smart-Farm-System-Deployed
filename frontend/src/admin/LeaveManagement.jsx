// src/admin/LeaveManagement.jsx

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  Filter, 
  RefreshCw, 
  Search, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Info, 
  Clock, 
  Eye, // For viewing details
} from 'lucide-react';
import { api } from "../lib/api";
import { format } from 'date-fns';

// Reusable Modal Component
const Modal = ({ show, onClose, title, children, size = "md" }) => {
  if (!show) return null;
  
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full ${sizeClasses[size]} border border-white/20`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group"
              >
                <XCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Status Badge Component (Adapted for leave statuses)
const StatusBadge = ({ status }) => {
  const configs = {
    Pending: { 
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-100', 
      text: 'text-yellow-800',
      icon: Clock,
      border: 'border-yellow-200'
    },
    Approved: { 
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100', 
      text: 'text-green-800',
      icon: CheckCircle,
      border: 'border-green-200'
    },
    Rejected: { 
      bg: 'bg-gradient-to-r from-red-100 to-rose-100', 
      text: 'text-red-800',
      icon: XCircle,
      border: 'border-red-200'
    }
  };

  const config = configs[status] || configs.Pending; 
  const Icon = config.icon;

  return (
    <motion.span 
      whileHover={{ scale: 1.05 }}
      className={`px-3 py-1.5 inline-flex items-center gap-2 text-xs leading-5 font-semibold rounded-full border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </motion.span>
  );
};

// Action Button Component
const ActionButton = ({ onClick, icon: Icon, color = "blue", children, size = "sm", disabled = false }) => {
  const colorClasses = {
    blue: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
    red: "text-red-600 hover:text-red-800 hover:bg-red-50",
    green: "text-green-600 hover:text-green-800 hover:bg-green-50",
    gray: "text-gray-600 hover:text-gray-800 hover:bg-gray-50",
    primaryGreen: "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md",
    primaryRed: "bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 shadow-md"
  };

  const sizeClasses = {
    xs: "p-1.5",
    sm: "p-2",
    md: "px-4 py-2",
    lg: "px-6 py-3"
  };

  const finalSizeClass = children ? sizeClasses[size] : sizeClasses.xs; 
  const finalColorClass = colorClasses[color] || colorClasses.blue;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${finalColorClass} ${finalSizeClass} transition-all duration-200 flex items-center gap-1.5 text-xs rounded-lg font-medium whitespace-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};


export default function LeaveManagement() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filters, setFilters] = useState({
    userId: "all",
    status: "all",
    startDate: "",
    endDate: "",
  });

  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRejectRequest, setCurrentRejectRequest] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [remarksSubmitting, setRemarksSubmitting] = useState(false);

  // New state for View Details Modal
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [currentViewRequest, setCurrentViewRequest] = useState(null);


  // --- Fetch Data ---
  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.userId !== 'all') params.userId = filters.userId;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const { data } = await api.get("/leave-requests", { params });
      setRequests(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/admin/users", { params: { role: 'Employee', limit: 100 } }); 
        setUsers(data.items || []);
      } catch (err) {
        console.error("Failed to load users for filter:", err);
      }
    };

    loadUsers();
    loadRequests();
  }, [loadRequests]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ userId: "all", status: "all", startDate: "", endDate: "" });
    setSearchTerm("");
  };

  const initiateReject = (request) => {
    setCurrentRejectRequest(request);
    setRejectionRemarks("");
    setShowRemarksModal(true);
    setShowViewDetailsModal(false); // Close view details modal if open
  };

  const handleConfirmReject = async () => {
    if (!currentRejectRequest) return;
    setRemarksSubmitting(true);
    try {
      await api.patch(`/leave-requests/${currentRejectRequest._id}/status`, { status: 'Rejected', adminRemarks: rejectionRemarks });
      loadRequests();
      setShowRemarksModal(false);
      setCurrentRejectRequest(null);
      setRejectionRemarks("");
    } catch (err) {
      alert(`Failed to reject request: ${err?.response?.data?.message || "Server Error"}`);
    } finally {
      setRemarksSubmitting(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (window.confirm("Are you sure you want to APPROVE this leave request?")) {
      try {
        await api.patch(`/leave-requests/${requestId}/status`, { status: 'Approved' });
        loadRequests();
        setShowViewDetailsModal(false); // Close view details modal if open
      } catch (err) {
        alert(`Failed to approve request: ${err?.response?.data?.message || "Server Error"}`);
      }
    }
  };

  // Handler to open View Details Modal
  const handleViewDetails = (request) => {
    setCurrentViewRequest(request);
    setShowViewDetailsModal(true);
  };

  // Filter requests by search term
  const filteredRequests = requests.filter(req => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      req.user?.fullName?.toLowerCase().includes(q) ||
      req.leaveType?.toLowerCase().includes(q) ||
      req.reason?.toLowerCase().includes(q) ||
      (req.adminRemarks && req.adminRemarks.toLowerCase().includes(q)); 
    return matchesSearch;
  });

  // Statistics calculation
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  return (
    <>
      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8"> 
        <div className="max-w-7xl mx-auto"> 
          {/* Enhanced Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-green-800 to-emerald-800 bg-clip-text text-transparent flex items-center gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> 
                  </div>
                  Leave Request Management
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Oversee and act on employee leave applications</p>
              </div>
              <ActionButton onClick={loadRequests} icon={RefreshCw} color="green" size="md" disabled={loading}>
                {loading ? "Refreshing..." : "Refresh Data"}
              </ActionButton>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"> 
              {[
                { label: "Total Requests", value: stats.total, icon: Users, color: "from-green-500 to-emerald-600" },
                { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-400 to-amber-500" },
                { label: "Approved", value: stats.approved, icon: CheckCircle, color: "from-emerald-500 to-green-600" },
                { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-rose-600" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 sm:p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> 
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Filter Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Filters & Search</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"> 
              {/* Search Bar */}
              <div className="lg:col-span-2"> 
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4" />
                  Search Records
                </label>
                <input
                  type="text"
                  placeholder="Search by employee, type, reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Employee Filter */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Employee
                </label>
                <select 
                  name="userId" 
                  value={filters.userId} 
                  onChange={handleFilterChange} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Employees</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" />
                  Status
                </label>
                <select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadRequests}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResetFilters}
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> 
                Reset All
              </motion.button>
            </div>
          </motion.div>

          {/* Enhanced Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">Loading leave requests...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No leave requests found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="overflow-x-auto"> 
                <table className="min-w-full table-auto w-full divide-y divide-gray-100"> 
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee</th> 
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Dates</th> 
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th> 
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reason</th> 
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admin Remarks</th> 
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th> 
                      <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th> 
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredRequests.map((req, index) => (
                        <motion.tr 
                          key={req._id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="px-3 py-3"> 
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm"> 
                                {req.user?.fullName?.charAt(0) || 'N'}
                              </div>
                              <div className="flex-1 min-w-0"> 
                                <p className="font-semibold text-gray-900 text-sm truncate">{req.user?.fullName || 'N/A'}</p> 
                                <p className="text-xs text-gray-500 truncate">{req.user?.email || ''}</p> 
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                            <Calendar className="inline-block w-4 h-4 mr-2 text-gray-500" />
                            {format(new Date(req.startDate), 'MMM d, yyyy')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600"> 
                            {req.leaveType}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate cursor-pointer hover:underline"
                              title={req.reason} // Tooltip for full reason
                              onClick={() => handleViewDetails(req)}
                          > 
                            {req.reason}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate cursor-pointer hover:underline"
                              title={req.adminRemarks || 'No remarks'} // Tooltip for full remarks
                              onClick={() => handleViewDetails(req)}
                          > 
                              {req.adminRemarks ? (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Info className="w-4 h-4 text-blue-500" /> {req.adminRemarks}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">No remarks</span>
                              )}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            {req.status === 'Pending' ? (
                              <div className="flex justify-end items-center gap-2">
                                <ActionButton 
                                  onClick={() => handleApprove(req._id)} 
                                  icon={CheckCircle} 
                                  color="primaryGreen" 
                                  size="xs"
                                >
                                  Approve
                                </ActionButton>
                                <ActionButton 
                                  onClick={() => initiateReject(req)} 
                                  icon={XCircle} 
                                  color="primaryRed" 
                                  size="xs"
                                >
                                  Reject
                                </ActionButton>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Action Taken</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* View Leave Details Modal */}
      <Modal
        show={showViewDetailsModal}
        onClose={() => setShowViewDetailsModal(false)}
        title={`Leave Request Details for ${currentViewRequest?.user?.fullName || ''}`}
        size="md"
      >
        {currentViewRequest && (
          <div className="space-y-4 text-gray-700">
            <p><span className="font-semibold">Employee:</span> {currentViewRequest.user?.fullName}</p>
            <p><span className="font-semibold">Email:</span> {currentViewRequest.user?.email}</p>
            <p><span className="font-semibold">Dates:</span> {format(new Date(currentViewRequest.startDate), 'MMM d, yyyy')} - {format(new Date(currentViewRequest.endDate), 'MMM d, yyyy')}</p>
            <p><span className="font-semibold">Leave Type:</span> {currentViewRequest.leaveType}</p>
            <div>
              <span className="font-semibold">Reason:</span>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100">{currentViewRequest.reason}</p>
            </div>
            <div>
              <span className="font-semibold">Admin Remarks:</span>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100">{currentViewRequest.adminRemarks || 'No remarks provided.'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <StatusBadge status={currentViewRequest.status} />
            </div>

            {currentViewRequest.status === 'Pending' && (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <ActionButton 
                  onClick={() => handleApprove(currentViewRequest._id)} 
                  icon={CheckCircle} 
                  color="primaryGreen" 
                  size="md"
                >
                  Approve
                </ActionButton>
                <ActionButton 
                  onClick={() => initiateReject(currentViewRequest)} 
                  icon={XCircle} 
                  color="primaryRed" 
                  size="md"
                >
                  Reject
                </ActionButton>
              </div>
            )}
            {currentViewRequest.status !== 'Pending' && (
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <span className="text-gray-500 italic text-sm">Action already taken.</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Rejection Remarks Modal (Existing) */}
      <Modal 
        show={showRemarksModal} 
        onClose={() => setShowRemarksModal(false)} 
        title={`Reject Leave for ${currentRejectRequest?.user?.fullName || ''}`}
        size="md"
      >
        {currentRejectRequest && (
          <div className="space-y-6">
            <p className="text-gray-700">
              Please provide remarks for rejecting this leave request. These remarks will be visible to the employee.
            </p>
            <div>
              <label htmlFor="rejectionRemarks" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Remarks
              </label>
              <textarea 
                id="rejectionRemarks"
                value={rejectionRemarks} 
                onChange={e => setRejectionRemarks(e.target.value)} 
                rows="4" 
                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="E.g., staffing issues, unapproved dates, incomplete details."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={() => setShowRemarksModal(false)} 
                className="px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                disabled={remarksSubmitting}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={handleConfirmReject} 
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                disabled={remarksSubmitting}
              >
                {remarksSubmitting ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> 
                        Rejecting...
                    </>
                ) : (
                    <>
                        <XCircle className="w-4 h-4" />
                        Confirm Reject
                    </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}