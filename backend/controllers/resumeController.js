const { generateResumeContent } = require("../config/gemini");
const {
  validateResumePrompt,
  sanitizeInput,
  validateRequestBody,
} = require("../utils/validators");

/**
 * Generate resume from user prompt
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const generateResume = async (req, res) => {
  let startTime = Date.now();

  try {
    console.log("\n--- New Resume Generation Request ---");

    // Validate request body
    const bodyValidation = validateRequestBody(req.body);
    if (!bodyValidation.valid) {
      console.warn("⚠ Invalid request body:", bodyValidation.error);
      return res.status(400).json({
        success: false,
        error: bodyValidation.error,
      });
    }

    let { prompt } = req.body;

    // Sanitize input
    prompt = sanitizeInput(prompt);
    console.log(`📥 Received prompt (${prompt.length} chars)`);

    // Validate prompt
    const validation = validateResumePrompt(prompt);
    if (!validation.valid) {
      console.warn("⚠ Prompt validation failed:", validation.error);
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    console.log("✓ Input validation passed");

    // Generate resume using Gemini
    console.log("🤖 Calling Gemini API...");
    const resumeData = await generateResumeContent(prompt);

    console.log("✓ Resume generated successfully");

    // Validate resume data
    if (!resumeData || typeof resumeData !== "object") {
      throw new Error("Invalid resume data returned from API");
    }

    const duration = Date.now() - startTime;
    console.log(`✓ Request completed in ${duration}ms`);

    return res.status(200).json({
      success: true,
      data: resumeData,
      message: "Resume generated successfully",
      processingTime: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error.message.includes("API key")) {
      console.error("✗ API Key Error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Server configuration error. Please contact support.",
      });
    }

    if (error.message.includes("invalid request")) {
      console.error("✗ Invalid API Request:", error.message);
      return res.status(400).json({
        success: false,
        error: "Invalid input format for resume generation",
      });
    }

    if (error.message.includes("Rate limit")) {
      console.error("✗ Rate Limited:", error.message);
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again in a few moments.",
      });
    }

    console.error("✗ Resume generation error:", error.message);
    console.error("Duration before error:", `${duration}ms`);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate resume. Please try again.",
    });
  }
};

/**
 * Health check endpoint
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const healthCheck = (req, res) => {
  try {
    return res.status(200).json({
      status: "Server is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("✗ Health check error:", error.message);
    return res.status(500).json({
      status: "Server error",
      error: error.message,
    });
  }
};

module.exports = { generateResume, healthCheck };
