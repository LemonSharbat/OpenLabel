// index.js - Enhanced OpenLabel backend with WHO health analysis
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// Import routers
const productRouter = require("./routes/product");
const analysisRouter = require("./routes/analysis");

const app = express();

// ✅ Enhanced request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log("\n" + "=".repeat(60));
  console.log(`📥 [${timestamp}] ${req.method} ${req.url}`);
  console.log(`🔗 Origin: ${req.get("origin") || "No origin"}`);
  console.log(`🔗 User-Agent: ${req.get("user-agent")?.substring(0, 50)}...`);
  console.log(`🔗 Client IP: ${req.ip || req.connection.remoteAddress}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📝 Body keys: ${Object.keys(req.body).join(", ")}`);
  }
  console.log("=".repeat(60));
  next();
});

// ✅ Enhanced CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["*"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// ✅ Enhanced body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Create uploads directory
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`📁 Created uploads directory: ${UPLOAD_DIR}`);
}

// ✅ Environment validation
const requiredEnvVars = [
  "DOC_ENDPOINT",
  "DOC_KEY",
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`❌ - ${varName}`);
  });
  console.error(
    "\n💡 Please check your .env file and ensure all variables are set."
  );
  console.error("📋 Use .env.example as a template.");
} else {
  console.log("✅ All required environment variables are set");
}

// ✅ Enhanced health check with environment status
app.get("/api/health", (req, res) => {
  console.log("\n🏥 HEALTH CHECK ACCESSED!");

  const healthData = {
    success: true,
    message: "✅ OpenLabel Server is running perfectly!",
    timestamp: new Date().toISOString(),
    server: {
      port: process.env.PORT || 3000,
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
    },
    services: {
      azureOCR: process.env.DOC_ENDPOINT ? "✅ Configured" : "❌ Missing",
      azureOpenAI: process.env.AZURE_OPENAI_ENDPOINT
        ? "✅ Configured"
        : "❌ Missing",
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME
        ? "✅ Configured"
        : "❌ Missing",
      openRouter: process.env.OPENROUTER_API_KEY
        ? "✅ Configured"
        : "❌ Missing",
    },
    features: {
      whoHealthAnalysis: "✅ Active",
      ingredientAnalysis: "✅ Active",
      imageProcessing: "✅ Active",
      nutritionScoring: "✅ Active",
      purchaseRecommendations: "✅ Active",
    },
    client: {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      origin: req.get("origin"),
    },
  };

  res.json(healthData);
});

// ✅ Enhanced test route
app.get("/api/test", (req, res) => {
  console.log("\n🧪 TEST ROUTE ACCESSED!");

  res.json({
    success: true,
    message: "🎉 OpenLabel API is working perfectly!",
    timestamp: new Date().toISOString(),
    testData: {
      server: "Express.js",
      database: "File-based",
      ai: "Azure + OpenAI",
      storage: "Cloudinary",
      features: ["WHO Analysis", "Ingredient Parsing", "Health Scoring"],
    },
    endpoints: [
      "GET /api/health - Server health check",
      "GET /api/test - Simple test endpoint",
      "POST /api/analysis/analyze-image - WHO ingredient analysis",
      "GET /api/analysis/saved-reports - Get analysis history",
      "POST /api/analysis/save-report - Save analysis report",
    ],
  });
});

// ✅ API routes
app.use("/api/products", productRouter);
app.use("/api/analysis", analysisRouter);

// ✅ Enhanced error handler
app.use((error, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [${timestamp}] SERVER ERROR:`);
  console.error(`❌ Route: ${req.method} ${req.url}`);
  console.error(`❌ Error: ${error.message}`);
  console.error(`❌ Stack: ${error.stack}`);

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(error.status || 500).json({
    success: false,
    message: error.message,
    error: isDevelopment ? error.name : "Internal Server Error",
    timestamp,
    ...(isDevelopment && { stack: error.stack }),
  });
});

// ✅ Enhanced 404 handler
app.use((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n❌ [${timestamp}] 404 NOT FOUND: ${req.method} ${req.url}`);

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    timestamp,
    suggestion: "Check the available routes below",
    availableRoutes: {
      health: "GET /api/health",
      test: "GET /api/test",
      analysis: "POST /api/analysis/analyze-image",
      reports: "GET /api/analysis/saved-reports",
      saveReport: "POST /api/analysis/save-report",
    },
    documentation: "https://github.com/LemonSharbat/OpenLabel",
  });
});

// ✅ Server startup
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("\n🚀 " + "=".repeat(50));
  console.log("🚀 OPENLABEL SERVER STARTED SUCCESSFULLY!");
  console.log("🚀 " + "=".repeat(50));
  console.log(`📍 Server: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📱 Mobile: http://192.168.43.18:${PORT}`);
  console.log(`📱 Emulator: http://10.0.2.2:${PORT}`);

  console.log("\n🏥 WHO HEALTH FEATURES:");
  console.log("✅ Ingredient analysis with health grading");
  console.log("✅ Purchase recommendations based on WHO standards");
  console.log("✅ Nutritional compliance scoring");
  console.log("✅ Advanced health analytics");

  console.log("\n🧪 TEST ENDPOINTS:");
  console.log(`• Health: http://localhost:${PORT}/api/health`);
  console.log(`• Test: http://localhost:${PORT}/api/test`);
  console.log(
    `• Analysis: POST http://localhost:${PORT}/api/analysis/analyze-image`
  );

  console.log("\n🔒 SECURITY:");
  console.log(
    `✅ Environment variables: ${
      missingVars.length === 0 ? "All configured" : "Some missing"
    }`
  );
  console.log("✅ CORS: Enabled for development");
  console.log("✅ File uploads: Configured with limits");

  console.log("\n📝 Ready to receive requests...");
  console.log("=".repeat(60) + "\n");
});

// ✅ Enhanced server error handling
server.on("error", (err) => {
  console.error("\n❌ SERVER STARTUP ERROR:", err.message);

  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error("\n💡 Solutions:");
    console.error("• Change PORT in .env file");
    console.error("• Kill existing process:");
    console.error(`  - Windows: netstat -ano | findstr :${PORT}`);
    console.error(`  - macOS/Linux: lsof -i :${PORT}`);
    process.exit(1);
  }

  if (err.code === "EACCES") {
    console.error(`❌ Permission denied for port ${PORT}`);
    console.error("💡 Try using a port > 1024 or run with sudo");
    process.exit(1);
  }
});

// ✅ Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});

module.exports = app;
