// src/pages/employee/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, FileText, TrendingUp, User, Clock, Loader, LayoutDashboard, LogOut } from "lucide-react"; // Removed Bell
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MyTasks from "./MyTasks";
import MyLeaveRequests from "./MyLeaveRequests";
import PerformanceTab from "./Performance";
import TaskCalendar from "./TaskCalendar";
import { api } from "../../lib/api";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { auth } from "../../lib/auth";

export default function EmployeeDashboard() {
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [todayRecords, setTodayRecords] = useState([]);
  const navigate = useNavigate();

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/attendance/today");

      if (data.items && data.items.length > 0) {
        setTodayRecords(data.items);
        const hasActiveSession = data.items.some(record => !record.checkOut);
        setStatus(hasActiveSession ? "checked-in" : "checked-out");
      } else {
        setTodayRecords([]);
        setStatus("idle");
      }
    } catch (err) {
      console.error("Failed to load attendance", err);
      if (err?.response?.status === 401) {
        auth.logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post("/attendance/clock-in");
      await loadToday();
    } catch (err) {
      console.error("Check-in failed", err);
      alert(err?.response?.data?.message || "Check-in failed. Please try again.");
      if (err?.response?.status === 401) {
        auth.logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post("/attendance/clock-out");
      await loadToday();
    } catch (err) {
      console.error("Check-out failed", err);
      alert(err?.response?.data?.message || "Check-out failed. Please try again.");
      if (err?.response?.status === 401) {
        auth.logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      auth.logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      auth.logout();
      navigate("/login");
      alert(err?.response?.data?.message || "Logout failed. Please try again.");
    }
  };

  const tabs = [
    { id: "today", label: "Today’s Tasks", icon: CheckSquare },
    { id: "calendar", label: "Task Calendar", icon: Calendar },
    { id: "leave", label: "Leave Requests", icon: FileText },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center">
            <div className="p-4 bg-green-500 rounded-lg shadow-md mr-4">
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Employee Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here’s what’s happening today.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Bell icon removed */}
            <Link to="/profile"> {/* Wrapped the user profile div with Link */}
              <motion.div
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white rounded-full pl-4 pr-3 py-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" // Added hover and cursor styles
              >
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-gray-800 font-medium">{auth.user ? auth.user.username : 'Employee'}</span>
              </motion.div>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors px-3 py-2 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-8 flex flex-wrap gap-4">
          <Button
            onClick={handleCheckIn}
            disabled={loading || status === "checked-in"}
            className="flex items-center px-6 py-3 font-medium text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.span whileHover={{ scale: (loading || status === "checked-in") ? 1 : 1.05 }} whileTap={{ scale: (loading || status === "checked-in") ? 1 : 0.95 }} className="flex items-center">
              {loading && status !== "checked-in" ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading && status !== "checked-in" ? "Checking in..." : "Check-In"}
            </motion.span>
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={loading || status !== "checked-in"}
            className="flex items-center px-6 py-3 font-medium text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.span whileHover={{ scale: (loading || status !== "checked-in") ? 1 : 1.05 }} whileTap={{ scale: (loading || status !== "checked-in") ? 1 : 0.95 }} className="flex items-center">
              {loading && status === "checked-in" ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading && status === "checked-in" ? "Checking out..." : "Check-Out"}
            </motion.span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 text-gray-700 space-y-2 p-6 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" /> Today's Sessions
          </h3>
          {loading ? (
             <p className="text-sm text-gray-500 flex items-center gap-2">
               <Loader className="w-4 h-4 animate-spin text-gray-400" /> Loading sessions...
            </p>
          ) : todayRecords.length > 0 ? (
            todayRecords.map((record) => (
              <motion.div key={record._id} className="flex items-center gap-6 text-sm py-2 px-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-700 flex items-center gap-1">✅ In: <span className="font-semibold text-gray-900">{new Date(record.checkIn).toLocaleTimeString()}</span></p>
                {record.checkOut ? (
                  <p className="text-gray-700 flex items-center gap-1">⏰ Out: <span className="font-semibold text-gray-900">{new Date(record.checkOut).toLocaleTimeString()}</span></p>
                ) : (
                  <p className="text-orange-600 font-semibold animate-pulse flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Active Session
                  </p>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md border border-gray-200">You have not clocked in today.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="flex space-x-1 p-1 rounded-xl border border-gray-200 bg-white shadow-sm mb-8"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${ activeTab === tab.id
                    ? "bg-green-500 text-white shadow hover:bg-green-600"
                    : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </motion.div>

        {activeTab === "today" && <MyTasks />}
        {activeTab === "calendar" && <TaskCalendar />}
        {activeTab === "leave" && <MyLeaveRequests />}
        {activeTab === "performance" && <PerformanceTab />}
      </motion.div>
    </div>
  );
}