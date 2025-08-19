// src/pages/employee/MyTasks.jsx
import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { CheckSquare, Clock, AlertCircle, CheckCircle, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

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
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      alert("Failed to update task status.");
    }
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckSquare className="h-5 w-5" /> Today’s Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-green-700">
                <span>Completed Tasks</span>
                <span className="font-semibold text-green-800">
                  {completed} of {tasks.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      <Card className="border-green-100 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-800">My Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500">No tasks assigned today.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-green-100 bg-white/50 hover:shadow"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === "Completed"}
                      onCheckedChange={() =>
                        handleStatusChange(task._id, task.status === "Completed" ? "To Do" : "Completed")
                      }
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium ${task.status === "Completed" ? "line-through text-green-600" : "text-green-800"}`}>
                          {task.title}
                        </h3>
                        <Badge className="bg-green-100 text-green-700" variant="outline">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
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
