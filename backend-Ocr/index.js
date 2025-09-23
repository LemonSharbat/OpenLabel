require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const productRouter = require("./routes/product");
const analysisRouter = require("./routes/analysis");

const app = express();

// ✅ Log every single request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log("\n" + "=".repeat(50));
  console.log(`📥 INCOMING REQUEST: ${timestamp}`);
  console.log(`🔗 Method: ${req.method}`);
  console.log(`🔗 URL: ${req.url}`);
  console.log(`🔗 Origin: ${req.get("origin") || "No origin"}`);
  console.log(`🔗 User-Agent: ${req.get("user-agent")}`);
  console.log(`🔗 Client IP: ${req.ip || req.connection.remoteAddress}`);
  console.log("=".repeat(50));
  next();
});

// ✅ FIXED: Ultra-permissive CORS without problematic options route
app.use(
  cors({
    origin: true, // Allow ALL origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["*"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Uploads folder
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// ✅ ENHANCED health check
app.get("/api/health", (req, res) => {
  console.log("\n🏥 HEALTH CHECK ACCESSED!");
  console.log("🏥 Request came from:", req.ip || req.connection.remoteAddress);

  res.json({
    success: true,
    message: "✅ Server is DEFINITELY running and accessible!",
    timestamp: new Date().toISOString(),
    server: {
      port: process.env.PORT || 3000,
      platform: process.platform,
      nodeVersion: process.version,
    },
    client: {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      origin: req.get("origin"),
    },
  });
});

// Add simple GET route that doesn't require anything
app.get("/api/test", (req, res) => {
  console.log("\n🧪 TEST ROUTE ACCESSED!");
  res.json({
    message: "Simple test route working!",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/products", productRouter);
app.use("/api/analysis", analysisRouter);

// Error handler
app.use((error, req, res, next) => {
  console.error("\n❌ SERVER ERROR:");
  console.error("❌ Error:", error);
  console.error("❌ Stack:", error.stack);

  res.status(500).json({
    success: false,
    message: error.message,
    error: error.name,
  });
});

// ✅ FIXED: 404 handler without problematic wildcard
app.use((req, res) => {
  console.log("\n❌ 404 NOT FOUND:");
  console.log("❌ Method:", req.method);
  console.log("❌ URL:", req.url);
  console.log("❌ IP:", req.ip || req.connection.remoteAddress);

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    availableRoutes: [
      "GET /api/health",
      "GET /api/test",
      "POST /api/analysis/analyze-image",
    ],
  });
});

const PORT = process.env.PORT || 3000;

// ✅ CRITICAL: Listen on all interfaces
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n🚀 ===============================");
  console.log("🚀 SERVER STARTED SUCCESSFULLY!");
  console.log("🚀 ===============================");
  console.log(`📍 Server listening on: 0.0.0.0:${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Emulator URL: http://10.0.2.2:${PORT}`);
  console.log("\n🧪 TEST THESE URLS:");
  console.log(`1. Browser: http://localhost:${PORT}/api/health`);
  console.log(`2. Emulator browser: http://10.0.2.2:${PORT}/api/health`);
  console.log(`3. Simple test: http://10.0.2.2:${PORT}/api/test`);
  console.log("\n📝 If you see request logs below, server is working!");
  console.log("================================\n");
});

server.on("error", (err) => {
  console.error("❌ SERVER ERROR:", err);
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(
      "❌ Try: lsof -i :3000 (macOS) or netstat -ano | findstr :3000 (Windows)"
    );
  }
});

module.exports = app;
