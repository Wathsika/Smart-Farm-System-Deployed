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
import { Calendar as CalendarIcon, Plus, FileText, Trash2, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const TaskModal = ({ show, onClose, onSave, onDelete, users, existingTask }) => {
  const isEditing = !!existingTask;
  const initialFormState = {
    user: '',
    title: '',
    description: '',
    dueDate: '',
    status: 'To Do'
  };
  const [task, setTask] = useState(initialFormState);

  // Animation variants
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.3,
      },
    },
  };

  const formFieldVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
      },
    }),
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
  };

  useEffect(() => {
    if (show) {
      if (isEditing) {
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
  }, [show, existingTask, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.user || !task.title || !task.dueDate) {
      alert("Please fill all required fields (Assign To, Task Title, Due Date).");
      return;
    }
    onSave(task, isEditing ? existingTask._id : null);
    onClose();
  };

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      onDelete(existingTask._id);
      onClose();
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <form onSubmit={handleSubmit}>
              <motion.div 
                className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center">
                  {isEditing ? (
                    <motion.div
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <CalendarIcon className="w-6 h-6 text-green-600 mr-3" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <Plus className="w-6 h-6 text-green-600 mr-3" />
                    </motion.div>
                  )}
                  <h3 className="text-xl font-bold text-gray-800">
                    {isEditing ? 'Edit Task' : 'Assign New Task'}
                  </h3>
                </div>
              </motion.div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <motion.div
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Assign To*
                  </label>
                  <motion.select 
                    value={task.user} 
                    onChange={e => setTask({ ...task, user: e.target.value })} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white" 
                    required
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <option value="">Select Employee</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                  </motion.select>
                </motion.div>

                <motion.div
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title*
                  </label>
                  <motion.input 
                    type="text" 
                    value={task.title} 
                    onChange={e => setTask({ ...task, title: e.target.value })} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    placeholder="Enter task title"
                    required
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>

                <motion.div
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Due Date*
                  </label>
                  <motion.input 
                    type="date" 
                    value={task.dueDate} 
                    onChange={e => setTask({ ...task, dueDate: e.target.value })} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                    required
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>

                <motion.div
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {getStatusIcon(task.status)}
                    <span className="ml-1">Status</span>
                  </label>
                  <motion.select 
                    value={task.status} 
                    onChange={e => setTask({ ...task, status: e.target.value })} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </motion.select>
                </motion.div>

                <motion.div
                  variants={formFieldVariants}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <motion.textarea 
                    value={task.description} 
                    onChange={e => setTask({ ...task, description: e.target.value })} 
                    rows="3" 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter task description (optional)"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </div>

              <motion.div 
                className="flex justify-between items-center p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {isEditing ? (
                  <motion.button 
                    type="button" 
                    onClick={handleDeleteClick} 
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </motion.button>
                ) : <div/>}
                
                <div className="flex gap-3">
                  <motion.button 
                    type="button" 
                    onClick={onClose} 
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-md"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {isEditing ? 'Save Changes' : 'Assign Task'}
                  </motion.button>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ReportModal = ({ show, onClose, onGenerate, month, setMonth, isGenerating }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -30,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  const handleSubmit = () => { 
    if(month) onGenerate(month); 
    else alert("Please select a month."); 
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center">
                <motion.div
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <FileText className="w-6 h-6 text-blue-600 mr-3" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800">Generate Monthly Report</h3>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-gray-700">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Select Month*
              </label>
              <motion.input 
                type="month" 
                value={month} 
                onChange={(e) => setMonth(e.target.value)} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div 
              className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Cancel
              </motion.button>
              <motion.button 
                onClick={handleSubmit} 
                disabled={isGenerating} 
                className="px-6 py-2 bg-blue-600 text-white rounded-xl disabled:bg-blue-400 hover:bg-blue-700 transition-all font-medium shadow-md flex items-center"
                variants={buttonVariants}
                whileHover={!isGenerating ? "hover" : {}}
                whileTap={!isGenerating ? "tap" : {}}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isGenerating, setIsGenerating] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      y: -2,
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
  };

  const loadingVariants = {
    animate: {
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const loadData = useCallback(async () => {
    setLoading(true);
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
      setLoading(false); 
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) { 
        await api.put(`/tasks/${taskId}`, taskData); 
      } else { 
        await api.post('/tasks', taskData); 
      }
      loadData();
    } catch (error) { 
      alert(`Failed to save task. ${error?.response?.data?.message || ''}`); 
    }
  };

  const handleDeleteTask = async (taskId) => {
    try { 
      await api.delete(`/tasks/${taskId}`); 
      loadData(); 
    } catch (error) { 
      alert(`Failed to delete task. ${error?.response?.data?.message || ''}`); 
    }
  }

  const handleSelectEvent = (event) => { 
    setSelectedTask(event.resource); 
    setShowTaskModal(true); 
  };
  
  const handleAddNewClick = () => { 
    setSelectedTask(null); 
    setShowTaskModal(true); 
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
      
      doc.setFontSize(20);
      doc.text("Monthly Task Report", 14, 22);
      doc.setFontSize(12);
      doc.text(`Month: ${format(new Date(year, month-1), 'MMMM yyyy')}`, 14, 30);
      doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd')}`, 140, 30);

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
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] } // Green color
      });

      doc.save(`Task_Report_${selectedMonth}.pdf`);
      setShowReportModal(false);

    } catch (error) {
      console.error("PDF Report generation failed:", error);
      alert(`Failed to generate report on the client-side.\n\nError: ${error.message}\n\nPlease check the browser console for more details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const events = tasks.map(task => ({
    id: task._id,
    title: `${task.user?.fullName || 'N/A'}: ${task.title}`,
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    allDay: true,
    resource: task, 
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3498db'; // To Do
    if (event.resource.status === 'In Progress') backgroundColor = '#f39c12';
    if (event.resource.status === 'Completed') backgroundColor = '#27ae60';
    return { 
      style: { 
        backgroundColor, 
        color: 'white', 
        borderRadius: '8px', 
        border: 'none', 
        padding: '4px 8px', 
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      } 
    };
  };

  return (
    <motion.div 
      className="p-6 bg-gradient-to-br from-green-50 via-blue-50 to-white min-h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <TaskModal 
        show={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
        onSave={handleSaveTask} 
        onDelete={handleDeleteTask} 
        users={users} 
        existingTask={selectedTask} 
      />
      
      <ReportModal 
        show={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onGenerate={handleGenerateReport} 
        month={reportMonth} 
        setMonth={setReportMonth} 
        isGenerating={isGenerating} 
      />

      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        variants={itemVariants}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center">
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CalendarIcon className="w-8 h-8 text-green-600 mr-3" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Task Calendar</h1>
              <p className="text-gray-600 mt-1">Manage and track team tasks</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="flex gap-4"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button 
            onClick={() => setShowReportModal(true)} 
            className="flex items-center px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FileText className="w-5 h-5 mr-2" />
            Generate Report
          </motion.button>
          
          <motion.button 
            onClick={handleAddNewClick} 
            className="flex items-center px-6 py-3 font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Assign New Task
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-[75vh] overflow-hidden"
        variants={itemVariants}
        whileHover={{ 
          boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
          transition: { duration: 0.3 }
        }}
      >
        {loading ? (
          <motion.div 
            className="text-center p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="inline-block w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mb-4"
              variants={loadingVariants}
              animate="animate"
            />
            <motion.p 
              className="text-gray-600 text-lg font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loading Calendar...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div 
            className="h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              onSelectEvent={handleSelectEvent}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}