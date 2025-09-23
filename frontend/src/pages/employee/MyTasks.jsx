// src/pages/employee/MyTasks.jsx
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { CheckSquare, Clock, AlertCircle, CheckCircle, ListTodo, Loader, Calendar as CalendarIcon, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

// Reusing the TaskStatusBadge concept, but for employee view if needed
const EmployeeTaskStatusBadge = ({ status }) => {
  let backgroundColorClass, textColorClass;
  let IconComponent;

  switch (status) {
    case 'Completed':
      backgroundColorClass = 'bg-green-100';
      textColorClass = 'text-green-800';
      IconComponent = CheckCircle;
      break;
    case 'In Progress':
      backgroundColorClass = 'bg-yellow-100';
      textColorClass = 'text-yellow-800';
      IconComponent = Clock;
      break;
    case 'To Do':
    default:
      backgroundColorClass = 'bg-blue-100';
      textColorClass = 'text-blue-800';
      IconComponent = ListTodo;
      break;
  }

  return (
    <Badge className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${backgroundColorClass} ${textColorClass}`}>
      <IconComponent className="w-3 h-3" />
      {status}
    </Badge>
  );
};


export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks/my-tasks");
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      ); // Optimistic update
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks(); // Fetch fresh data to ensure consistency
    } catch (error) {
      alert("Failed to update task status.");
      fetchTasks(); // Revert to server state on error
    }
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0;
  const todoCount = tasks.filter(t => t.status === "To Do").length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const totalTasksCount = tasks.length;


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-green-500" /> Today’s Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-4">
              <Loader className="w-5 h-5 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Task Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Tasks", value: totalTasksCount, icon: Target, color: "bg-blue-100 text-blue-800 border-blue-200" },
                  { label: "To Do", value: todoCount, icon: ListTodo, color: "bg-blue-100 text-blue-800 border-blue-200" },
                  { label: "In Progress", value: inProgressCount, icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-lg shadow-sm border ${stat.color} flex items-center justify-between`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-sm font-medium">{stat.label}</p>
                    </div>
                    <stat.icon className="w-6 h-6 opacity-60" />
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Completed Tasks</span>
                <span className="font-semibold text-gray-800">
                  {completed} of {tasks.length}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-200 rounded-full [&>*]:bg-green-500" /> {/* Tailor progress bar color */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      <Card className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-green-500" /> My Daily Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader className="w-6 h-6 animate-spin text-green-500" />
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
              <CheckSquare className="w-10 h-10 mx-auto text-green-400 mb-3" />
              <p className="font-medium">No tasks assigned today. Great job, or perhaps a day off?</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex items-start gap-4"
                >
                  <Checkbox
                    checked={task.status === "Completed"}
                    onCheckedChange={() =>
                      handleStatusChange(task._id, task.status === "Completed" ? "To Do" : "Completed")
                    }
                    className="mt-1 flex-shrink-0 border-gray-300 focus-visible:ring-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white" // Custom checkbox styling
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`font-medium text-lg ${task.status === "Completed" ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {task.title}
                      </h3>
                      <EmployeeTaskStatusBadge status={task.status} />
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                      <CalendarIcon className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}