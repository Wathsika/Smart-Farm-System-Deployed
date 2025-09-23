// src/admin/StaffAttendance.jsx

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, // Keep Clock for general icons if intended
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
  Zap,
  LucideClock, // Keep LucideClock for status badge and table times
  CalendarDays // Using CalendarDays to signify a fixed date
} from 'lucide-react';

import { api } from "../lib/api";
import { format } from 'date-fns'; // Import format from date-fns

// Helper to format date-time for datetime-local input, handles null/undefined
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
};

// This function returns "YYYY-MM-DD" part of an ISO date string
const getDateOnlyString = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'yyyy-MM-dd');
};

// This function returns "YYYY-MM-DDT00:00" or "YYYY-MM-DDT23:59" for use in datetime-local min/max
const getMinMaxDateTimeForFixedDay = (fixedDateString, type = 'min') => {
    if (!fixedDateString) return '';
    const datePart = getDateOnlyString(fixedDateString); // "YYYY-MM-DD"
    return `${datePart}T${type === 'min' ? '00:00' : '23:59'}`;
};

// New helper: Determines the effective maximum selectable datetime for an input.
// It's the earlier of (end of the fixed day OR current real-world time).
const getMaxTimeForInput = (fixedDateString) => {
  if (!fixedDateString) return '';

  const endOfFixedDayDate = new Date(getMinMaxDateTimeForFixedDay(fixedDateString, 'max'));
  const now = new Date();
  
  // Choose the earlier time. If endOfFixedDayDate is in the future compared to now,
  // then 'now' is the effective max. Otherwise, endOfFixedDayDate is the max.
  const effectiveMaxTime = Math.min(endOfFixedDayDate.getTime(), now.getTime());
  
  return formatDateForInput(effectiveMaxTime);
};

