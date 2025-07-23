const mongoose = require('mongoose');

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    // This line reads the variable from your .env file
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("MongoDB connected successfully to Atlas!");

  } catch (error) {
    console.error("MongoDB connection FAILED:", error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;