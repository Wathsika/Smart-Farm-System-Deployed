// src/pages/employee/TaskCalendar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Loader, ListTodo, CheckCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"; // Added ChevronLeft/Right
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button component

// Helper to format YYYY-MM-DD using local date components
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TaskCalendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); // State for the month being displayed
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks/my-tasks");
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth(); // 0-indexed month

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
      return newDate;
    });
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get total days in current month

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Create an array for all days in the calendar grid, including leading empty slots
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Fill leading empty days
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }


  const tasksByDate = tasks.reduce((acc, task) => {
    const day = formatDate(task.dueDate);
    acc[day] = acc[day] ? [...acc[day], task] : [task];
    return acc;
  }, {});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case 'In Progress': return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
      case 'To Do':
      default: return <ListTodo className="w-3.5 h-3.5 text-blue-500" />;
    }
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <div className="flex justify-between items-center w-full"> {/* Flex container for title and navigation */}
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <CalendarIcon className="h-6 w-6 text-green-500" />
              Task Calendar
            </CardTitle>
            <div className="flex items-center gap-2"> {/* Month navigation */}
              <Button onClick={handlePrevMonth} variant="outline" size="icon" className="h-8 w-8 text-gray-700 border-gray-200 hover:bg-gray-100">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-gray-800">
                {currentDisplayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button onClick={handleNextMonth} variant="outline" size="icon" className="h-8 w-8 text-gray-700 border-gray-200 hover:bg-gray-100">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="w-6 h-6 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-700 uppercase">
                {dayNames.map(day => <div key={day} className="py-2 bg-gray-100 rounded-md">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="p-2 h-20 bg-gray-50 rounded-lg border border-gray-100"></div>; // Empty cell styling
                  }

                  const dateStr = formatDate(date);
                  const isToday = dateStr === formatDate(new Date());
                  const hasTasks = tasksByDate[dateStr] && tasksByDate[dateStr].length > 0;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <motion.div
                      key={dateStr}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`cursor-pointer rounded-lg p-2 h-20 flex flex-col justify-center items-center text-sm font-medium transition-colors duration-200
                        ${isSelected ? "bg-green-100 border-green-500 ring-2 ring-green-300" : ""}
                        ${isToday && !isSelected ? "bg-blue-100 border-blue-300" : ""}
                        ${hasTasks && !isSelected && !isToday ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}
                        ${!hasTasks && !isToday && !isSelected ? "bg-white" : ""}
                        hover:bg-gray-50 border`}
                    >
                      <p className={`font-semibold ${isSelected ? "text-green-800" : isToday ? "text-blue-800" : "text-gray-800"}`}>
                        {date.getDate()}
                      </p>
                      {hasTasks && (
                        <span className="block text-xs mt-1 text-green-700">
                          {tasksByDate[dateStr].length} task{tasksByDate[dateStr].length > 1 ? "s" : ""}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      <Card className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-green-500" /> Tasks on {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tasksByDate[selectedDate] && tasksByDate[selectedDate].length > 0 ? (
            <ul className="space-y-3">
              {tasksByDate[selectedDate].map((task, index) => (
                <motion.li
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-700"
                >
                  {getStatusIcon(task.status)}
                  <span className={`${task.status === "Completed" ? "line-through text-gray-500" : "text-gray-800 font-medium"}`}>
                    {task.title}
                  </span>
                  <span className="ml-auto text-xs text-gray-600">({task.status})</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
              <CheckCircle className="w-10 h-10 mx-auto text-green-400 mb-3" />
              <p className="font-medium">No tasks scheduled for this day.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}