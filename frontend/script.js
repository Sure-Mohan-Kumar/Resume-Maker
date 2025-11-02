/**
 * ResumeCraft Frontend – Stable Version (2025)
 * Handles resume generation, PDF/Word download, and UI updates safely
 */

const API_URL = "https://resume-maker-91k6.onrender.com/api";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// DOM elements (safely)
const resumePrompt = document.getElementById("resumePrompt");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadDocxBtn = document.getElementById("downloadDocxBtn");
const copyBtn = document.getElementById("copyBtn");
const resumePreview = document.getElementById("resumePreview");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const charCount = document.getElementById("charCount");

let currentResumeData = null;
let isGenerating = false;

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔧 ResumeCraft frontend loaded...");
  if (resumePrompt) resumePrompt.addEventListener("input", handleCharacterCount);
  if (generateBtn) generateBtn.addEventListener("click", generateResume);
  if (downloadBtn) downloadBtn.addEventListener("click", downloadPDF);
  if (downloadDocxBtn) downloadDocxBtn.addEventListener("click", downloadWord);
  if (copyBtn) copyBtn.addEventListener("click", copyToClipboard);
  await checkAPIConnectivity();
});

// === CHARACTER COUNT ===
function handleCharacterCount(e) {
  const count = e.target.value.length;
  if (charCount) {
    charCount.textContent = count;
    charCount.style.color =
      count < 50 ? "#dc3545" : count > 4500 ? "#ffc107" : "#999";
  }
}

// === BACKEND HEALTH CHECK ===
async function checkAPIConnectivity() {
  try {
    const response = await fetch(`${API_URL.replace("/api", "")}/health`);
    if (response.ok) console.log("✓ Backend server connected");
    else console.warn("⚠ Backend responded but not healthy");
  } catch (error) {
    console.warn("⚠ Cannot reach backend:", error.message);
  }
}

// === PROMPT VALIDATION ===
function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== "string")
    return { valid: false, error: "Prompt must be a string" };
  const trimmed = prompt.trim();
  if (trimmed.length < 50)
    return { valid: false, error: "Minimum 50 characters required" };
  if (trimmed.length > 5000)
    return { valid: false, error: "Maximum 5000 characters allowed" };
  return { valid: true };
}

// === GENERATE RESUME ===
async function generateResume() {
  const btnText = document.querySelector(".btn-text");
  const spinner = document.querySelector(".spinner");

  try {
    if (isGenerating) return showError("Already generating...");
    const prompt = resumePrompt?.value || "";
    const validation = validatePrompt(prompt);
    if (!validation.valid) return showError(validation.error);

    clearMessages();
    isGenerating = true;
    if (generateBtn) generateBtn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (spinner) spinner.classList.remove("hidden");

    console.log("📨 Sending resume generation request...");

    const response = await fetchWithRetry(`${API_URL}/generate-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);

    currentResumeData = result.data;
    displayResume(currentResumeData);
    showSuccess("Resume generated successfully!");

    if (downloadBtn) downloadBtn.classList.remove("hidden");
    if (downloadDocxBtn) downloadDocxBtn.classList.remove("hidden");
    if (copyBtn) copyBtn.classList.remove("hidden");
  } catch (error) {
    console.error("✗ API error:", error.message);
    showError(error.message || "Failed to generate resume");
  } finally {
    // ✅ 100% safe cleanup
    isGenerating = false;
    if (generateBtn) generateBtn.disabled = false;
    if (btnText && btnText.style) btnText.style.display = "inline";
    if (spinner && spinner.classList) spinner.classList.add("hidden");
  }
}

// === FETCH WITH RETRY ===
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠ Retry ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// === DISPLAY RESUME PREVIEW ===
function displayResume(data) {
  if (!resumePreview) return;
  try {
    let html = `<div class="resume-header"><h2>${escapeHtml(data.name || "Name")}</h2>`;
    if (data.email || data.phone) {
      html += `<p>${escapeHtml(data.email || "")}${
        data.phone ? " | " + escapeHtml(data.phone) : ""
      }</p>`;
    }
    html += "</div>";

    if (data.professional_summary)
      html += `<h3>Professional Summary</h3><p>${escapeHtml(
        data.professional_summary
      )}</p>`;
    if (data.education)
      html += `<h3>Education</h3><p>${escapeHtml(formatField(data.education))}</p>`;
    if (data.skills)
      html += `<h3>Skills</h3><p>${escapeHtml(formatField(data.skills))}</p>`;
    if (data.experience)
      html += `<h3>Experience</h3><p>${escapeHtml(formatField(data.experience))}</p>`;
    if (data.projects)
      html += `<h3>Projects</h3><p>${escapeHtml(formatField(data.projects))}</p>`;
    if (data.achievements)
      html += `<h3>Achievements</h3><p>${escapeHtml(
        formatField(data.achievements)
      )}</p>`;

    resumePreview.innerHTML = html;
  } catch (err) {
    resumePreview.innerHTML =
      "<p style='color:#dc3545;'>Error displaying resume.</p>";
  }
}

function formatField(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return Object.values(value).join(", ");
  return value;
}

// === DOWNLOAD PDF ===
async function downloadPDF() {
  try {
    if (!currentResumeData) {
      showError("No resume data available");
      return;
    }

    const response = await fetch(`${API_URL}/download-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentResumeData),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to generate PDF: ${err}`);
    }

    // convert blob to downloadable file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentResumeData.name || "Resume"}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("✗ PDF download error:", error.message);
    showError("Failed to generate PDF");
  }
}

// === DOWNLOAD WORD ===

downloadDocxBtn.addEventListener("click", downloadDOCX);

async function downloadDOCX() {
  try {
    if (!currentResumeData) return showError("No resume data available");
    const response = await fetch(`${API_URL}/download-docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentResumeData),
    });
    if (!response.ok) throw new Error("Failed to generate DOCX");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "resume.docx";
    link.click();
  } catch (e) {
    console.error("✗ DOCX download error:", e.message);
    showError("Failed to generate Word document.");
  }
}


// === COPY TO CLIPBOARD ===
async function copyToClipboard() {
  try {
    if (!currentResumeData) return showError("No resume data available");
    await navigator.clipboard.writeText(JSON.stringify(currentResumeData, null, 2));
    showSuccess("Resume copied to clipboard!");
  } catch (error) {
    console.error("✗ Clipboard error:", error.message);
    showError("Failed to copy to clipboard.");
  }
}

// === UTILITY HELPERS ===
function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
function showError(msg) {
  if (!errorMessage) return;
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hidden");
  if (successMessage) successMessage.classList.add("hidden");
}
function showSuccess(msg) {
  if (!successMessage) return;
  successMessage.textContent = msg;
  successMessage.classList.remove("hidden");
  if (errorMessage) errorMessage.classList.add("hidden");
}
function clearMessages() {
  if (errorMessage) errorMessage.classList.add("hidden");
  if (successMessage) successMessage.classList.add("hidden");
}

console.log("🎉 ResumeCraft initialized successfully!");
