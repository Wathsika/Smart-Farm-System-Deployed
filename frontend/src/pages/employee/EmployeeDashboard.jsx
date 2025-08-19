// src/pages/employee/EmployeeDashboard.jsx
import { useState } from "react";
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


// later you can add Performance.jsx

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("today");

  const tabs = [
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "today", label: "Today’s Tasks", icon: CheckSquare },
    { id: "leave", label: "Leave Requests", icon: FileText },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              Employee Dashboard
            </h1>
            <p className="text-green-600">
              Welcome back! Here’s what’s happening today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="border-green-200 hover:bg-green-50"
            >
              <Bell className="h-4 w-4 text-green-600" />
            </Button>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-green-100">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-medium">Employee</span>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-green-800">
                Tasks Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">—</div>
              <Badge className="bg-green-100 text-green-700 mt-2">
                from MyTasks
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-green-800">
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">—</div>
              <Badge className="bg-green-100 text-green-700 mt-2">
                from MyLeaveRequests
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-green-800">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">—</div>
              <Badge className="bg-green-100 text-green-700 mt-2">
                Performance
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-green-800">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">—</div>
              <Badge className="bg-green-100 text-green-700 mt-2">
                Leave Requests
              </Badge>
            </CardContent>
          </Card>
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
                  activeTab === tab.id
                    ? "bg-green-600 text-white"
                    : "text-green-700 hover:bg-green-50"
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
