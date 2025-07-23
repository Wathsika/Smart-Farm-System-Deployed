const mongoose = require("mongoose");
const dburl =
  "mongodb+srv://savinduweerarathna:0x4kYld24S32cKrZ@smartfarmsystem.52kl2bz.mongodb.net/?retryWrites=true&w=majority&appName=SmartFarmSystem";
mongoose.set("strictQuery", true, "useNewUrlParser", true);
const connection = async () => {
  try {
    mongoose.connect(dburl);
    console.log("mongoose connected");
  } catch (e) {
    console.error(e.message);
    process.exit();
  }
};

module.exports = connection;
