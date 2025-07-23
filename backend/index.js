const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config(); // This line loads your .env file

const app = express();
const port = 3001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => 
      console.log(`Server is running on http://localhost:${port}`)
    );
  } catch (error) {
    console.error("Could not start server", error);
  }
};

app.get("/", (req, res) => res.send("Server is Running!"));

startServer();