// Get current date/time string for filter date inputs, always in local timezone
const currentDateTimeLocal = format(new Date(), "yyyy-MM-dd'T'HH:mm"); // for max of datetime-local inputs
const currentDateString = format(new Date(), 'yyyy-MM-dd'); // YYYY-MM-DD for date inputs

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
      {show && ( // Only render if show is true
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
      )}
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
      icon: LucideClock, // Use LucideClock here
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
    blue: "text-green-600 hover:text-green-800 hover:bg-green-50",
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
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    userId: "all",
    startDate: "",
    endDate: "",
  });
  const [filterFormErrors, setFilterFormErrors] = useState({}); // New state for filter errors

  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({}); // New state for edit modal errors
  const [editFormGeneralError, setEditFormGeneralError] = useState(""); // General error for edit modal submission

  // --- Validation for Edit Record Modal ---
  const validateEditRecordForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    const now = new Date();

    // Ensure editingRecord is not null before validation
    if (!editingRecord) return false;

    // Check-In Time Validation
    if (!editingRecord.checkIn) {
      errors.checkIn = "Check-In Time is required.";
      isValid = false;
    } else {
      const checkInDate = new Date(editingRecord.checkIn);
      if (isNaN(checkInDate.getTime())) {
        errors.checkIn = "Invalid Check-In Time format.";
        isValid = false;
      } else if (checkInDate > now) {
        errors.checkIn = "Check-In Time cannot be in the future.";
        isValid = false;
      }
      // Ensure Check-In is on the fixed record date
      if (getDateOnlyString(checkInDate) !== getDateOnlyString(editingRecord.date)) {
        errors.checkIn = "Check-In Time must be on the attendance record date.";
        isValid = false;
      }
    }

    // Check-Out Time Validation (if present)
    if (editingRecord.checkOut) {
      const checkOutDate = new Date(editingRecord.checkOut);
      if (isNaN(checkOutDate.getTime())) {
        errors.checkOut = "Invalid Check-Out Time format.";
        isValid = false;
      } else if (checkOutDate > now) {
        errors.checkOut = "Check-Out Time cannot be in the future.";
        isValid = false;
      } else if (editingRecord.checkIn && new Date(editingRecord.checkIn) >= checkOutDate) {
        errors.checkOut = "Check-Out Time must be after Check-In Time.";
        isValid = false;
      }
      // Ensure Check-Out is on the fixed record date
      if (getDateOnlyString(checkOutDate) !== getDateOnlyString(editingRecord.date)) {
        errors.checkOut = "Check-Out Time must be on the attendance record date.";
        isValid = false;
      }
    }

    // Status Validation
    if (!['Present', 'Late', 'Absent', 'On Leave'].includes(editingRecord.status)) {
      errors.status = "Invalid status selected.";
      isValid = false;
    }

    // Remarks Validation (optional, but max length)
    if (editingRecord.remarks && editingRecord.remarks.length > 500) {
      errors.remarks = "Remarks cannot exceed 500 characters.";
      isValid = false;
    }

    setEditFormErrors(errors);
    return isValid;
  }, [editingRecord]);

  // --- Validation for Filter Dates ---
  const validateFilterDates = useCallback(() => {
    const errors = {};
    let isValid = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today

    // Start Date Validation (if present)
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0); // Normalize to start of day
      if (isNaN(startDate.getTime())) {
        errors.startDate = "Invalid Start Date format.";
        isValid = false;
      } else if (startDate > today) { // Allow past and today, but not future
        errors.startDate = "Start Date cannot be in the future.";
        isValid = false;
      }
    }

    // End Date Validation (if present)
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(0, 0, 0, 0); // Normalize to start of day
      if (isNaN(endDate.getTime())) {
        errors.endDate = "Invalid End Date format.";
        isValid = false;
      } else if (endDate > today) { // Allow past and today, but not future
        errors.endDate = "End Date cannot be in the future.";
        isValid = false;
      }
    }

    // Start Date must be before or same as End Date (if both present)
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      if (startDate > endDate) {
        errors.endDate = "End Date cannot be before Start Date.";
        isValid = false;
      }
    }

    setFilterFormErrors(errors);
    return isValid;
  }, [filters]);


  // --- Fetch Data ---
  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    setFilterFormErrors({}); // Clear filter errors before loading

    if (!validateFilterDates()) { // Validate filter dates before making API call
      setLoading(false);
      setError("Please correct the date filter errors.");
      return;
    }

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
  }, [filters, validateFilterDates]); // Dependencies include filters and the validation function

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data.items || []);
      } catch (err) {
        console.error("Failed to load users for filter:", err);
      }
    };

    loadUsers();
    loadAttendance();
  }, [loadAttendance]);

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Clear the specific error for this filter field as the user types/changes
    if (filterFormErrors[name]) {
      setFilterFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    setError(""); // Clear general error if user starts interacting with filters
  };

  const handleResetFilters = () => {
    setFilters({ userId: "all", startDate: "", endDate: "" });
    setSearchTerm("");
    setFilterFormErrors({}); // Clear filter errors on reset
    setError(""); // Clear any general error
    loadAttendance(); // Re-load data after resetting filters
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      try {
        await api.delete(`/attendance/${id}`);
        loadAttendance();
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to delete record.");
      }
    }
  };

  const handleEditRecordInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord(prev => ({ ...prev, [name]: value }));
    // Clear specific error for the field as user types
    if (editFormErrors[name]) {
      setEditFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    setEditFormGeneralError(""); // Clear general form error
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditFormGeneralError(""); // Clear general error before new validation/submission
    setEditFormErrors({}); // Clear field-specific errors

    if (!editingRecord) { // Basic check if editingRecord is still null
      setEditFormGeneralError("No record selected for update.");
      return;
    }

    if (!validateEditRecordForm()) {
      setEditFormGeneralError("Please correct the errors in the form.");
      return;
    }

    try {
      const { _id, user, date, ...updateData } = editingRecord; // Exclude 'date' and 'user' as they are not being updated from the form
      await api.patch(`/attendance/${_id}`, updateData);
      setEditingRecord(null);
      loadAttendance();
    } catch (err) {
      setEditFormGeneralError(err?.response?.data?.message || "Failed to update record.");
    }
  };
  
  // Filter records by search term
  const filteredRecords = records.filter(record => 
    record.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(record.date), 'MM/dd/yyyy').includes(searchTerm) // Changed to date-fns format
  );

  // Statistics calculation
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'Present').length,
    late: records.filter(r => r.status === 'Late').length,
    absent: records.filter(r => r.status === 'Absent').length,
    onLeave: records.filter(r => r.status === 'On Leave').length,
  };

  return (
    <>
      <div className="min-h-screen bg-white">
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
                { label: "Late", value: stats.late, icon: LucideClock, color: "from-yellow-400 to-amber-500" },
                { label: "Absent", value: stats.absent, icon: AlertCircle, color: "from-red-500 to-rose-600" },
                { label: "On Leave", value: stats.onLeave, icon: Coffee, color: "from-blue-500 to-sky-600" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
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
            className="mb-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
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
                <label htmlFor="searchTerm" className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4" />
                  Search Records
                </label>
                <input
                  id="searchTerm"
                  type="text"
                  placeholder="Search by name, status, remarks or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Employee Filter */}
              <div>
                <label htmlFor="userId" className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Employee
                </label>
                <select 
                  id="userId"
                  name="userId" 
                  value={filters.userId} 
                  onChange={handleFilterChange} 
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Employees</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                </select>
              </div>
              
              {/* Start Date Filter */}
              <div>
                <label htmlFor="startDate" className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input 
                  id="startDate"
                  name="startDate" 
                  type="date" 
                  value={filters.startDate} 
                  onChange={handleFilterChange} 
                  className={`w-full p-3 border ${filterFormErrors.startDate ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  max={currentDateString} // Prevent future dates
                />
                {filterFormErrors.startDate && <p className="text-red-500 text-xs mt-1">{filterFormErrors.startDate}</p>}
              </div>
              
              {/* End Date Filter */}
              <div>
                <label htmlFor="endDate" className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input 
                  id="endDate"
                  name="endDate" 
                  type="date" 
                  value={filters.endDate} 
                  onChange={handleFilterChange} 
                  className={`w-full p-3 border ${filterFormErrors.endDate ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  max={currentDateString} // Prevent future dates
                />
                {filterFormErrors.endDate && <p className="text-red-500 text-xs mt-1">{filterFormErrors.endDate}</p>}
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
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
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
                    <tr className="bg-gray-50 border-b border-gray-200">
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
                          className="hover:bg-gray-50 transition-all duration-200"
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
                            {format(new Date(rec.date), 'EEE, MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <LucideClock className="w-4 h-4 text-green-500" />
                              {rec.checkIn ? format(new Date(rec.checkIn), 'hh:mm a') : <span className="text-gray-400 italic">N/A</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {rec.checkOut ? (
                              <div className="flex items-center gap-2">
                                <LucideClock className="w-4 h-4 text-red-500" />
                                {format(new Date(rec.checkOut), 'hh:mm a')}
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
      <Modal show={!!editingRecord} onClose={() => {setEditingRecord(null); setEditFormErrors({}); setEditFormGeneralError("");}} title="Edit Attendance Record" size="lg">
        {editingRecord && (
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* General form error message */}
            {editFormGeneralError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {editFormGeneralError}
              </div>
            )}

            {/* Employee Info Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                {editingRecord.user?.fullName?.charAt(0) || 'N'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{editingRecord.user?.fullName}</h4>
                {/* Display the fixed attendance date */}
                <p className="text-md text-gray-700 font-medium flex items-center gap-2 mt-1">
                  <CalendarDays className="w-5 h-5 text-gray-500" />
                  Attendance Date: {format(new Date(editingRecord.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-In Time */}
              <div>
                <label htmlFor="checkIn" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <LucideClock className="w-4 h-4 text-green-500" />
                  Check-In Time *
                </label>
                <input 
                  id="checkIn"
                  name="checkIn"
                  type="datetime-local" 
                  value={formatDateForInput(editingRecord.checkIn)} 
                  onChange={handleEditRecordInputChange}
                  className={`w-full p-3 border ${editFormErrors.checkIn ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  // Restrict date selection to the fixed attendance date and not in future
                  min={getMinMaxDateTimeForFixedDay(editingRecord.date, 'min')} 
                  max={getMaxTimeForInput(editingRecord.date)} 
                  required
                />
                {editFormErrors.checkIn && <p className="text-red-500 text-xs mt-1">{editFormErrors.checkIn}</p>}
              </div>
              
              {/* Check-Out Time */}
              <div>
                <label htmlFor="checkOut" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <LucideClock className="w-4 h-4 text-red-500" />
                  Check-Out Time
                </label>
                <input 
                  id="checkOut"
                  name="checkOut"
                  type="datetime-local" 
                  value={formatDateForInput(editingRecord.checkOut)} 
                  onChange={handleEditRecordInputChange} 
                  className={`w-full p-3 border ${editFormErrors.checkOut ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  // Check-out must be after check-in, or start of fixed day. Max not in future.
                  min={editingRecord.checkIn ? formatDateForInput(editingRecord.checkIn) : getMinMaxDateTimeForFixedDay(editingRecord.date, 'min')} 
                  max={getMaxTimeForInput(editingRecord.date)} 
                />
                {editFormErrors.checkOut && <p className="text-red-500 text-xs mt-1">{editFormErrors.checkOut}</p>}
              </div>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Status *
              </label>
              <select 
                id="status"
                name="status"
                value={editingRecord.status} 
                onChange={handleEditRecordInputChange} 
                className={`w-full p-3 border ${editFormErrors.status ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
              {editFormErrors.status && <p className="text-red-500 text-xs mt-1">{editFormErrors.status}</p>}
            </div>
            
            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
              <textarea 
                id="remarks"
                name="remarks"
                value={editingRecord.remarks || ''} 
                onChange={handleEditRecordInputChange} 
                rows="4" 
                className={`w-full p-3 border ${editFormErrors.remarks ? 'border-red-500' : 'border-gray-200'} rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                placeholder="Add any additional remarks or notes..."
                maxLength={500}
              ></textarea>
              {editFormErrors.remarks && <p className="text-red-500 text-xs mt-1">{editFormErrors.remarks}</p>}
            </div>
            
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" 
                onClick={() => {setEditingRecord(null); setEditFormErrors({}); setEditFormGeneralError("");}}
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