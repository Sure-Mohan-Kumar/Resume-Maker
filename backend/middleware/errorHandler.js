/**
 * Global error handling middleware
 * Should be used as the last middleware in Express
 */
const errorHandler = (err, req, res, next) => {
  try {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";

    console.error("✗ Error caught by global handler:");
    console.error(`  Status: ${status}`);
    console.error(`  Message: ${message}`);
    console.error(`  Stack: ${err.stack}`);

    // Gemini API specific errors
    if (message.includes("API") || message.includes("Gemini")) {
      console.error("  Type: Gemini API Error");
      return res.status(503).json({
        success: false,
        error: "AI service temporarily unavailable. Please try again later.",
      });
    }

    // Rate limiting errors
    if (status === 429) {
      console.error("  Type: Rate Limit Error");
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please wait before trying again.",
      });
    }

    // Validation errors
    if (status === 400) {
      console.error("  Type: Validation Error");
      return res.status(400).json({
        success: false,
        error: message,
      });
    }

    // Default error response
    return res.status(status).json({
      success: false,
      error: process.env.NODE_ENV === "production" 
        ? "An error occurred. Please try again later." 
        : message,
    });
  } catch (handlerError) {
    console.error("✗ Error in error handler itself:", handlerError.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Async error wrapper - wrap async route handlers to catch errors
 * @param {function} fn - Async function to wrap
 */
const asyncHandler = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (error) {
    console.error("✗ Async handler error:", error.message);
    next(error);
  }
};

module.exports = { errorHandler, asyncHandler };
