
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed"],
      default: "To Do",
    },
    // Add completedAt field for more accurate performance tracking
    completedAt: { // මෙම නව field එක එකතු කරන්න
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook to set completedAt when status changes to "Completed"
TaskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;
