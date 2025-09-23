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
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);
export default Task;

