/**
 * Validate resume prompt
 * @param {string} prompt - User's input prompt
 * @returns {object} - Validation result
 */
const validateResumePrompt = (prompt) => {
  try {
    // Check if prompt exists
    if (prompt === null || prompt === undefined) {
      return { valid: false, error: "Prompt cannot be null or undefined" };
    }

    // Check if prompt is a string
    if (typeof prompt !== "string") {
      return { valid: false, error: "Prompt must be a string" };
    }

    // Trim and check length
    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length === 0) {
      return { valid: false, error: "Prompt cannot be empty" };
    }

    if (trimmedPrompt.length < 50) {
      return {
        valid: false,
        error: `Prompt too short. Minimum 50 characters required. Current: ${trimmedPrompt.length}`,
      };
    }

    if (trimmedPrompt.length > 5000) {
      return {
        valid: false,
        error: `Prompt too long. Maximum 5000 characters allowed. Current: ${trimmedPrompt.length}`,
      };
    }

    // Check for valid content (not just special characters)
    if (!/[a-zA-Z0-9]/.test(trimmedPrompt)) {
      return { valid: false, error: "Prompt must contain alphanumeric characters" };
    }

    return { valid: true };
  } catch (error) {
    console.error("✗ Validation error:", error.message);
    return { valid: false, error: "Internal validation error: " + error.message };
  }
};

/**
 * Sanitize input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  try {
    if (typeof input !== "string") return "";

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  } catch (error) {
    console.error("✗ Sanitization error:", error.message);
    return "";
  }
};

/**
 * Validate API request format
 * @param {object} body - Request body
 * @returns {object} - Validation result
 */
const validateRequestBody = (body) => {
  try {
    if (!body || typeof body !== "object") {
      return { valid: false, error: "Request body must be an object" };
    }

    if (!("prompt" in body)) {
      return { valid: false, error: "Request must include 'prompt' field" };
    }

    return { valid: true };
  } catch (error) {
    console.error("✗ Request validation error:", error.message);
    return { valid: false, error: "Invalid request format" };
  }
};

module.exports = {
  validateResumePrompt,
  sanitizeInput,
  validateRequestBody,
};
