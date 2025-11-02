const express = require("express");
const router = express.Router();
const { generateResume, healthCheck } = require("../controllers/resumeController");
const { generatePDF, generateDOCX } = require("../controllers/pdfController");

/**
 * POST /api/generate-resume
 * Generate resume from user prompt
 */
router.post("/generate-resume", generateResume);

/**
 * POST /api/download-pdf
 * Download PDF
 */
router.post("/download-pdf", generatePDF);

/**
 * POST /api/download-docx
 * Download Word (editable)
 */
router.post("/download-docx", generateDOCX);

/**
 * GET /health
 * Health check
 */
router.get("/health", healthCheck);

/**
 * Catch-all for unknown routes
 */
router.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

module.exports = router;
