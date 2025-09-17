// src/admin/TaskManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { api } from '../lib/api'; 
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  FileText, 
  Trash2, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Target,
  Sparkles,
  TrendingUp,
  XCircle, 
  Loader, 
  ListTodo,
  ClipboardList, // Used for main task list
} from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- Reusable Modal Component (simplified styling) ---
const Modal = ({ show, onClose, title, children, size = "md" }) => {
  if (!show) return null;
  
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {show && ( 
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" // Less dark overlay
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-xl shadow-lg w-full ${sizeClasses[size]} border border-gray-100`} // White bg, less shadow
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div> {/* Simple green dot */}
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
              >
                <XCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
            <div className="p-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Task Modal (Simplified styling) ---
const TaskModal = ({ show, onClose, onSave, onDelete, users, existingTask, preselectedDate }) => {
  const isEditing = !!existingTask;
  const initialFormState = {
    user: '',
    title: '',
    description: '',
    dueDate: preselectedDate ? format(preselectedDate, 'yyyy-MM-dd') : '',
    status: 'To Do'
  };
  const [task, setTask] = useState(initialFormState);

  useEffect(() => {
    if (show) {
      if (isEditing && existingTask) {
        setTask({
          user: existingTask.user?._id || '',
          title: existingTask.title || '',
          description: existingTask.description || '',
          dueDate: existingTask.dueDate ? format(new Date(existingTask.dueDate), 'yyyy-MM-dd') : '',
          status: existingTask.status || 'To Do'
        });
      } else {
        setTask(initialFormState);
      }
    }
  }, [show, existingTask, isEditing, preselectedDate]); // Add preselectedDate to dependencies

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.user || !task.title || !task.dueDate) {
      alert("Please fill all required fields (Assign To, Task Title, Due Date).");
      return;
    }
    onSave(task, isEditing ? existingTask._id : null);
  };

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      onDelete(existingTask._id);
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />; // Default for 'To Do'
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200'; // Default for 'To Do'
    }
  };

  return (
    <Modal show={show} onClose={onClose} title={isEditing ? 'Update Task' : 'Create New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            Assign To*
          </label>
          <select 
            value={task.user} 
            onChange={e => setTask({ ...task, user: e.target.value })} 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800" 
            required
          >
            <option value="">Select Team Member</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            Task Title*
          </label>
          <input 
            type="text" 
            value={task.title} 
            onChange={e => setTask({ ...task, title: e.target.value })} 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800" 
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            Due Date*
          </label>
          <input 
            type="date" 
            value={task.dueDate} 
            onChange={e => setTask({ ...task, dueDate: e.target.value })} 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            {getStatusIcon(task.status)}
            <span className="ml-0.5">Status</span>
          </label>
          <div className={`p-0.5 rounded-md border ${getStatusColorClass(task.status)}`}>
            <select 
              value={task.status} 
              onChange={e => setTask({ ...task, status: e.target.value })} 
              className="w-full p-2.5 border-0 rounded-sm focus:outline-none bg-transparent font-medium"
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Description
          </label>
          <textarea 
            value={task.description} 
            onChange={e => setTask({ ...task, description: e.target.value })} 
            rows="3" 
            className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors resize-none bg-white text-gray-800"
            placeholder="Add task description or notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          {isEditing && (
            <motion.button 
              type="button" 
              onClick={handleDeleteClick} 
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors shadow-sm"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </motion.button>
          )}
          
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors shadow-sm"
            disabled={onSave.isLoading}
          >
            Cancel
          </button>
          <motion.button 
            type="submit" 
            className={`px-4 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-colors shadow-sm ${onSave.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: onSave.isLoading ? 1 : 1.05 }} 
            whileTap={{ scale: onSave.isLoading ? 1 : 0.95 }}
            disabled={onSave.isLoading}
          >
            {onSave.isLoading ? <Loader className="w-4 h-4 animate-spin mr-1.5" /> : null}
            {isEditing ? 'Save Changes' : 'Create Task'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

// --- Report Modal (Simplified styling) ---
const ReportModal = ({ show, onClose, onGenerate, month, setMonth, isGenerating }) => {
  const handleSubmit = () => { 
    if(month) onGenerate(month); 
    else alert("Please select a month."); 
  }

  return (
    <Modal show={show} onClose={onClose} title="Generate Task Report">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          Select Month*
        </label>
        <input 
          type="month" 
          value={month} 
          onChange={(e) => setMonth(e.target.value)} 
          className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors shadow-sm"
          disabled={isGenerating}
        >
          Cancel
        </button>
        <motion.button 
          onClick={handleSubmit} 
          disabled={isGenerating} 
          className={`px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400 font-medium hover:bg-green-600 transition-colors shadow-sm flex items-center ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={{ scale: isGenerating ? 1 : 1.05 }} whileTap={{ scale: isGenerating ? 1 : 0.95 }}
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-1.5" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-1.5" />
              Generate PDF
            </>
          )}
        </motion.button>
      </div>
    </Modal>
  );
}


// --- Status Badge for Tasks (Fixed and simplified styling) ---
const TaskStatusBadge = ({ status }) => {
  let backgroundColorClass, textColorClass;
  let IconComponent = ListTodo; 

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
    default: // This will handle 'To Do' and any other statuses
      backgroundColorClass = 'bg-blue-100';
      textColorClass = 'text-blue-800';
      IconComponent = ListTodo; 
      break; 
  }

  return (
    <motion.span 
      className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${backgroundColorClass} ${textColorClass}`}
      whileHover={{ scale: 1.05 }}
    >
      <IconComponent className="w-3 h-3" /> 
      {status}
    </motion.span>
  );
};


// --- Task Calendar Component (Smaller, no view switcher, assign on click) ---
const SmallTaskCalendar = ({ tasks, onSelectEvent, onDateSelect, isLoading }) => {
  const events = tasks.map(task => ({
    id: task._id,
    title: `${task.user?.fullName || 'N/A'}: ${task.title}`,
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    allDay: true,
    resource: task, 
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor;
    switch (event.resource.status) {
      case 'Completed': backgroundColor = '#16a34a'; break; // Green
      case 'In Progress': backgroundColor = '#059669'; break; // Emerald
      default: backgroundColor = '#65a30d'; // Lime (To Do)
    }
    
    return { 
      style: { 
        backgroundColor, 
        color: 'white', 
        borderRadius: '4px', // Even smaller radius
        padding: '2px 4px', // Smaller padding
        fontSize: '9px', // Smallest font size for clarity
        fontWeight: '600',
        lineHeight: '1.2'
      } 
    };
  };

  const CustomToolbar = ({ label, onNavigate }) => {
    return (
      <div className="rbc-toolbar mb-3 flex items-center justify-between p-2">
        <span className="rbc-btn-group">
          <motion.button 
            onClick={() => onNavigate('PREV')} 
            className="px-2 py-1 bg-green-500 text-white rounded-l-md hover:bg-green-600 text-sm"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            &lt;
          </motion.button>
          <motion.button 
            onClick={() => onNavigate('NEXT')} 
            className="px-2 py-1 bg-green-500 text-white rounded-r-md hover:bg-green-600 text-sm"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            &gt;
          </motion.button>
        </span>
        <span className="rbc-toolbar-label text-md font-bold text-gray-800">{label}</span>
      </div>
    );
  };

  return (
    <motion.div 
      className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative" 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
      style={{ height: '400px' }} // Fixed height for small calendar
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-green-500" /> Calendar Overview
      </h3>
      {isLoading ? (
          <div className="flex justify-center items-center h-full absolute inset-0 z-10 bg-white bg-opacity-80">
            <Loader className="w-6 h-6 animate-spin text-green-500" />
          </div>
      ) : null}
      <style jsx global>{`
        .rbc-calendar { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        .rbc-header {
          background: #f0fdf4; /* light green */
          font-weight: 600; color: #14532d; padding: 8px 4px; 
          border: none; text-transform: uppercase;
          font-size: 10px; letter-spacing: 0.05em;
        }
        .rbc-date-cell { padding: 4px; font-weight: 500; color: #34473b; font-size: 11px; }
        .rbc-today { background: #dcfce7 !important; border-radius: 4px; } /* Light green today */
        .rbc-off-range-bg { background: #f9fafb; } /* very light grey for off range */
        .rbc-month-view { border: 1px solid #d1fae5; border-radius: 8px; overflow: hidden; background: white; }
        .rbc-day-bg { transition: background-color 0.2s; }
        .rbc-day-bg.rbc-selected-cell { background-color: #bbf7d0 !important; } /* A slightly darker light-green for selection */
        .rbc-row-content .rbc-button-link { font-size: 11px !important; font-weight: 500; }
        .rbc-row-content .rbc-header + .rbc-header { border-left: 1px solid #d1fae5; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #d1fae5; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #d1fae5; }
        .rbc-event { /* already defined by eventPropGetter */ }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        onSelectEvent={onSelectEvent}
        onSelectSlot={(slotInfo) => onDateSelect(slotInfo.start)} // New task on date click
        selectable // Make days clickable
        views={['month']} // Only month view
        defaultView="month"
        startAccessor="start"
        endAccessor="end"
        components={{ toolbar: CustomToolbar }} // Use custom toolbar
        style={{ height: 'calc(100% - 30px)' }} // Adjust height for toolbar
      />
    </motion.div>
  );
};


// --- Main Assigned Tasks (central content) ---
const MainAssignedTasks = ({ tasks, users, stats, isLoading, onSelectTask, onMarkAsComplete }) => {
  const actionableTasks = tasks
    .filter(task => task.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const completedTasksCount = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasksCount = tasks.filter(task => task.status === 'In Progress').length;
  const todoTasksCount = tasks.filter(task => task.status === 'To Do').length;

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 min-h-[calc(100vh-180px)]"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="p-2 bg-green-500 rounded-lg shadow-sm">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
          <p className="text-gray-600 text-sm">Overview of assigned and pending work</p>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks", value: stats.totalTasks, icon: Target, color: "bg-blue-100 text-blue-800 border-blue-200" },
          { label: "To Do", value: todoTasksCount, icon: ListTodo, color: "bg-blue-100 text-blue-800 border-blue-200" },
          { label: "In Progress", value: inProgressTasksCount, icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
          { label: "Completed", value: completedTasksCount, icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200" }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className={`p-4 rounded-lg shadow-sm border ${stat.color} flex items-center justify-between`}
            whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}
          >
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium">{stat.label}</p>
            </div>
            <stat.icon className="w-6 h-6 opacity-60" />
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Actionable Tasks ({actionableTasks.length})</h3>
        {isLoading.tasks ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="w-6 h-6 animate-spin text-green-500" />
            <span className="ml-2 text-gray-600">Loading tasks...</span>
          </div>
        ) : actionableTasks.length === 0 ? (
          <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
            <CheckCircle className="w-10 h-10 mx-auto text-green-400 mb-3" />
            <p className="font-medium">All tasks are up-to-date! Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionableTasks.map((task) => (
              <motion.div
                key={task._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col justify-between"
                whileHover={{ y: -3 }}
                onClick={() => onSelectTask(task)}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <p className="font-semibold text-gray-800">{task.user?.fullName || 'Unassigned'}</p>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{task.description?.substring(0, 70)}...</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                    <CalendarIcon className="w-4 h-4" /> Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No Date'}
                  </p>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                  <TaskStatusBadge status={task.status} />
                  {task.status !== 'Completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); onMarkAsComplete(task._id); }} // Prevent parent click
                      className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Complete
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};


// --- Main TaskManagement Component ---
export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
      tasks: true, 
      users: true,
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState(null); // New state for preselecting date in modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isGenerating, setIsGenerating] = useState(false);

  // Animation variants (simplified)
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  const loadData = useCallback(async () => {
    setLoading(prev => ({ ...prev, tasks: true, users: true }));
    try {
      const [tasksRes, usersRes] = await Promise.all([ 
        api.get('/tasks'), 
        api.get('/admin/users', { params: { role: 'Employee' } }) 
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data.items);
    } catch (error) { 
      console.error("Failed to load data:", error); 
    } finally { 
      setLoading(prev => ({ ...prev, tasks: false, users: false })); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveTask = async (taskData, taskId) => {
    try {
      // Simulate loading for UI feedback
      setLoading(prev => ({ ...prev, saveTask: true })); 
      if (taskId) { 
        await api.put(`/tasks/${taskId}`, taskData); 
      } else { 
        await api.post('/tasks', taskData); 
      }
      setShowTaskModal(false);
      setPreselectedDate(null); // Clear preselected date
      loadData();
    } catch (error) { 
      alert(`Failed to save task. ${error?.response?.data?.message || ''}`); 
    } finally {
      setLoading(prev => ({ ...prev, saveTask: false }));
    }
  };
  handleSaveTask.isLoading = loading.saveTask; // Attach loading state to function

  const handleDeleteTask = async (taskId) => {
    try { 
      await api.delete(`/tasks/${taskId}`); 
      setShowTaskModal(false);
      loadData(); 
    } catch (error) { 
      alert(`Failed to delete task. ${error?.response?.data?.message || ''}`); 
    }
  }

  const handleSelectEvent = (event) => { 
    setSelectedTask(event.resource || event); // event might be raw task obj from sidebar or BigCalendar event object
    setShowTaskModal(true); 
    setPreselectedDate(null); // Clear any preselected date if editing
  };
  
  const handleAddNewClick = () => { 
    setSelectedTask(null);
    setPreselectedDate(null); // No specific date pre-selected
    setShowTaskModal(true); 
  };

  // Handler for clicking a date on the small calendar
  const handleDateSelectInCalendar = (date) => {
    setSelectedTask(null); // Ensure no existing task is being edited
    setPreselectedDate(date); // Set the clicked date for the new task form
    setShowTaskModal(true);
  };

  const handleMarkTaskAsComplete = async (taskId) => {
    if (window.confirm("Are you sure you want to mark this task as 'Completed'?")) {
      try {
        await api.patch(`/tasks/${taskId}/status`, { status: 'Completed' }); 
        loadData(); 
      } catch (error) {
        alert(`Failed to mark task as complete. ${error?.response?.data?.message || ''}`); 
      }
    }
  };

  const handleGenerateReport = async (selectedMonth) => {
    setIsGenerating(true);
    const [year, month] = selectedMonth.split('-');

    try {
      const { data: reportTasks } = await api.get('/tasks/report', { params: { year, month } });

      if (!reportTasks || reportTasks.length === 0) {
        alert("There are no tasks scheduled for the selected month to generate a report.");
        setShowReportModal(false);
        return;
      }
      
      const doc = new jsPDF();
      doc.setFont('helvetica'); // Ensure a common font
      
      doc.setFontSize(18);
      doc.setTextColor(52, 58, 64); // Dark gray
      doc.text("Monthly Task Report", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125); // Medium gray
      doc.text(`Month: ${format(new Date(year, month-1, 1), 'MMMM yyyy')}`, 14, 28);
      doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 34);

      const tableHeaders = [['Due Date', 'Assigned To', 'Task Title', 'Status']];
      const tableData = reportTasks.map(task => [
        task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : 'No Date',
        task.user && task.user.fullName ? task.user.fullName : 'Unassigned User',
        String(task.title || 'Untitled Task'),
        String(task.status || 'No Status')
      ]);

      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 45, // Start below header text
        theme: 'striped', // Cleaner table theme
        headStyles: { 
          fillColor: [34, 139, 34], // Forest Green
          textColor: 255, 
          fontStyle: 'bold' 
        }, 
        alternateRowStyles: { 
          fillColor: [248, 248, 248] // Light gray for alternate rows
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          halign: 'left',
          valign: 'middle'
        },
        columnStyles: { // Add some padding or width adjustments
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 70 },
          3: { cellWidth: 25 },
        }
      });

      doc.save(`Task_Report_${selectedMonth}.pdf`);
      setShowReportModal(false);

    } catch (error) {
      console.error("PDF Report generation failed:", error);
      alert(`Failed to generate report: ${error.message}\n\nPlease check the browser console for more details.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Overall Task Statistics for MainAssignedTasks
  const totalTasksCount = tasks.length;
  const actionableTasksCount = tasks.filter(task => task.status !== 'Completed').length;

  return (
    <motion.div 
      className="p-8 bg-white min-h-full" // Main background white
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Task Creation/Edit Modal */}
      <TaskModal 
        show={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
        onSave={handleSaveTask} 
        onDelete={handleDeleteTask} 
        users={users} 
        existingTask={selectedTask} 
        preselectedDate={preselectedDate}
      />
      
      {/* Report Generation Modal */}
      <ReportModal 
        show={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onGenerate={handleGenerateReport} 
        month={reportMonth} 
        setMonth={setReportMonth} 
        isGenerating={isGenerating} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <motion.div
          className="flex items-center"
          variants={itemVariants}
        >
          <div className="p-4 bg-green-500 rounded-lg shadow-md mr-4">
            <ClipboardList className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Task Management</h1>
            <p className="text-gray-600 mt-1">Organize and monitor all team activities</p>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-wrap gap-3"
          variants={itemVariants}
        >
          <motion.button 
            onClick={() => setShowReportModal(true)} 
            className="flex items-center px-5 py-2.5 font-medium text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Generate Report
          </motion.button>
          
          <motion.button 
            onClick={handleAddNewClick} 
            className="flex items-center px-5 py-2.5 font-medium text-white bg-green-500 rounded-lg shadow-sm hover:bg-green-600 transition-colors"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Task
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content Area: Left (Main Tasks List) + Right (Small Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8"> 
        {/* Left Column (3/5 width): Main Tasks List */}
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <MainAssignedTasks 
            tasks={tasks}
            users={users}
            stats={{
                totalTasks: totalTasksCount,
                actionableTasks: actionableTasksCount,
            }}
            isLoading={loading}
            onSelectTask={handleSelectEvent}
            onMarkAsComplete={handleMarkTaskAsComplete}
          />
        </motion.div>

        {/* Right Column (2/5 width): Small Task Calendar */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <SmallTaskCalendar
            tasks={tasks}
            onSelectEvent={handleSelectEvent}
            onDateSelect={handleDateSelectInCalendar} // Pass handler for date click
            isLoading={loading.tasks}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}