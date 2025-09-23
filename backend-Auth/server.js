const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "OpenLabel API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler - COMPLETELY REMOVED
// Express automatically returns 404 for unmatched routes

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 OpenLabel API running on port ${PORT}`);
});
