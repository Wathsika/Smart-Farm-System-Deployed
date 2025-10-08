// src/admin/TaskManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isBefore, startOfDay, isSameMonth } from 'date-fns';
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
  TrendingUp,
  XCircle,
  Loader,
  ListTodo,
  ClipboardList,
} from 'lucide-react';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const todayDateString = format(startOfDay(new Date()), 'yyyy-MM-dd');

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
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-xl shadow-lg w-full ${sizeClasses[size]} border border-gray-100`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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

// --- Task Modal with Validation ---
const TaskModal = ({ show, onClose, onSave, onDelete, users, existingTask, preselectedDate, readOnly }) => { // Added readOnly prop
  const isEditing = !!existingTask;
  const initialFormState = {
    user: '',
    title: '',
    description: '',
    dueDate: preselectedDate ? format(preselectedDate, 'yyyy-MM-dd') : '',
    status: 'To Do'
  };
  const [task, setTask] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState("");

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
      setFormErrors({}); // Clear errors when modal opens
      setFormAlert(""); // Clear form alert
    }
  }, [show, existingTask, isEditing, preselectedDate]); // Add preselectedDate to dependencies

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!task.user) {
      errors.user = "Assign To field is required.";
      isValid = false;
    }

    if (!task.title.trim()) {
      errors.title = "Task Title is required.";
      isValid = false;
    } else if (task.title.trim().length < 5) {
      errors.title = "Task Title must be at least 5 characters.";
      isValid = false;
    } else if (task.title.trim().length > 200) {
      errors.title = "Task Title cannot exceed 200 characters.";
      isValid = false;
    } else if (!/^[a-zA-Z\s-]+$/.test(task.title)) {
      errors.title = "Task Title can only contain letters, spaces, and hyphens.";
      isValid = false;
    }

    if (!task.dueDate) {
      errors.dueDate = "Due Date is required.";
      isValid = false;
    } else if (isBefore(new Date(task.dueDate), startOfDay(new Date()))) {
      errors.dueDate = "Due Date cannot be in the past.";
      isValid = false;
    }

    if (task.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters.";
      isValid = false;
    }

    // Status validation is still useful if the field is manipulated outside the disabled state or through API
    if (!['To Do', 'In Progress', 'Completed'].includes(task.status)) {
        errors.status = "Invalid status selected.";
        isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'title') {
      newValue = value.replace(/[^a-zA-Z\s-]/g, '');
    }

    setTask(prevTask => ({ ...prevTask, [name]: newValue }));
    if (formErrors[name]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    setFormAlert("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormAlert("");
    if (!validateForm()) {
      setFormAlert("Please correct the errors in the form.");
      return;
    }
    onSave(task, isEditing ? existingTask._id : null);
    setFormAlert("");
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
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Determine if the delete button should be disabled based on status
  const isDeleteDisabled = readOnly || existingTask?.status === 'In Progress' || existingTask?.status === 'Completed';

  return (
    <Modal show={show} onClose={onClose} title={isEditing && readOnly ? 'Task Details' : (isEditing ? 'Update Task' : 'Create New Task')}> {/* Adjusted title */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {formAlert && !readOnly && ( // Only show form alert if not in readOnly mode
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {formAlert}
          </div>
        )}
        {/* Assign To */}
        <div>
          <label htmlFor="user" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            Assign To*
          </label>
          <select
            id="user"
            name="user"
            value={task.user}
            onChange={handleTaskInputChange}
            className={`w-full p-2.5 border ${formErrors.user ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800`}
            required
            disabled={readOnly} // Disabled if in readOnly mode
          >
            <option value="">Select Team Member</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
          </select>
          {formErrors.user && !readOnly && <p className="text-red-500 text-xs mt-1">{formErrors.user}</p>} {/* Show errors only if not readOnly */}
        </div>

        {/* Task Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            Task Title*
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={task.title}
            onChange={handleTaskInputChange}
            className={`w-full p-2.5 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800`}
            placeholder="Enter task title (only letters, spaces, hyphens)"
            required
            maxLength={200}
            minLength={5}
            disabled={readOnly} // Disabled if in readOnly mode
          />
          {formErrors.title && !readOnly && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>} {/* Show errors only if not readOnly */}
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            Due Date*
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={task.dueDate}
            onChange={handleTaskInputChange}
            className={`w-full p-2.5 border ${formErrors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800`}
            required
            min={todayDateString}
            disabled={readOnly} // Disabled if in readOnly mode
          />
          {formErrors.dueDate && !readOnly && <p className="text-red-500 text-xs mt-1">{formErrors.dueDate}</p>} {/* Show errors only if not readOnly */}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            {getStatusIcon(task.status)}
            <span className="ml-0.5">Status</span>
          </label>
          <div className={`p-0.5 rounded-md border ${getStatusColorClass(task.status)}`}>
            <select
              id="status"
              name="status"
              value={task.status}
              onChange={handleTaskInputChange}
              className={`w-full p-2.5 border-0 rounded-sm focus:outline-none bg-transparent font-medium ${formErrors.status ? 'border-red-500' : ''}`}
              disabled={true} // ALWAYS DISABLED: Admin cannot change status (for new or existing tasks)
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          {formErrors.status && !readOnly && <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>} {/* Show errors only if not readOnly */}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleTaskInputChange}
            rows="3"
            className={`w-full p-2.5 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors resize-none bg-white text-gray-800`}
            placeholder="Add task description or notes..."
            maxLength={1000}
            disabled={readOnly} // Disabled if in readOnly mode
          />
          {formErrors.description && !readOnly && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>} {/* Show errors only if not readOnly */}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          {isEditing && (
            <motion.button
              type="button"
              onClick={handleDeleteClick}
              className={`flex items-center px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors shadow-sm ${isDeleteDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              whileHover={{ scale: isDeleteDisabled ? 1 : 1.05 }} whileTap={{ scale: isDeleteDisabled ? 1 : 0.95 }}
              disabled={isDeleteDisabled} // Disabled based on readOnly or task status
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </motion.button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors shadow-sm"
            disabled={onSave.isLoading && !readOnly} // Allow cancel even if saving, unless it's read-only
          >
            Cancel
          </button>
          {/* Only show Save/Create button if not in readOnly mode */}
          {!readOnly && (
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
          )}
        </div>
      </form>
    </Modal>
  );
};

// --- Report Modal with Validation ---
const ReportModal = ({ show, onClose, onGenerate, month, setMonth, isGenerating }) => {
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState("");

  useEffect(() => {
    if (show) {
      setFormErrors({});
      setFormAlert("");
    }
  }, [show]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    const currentMonth = format(new Date(), 'yyyy-MM');

    if (!month) {
      errors.month = "Month selection is required.";
      isValid = false;
    } else if (month > currentMonth) {
      errors.month = "Cannot generate report for a future month.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    setFormAlert("");
    if (!validateForm()) {
      setFormAlert("Please correct the errors in the form.");
      return;
    }
    onGenerate(month);
  }

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    if (formErrors.month) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.month; // Corrected: `delete newErrors[month];` -> `delete newErrors.month;`
        return newErrors;
      });
    }
    setFormAlert("");
  };

  return (
    <Modal show={show} onClose={onClose} title="Generate Monthly Task Report"> {/* Updated title */}
      <div className="space-y-4">
        {formAlert && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {formAlert}
          </div>
        )}
        <label htmlFor="reportMonth" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          Select Month*
        </label>
        <input
          id="reportMonth"
          type="month"
          value={month}
          onChange={handleMonthChange}
          className={`w-full p-2.5 border ${formErrors.month ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-gray-800`}
        />
        {formErrors.month && <p className="text-red-500 text-xs mt-1">{formErrors.month}</p>}
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
  const [calendarDate, setCalendarDate] = useState(new Date()); // State to manage calendar's current date

  // Use useMemo to optimize event creation for one dot per day
  const calendarEvents = useMemo(() => {
    const datesWithTasks = new Set();
    // Collect all unique due dates that have tasks
    tasks.forEach(task => {
      if (task.dueDate) {
        datesWithTasks.add(format(new Date(task.dueDate), 'yyyy-MM-dd'));
      }
    });

    // Create one event for each unique date that has tasks
    return Array.from(datesWithTasks).map(dateString => {
      // Find one task for this date to serve as the 'resource' for onSelectEvent.
      // This ensures that clicking the dot still opens a modal with a task's details.
      const taskForResource = tasks.find(task => task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === dateString);

      return {
        id: dateString, // A unique ID for the day event
        title: "•", // Display a simple dot
        start: new Date(dateString),
        end: new Date(dateString),
        allDay: true,
        resource: taskForResource, // Pass one task object as resource
      };
    });
  }, [tasks]);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#4299e1'; // Blue color for the dot

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '50%', // Make it a small circle/dot
        width: '8px', // Size of the dot
        height: '8px',
        padding: '0px',
        fontSize: '0px', // Hide any text
        margin: '2px auto', // Center the dot
        display: 'block', // Ensure it takes up space and can be centered
        lineHeight: '1',
      }
    };
  };

  const CustomToolbar = ({ label, onNavigate, date }) => { // date prop is available here
    // Removed `isCurrentMonth` check for previous button's disabled state
    return (
      <div className="rbc-toolbar mb-3 flex items-center justify-between p-2">
        <span className="rbc-btn-group">
          <motion.button
            onClick={() => onNavigate('PREV')}
            className={`px-2 py-1 bg-green-500 text-white rounded-l-md hover:bg-green-600 text-sm`} // Removed conditional styling for disabled
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} // Always allow hover/tap
            // disabled={isCurrentMonth} // Removed disabled prop based on current month
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

  const dayPropGetter = useCallback((date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      return {
        className: 'past-date',
        style: {
          backgroundColor: '#f1f8f3',
          color: '#a0a0a0',
          cursor: 'not-allowed', // Make it clear past dates are not selectable for new tasks
        },
      };
    }
    return {};
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    const today = startOfDay(new Date());
    if (isBefore(slotInfo.start, today)) {
      // Prevent creating tasks on past dates
      return;
    }
    // Allow creating tasks on current/future dates
    onDateSelect(slotInfo.start);
  }, [onDateSelect]);

  const handleNavigate = useCallback((newDate) => {
    setCalendarDate(newDate);
  }, []);

  return (
    <motion.div
      className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
      style={{ height: '400px' }}
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
          background: #f0fdf4;
          font-weight: 600; color: #14532d; padding: 8px 4px;
          border: none; text-transform: uppercase;
          font-size: 10px; letter-spacing: 0.05em;
        }
        .rbc-date-cell { padding: 4px; font-weight: 500; color: #34473b; font-size: 11px; }
        .rbc-today { background: #dcfce7 !important; border-radius: 4px; }
        .rbc-off-range-bg { background: #f9fafb; }
        .rbc-month-view { border: 1px solid #d1fae5; border-radius: 8px; overflow: hidden; background: white; }
        .rbc-day-bg { transition: background-color 0.2s; }
        .rbc-day-bg.rbc-selected-cell { background-color: #bbf7d0 !important; }
        .rbc-row-content .rbc-button-link { font-size: 11px !important; font-weight: 500; }
        .rbc-row-content .rbc-header + .rbc-header { border-left: 1px solid #d1fae5; }
        .rbc-month-row + .rbc-month-row { border-top: 1px solid #d1fae5; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #d1fae5; }
        .rbc-event { /* customized in eventStyleGetter for dot */ }

        .rbc-day-bg.past-date {
          background-color: #f0f0f0 !important;
          color: #b0b0b0 !important;
          cursor: not-allowed !important;
          opacity: 0.8;
        }
        .rbc-day-bg.past-date .rbc-button-link {
          color: #b0b0b0 !important;
        }
        /* Specific styles to handle dot appearance */
        .rbc-event-content {
          font-size: 0 !important; /* hide event title text */
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background-color: #4299e1 !important; /* default blue dot */
          display: block;
          margin: 2px auto;
          overflow: hidden; /* hide overflow text */
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={calendarEvents} // <--- Now uses calendarEvents which only has one event per day
        onSelectEvent={onSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        views={['month']}
        defaultView="month"
        date={calendarDate} // Use calendarDate state here
        onNavigate={handleNavigate} // Pass the custom navigation handler
        startAccessor="start"
        endAccessor="end"
        components={{ toolbar: CustomToolbar }}
        style={{ height: 'calc(100% - 30px)' }}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventStyleGetter} // Apply custom style for events
      />
    </motion.div>
  );
};

// --- Main Assigned Tasks (central content) ---
const MainAssignedTasks = ({ tasks, users, stats, isLoading, onSelectTask, activeStatusFilter, onFilterChange }) => {

  const taskStats = [
    { label: "Total Tasks", value: stats.totalTasks, icon: Target, color: "bg-blue-100 text-blue-800 border-blue-200", filterValue: 'All' },
    { label: "To Do", value: tasks.filter(task => task.status === 'To Do').length, icon: ListTodo, color: "bg-blue-100 text-blue-800 border-blue-200", filterValue: 'To Do' },
    { label: "In Progress", value: tasks.filter(task => task.status === 'In Progress').length, icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200", filterValue: 'In Progress' },
    { label: "Completed", value: tasks.filter(task => task.status === 'Completed').length, icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200", filterValue: 'Completed' }
  ];

  const filteredTasksToDisplay = tasks
    .filter(task => {
      if (activeStatusFilter === 'All') return true;
      return task.status === activeStatusFilter;
    })
    .sort((a, b) => {
        // For completed tasks, sort from newest to oldest due date
        if (activeStatusFilter === 'Completed') {
            return new Date(b.dueDate) - new Date(a.dueDate);
        }
        // For other statuses or all tasks, sort from oldest to newest due date
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

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
          <h2 className="text-2xl font-bold text-gray-800">Task Overview</h2> {/* Changed title for admin context */}
          <p className="text-gray-600 text-sm">Organize and monitor all team activities</p>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {taskStats.map((stat) => (
          <motion.div
            key={stat.label}
            className={`p-4 rounded-lg shadow-sm border ${stat.color} flex items-center justify-between cursor-pointer ${activeStatusFilter === stat.filterValue ? 'ring-2 ring-offset-1 ring-green-500' : ''}`}
            whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}
            onClick={() => onFilterChange(stat.filterValue)}
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Current View: {activeStatusFilter} Tasks ({filteredTasksToDisplay.length})
        </h3>
        {isLoading.tasks ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="w-6 h-6 animate-spin text-green-500" />
            <span className="ml-2 text-gray-600">Loading tasks...</span>
          </div>
        ) : filteredTasksToDisplay.length === 0 ? (
          <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
            <CheckCircle className="w-10 h-10 mx-auto text-green-400 mb-3" />
            <p className="font-medium">No {activeStatusFilter.toLowerCase()} tasks found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasksToDisplay.map((task) => (
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
                  {/* The "Complete" button is removed from the admin's task list view. */}
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
      saveTask: false,
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [preselectedDate, setPreselectedDate] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState('All'); // New state for task filtering
  const [isCalendarModalReadOnly, setIsCalendarModalReadOnly] = useState(false); // New state for readOnly modal from calendar

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
    setLoading(prev => ({ ...prev, saveTask: true }));
    try {
      if (taskId) {
        // When editing an existing task, exclude the status field from the payload
        // as admins are not allowed to change it. The TaskModal handles disabling
        // the select input, and this ensures backend doesn't accidentally update.
        const { status, ...updatePayload } = taskData; // Destructure status out
        await api.put(`/tasks/${taskId}`, updatePayload);
      } else {
        await api.post('/tasks', taskData);
      }
      setShowTaskModal(false);
      setPreselectedDate(null);
      loadData();
    } catch (error) {
      alert(`Failed to save task. ${error?.response?.data?.message || ''}`);
    } finally {
      setLoading(prev => ({ ...prev, saveTask: false }));
    }
  };
  handleSaveTask.isLoading = loading.saveTask;

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
    const eventDueDate = new Date(event.resource.dueDate);
    const today = startOfDay(new Date());

    if (isBefore(eventDueDate, today)) {
      setIsCalendarModalReadOnly(true); // Past tasks are read-only
    } else {
      setIsCalendarModalReadOnly(false); // Current/future tasks are editable
    }
    setSelectedTask(event.resource || event);
    setShowTaskModal(true);
    setPreselectedDate(null); // Clear preselected date for event selection
  };

  const handleAddNewClick = () => {
    setSelectedTask(null);
    setIsCalendarModalReadOnly(false); // Not readOnly when creating new task
    setPreselectedDate(null);
    setShowTaskModal(true);
  };

  const handleDateSelectInCalendar = (date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      // If a past date is clicked, do nothing (no modal for creating/assigning tasks)
      return;
    }
    // If current or future date, open modal for new task assignment
    setSelectedTask(null);
    setPreselectedDate(date);
    setIsCalendarModalReadOnly(false); // It's a new task, so not read-only
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setIsCalendarModalReadOnly(false); // Reset readOnly state when modal closes
  }

  // This function `handleMarkTaskAsComplete` is kept for completeness if needed elsewhere
  // but will not be triggered from MainAssignedTasks in this admin UI anymore.
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
      // Fetch task data for the selected month
      const { data: reportTasks } = await api.get('/tasks/report', { params: { year, month } });

      if (!reportTasks || reportTasks.length === 0) {
        alert("There are no tasks scheduled for the selected month to generate a report.");
        setShowReportModal(false);
        return;
      }

      const doc = new jsPDF();
      doc.setFont('helvetica');

      // --- Header (Top Left - Company Info) ---
      doc.setFontSize(18);
      doc.setTextColor("#16a34a"); // GreenLeaf Farm green
      doc.setFont('helvetica', 'bold');
      doc.text("GreenLeaf Farm", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50); // Darker gray for details
      doc.setFont('helvetica', 'normal');
      doc.text("10/F, Ginimellagaha, Baddegama, Sri Lanka", 14, 27);
      doc.text("contact@greenleaffarm.com | +94 91 227 6246", 14, 32);

      // --- Header (Top Right - Report Title & Generated Date/Time) ---
      doc.setFontSize(18);
      doc.setTextColor(52, 58, 64); // Dark gray
      doc.setFont('helvetica', 'bold');
      doc.text("TASK REPORTS", 196, 20, { align: 'right' });

      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy')}`, 196, 27, { align: 'right' });
      doc.text(`${format(new Date(), 'HH:mm:ss')}`, 196, 32, { align: 'right' });

      // Green separator line
      doc.setDrawColor("#16a34a"); // Green color
      doc.setLineWidth(0.5);
      doc.line(14, 37, doc.internal.pageSize.getWidth() - 14, 37); // x1, y1, x2, y2


      // --- Report Details (Below green line) ---
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text("Section:", 14, 45);
      doc.text("Task Reports", 40, 45); // Adjust x-coordinate as needed

      doc.text("Range:", 14, 52);
      doc.text(`Monthly Report - ${format(new Date(year, month - 1, 1), 'MMMM yyyy')}`, 40, 52);

      // Duplicating "Generated" for style consistency with the image
      doc.text("Generated:", 155, 45);
      doc.text(`${format(new Date(), 'dd/MM/yyyy, HH:mm:ss')}`, 155, 52);


      // --- Metric and Value (Green bar) ---
      const startYForMetric = 60;
      const rowHeight = 10;
      const columnWidth = (doc.internal.pageSize.getWidth() - 28) / 2; // Split width for Metric and Value

      doc.setFillColor(34, 139, 34); // Green for the bar
      doc.rect(14, startYForMetric, doc.internal.pageSize.getWidth() - 28, rowHeight, 'F'); // Draw filled rectangle

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // White text for metric header
      doc.setFont('helvetica', 'bold');
      doc.text("Metric", 18, startYForMetric + rowHeight / 2 + 2, { align: 'left' });
      doc.text("Value", 14 + columnWidth + 4, startYForMetric + rowHeight / 2 + 2, { align: 'left' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50); // Dark gray for data
      doc.setFillColor(248, 248, 248); // Light gray background for data row
      doc.rect(14, startYForMetric + rowHeight, doc.internal.pageSize.getWidth() - 28, rowHeight, 'F');

      doc.text("Total Tasks", 18, startYForMetric + rowHeight * 1.5 + 2);
      doc.text(`${reportTasks.length}`, 14 + columnWidth + 4, startYForMetric + rowHeight * 1.5 + 2);

      // --- Task Details Table ---
      const tableStartY = startYForMetric + rowHeight * 2 + 5; // Position below the metric section

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
        startY: tableStartY,
        theme: 'striped',
        margin: { left: 14, right: 14 },
        tableWidth: doc.internal.pageSize.getWidth() - 28,
        headStyles: {
          fillColor: [34, 139, 34], // Green header
          textColor: 255,
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248] // Light gray for alternate rows
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          halign: 'left',
          valign: 'middle',
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Due Date
          1: { cellWidth: 40 }, // Assigned To
          2: { cellWidth: 70 }, // Task Title
          3: { cellWidth: 25 }, // Status
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

  const totalTasksCount = tasks.length;

  return (
    <motion.div
      className="p-8 bg-white min-h-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Task Creation/Edit Modal */}
      <TaskModal
        show={showTaskModal}
        onClose={handleCloseTaskModal} // Use custom close handler to reset readOnly
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        users={users}
        existingTask={selectedTask}
        preselectedDate={preselectedDate}
        readOnly={isCalendarModalReadOnly} // Pass the readOnly state
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
            }}
            isLoading={loading}
            onSelectTask={handleSelectEvent}
            onMarkAsComplete={handleMarkTaskAsComplete}
            activeStatusFilter={activeStatusFilter}
            onFilterChange={setActiveStatusFilter}
          />
        </motion.div>

        {/* Right Column (2/5 width): Small Task Calendar */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <SmallTaskCalendar
            tasks={tasks}
            onSelectEvent={handleSelectEvent}
            onDateSelect={handleDateSelectInCalendar} // Now handles enabling new task creation for current/future dates
            isLoading={loading.tasks}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}