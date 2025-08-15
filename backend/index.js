import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

// --- Middleware ---
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// --- ALL ROUTE FILES ---
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import orderRoutes from "./routes/order.routes.js";
// --- 1. IMPORT THE NEW DISCOUNT ROUTE FILE ---
import discountRoutes from './routes/discount.routes.js'; 


// --- Initialize App & DB ---
const app = express();
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});


// --- Core Middleware ---
const allowedOrigins = [ /* ... your origins ... */ ];
app.use(cors({ /* ... your cors config ... */ }));
app.use(morgan("dev"));


// --- Body Parsing Middleware ---
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: "5mb" }));


// --- ALL API ROUTES ---
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// --- 2. ADD THE NEW ROUTE MIDDLEWARE ---
// This line tells Express: "For any request that starts with '/api/discounts',
// hand it over to the 'discountRoutes' router to handle."
app.use("/api/discounts", discountRoutes);


// Health check
app.get("/", (_req, res) => res.json({ ok: true, message: "API is running" }));

// --- Error Handling Middleware (must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`✅ API running on port :${PORT}`));