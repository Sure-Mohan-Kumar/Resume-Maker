require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const resumeRoutes = require("./routes/resumeRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const { version } = require("./package.json");

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// 🚀 ResumeCraft Server Initialization
// ========================================
console.log("\n=== ResumeCraft Server Initialization ===");
console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`Version: ${version}`);
console.log(`Port: ${PORT}`);

// ========================================
// 🧩 MIDDLEWARE
// ========================================

try {
  // Security headers
  app.use(helmet());
  console.log("✓ Helmet security enabled");

  // JSON & URL Encoded Parser
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  console.log("✓ Body parser configured");

  // CORS
  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  console.log("✓ CORS enabled");

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 30 : 1000, // 30 in prod, 1000 in dev
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`⚠ Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: "Too many requests. Please try again in 15 minutes.",
        retryAfter: req.rateLimit.resetTime,
      });
    },
  });

  app.use(limiter);
  console.log("✓ Rate limiting configured");
} catch (error) {
  console.error("✗ Middleware configuration error:", error.message);
  process.exit(1);
}

// ========================================
// 💚 HEALTH CHECK ENDPOINT
// ========================================
app.get("/health", (req, res) => {
  try {
    res.status(200).json({
      status: "✓ Server running",
      timestamp: new Date().toISOString(),
      version,
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    console.error("✗ Health check error:", error.message);
    res.status(500).json({ error: "Health check failed" });
  }
});

// ========================================
// 🧾 ROUTES
// ========================================
try {
  app.use("/api", resumeRoutes);
  console.log("✓ Routes configured");
} catch (error) {
  console.error("✗ Route configuration error:", error.message);
  process.exit(1);
}

// ========================================
// ⚠️ 404 HANDLER
// ========================================
app.use((req, res) => {
  try {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.path} not found`,
      availableEndpoints: [
        "GET /health",
        "POST /api/generate-resume",
      ],
    });
  } catch (error) {
    console.error("✗ 404 handler error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ========================================
// ❌ GLOBAL ERROR HANDLER
// ========================================
app.use(errorHandler);

// ========================================
// 🔥 UNCAUGHT EXCEPTIONS
// ========================================
process.on("uncaughtException", (error) => {
  console.error(`[${new Date().toISOString()}] ✗ Uncaught Exception:`, error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`[${new Date().toISOString()}] ✗ Unhandled Rejection at:`, promise);
  console.error("Reason:", reason);
  process.exit(1);
});

// ========================================
// 🧠 SERVER STARTUP
// ========================================
const server = app.listen(PORT, () => {
  console.log(`\n🚀 ResumeCraft Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoint: POST http://localhost:${PORT}/api/generate-resume`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
  console.log("\n=== Server Ready ===\n");
});

// ========================================
// 🧹 GRACEFUL SHUTDOWN
// ========================================
const gracefulShutdown = (signal) => {
  console.log(`\n📛 ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("✓ Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Handles Ctrl+C

module.exports = app;
