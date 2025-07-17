require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

// Core Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: "API is running successfully." });
});

// Your other API routes will go here...
// e.g., app.use('/api/users', require('./routes/userRoutes'));


// DB Connection & Server Initialization
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connection successful.");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });