// src/pages/employee/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, FileText, TrendingUp, Bell, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import MyTasks from "./MyTasks";
import MyLeaveRequests from "./MyLeaveRequests";
import MyAttendance from "./MyAttendance";
import PerformanceTab from "./Performance.jsx";
import TaskCalendar from "./TaskCalendar.jsx";

import { api } from "../../lib/api";

export default function EmployeeDashboard() {
  const [status, setStatus] = useState("idle"); // idle | checked-in | checked-out
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [todayRecords, setTodayRecords] = useState([]); // ✅ දවසේ සියලුම records තබාගැනීමට

  const loadToday = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      // ✅ දවසට අදාළ සියලුම records ලබාගැනීම
      const { data } = await api.get(`/attendance?startDate=${today}&endDate=${today}`);

      if (data.items && data.items.length > 0) {
        setTodayRecords(data.items);
        // ✅ checkOut: null ඇති වාර්තාවක් ඇත්නම්, සේවකයා තවමත් check in වී ඇත
        const hasActiveSession = data.items.some(record => !record.checkOut);
        setStatus(hasActiveSession ? "checked-in" : "checked-out");
      } else {
        // No records for today found
        setTodayRecords([]);
        setStatus("idle");
      }
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  }, []);


  // Load today’s attendance on initial mount
  useEffect(() => {
    loadToday();
  }, [loadToday]);

  // Check-In
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await api.post("/attendance/clock-in");
      await loadToday();
    } catch (err) {
      console.error("Check-in failed", err);
      // You can add an alert or toast message here for the user
      alert(err?.response?.data?.message || "Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check-Out
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await api.post("/attendance/clock-out");
      await loadToday();
    } catch (err) {
      console.error("Check-out failed", err);
      alert(err?.response?.data?.message || "Check-out failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "today", label: "Today’s Tasks", icon: CheckSquare },
    { id: "leave", label: "Leave Requests", icon: FileText },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">Employee Dashboard</h1>
            <p className="text-green-600">Welcome back! Here’s what’s happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="border-green-200 hover:bg-green-50">
              <Bell className="h-4 w-4 text-green-600" />
            </Button>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-green-100">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-medium">Employee</span>
            </div>
          </div>
        </div>

        {/* Check-in/out buttons */}
        <div className="mb-8 space-x-4">
          <button
            onClick={handleCheckIn}
            // ✅ Check out කර ඇත්නම් හෝ ආරම්භයේදී පමණක් Check in button එක enable කිරීම
            disabled={loading || status === "checked-in"}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && status !== "checked-in" ? "Checking in..." : "Check-In"}
          </button>

          <button
            onClick={handleCheckOut}
            // ✅ Check in වී ඇත්නම් පමණක් Check out button එක enable කිරීම
            disabled={loading || status !== "checked-in"}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && status === "checked-in" ? "Checking out..." : "Check-Out"}
          </button>
        </div>

        {/* ✅ Show ALL times for the day */}
        <div className="mb-8 text-green-700 space-y-2 p-4 bg-green-50 rounded-lg border border-green-100">
          <h3 className="font-bold text-green-800">Today's Sessions</h3>
          {loading ? (
             <p className="text-sm text-gray-500">Loading sessions...</p>
          ) : todayRecords.length > 0 ? (
            todayRecords.map((record) => (
              <div key={record._id} className="flex items-center gap-4 text-sm">
                <p>✅ In: <span className="font-semibold">{new Date(record.checkIn).toLocaleTimeString()}</span></p>
                {record.checkOut ? (
                  <p>⏰ Out: <span className="font-semibold">{new Date(record.checkOut).toLocaleTimeString()}</span></p>
                ) : (
                  <p className="text-yellow-600 font-semibold animate-pulse"> (Active Session) </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">You have not clocked in today.</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/70 p-1 rounded-lg border border-green-100 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 ${
                  activeTab === tab.id ? "bg-green-600 text-white" : "text-green-700 hover:bg-green-50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === "today" && <MyTasks />}
        {activeTab === "calendar" && <TaskCalendar />}
        {activeTab === "leave" && <MyLeaveRequests />}
        {activeTab === "performance" && <PerformanceTab />}
      </motion.div>
    </div>
  );
}