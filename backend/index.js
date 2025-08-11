// index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcryptjs";

import { connectDB } from "./config/db.js";
import User from "./models/User.js";

// Routes
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import staffOwnerRoutes from "./routes/staffOwner.routes.js"; // mounts user mgmt under /api/admin/users
import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { notFound, errorHandler } from "./middlewares/error.js";

// --- ENV & APP ---
dotenv.config();
const app = express();

// --- DB ---
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// --- MIDDLEWARES ---
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));



// --- API ROUTES ---
app.use("/api/auth", authRoutes);          // /signup, /login
app.use("/api/products", productRoutes);   // product endpoints

app.use("/api/admin", adminRoutes);        // your existing admin endpoints
app.use("/api/admin/users", staffOwnerRoutes);  // exposes /api/admin/users
app.use("/api/employee", employeeRoutes);  // future employee self-service

// Health check
app.get("/", (_req, res) => res.json({ ok: true }));

// --- ERROR HANDLERS (last) ---
app.use(notFound);
app.use(errorHandler);

// --- START SERVER ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
