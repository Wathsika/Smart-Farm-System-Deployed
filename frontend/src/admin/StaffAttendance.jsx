// src/admin/StaffAttendance.jsx

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  Edit3, // This icon is no longer needed but kept for completeness in imports
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  UserCheck, // For 'Clocked In' status (Present)
  Coffee, // For On Leave
  Zap, // For general status icon
  LucideClock, // Keep LucideClock for general time and original Late status
  CalendarDays, // Using CalendarDays to signify a fixed date for edit modal
  XCircle // Added for explicit Absent icon if needed
} from 'lucide-react';

import { api } from "../lib/api";
import { format } from 'date-fns';

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

// Get current date string for filter date inputs (not used anymore, but good for context)
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

// --- Status Badge Component (MODIFIED to work with new statuses) ---
const StatusBadge = ({ status }) => {
  const configs = {
    'Present': {
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
      text: 'text-green-800',
      icon: CheckCircle,
      border: 'border-green-200'
    },
    'Late': {
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
      text: 'text-yellow-800',
      icon: LucideClock,
      border: 'border-yellow-200'
    },
    'On Leave': {
      bg: 'bg-gradient-to-r from-blue-100 to-sky-100',
      text: 'text-blue-800',
      icon: Coffee,
      border: 'border-blue-200'
    },
    'Absent': {
      bg: 'bg-gradient-to-r from-red-100 to-rose-100',
      text: 'text-red-800',
      icon: AlertCircle, // Using AlertCircle for Absent now
      border: 'border-red-200'
    },
    'N/A': { // Default if status is unknown or no data (e.g. for future date calculation)
      bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
      text: 'text-gray-700',
      icon: Zap, // General info icon
      border: 'border-gray-300'
    }
  };

  const config = configs[status] || configs['N/A'];
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
const ActionButton = ({ onClick, icon: Icon, color = "blue", children, size = "sm", disabled = false }) => {
  const colorClasses = {
    blue: "text-green-600 hover:text-green-800 hover:bg-green-50",
    red: "text-red-600 hover:text-red-800 hover:bg-red-50",
    green: "text-green-600 hover:text-green-800 hover:bg-green-50",
    gray: "text-gray-400 cursor-not-allowed", // For disabled state
  };

  const sizeClasses = {
    sm: "p-2",
    md: "px-4 py-2",
    lg: "px-6 py-3"
  };

  const finalColorClass = disabled ? colorClasses.gray : (colorClasses[color] || colorClasses.blue);

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      className={`${finalColorClass} ${sizeClasses[size]} rounded-xl transition-all duration-200 flex items-center gap-2 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      <Icon className="w-4 h-4" />
      {children}
    </motion.button>
  );
};

// --- Main StaffAttendance Component ---
export default function StaffAttendance() {
  const [employeesList, setEmployeesList] = useState([]); // Now stores employees with their status
  const [allUsersForFilter, setAllUsersForFilter] = useState([]); // For the user dropdown in filter (all users, not just employees)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const sanitizeSearch = useCallback(
    (v) => v.replace(/[^a-zA-Z0-9,\s]/g, ""), // allow letters, numbers, space, and comma only
  []);
  const [filters, setFilters] = useState({
    userId: "all",
    statusFilter: "all", // New filter for attendance status
  });
  const [filterFormErrors, setFilterFormErrors] = useState({}); // New state for filter errors (dates removed)

  const [editingRecord, setEditingRecord] = useState(null); // This is now an attendance record, not employee
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editFormGeneralError, setEditFormGeneralError] = useState("");

  // --- Validation for Edit Record Modal ---
  const validateEditRecordForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    const now = new Date();

    if (!editingRecord) return false;

    // Fixed date for the record (not editable in modal)
    const fixedRecordDate = new Date(editingRecord.date);
    fixedRecordDate.setHours(0,0,0,0);

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
      if (getDateOnlyString(checkInDate) !== getDateOnlyString(fixedRecordDate)) {
        errors.checkIn = "Check-In Time must be on the attendance record date.";
        isValid = false;
      }
    }

    // Check-Out Time Validation (if present)
    if (editingRecord.checkOut) { // checkOut can be null
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
      if (getDateOnlyString(checkOutDate) !== getDateOnlyString(fixedRecordDate)) {
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


  // --- Fetch Data ---
  const loadEmployeesAttendanceOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    setFilterFormErrors({});

    try {
      const params = {};
      if (filters.userId !== 'all') params.userId = filters.userId;
      
      // Fetch employees with their current day's attendance status
      const { data } = await api.get("/admin/users", { params }); // Assuming this is where listUsers is
      setEmployeesList(data.items || []);

      // Also ensure we have all users for the employee filter dropdown
      if (allUsersForFilter.length === 0) {
         const usersRes = await api.get("/admin/users", { params: { role: 'Employee', limit: 100 } }); // Fetch all employees for filter dropdown
         setAllUsersForFilter(usersRes.data.items || []);
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load employee attendance data.");
      console.error("Fetch error for employees attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, allUsersForFilter.length]); // Dependencies now include filter, not validateFilterDates (removed)

  useEffect(() => {
    loadEmployeesAttendanceOverview();
  }, [loadEmployeesAttendanceOverview]);


  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleResetFilters = () => {
    setFilters({ userId: "all", statusFilter: "all" });
    setSearchTerm("");
    setFilterFormErrors({});
    setError("");
    // Data will re-load automatically via useEffect when filters change
  };

  // Handler for editing an attendance record
  // This function is no longer called by an "Edit" button in the table,
  // but the modal logic remains if you were to re-introduce a way to edit attendance
  const handleEdit = useCallback(async (recordId) => {
    if (!recordId) {
      alert("No attendance record ID available to edit.");
      setEditingRecord(null);
      return;
    }
    try {
      // We actually need to fetch the individual record via /attendance/:id
      const individualRecordRes = await api.get(`/attendance/${recordId}`);
      if (individualRecordRes.data) {
          // Add user info to editingRecord for display in modal, since it's not populated by /attendance/:id endpoint normally
          const employee = employeesList.find(emp => emp.todayPrimaryAttendanceRecordId === recordId);
          setEditingRecord({...individualRecordRes.data, user: employee?.user || employee}); // Use employee object itself if .user is not defined
      }

    } catch (err) {
      alert(`Failed to fetch record for editing: ${err?.response?.data?.message || "Server Error"}`);
      console.error("Fetch record for edit error:", err);
      setEditingRecord(null);
    }
  }, [employeesList]); // Include employeesList in deps to ensure accurate employee data for populating modal

  const handleDelete = async (recordId) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      try {
        await api.delete(`/attendance/${recordId}`);
        loadEmployeesAttendanceOverview(); // Reload data after deletion
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to delete record.");
        console.error("Delete record error:", err);
      }
    }
  };

  const handleEditRecordInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord(prev => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    setEditFormGeneralError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditFormGeneralError("");
    setEditFormErrors({});

    if (!editingRecord) {
      setEditFormGeneralError("No record selected for update.");
      return;
    }

    if (!validateEditRecordForm()) {
      setEditFormGeneralError("Please correct the errors in the form.");
      return;
    }

    try {
      const { _id, user, date, ...updateData } = editingRecord; // Exclude 'date' and 'user' from update payload, as they are not editable in this form
      await api.patch(`/attendance/${_id}`, updateData);
      setEditingRecord(null); // Close modal
      loadEmployeesAttendanceOverview(); // Reload all data
    } catch (err) {
      setEditFormGeneralError(err?.response?.data?.message || "Failed to update record.");
      console.error("Update attendance record error:", err);
    }
  };

  // Filter employees by search term and new status filter
  const filteredEmployees = employeesList.filter(employee => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      employee.fullName?.toLowerCase().includes(q) ||
      employee.jobTitle?.toLowerCase().includes(q) ||
      employee.email?.toLowerCase().includes(q);

    const matchesStatus = filters.statusFilter === 'all' || employee.currentAttendanceStatus === filters.statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics calculation based on currentAttendanceStatus
  const stats = {
    totalEmployees: employeesList.length,
    present: employeesList.filter(e => e.currentAttendanceStatus === 'Present' || e.currentAttendanceStatus === 'Late').length, // Counts both 'Present' (on-time) and 'Late' as present overall
    late: employeesList.filter(e => e.currentAttendanceStatus === 'Late').length, // Only 'Late' employees
    absent: employeesList.filter(e => e.currentAttendanceStatus === 'Absent').length,
    onLeave: employeesList.filter(e => e.currentAttendanceStatus === 'On Leave').length,
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
                <p className="text-gray-600 mt-2">Manage and monitor employee attendance records for {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <ActionButton onClick={loadEmployeesAttendanceOverview} icon={RefreshCw} color="green" size="md">
                Refresh Data
              </ActionButton>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"> {/* Adjusted to 5 columns */}
              {[
                { label: "Total Employees", value: stats.totalEmployees, icon: Users, color: "from-blue-500 to-cyan-600" },
                { label: "Present", value: stats.present, icon: CheckCircle, color: "from-green-500 to-emerald-600" },
                { label: "Late", value: stats.late, icon: LucideClock, color: "from-yellow-400 to-amber-500" },
                { label: "Absent", value: stats.absent, icon: AlertCircle, color: "from-red-500 to-rose-600" },
                { label: "On Leave", value: stats.onLeave, icon: Coffee, color: "from-purple-500 to-indigo-600" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"> {/* Adjusted grid layout */}
              {/* Search Bar */}
              <div className="lg:col-span-1">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4" />
                  Search Employee
                </label>
                <input
                  id="searchTerm"
                  type="text"
                  placeholder="Search by name, job title, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(sanitizeSearch(e.target.value))}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Employee Filter (All employees from the database for consistency) */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
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
                  {allUsersForFilter.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                </select>
              </div>

              {/* Status Filter (New) - Aligned with backend statuses */}
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  Attendance Status
                </label>
                <select
                  id="statusFilter"
                  name="statusFilter"
                  value={filters.statusFilter}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadEmployeesAttendanceOverview}
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
                <p className="text-gray-600">Loading employee attendance data...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No employees found matching filters</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check In (Today)</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check Out (Today)</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status (Today)</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredEmployees.map((employee, index) => (
                        <motion.tr
                          key={employee._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                {employee.fullName?.charAt(0) || 'N'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{employee.fullName || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{employee.jobTitle || ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {format(new Date(), 'EEE, MMM d, yyyy')} {/* Always today's date */}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {employee.todayFirstCheckIn ? (
                              <div className="flex items-center gap-2">
                                <LucideClock className="w-4 h-4 text-green-500" />
                                {format(new Date(employee.todayFirstCheckIn), 'hh:mm a')}
                              </div>
                            ) : (
                              <span className="text-gray-500 font-medium">Not Checked In</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {employee.todayLastCheckOut ? (
                              <div className="flex items-center gap-2">
                                <LucideClock className="w-4 h-4 text-red-500" />
                                {format(new Date(employee.todayLastCheckOut), 'hh:mm a')}
                              </div>
                            ) : (
                                // If there's a check-in but no check-out, and status indicates they are working (Present or Late)
                                (employee.todayFirstCheckIn && (employee.currentAttendanceStatus === "Present" || employee.currentAttendanceStatus === "Late")) ?
                                <span className="text-gray-500 font-medium">Still Clocked In</span> :
                                <span className="text-gray-500 font-medium">Not Checked Out</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={employee.currentAttendanceStatus} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {/* Removed the Edit ActionButton as per request */}
                              <ActionButton
                                onClick={() => handleDelete(employee.todayPrimaryAttendanceRecordId)}
                                icon={Trash2}
                                color="red"
                                disabled={!employee.todayPrimaryAttendanceRecordId} // Disable if no record today
                              >
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
      {/* This modal is still present in the component but will not be triggered from the table directly */}
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