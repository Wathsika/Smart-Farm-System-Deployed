import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Discount from "../models/Discount.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const result = await Discount.updateMany(
      {
        $or: [
          { applicationMode: { $exists: false } },
          { applicationMode: null },
        ],
      },
      { $set: { applicationMode: "AUTO" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} discount(s) to applicationMode=AUTO.`);
  } catch (error) {
    console.error("❌ Failed to update discounts:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

run().then(() => process.exit(0));