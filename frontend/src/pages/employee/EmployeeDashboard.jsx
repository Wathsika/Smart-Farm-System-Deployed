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
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  // ✅ Step 1: Create a reusable function to fetch the latest attendance data
  const loadToday = useCallback(async () => {
    try {
      const { data } = await api.get("/attendance?limit=1&page=1");
      if (data.items && data.items.length > 0) {
        const today = data.items[0];
        setCheckInTime(today.checkIn || null);
        setCheckOutTime(today.checkOut || null);

        if (today.checkIn && !today.checkOut) {
          setStatus("checked-in");
        } else if (today.checkOut) {
          setStatus("checked-out");
        } else {
          setStatus("idle");
        }
      } else {
        // No records for today found
        setStatus("idle");
        setCheckInTime(null);
        setCheckOutTime(null);
      }
    } catch (err) {
      console.error("Failed to load attendance", err);
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
      // ✅ Step 2: After a successful check-in, reload the data
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
      // ✅ Step 3: After a successful check-out, reload the data
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

        {/* ✅ Check-in/out buttons with corrected disabled logic */}
        <div className="mb-8 space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={loading || status === "checked-in" || status === "checked-out"}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && status === "idle" ? "Checking in..." : "Check-In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={loading || status !== "checked-in"}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && status === "checked-in" ? "Checking out..." : "Check-Out"}
          </button>
        </div>

        {/* Show times */}
        <div className="mb-8 text-green-700">
          {checkInTime && <p>✅ Checked in at: {new Date(checkInTime).toLocaleTimeString()}</p>}
          {checkOutTime && <p>⏰ Checked out at: {new Date(checkOutTime).toLocaleTimeString()}</p>}
        </div>

        {/* ... (rest of the component remains the same) ... */}

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