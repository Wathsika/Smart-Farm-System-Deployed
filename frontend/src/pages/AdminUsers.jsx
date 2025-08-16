// src/pages/AdminUsers.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for the new user form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Employee",
    jobTitle: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to load users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Function to create a new user
  const createUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await api.post("/admin/users", form);
      // Reset form, hide it, and reload the user list
      setForm({ fullName: "", email: "", password: "", role: "Employee", jobTitle: "" });
      setShowForm(false);
      await loadUsers(); // await to ensure list is updated before finishing
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-xl shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New User</h2>
          {formError && <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{formError}</div>}
          <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleInputChange} className="p-2 border rounded" required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleInputChange} className="p-2 border rounded" required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleInputChange} className="p-2 border rounded" required />
            <select name="role" value={form.role} onChange={handleInputChange} className="p-2 border rounded">
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
              <option value="Customer">Customer</option>
            </select>
            {form.role === "Employee" && (
              <input name="jobTitle" placeholder="Job Title" value={form.jobTitle} onChange={handleInputChange} className="p-2 border rounded" required/>
            )}
            <div className="md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Employee' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.jobTitle || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}