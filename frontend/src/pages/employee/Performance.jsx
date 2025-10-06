import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { TrendingUp, Award, MessageCircleMore, Gauge, ChevronLeft, ChevronRight } from "lucide-react"; // Added Chevron icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react"; // Import Loader icon
import { Button } from "@/components/ui/button"; // Import Button component

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date()); // වත්මන් මාසය/වසර කළමනාකරණය කිරීමට State එකක්

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed (0-11)
    const year = currentDate.getFullYear();

    try {
      const { data } = await api.get(`/performance/my?month=${month}&year=${year}`);
      setData(data);
    } catch (err) {
      console.error("Failed to fetch performance", err);
      setData(null); // දෝෂයක් ඇති වූ විට දත්ත හිස් කරයි
    } finally {
      setLoading(false);
    }
  }, [currentDate]); // currentDate වෙනස් වන විට effect එක නැවත ධාවනය කරයි

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => {
      // පෙර මාසයට යාමට නව Date වස්තුවක් සාදන්න
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      // ඊළඟ මාසයට යාමට නව Date වස්තුවක් සාදන්න
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
      return newDate;
    });
  };

  // වත්මන් මාසය සහ වසර සංදර්ශනය කිරීම සඳහා format කරයි
  const formattedMonthYear = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) return (
    <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 min-h-[300px]">
      <Loader className="w-8 h-8 animate-spin text-green-500" />
      <span className="ml-3 text-lg text-gray-600">Loading performance data...</span>
    </div>
  );

  // දත්ත load කිරීමෙන් පසු (උදා: දෝෂයක් නිසා) දත්ත null නම්
  if (!data) return (
    <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-100 min-h-[300px] flex flex-col justify-center items-center">
      <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="font-medium text-lg">Failed to load performance data.</p>
      <p className="text-sm">Please try again later or contact support.</p>
      <Button onClick={fetchPerformance} className="mt-4 bg-green-500 hover:bg-green-600">Retry</Button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Month Navigation */}
      <Card className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePreviousMonth} disabled={loading} className="text-gray-600 hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Performance for <span className="text-green-600">{formattedMonthYear}</span>
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={loading} className="text-gray-600 hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Card>

      {/* Overview */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-center">
          <div className="text-5xl font-extrabold text-green-600 mb-2">{data.overallScore}%</div>
          <p className="text-sm text-gray-600 font-medium">Overall Performance Score</p>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-500" /> Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          {data.metrics.map((m, index) => (
            <motion.div
              key={m.id || index}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <span className="text-gray-700 font-medium">{m.name}</span>
              <Badge className={`px-3 py-1 rounded-full text-sm font-semibold
                ${m.trend === 'up' ? 'bg-green-100 text-green-800' :
                  m.trend === 'down' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'}`}>
                {m.value}{m.unit}
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.achievements && data.achievements.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {data.achievements.map((a, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="p-2 bg-gray-50 rounded-md border border-gray-200 flex items-center gap-2"
                >
                  <span className="text-yellow-600">★</span> {a}
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 p-2 bg-gray-50 rounded-md border border-gray-200">No achievements recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircleMore className="w-5 h-5 text-purple-500" /> Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-gray-700 p-3 bg-gray-50 rounded-md border border-gray-200 leading-relaxed">
            {data.feedback || "No feedback available at this time."}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
