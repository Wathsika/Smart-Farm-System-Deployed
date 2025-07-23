const express = require('express');
const connectDB = require('./config/db');
// Connect to MongoDB
connectDB();

const app = express();

app.get("/", (req, res) => res.send("Server is Runing!"));

const port = 3001;

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));


