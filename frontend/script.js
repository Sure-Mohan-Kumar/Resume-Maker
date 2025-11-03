const API_URL = "https://resume-maker-91k6.onrender.com/api";

const resumePrompt = document.getElementById("resumePrompt");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const downloadWordBtn = document.getElementById("downloadWordBtn");
const copyBtn = document.getElementById("copyBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const jsonOutput = document.getElementById("jsonOutput");
const outputButtons = document.getElementById("outputButtons");

let currentResumeData = null;

generateBtn.addEventListener("click", async () => {
  const prompt = resumePrompt.value.trim();
  if (prompt.length < 50) return showError("Please enter at least 50 characters.");

  clearMessages();
  toggleLoading(true);

  try {
    const res = await fetch(`${API_URL}/generate-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Generation failed.");

    currentResumeData = data.data;
    displayJSON(currentResumeData);
    showSuccess("✅ Resume JSON generated successfully!");
    outputButtons.classList.remove("hidden");
  } catch (err) {
    showError(err.message || "Something went wrong.");
  } finally {
    toggleLoading(false);
  }
});

function displayJSON(data) {
  jsonOutput.classList.remove("hidden");
  jsonOutput.textContent = JSON.stringify(data, null, 2);
}

function toggleLoading(show) {
  loadingOverlay.classList.toggle("hidden", !show);
  generateBtn.disabled = show;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.remove("hidden");
  successMessage.classList.add("hidden");
}

function showSuccess(msg) {
  successMessage.textContent = msg;
  successMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
}

function clearMessages() {
  errorMessage.classList.add("hidden");
  successMessage.classList.add("hidden");
}

/* Copy JSON */
copyBtn.addEventListener("click", async () => {
  if (!currentResumeData) return showError("No data to copy.");
  await navigator.clipboard.writeText(JSON.stringify(currentResumeData, null, 2));
  showSuccess("Copied JSON to clipboard!");
});

/* Download PDF */
downloadBtn.addEventListener("click", async () => {
  if (!currentResumeData) return showError("Generate first!");
  const response = await fetch(`${API_URL}/download-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentResumeData),
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.pdf";
  a.click();
});

/* Download DOCX */
downloadWordBtn.addEventListener("click", async () => {
  if (!currentResumeData) return showError("Generate first!");
  const response = await fetch(`${API_URL}/download-docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentResumeData),
  });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.docx";
  a.click();
});
