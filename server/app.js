const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorMiddleware = require("./middleware/error.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const categoryRoutes = require("./routes/category.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(helmet());

if(process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());



const allowedOrigins = [
  "https://expense-tracker-kappa-eight-95.vercel.app",
  "https://expense-tracker-atul15.vercel.app",
  "https://expense-tracker-git-main-atul15.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(limiter);




app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// â Global error middleware 

app.use(errorMiddleware);

module.exports = app;
