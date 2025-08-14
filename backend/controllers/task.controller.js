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