import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { TrendingUp, Award, MessageCircleMore, Gauge } from "lucide-react"; // Added new icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react"; // Import Loader icon

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data } = await api.get("/performance/my");
        setData(data);
      } catch (err) {
        console.error("Failed to fetch performance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <Loader className="w-6 h-6 animate-spin text-green-500" />
      <span className="ml-2 text-gray-600">Loading performance data...</span>
    </div>
  );
  if (!data) return (
    <div className="text-center text-gray-500 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <TrendingUp className="w-10 h-10 mx-auto text-gray-400 mb-3" />
      <p className="font-medium">No performance data available yet.</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
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
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
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