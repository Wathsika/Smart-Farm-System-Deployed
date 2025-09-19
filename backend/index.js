// index.js  (ESM)

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
// ok to keep, even if unused

// --- DB & Error Middleware ---
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// --- Controllers ---
import { stripeWebhookHandler } from "./controllers/order.controller.js";

// --- Routes (ESM imports; .js extensions required) ---
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import cowRoutes from "./routes/cow.routes.js";
import milkRoutes from "./routes/milk.routes.js";
import healthRoutes from "./routes/health.routes.js";
import breedingRoutes from "./routes/breeding.routes.js";

import staffOwnerRoutes from "./routes/staffOwner.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";

import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import taskRoutes from "./routes/task.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import orderRoutes from "./routes/order.routes.js";
import discountRoutes from "./routes/discount.routes.js";

import performanceRoutes from "./routes/performance.routes.js";

import cropRoutes from "./routes/crop.routes.js";
import fieldRoutes from "./routes/field.routes.js";
import inputRoutes from "./routes/input.routes.js";
import planRoutes from "./routes/plan.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import payrollSettingsRoutes from "./routes/payrollSettings.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import reportRoutes from "./routes/report.routes.js";

// --- Initialize App ---
const app = express();

// --- DB ---
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// --- CORS / Logging ---
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      // ❗ Explicitly reject unknown origins (more secure)
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(morgan("dev")); // HTTP request logger

/**
 * ❗ Stripe needs the raw body for signature verification.
 * Register raw parsers BEFORE express.json().
 * We support BOTH paths:
 *   - /api/orders/webhook  (kept for compatibility)
 *   - /api/stripe/webhook  (matches Stripe CLI --forward-to)
 */

app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// Attach handlers for both webhook paths
app.post("/api/orders/webhook", stripeWebhookHandler);
app.post("/api/stripe/webhook", stripeWebhookHandler);

// --- Body Parsers (after raw webhook parsers) ---
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/cows", cowRoutes);
app.use("/api/milk", milkRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/breeding", breedingRoutes);

app.use("/api/discounts", discountRoutes);

app.use("/api/admin/users", staffOwnerRoutes); // cleaner
app.use("/api/employees", employeeRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/tasks", taskRoutes);

// Health check

app.use("/api/performance", performanceRoutes);

app.use("/api/transactions", transactionRoutes);
app.use("/api", payrollSettingsRoutes);
app.use("/employees", employeeRoutes);
app.use("/payrolls", payrollRoutes);

// Smart farm modules
app.use("/api/crops", cropRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/inputs", inputRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/applications", applicationRoutes);

// --- Health Check ---
app.get("/", (_req, res) =>
  res.json({ ok: true, message: "API is running successfully." })
);

// --- Errors (must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`✅ API running on port :${PORT}`));
