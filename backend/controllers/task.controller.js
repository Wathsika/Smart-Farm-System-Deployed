import Task from "../models/Task.js";

// @desc    Admin creates a new task for an employee
// @route   POST /api/tasks
// @access  Private (Admin)
export const createTaskByAdmin = async (req, res) => {
  try {
    const { user, title, description, dueDate } = req.body;
    if (!user || !title || !dueDate) {
      return res.status(400).json({ message: "Employee, title, and due date are required." });
    }
    const newTask = await Task.create({ user, title, description, dueDate });
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const getAllTasksForAdmin = async (req, res) => {
  try {
    const tasks = await Task.find({}).populate('user', 'fullName').sort({ dueDate: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateTaskByAdmin = async (req, res) => {
  try {
    const { user, title, description, dueDate, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid Task ID" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ලැබී ඇති දත්ත වලින් පමණක් task එක යාවත්කාලීන කරන්න
    task.user = user || task.user;
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.dueDate = dueDate || task.dueDate;
    task.status = status || task.status;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Admin deletes a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
export const deleteTaskByAdmin = async (req, res) => {
  try {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid Task ID" });
    }
    
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// @desc    Admin generates a task report for a specific month
// @route   GET /api/tasks/report
// @access  Private (Admin)
export const generateTaskReport = async (req, res) => {
    try {
        const { year, month } = req.query;

        if (!year || !month) {
            return res.status(400).json({ message: "Year and month are required." });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const tasks = await Task.find({
            dueDate: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .populate('user', 'fullName')
        .sort({ dueDate: 'asc' });

        res.status(200).json(tasks);

    } catch (error) {
        // --- මෙන්න වැදගත්ම යාවත්කාලීන කිරීම ---
        // සිදුවන දෝෂය කුමක්දැයි backend terminal එකේ පැහැදිලිව පෙන්වීමට සලස්වනවා
        console.error("--- ERROR GENERATING TASK REPORT ---");
        console.error("Timestamp:", new Date().toISOString());
        console.error("Error Details:", error);
        // --- යාවත්කාලීන කිරීම අවසන් ---

        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Employee gets their own tasks
// @route   GET /api/tasks/my-tasks
// @access  Private (Employee)
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 }); // Due date එක අනුව sort කරන්න
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Employee updates the status of their own task
// @route   PATCH /api/tasks/:id/status
// @access  Private (Employee)
export const updateMyTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Task එක අයිති මේ employeeටමද කියලා බලනවා
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this task." });
    }
    
    task.status = status;
    await task.save();
    res.status(200).json({ message: "Task status updated.", task });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};