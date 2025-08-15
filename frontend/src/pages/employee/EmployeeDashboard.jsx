// src/pages/employee/EmployeeDashboard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth"; // path එක වෙනස් වුණා
import MyTasks from "./MyTasks"; // path එක වෙනස් වුණා
import MyLeaveRequests from "./MyLeaveRequests"; // path එක වෙනස් වුණා

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = auth.user;

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.fullName || 'Employee'}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MyTasks />
          </div>
          <div className="lg:col-span-1">
            <MyLeaveRequests />
          </div>
        </div>
      </main>
    </div>
  );
}