// src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Edit, Trash2, UserPlus, Eye, EyeOff, XCircle } from "lucide-react";
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
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Animations
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const formVariants = { hidden: { opacity: 0, scale: 0.9, y: -20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }, exit: { opacity: 0, scale: 0.9, y: -20 } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }, exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } } };

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

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8" variants={itemVariants}>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Employee Management</h1>
            <p className="text-gray-600">Manage and organize your employees</p>
          </div>
          <motion.button
            onClick={() => { if (showForm && editingEmployee) resetForm(); else setShowForm((s) => !s); }}
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {showForm ? "Cancel" : "Add New Employee"}
          </motion.button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8 mb-8" variants={formVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <UserPlus className="w-6 h-6 mr-2 text-green-600" />
                {editingEmployee ? "Edit Employee" : "Create New Employee"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm mb-2">Full Name</label><input name="fullName" value={form.fullName} onChange={handleInputChange} className="w-full p-3 border rounded-xl" /></div>
                <div><label className="block text-sm mb-2">Email</label><input name="email" type="email" value={form.email} onChange={handleInputChange} className="w-full p-3 border rounded-xl" /></div>
                <div>
                  <label className="block text-sm mb-2">Password {editingEmployee && "(leave blank to keep current)"}</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleInputChange} className="w-full p-3 border rounded-xl pr-12" required={!editingEmployee} />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-3 text-gray-400">{showPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                </div>
                <div><label className="block text-sm mb-2">Job Title</label><input name="jobTitle" value={form.jobTitle} onChange={handleInputChange} className="w-full p-3 border rounded-xl" /></div>
                <div><label className="block text-sm mb-2">Basic Salary</label><input name="basicSalary" type="number" value={form.basicSalary} onChange={handleInputChange} className="w-full p-3 border rounded-xl" /></div>
                <div><label className="block text-sm mb-2">Working Hours</label><input name="workingHours" type="number" value={form.workingHours} onChange={handleInputChange} className="w-full p-3 border rounded-xl" /></div>
                <div><label className="block text-sm mb-2">Status</label><select name="status" value={form.status} onChange={handleInputChange} className="w-full p-3 border rounded-xl"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              </div>

              <div className="mt-6 flex gap-4">
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-green-600 text-white rounded-xl">
                  {isSubmitting ? "Processing..." : editingEmployee ? "Update Employee" : "Create Employee"}
                </button>
                <button onClick={resetForm} className="px-8 py-3 bg-gray-500 text-white rounded-xl">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden" variants={itemVariants}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Job Title</th>
                  <th className="px-6 py-4 text-left">Salary</th>
                  <th className="px-6 py-4 text-left">Hours</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-green-50">
                    <td className="px-6 py-4">{emp.fullName}</td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4">{emp.jobTitle || "—"}</td>
                    <td className="px-6 py-4">{emp.basicSalary || "—"}</td>
                    <td className="px-6 py-4">{emp.workingHours || "—"}</td>
                    <td className="px-6 py-4">{emp.status}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => editEmployee(emp)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(emp)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial="hidden" animate="visible" exit="exit" variants={modalVariants}>
              <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <b>{deleteConfirm.fullName}</b>?
                </p>
                <div className="flex justify-end gap-4">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                  <button onClick={() => deleteEmployee(deleteConfirm._id)} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
