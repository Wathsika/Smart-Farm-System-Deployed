const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware 
app.use("/", (req, res, next) => {
    res.send("It works!");
});

mongoose.connect("mongodb+srv://savinduweerarathna:0x4kYld24S32cKrZ@smartfarmsystem.52kl2bz.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => { app.listen(5001);

})
.catch((err)=> console.log((err)));


