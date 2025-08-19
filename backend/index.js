import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import cowRoutes from "./routes/cow.routes.js";
import milkRoutes from "./routes/milk.routes.js";
import healthRoutes from "./routes/health.routes.js";
import breedingRoutes from "./routes/breeding.routes.js";

dotenv.config();
const app = express();

connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

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

app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cows", cowRoutes);
app.use("/api/milk", milkRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/breeding", breedingRoutes);  

app.get("/", (_, res) => res.json({ ok: true }));

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5001;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
