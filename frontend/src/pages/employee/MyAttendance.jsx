// src/pages/employee/MyAttendance.jsx
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from 'lucide-react'; // Import Clock icon for attendance
import { Loader } from 'lucide-react'; // Import loader icon

export default function MyAttendance() {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0]; // Correctly get today's date string
    try {
      const { data } = await api.get("/attendance", { params: { startDate: today, endDate: today } });
      setTodayRecord(data.items?.[0] || null); // Access the first item of the array
    } catch (err) {
      console.error("Failed to fetch today's attendance", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleCheckIn = async () => {
    setLoading(true); // Indicate loading while checking in
    try {
      await api.post("/attendance/clock-in");
      await fetchToday();
    } catch (err) {
      console.error("Check-in failed", err);
      alert(err?.response?.data?.message || "Check-in failed. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleCheckOut = async () => {
    setLoading(true); // Indicate loading while checking out
    try {
      await api.post("/attendance/clock-out");
      await fetchToday();
    } catch (err) {
      console.error("Check-out failed", err);
      alert(err?.response?.data?.message || "Check-out failed. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 w-full max-w-sm"> {/* Refined card styling */}
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100"> {/* Header styling */}
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2"> {/* Title styling */}
            <Clock className="w-5 h-5 text-green-500" /> My Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0"> {/* Remove default padding if not needed */}
          {loading ? (
            <p className="flex items-center justify-center gap-2 text-gray-600">
              <Loader className="w-4 h-4 animate-spin text-green-500" /> Loading...
            </p>
          ) : todayRecord ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Date: <span className="text-gray-900">{new Date(todayRecord.date).toLocaleDateString()}</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Check-In: <span className="font-semibold text-gray-800">{todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : "—"}</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mb-4">
                Check-Out: <span className="font-semibold text-gray-800">{todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : "—"}</span>
              </p>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                {!todayRecord.checkIn && (
                  <Button
                    onClick={handleCheckIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2.5 font-medium text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.span whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                      {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                      Check In
                    </motion.span>
                  </Button>
                )}
                {todayRecord.checkIn && !todayRecord.checkOut && (
                  <Button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2.5 font-medium text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.span whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                      {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                      Check Out
                    </motion.span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm mb-4">You have not clocked in today.</p>
              <Button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2.5 font-medium text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.span whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                  Check In
                </motion.span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}