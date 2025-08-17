import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcryptjs";

// --- Database & Models ---
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// --- Import Route Files ---
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import staffOwnerRoutes from "./routes/staffOwner.routes.js"; // mounts user mgmt under /api/admin/users
import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import taskRoutes from "./routes/task.routes.js";

import transactionRoutes from "./routes/transaction.routes.js";

import orderRoutes from "./routes/order.routes.js";

// --- Initialize App ---
const app = express();

// --- Database Connection ---
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// --- Core Middleware ---
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173", // Corrected IP
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

app.use(morgan("dev")); // HTTP request logger

// --- !!! THE DEFINITIVE FIX FOR BODY PARSING !!! ---

// 1. We define the special webhook route handler FIRST, before app.use(express.json()).
// This tells Express: "For the specific route '/api/orders/webhook', use the raw body parser."
// All other routes will ignore this and continue to the next middleware.
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

// 2. NOW we can safely use the global JSON parser for all OTHER routes in our application.
// This will parse the body for '/api/orders/create-checkout-session', '/api/admin', etc.

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// Simple root route for health checks
app.get("/", (_, res) => res.json({ message: "API is running successfully." }));

app.use("/api/transactions", transactionRoutes);

app.use("/api/admin", adminRoutes); // your existing admin endpoints
app.use("/api/admin/users", staffOwnerRoutes); // exposes /api/admin/users
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave-requests", leaveRequestRoutes); // future employee self-service
app.use("/api/tasks", taskRoutes);
// Health check
app.get("/", (_req, res) => res.json({ ok: true }));

// --- Error Handling Middleware (must be last) ---

app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`✅ API running on port :${PORT}`));
