// src/pages/employee/MyAttendance.jsx
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyAttendance() {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const { data } = await api.get("/attendance", { params: { startDate: today, endDate: today } });
      setTodayRecord(data.items?.[0] || null);
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
    await api.post("/attendance/clock-in"); fetchToday();
  };
  const handleCheckOut = async () => {
    await api.post("/attendance/clock-out"); fetchToday();
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-64 border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800 text-sm">My Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : todayRecord ? (
            <>
              <p className="text-xs text-green-700 mb-1">
                Date: {new Date(todayRecord.date).toLocaleDateString()}
              </p>
              <p className="text-xs">Check-In: {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : "—"}</p>
              <p className="text-xs mb-3">Check-Out: {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : "—"}</p>

              {!todayRecord.checkIn && (
                <Button onClick={handleCheckIn} className="w-full bg-green-600 hover:bg-green-700 text-xs">
                  Check In
                </Button>
              )}
              {todayRecord.checkIn && !todayRecord.checkOut && (
                <Button onClick={handleCheckOut} className="w-full bg-red-600 hover:bg-red-700 text-xs">
                  Check Out
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleCheckIn} className="w-full bg-green-600 hover:bg-green-700 text-xs">
              Check In
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
