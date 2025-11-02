// backend/config/gemini.js
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate a structured resume JSON from raw user input
 */
const generateResumeContent = async (userPrompt) => {
  if (!userPrompt || typeof userPrompt !== "string") {
    throw new Error("Invalid prompt: must be a non-empty string");
  }

  console.log("📝 Sending prompt to Gemini API...");

  const systemPrompt = `
You are an expert HR recruiter and resume formatter.

Your task:
- Convert the following unstructured input into a **well-organized JSON resume**.
- The output **must be strictly valid JSON** — no markdown, no explanations.
- Fill in missing but obvious details logically.

Schema:
{
  "name": string,
  "email": string,
  "phone": string,
  "linkedin": string,
  "location": string,
  "professional_summary": string,
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "startDate": string,
      "endDate": string,
      "score": string
    }
  ],
  "skills": [string],
  "experience": [
    {
      "company": string,
      "role": string,
      "startDate": string,
      "endDate": string,
      "achievements": [string]
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "technologies": [string],
      "impact": string
    }
  ],
  "achievements": [string],
  "certifications": [string]
}

USER INPUT:
${userPrompt}

Output only valid JSON in the above schema.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
  });

  // Extract safely from Gemini response
  let text = "";

  try {
    text =
      response.output_text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";
  } catch (e) {
    console.error("⚠️ Gemini API shape changed:", e);
  }

  if (!text || !text.trim()) {
    console.error("⚠️ Gemini returned empty text:", response);
    throw new Error("Gemini returned no readable text output.");
  }

  // Clean Markdown / JSON fence if present
  const cleanText = text.replace(/```json|```/g, "").trim();

  const match = cleanText.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("⚠️ Gemini output missing JSON:", cleanText);
    throw new Error("Gemini returned invalid JSON.");
  }

  try {
    const parsed = JSON.parse(match[0]);
    console.log("✅ Parsed JSON successfully.");
    return parsed;
  } catch (err) {
    console.error("✗ JSON Parse Error:", err.message, "\nRaw Output:", cleanText);
    throw new Error("Failed to parse Gemini JSON response.");
  }
};

module.exports = { generateResumeContent };
