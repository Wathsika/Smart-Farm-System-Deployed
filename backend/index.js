// index.js  (ESM)

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcryptjs"; // (ok to keep, even if unused)

// --- Database & Middlewares ---
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// --- Routes (ESM imports; note the .js extensions) ---
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cropRoutes from "./routes/crop.routes.js";
import fieldRoutes from "./routes/field.routes.js";
import inputRoutes from "./routes/input.routes.js";
import planRoutes from "./routes/plan.routes.js";
import applicationRoutes from "./routes/application.routes.js";

// --- App ---
const app = express();

// --- DB ---
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// --- Core middleware ---
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

app.use(morgan("dev"));

// --- Body parsing ---
// Put webhook raw BEFORE global parsers
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// --- API Routes (MOUNT BEFORE error handlers) ---
app.use("/api/products", productRoutes);     // old products endpoints (kept)
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/fields", fieldRoutes);

// new modules
app.use("/api/inputs", inputRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/applications", applicationRoutes);

// health check
app.get("/", (_, res) => res.json({ message: "API is running successfully." }));

// --- Error handlers (MUST be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start server ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`✅ API running on port :${PORT}`));
