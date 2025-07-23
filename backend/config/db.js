const { default: mongoose } = require('mongoose');
const mongo = require('mongoose');
const dbURI = "mongodb+srv://savinduweerarathna:0x4kYld24S32cKrZ@smartfarmsystem.52kl2bz.mongodb.net/?retryWrites=true&w=majority&appName=SmartFarmSystem";


mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connectDB = async () => {
try {
    mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
 } catch(e){
    console.error("MongoDB connection failed", e);
    process.exit();
}
};


module.exports = connectDB;