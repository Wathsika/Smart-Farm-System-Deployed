// src/admin/StaffAttendance.jsx

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  Filter, 
  RefreshCw, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle,
  AlertCircle,
  UserCheck,
  Coffee,
  Zap, // Added Zap for Status icon
  LucideClock, // Using LucideClock explicitly to avoid clash if needed
} from 'lucide-react'; // Ensure all icons are imported

import { api } from "../lib/api"; // Using your actual API import

// --- Reusable Modal Component (from the enhanced UI) ---
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
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Status Badge Component (from the enhanced UI) ---
const StatusBadge = ({ status }) => {
  const configs = {
    Present: { 
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100', 
      text: 'text-green-800',
      icon: CheckCircle,
      border: 'border-green-200'
    },
    Late: { 
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-100', 
      text: 'text-yellow-800',
      icon: LucideClock, // Use LucideClock to differentiate
      border: 'border-yellow-200'
    },
    'On Leave': { 
      bg: 'bg-gradient-to-r from-blue-100 to-sky-100', 
      text: 'text-blue-800',
      icon: Coffee,
      border: 'border-blue-200'
    },
    Absent: { 
      bg: 'bg-gradient-to-r from-red-100 to-rose-100', 
      text: 'text-red-800',
      icon: AlertCircle,
      border: 'border-red-200'
    }
  };

  const config = configs[status] || configs.Absent;
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

// --- Action Button Component (from the enhanced UI) ---
const ActionButton = ({ onClick, icon: Icon, color = "blue", children, size = "sm" }) => {
  const colorClasses = {
    blue: "text-green-600 hover:text-green-800 hover:bg-green-50", // Changed to green shades
    red: "text-red-600 hover:text-red-800 hover:bg-red-50",
    green: "text-green-600 hover:text-green-800 hover:bg-green-50"
  };

  const sizeClasses = {
    sm: "p-2",
    md: "px-4 py-2",
    lg: "px-6 py-3"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${colorClasses[color]} ${sizeClasses[size]} rounded-xl transition-all duration-200 flex items-center gap-2 font-medium`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </motion.button>
  );
};

// --- Main StaffAttendance Component ---
export default function StaffAttendance() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // From enhanced UI

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
  }, [filters]); // Dependencies include filters to re-fetch when they change

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data.items || []);
      } catch (err) {
        console.error("Failed to load users for filter:", err); // Added error logging
      }
    };

    loadUsers();
    loadAttendance(); // Initial load of attendance
  }, [loadAttendance]); // Depend on loadAttendance for initial data and filter changes

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ userId: "all", startDate: "", endDate: "" });
    setSearchTerm(""); // Reset search term too
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      try {
        await api.delete(`/attendance/${id}`);
        loadAttendance(); // Refresh list after deletion
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to delete record.");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { _id, user, ...updateData } = editingRecord; // Exclude 'user' if not directly patchable
      await api.patch(`/attendance/${_id}`, updateData);
      setEditingRecord(null);
      loadAttendance(); // Refresh list after update
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update record.");
    }
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone offset before converting to ISO string
    // This helps with rendering correctly in datetime-local inputs
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  // Filter records by search term
  const filteredRecords = records.filter(record => 
    record.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(record.date).toLocaleDateString().includes(searchTerm) // Allow searching by formatted date
  );

  // Statistics calculation
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'Present').length,
    late: records.filter(r => r.status === 'Late').length,
    absent: records.filter(r => r.status === 'Absent').length, // Ensure your mock or actual data supports "Absent" explicitly
    onLeave: records.filter(r => r.status === 'On Leave').length,
  };

  return (
    <>
      <div className="min-h-screen bg-white"> {/* Main background is white */}
        {/* Animated Background Elements - Removed as requested */}
        {/*
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"></div>
        </div>
        */}

        <div className="relative z-10 p-6">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-green-800 to-emerald-800 bg-clip-text text-transparent flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  Staff Attendance
                </h1>
                <p className="text-gray-600 mt-2">Manage and monitor employee attendance records</p>
              </div>
              <ActionButton onClick={loadAttendance} icon={RefreshCw} color="green" size="md">
                Refresh Data
              </ActionButton>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total Records", value: stats.total, icon: Users, color: "from-green-500 to-emerald-600" },
                { label: "Present", value: stats.present, icon: CheckCircle, color: "from-emerald-500 to-green-600" },
                { label: "Late", value: stats.late, icon: LucideClock, color: "from-yellow-400 to-amber-500" }, // Updated color to yellow
                { label: "Absent", value: stats.absent, icon: AlertCircle, color: "from-red-500 to-rose-600" }, // Updated color to red
                { label: "On Leave", value: stats.onLeave, icon: Coffee, color: "from-blue-500 to-sky-600" } // Updated color to blue
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300" // Simplified styling, removed backdrop/green border
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
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
            className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100" // Simplified styling, removed backdrop/white border
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Filters & Search</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Search Bar */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4" />
                  Search Records
                </label>
                <input
                  type="text"
                  placeholder="Search by name, status, remarks or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" // Simplified bg/backdrop
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
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent" // Simplified bg/backdrop
                >
                  <option value="all">All Employees</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                </select>
              </div>
              
              {/* Date Filters */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input 
                  name="startDate" 
                  type="date" 
                  value={filters.startDate} 
                  onChange={handleFilterChange} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent" // Simplified bg/backdrop
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input 
                  name="endDate" 
                  type="date" 
                  value={filters.endDate} 
                  onChange={handleFilterChange} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" // Simplified bg/backdrop
                />
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadAttendance}
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
                <X className="w-4 h-4" />
                Reset All
              </motion.button>
            </div>
          </motion.div>

          {/* Enhanced Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" // Simplified styling, removed backdrop/white border
          >
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" // Loader color changed
                />
                <p className="text-gray-600">Loading attendance records...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No attendance records found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200"> {/* Simplified gradient in table header */}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredRecords.map((rec, index) => (
                        <motion.tr 
                          key={rec._id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-all duration-200" // Simplified hover effect
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                {rec.user?.fullName?.charAt(0) || 'N'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{rec.user?.fullName || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(rec.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <LucideClock className="w-4 h-4 text-green-500" /> {/* Explicitly using LucideClock */}
                              {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-gray-400 italic">N/A</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {rec.checkOut ? (
                              <div className="flex items-center gap-2">
                                <LucideClock className="w-4 h-4 text-red-500" /> {/* Explicitly using LucideClock */}
                                {new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Still active</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={rec.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <ActionButton onClick={() => setEditingRecord(rec)} icon={Edit3} color="blue">
                                Edit
                              </ActionButton>
                              <ActionButton onClick={() => handleDelete(rec._id)} icon={Trash2} color="red">
                                Delete
                              </ActionButton>
                            </div>
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
      
      {/* Enhanced Edit Modal */}
      <Modal show={!!editingRecord} onClose={() => setEditingRecord(null)} title="Edit Attendance Record" size="lg">
        {editingRecord && (
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Employee Info Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"> {/* Simplified styling */}
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                {editingRecord.user?.fullName?.charAt(0) || 'N'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{editingRecord.user?.fullName}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(editingRecord.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <LucideClock className="w-4 h-4 text-green-500" /> {/* Explicitly using LucideClock */}
                  Check-In Time
                </label>
                <input 
                  type="datetime-local" 
                  value={formatDateForInput(editingRecord.checkIn)} 
                  onChange={e => setEditingRecord({...editingRecord, checkIn: e.target.value})} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <LucideClock className="w-4 h-4 text-red-500" /> {/* Explicitly using LucideClock */}
                  Check-Out Time
                </label>
                <input 
                  type="datetime-local" 
                  value={formatDateForInput(editingRecord.checkOut)} 
                  onChange={e => setEditingRecord({...editingRecord, checkOut: e.target.value})} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Status
              </label>
              <select 
                value={editingRecord.status} 
                onChange={e => setEditingRecord({...editingRecord, status: e.target.value})} 
                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option>Present</option>
                <option>Late</option>
                <option>Absent</option>
                <option>On Leave</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
              <textarea 
                value={editingRecord.remarks || ''} 
                onChange={e => setEditingRecord({...editingRecord, remarks: e.target.value})} 
                rows="4" 
                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Add any additional remarks or notes..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={() => setEditingRecord(null)} 
                className="px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Save Changes
              </motion.button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}