import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper to format YYYY-MM-DD
const formatDate = (date) => new Date(date).toISOString().split("T")[0];

export default function TaskCalendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get("/tasks/my-tasks");
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);

  const tasksByDate = tasks.reduce((acc, task) => {
    const day = formatDate(task.dueDate);
    acc[day] = acc[day] ? [...acc[day], task] : [task];
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Calendar className="h-5 w-5" />
            Task Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="grid grid-cols-7 gap-2 text-center">
              {days.map((day) => {
                const dateStr = formatDate(new Date(year, month, day));
                const isToday = dateStr === formatDate(new Date());
                const hasTasks = tasksByDate[dateStr];
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`cursor-pointer rounded-lg p-2 border 
                      ${isToday ? "bg-green-200" : "bg-white"} 
                      ${hasTasks ? "border-green-500" : "border-gray-200"}
                      hover:bg-green-100`}
                  >
                    <p className="font-semibold">{day}</p>
                    {hasTasks && (
                      <span className="block text-xs text-green-700">
                        {tasksByDate[dateStr].length} task
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <Card className="mt-4 border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">
            Tasks on {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksByDate[selectedDate] ? (
            <ul className="list-disc list-inside text-green-700 space-y-1">
              {tasksByDate[selectedDate].map((task) => (
                <li key={task._id}>{task.title} ({task.status})</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks for this day.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
