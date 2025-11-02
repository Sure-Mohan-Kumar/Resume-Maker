# 🧠 ResumeCraft — AI-Powered Resume Generator
---
##
ResumeCraft is a full-stack application that generates professional resumes using **Google Gemini AI**. 
It features a modern glassmorphic UI and provides resume downloads in both **PDF** and **Word (DOCX)** formats.
##
---
## 🚀 Features
- ⚡ AI-powered resume content generation using Google Gemini API
- 🧾 Download resumes as **PDF** or **DOCX**
- 💎 Modern glassmorphism UI for clean and elegant design
- 🧠 Smart resume formatting and validation
- 🔐 Secure backend with rate limiting and CORS
- ☁️ Deployable on Render (backend) and Vercel (frontend)
---
## 🏗️ Tech Stack
### Frontend
- HTML5, CSS3 (Glassmorphism UI)
- JavaScript (Vanilla JS)
- html2pdf.js for PDF generation

### Backend
- Node.js with Express
- @google/generative-ai (Gemini API)
- pdfkit and docx for document creation

---
## ⚙️ Installation
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/ResumeCraft.git
cd ResumeCraft
```
### 2️⃣ Install Dependencies
```bash
cd backend
npm install
```
### 3️⃣ Add Environment Variables
Create a `.env` file inside the **backend** folder:

```
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=30
```

### 4️⃣ Run the Server Locally
```bash
npm run dev
```
Visit: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deployment

### Backend (Render)
- Push your code to GitHub.
- Create a **Render Web Service**.
- Set the environment variables under “Environment” tab.
- Render automatically deploys on every GitHub push.

### Frontend (Vercel or GitHub Pages)
- Upload the `frontend` folder.
- Set API URL in `script.js`:
  ```js
  const API_URL = "https://your-backend-url.onrender.com/api";
  ```

---

## 🖼️ UI Preview
The modern **Glassmorphic ResumeCraft** interface provides an elegant and smooth experience for users generating their resumes.

---


## 📜 License
MIT License © 2025 ResumeCraft
