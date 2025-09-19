

// src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, UserPlus, Eye, EyeOff, XCircle, Search, Filter, Users, DollarSign, Clock, Mail, Briefcase, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

export default function AdminUsers() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // search / filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Employee", // always employee
    jobTitle: "",
    status: "active",
    basicSalary: "",
    workingHours: "",
    // New fields
    allowance: "", // Add allowance
    loan: "",      // Add loan
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Animations
  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.6, 
        staggerChildren: 0.1 
      } 
    } 
  };
  const itemVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 } 
    } 
  };
  const formVariants = { 
    hidden: { opacity: 0, scale: 0.9, y: -20 }, 
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.4 } 
    }, 
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -20,
      transition: { duration: 0.3 }
    } 
  };
  const modalVariants = { 
    hidden: { opacity: 0, scale: 0.8 }, 
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.3 } 
    }, 
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      transition: { duration: 0.2 } 
    } 
  };

  // load employees
  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users"); // backend returns only employees
      setEmployees(data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // filter employees
  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      emp.fullName?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.jobTitle?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // submit (create/update)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingEmployee) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.patch(`/admin/users/${editingEmployee._id}`, payload);
      } else {
        await api.post("/admin/users", form);
      }
      resetForm();
      await loadEmployees();
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          `Failed to ${editingEmployee ? "update" : "create"} employee.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // delete employee
  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      await loadEmployees();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete employee.");
    }
  };

  // edit employee
  const editEmployee = (emp) => {
    setEditingEmployee(emp);
    setForm({
      fullName: emp.fullName || "",
      email: emp.email || "",
      password: "",
      role: "Employee",
      jobTitle: emp.jobTitle || "",
      status: emp.status || "active",
      basicSalary: emp.basicSalary || "",
      workingHours: emp.workingHours || "",
      // Populate new fields for editing
      allowance: emp.allowance || "", 
      loan: emp.loan || "",
    });
    setShowPassword(false);
    setFormError("");
    setShowForm(true);
  };

  // reset form
  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "Employee",
      jobTitle: "",
      status: "active",
      basicSalary: "",
      workingHours: "",
      // Reset new fields
      allowance: "", 
      loan: "",
    });
    setShowForm(false);
    setEditingEmployee(null);
    setFormError("");
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Stats calculation
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalSalary = employees.reduce((sum, emp) => sum + (parseFloat(emp.basicSalary) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading employees...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-4 sm:p-6 lg:p-8" 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-3xl shadow-2xl mb-8"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="text-white mb-6 lg:mb-0">
                <motion.h1 
                  className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Employee Management
                </motion.h1>
                <motion.p 
                  className="text-green-100 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Manage your team with powerful tools and insights
                </motion.p>
              </div>
              
              <motion.button
                onClick={() => { 
                  if (showForm && editingEmployee) resetForm(); 
                  else setShowForm((s) => !s); 
                }}
                className="group relative overflow-hidden bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-4 rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center space-x-2">
                  {showForm ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  <span>{showForm ? "Cancel" : "Add Employee"}</span>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={itemVariants}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Employees</p>
                <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Payroll</p>
                <p className="text-3xl font-bold text-green-600">${totalSalary.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/50 shadow-lg"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8" 
              variants={formVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingEmployee ? "Update employee information" : "Fill in the details below"}
                  </p>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      Full Name
                    </label>
                    <input 
                      name="fullName" 
                      value={form.fullName} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      Email Address
                    </label>
                    <input 
                      name="email" 
                      type="email" 
                      value={form.email} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Eye className="w-4 h-4 mr-2 text-gray-500" />
                      Password {editingEmployee && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                      <input 
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        value={form.password} 
                        onChange={handleInputChange} 
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pr-12"
                        placeholder="Enter password"
                        required={!editingEmployee}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword((s) => !s)} 
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                      Job Title
                    </label>
                    <input 
                      name="jobTitle" 
                      value={form.jobTitle} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter job title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      Basic Salary
                    </label>
                    <input 
                      name="basicSalary" 
                      type="number" 
                      value={form.basicSalary} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter salary amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      Working Hours
                    </label>
                    <input 
                      name="workingHours" 
                      type="number" 
                      value={form.workingHours} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Hours per week"
                    />
                  </div>
                  
                  {/* New Allowance Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      Allowance
                    </label>
                    <input 
                      name="allowance" 
                      type="number" 
                      value={form.allowance} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter allowance amount"
                    />
                  </div>

                  {/* New Loan Field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      Loan
                    </label>
                    <input 
                      name="loan" 
                      type="number" 
                      value={form.loan} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter outstanding loan amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      Status
                    </label>
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleInputChange} 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <motion.button 
                    type="submit"
                    disabled={isSubmitting} 
                    className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? "Processing..." : editingEmployee ? "Update Employee" : "Create Employee"}
                  </motion.button>
                  <motion.button 
                    type="button"
                    onClick={resetForm} 
                    className="flex-1 sm:flex-none px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Table */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden" 
          variants={itemVariants}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Employee Directory ({filteredEmployees.length} employees)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compensation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No employees found</p>
                        <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <motion.tr 
                      key={emp._id} 
                      className="hover:bg-green-50 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                              {emp.fullName?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{emp.fullName}</div>
                            <div className="text-sm text-gray-500">ID: {emp._id?.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{emp.jobTitle || "—"}</div>
                        {emp.workingHours && (
                          <div className="text-sm text-gray-500">{emp.workingHours} hrs/week</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {emp.basicSalary ? `$${parseFloat(emp.basicSalary).toLocaleString()}` : "—"}
                        </div>
                        {emp.allowance > 0 && (
                          <div className="text-xs text-gray-500">Allowance: ${parseFloat(emp.allowance).toLocaleString()}</div>
                        )}
                        {emp.loan > 0 && (
                          <div className="text-xs text-red-500">Loan: ${parseFloat(emp.loan).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          emp.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <motion.button 
                            onClick={() => editEmployee(emp)} 
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-100 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            onClick={() => setDeleteConfirm(emp)} 
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded-lg transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Enhanced Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              variants={modalVariants}
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
              >
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">Delete Employee</h3>
                    <p className="text-gray-600 mt-1">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {deleteConfirm.fullName?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{deleteConfirm.fullName}</p>
                      <p className="text-sm text-gray-500">{deleteConfirm.email}</p>
                      {deleteConfirm.jobTitle && (
                        <p className="text-sm text-gray-500">{deleteConfirm.jobTitle}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 text-center">
                  Are you sure you want to permanently delete <strong>{deleteConfirm.fullName}</strong> from the system?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={() => deleteEmployee(deleteConfirm._id)} 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete Employee
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}