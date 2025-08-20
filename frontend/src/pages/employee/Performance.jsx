import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data } = await api.get("/performance/my");
console.log("Performance API:", data);
setData(data);
      } catch (err) {
        console.error("Failed to fetch performance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return <p>Loading performance...</p>;
  if (!data) return <p>No performance data available.</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Overview */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">{data.overallScore}%</div>
          <p className="text-sm text-green-600">Overall Performance Score</p>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.metrics.map((m) => (
            <div key={m.id} className="flex justify-between items-center">
              <span className="text-green-700">{m.name}</span>
              <Badge className="bg-green-100 text-green-800">
                {m.value}{m.unit}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-green-700 space-y-1">
            {data.achievements.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">{data.feedback}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

