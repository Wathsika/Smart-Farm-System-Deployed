const express = require("express");
const dbConnection = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true, credentials: true }));

//db connection
dbConnection();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send(`server running in port ${port}`));

const port = 3001;
app.listen(port, () => console.log(`server running in port ${port}`));
