import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    // Task එක assign කරපු user (employee)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Task එකේ මාතෘකාව
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Task එක ගැන විස්තරයක්
    description: {
      type: String,
      trim: true,
    },
    // Task එක ඉවර කරන්න ඕන දවස
    dueDate: {
      type: Date,
      required: true,
    },
    // Task එකේ තත්ත්වය
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed"],
      default: "To Do",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);
export default Task;