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
import orderRoutes from "./routes/order.routes.js";
import cropRoutes from './routes/crop.routes.js';

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

app.use(cors({
    origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
    },
    credentials: true,
}));

app.use(morgan("dev")); // HTTP request logger


// --- !!! THE DEFINITIVE FIX FOR BODY PARSING !!! ---

// 1. We define the special webhook route handler FIRST, before app.use(express.json()).
// This tells Express: "For the specific route '/api/orders/webhook', use the raw body parser."
// All other routes will ignore this and continue to the next middleware.
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// 2. NOW we can safely use the global JSON parser for all OTHER routes in our application.
// This will parse the body for '/api/orders/create-checkout-session', '/api/admin', etc.
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));


// --- API ROUTES ---
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/crops", cropRoutes);

// Simple root route for health checks
app.get("/", (_, res) => res.json({ message: "API is running successfully." }));

// --- Error Handling Middleware (must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`✅ API running on port :${PORT}`));