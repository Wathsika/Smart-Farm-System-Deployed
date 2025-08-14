// src/pages/employee/MyTasks.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api'; // path එක වෙනස් වුණා

export default function MyTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/tasks/my-tasks');
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
            alert('Failed to update task status.');
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Daily Tasks</h2>
            {loading ? <p>Loading tasks...</p> : (
                <div className="space-y-4">
                    {tasks.length === 0 ? <p className="text-gray-500">No tasks assigned for today.</p> :
                        tasks.map(task => (
                            <div key={task._id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-900">{task.title}</p>
                                    <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                        className={`text-sm font-bold p-2 rounded-lg border ${
                                            task.status === 'Completed' ? 'bg-green-100 border-green-200 text-green-800' :
                                            task.status === 'In Progress' ? 'bg-blue-100 border-blue-200 text-blue-800' :
                                            'bg-gray-100 border-gray-200 text-gray-800'
                                        }`}
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}