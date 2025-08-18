import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

// --- Middleware ---
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// --- ROUTES ---
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import staffOwnerRoutes from "./routes/staffOwner.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRequestRoutes from "./routes/leaveRequest.routes.js";
import taskRoutes from "./routes/task.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import orderRoutes from "./routes/order.routes.js";
import discountRoutes from "./routes/discount.routes.js";

// ✅ Import the webhook handler so we can mount an extra path that matches your Stripe CLI
import { stripeWebhookHandler } from "./controllers/order.controller.js";

// --- Initialize App & DB ---
const app = express();
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// --- CORS / Logging ---
const allowedOrigins = [process.env.CLIENT_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));

/**
 * ❗ Stripe needs the raw body for signature verification.
 * We support BOTH paths:
 *   - /api/orders/webhook           (your existing router path)
 *   - /api/stripe/webhook           (what your Stripe CLI is forwarding to)
 *
 * These MUST be registered BEFORE express.json().
 */
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// This standalone route matches your CLI: `--forward-to http://localhost:5001/api/stripe/webhook`
app.post("/api/stripe/webhook", stripeWebhookHandler);

// General JSON parser (keep after raw webhook parsers)
app.use(express.json({ limit: "5mb" }));

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin/users", staffOwnerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/tasks", taskRoutes);

// Health
app.get("/", (_req, res) => res.json({ ok: true, message: "API is running" }));

// --- Errors (must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`✅ API running on port :${PORT}`));
