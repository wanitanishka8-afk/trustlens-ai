# TrustLens AI 🛡️
> **See the Risk Before You Trust.**
> A full-stack, AI-powered cybersecurity platform that analyzes suspicious messages, emails, scholarship announcements, job offers, payment requests, and suspicious links to detect fraud and social engineering tactics.

---

## 🌟 Overview

**TrustLens AI** is designed to empower everyday users and security teams to evaluate suspicious communications before falling victim to scams. It inspects submitted text, flags specific warning signs, extracts real evidence snippets, calculates risk scores (0–100), and provides actionable defensive recommendations.

TrustLens AI employs a **Dual-Layer Analysis Engine**:
1. **Layer 1: Deterministic Risk Engine**: Fast, local pattern-matching evaluating 7 core threat categories (credentials, advance fees, urgency, unrealistic earnings, brand impersonation, link obfuscation, and channel shifting) with sub-additive scoring and critical synergy floors.
2. **Layer 2: Google Gemini AI Analysis**: Contextual, cognitive assessment using the official `@google/genai` SDK (`gemini-3.8-flash`) to detect psychological manipulation, pretexting, and subtle fraud cues.
3. **Graceful Degradation**: If `GEMINI_API_KEY` is not configured or the network is unavailable, TrustLens AI automatically and transparently operates in **"Local rules-only analysis"** mode without fabricating AI results.

> [!NOTE]
> **Advisory Nature**: TrustLens AI provides probabilistic risk assessments and threat heuristics. It does not provide absolute legal verdicts or guarantees of safety.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite | Responsive cybersecurity dashboard with dark navy theme, SVG Risk Meter, and real-time validation. |
| **Styling** | Modern CSS | Dark navy theme (`#070A13`), violet & blue cyber accents, rounded cards, accessible contrast, smooth transitions. |
| **Backend** | Node.js + Express + TypeScript | RESTful API with Helmet security headers, rate limiting, and safe logging. |
| **AI Engine** | Google Gemini API (`@google/genai`) | Official SDK utilizing `gemini-3.8-flash` with strict structured JSON output validation. |
| **Persistence** | SQLite (`node:sqlite`) | Lightweight, zero-dependency local database for history with in-memory fallback. |
| **Validation** | Zod | Strict input length validation and response schema verification. |
| **Testing** | Vitest + Supertest | Automated unit and integration test suite covering rules, fallback, history, and API routes. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or v22+ (tested on Node v22.14.0)
- **npm**: v10+

### 2. Installation
Clone the repository and install all dependencies:
```bash
# Install root orchestration dependencies
npm install

# Install server and client dependencies
npm run install:all
```
*(Alternatively, run `npm install` inside both the `server` and `client` directories).*

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Open `.env` and configure your settings:
```env
# Server Port
PORT=3001

# Node Environment
NODE_ENV=development

# Google Gemini API Key (Backend-only. Get yours at https://aistudio.google.com/)
# If left blank, TrustLens AI will operate in "Local rules-only analysis" mode.
GEMINI_API_KEY=your_actual_gemini_api_key_here

# SQLite Database Location
DATABASE_PATH=./data/trustlens.db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=60
```

> [!IMPORTANT]
> The `GEMINI_API_KEY` is kept exclusively on the backend. It is never exposed in client bundles, browser network requests, or version control (`.env` is in `.gitignore`).

### 4. Start Development Servers
Run frontend and backend concurrently with a single command:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### 5. Build for Production
To compile both the server TypeScript code and the Vite React frontend:
```bash
npm run build
```
This produces:
- `server/dist/`: Compiled Node.js backend.
- `client/dist/`: Optimized production frontend bundle.

### 6. Run Production Server
Start the production server:
```bash
npm start
```
The server will start on port `3001` and automatically serve both the `/api/*` endpoints and the frontend SPA from `http://localhost:3001`.

---

## 🧪 Automated Testing

TrustLens AI includes a complete automated test suite with 27 unit and integration tests:

To run all automated tests:
```bash
npm test
```

### Tested Test Suites:
- `server/tests/deterministic.test.ts`:
  - Critical credential and OTP harvesting detection.
  - Advance-fee / upfront payment scam detection.
  - Unrealistic remote job offers with private Telegram shift.
  - Scholarship notifications with unverified grant awards and suspicious TLDs.
  - Harmless, benign message evaluation (ensuring Low risk).
  - Score bounds clamping (0–100) and sub-additive keyword saturation.
- `server/tests/gemini.test.ts`:
  - Missing or placeholder API key fallback handling.
  - Structured output validation with Zod schemas.
  - Rejection of malformed schema output.
- `server/tests/combiner.test.ts`:
  - Multi-engine consensus and divergence notes.
  - Transparent "Local rules-only analysis" reporting.
  - Discrepancy analysis when rules vs. AI scores differ.
- `server/tests/history.test.ts`:
  - Saving analysis reports into SQLite persistence.
  - Chronological descending history listing with safely truncated snippets.
  - Single report retrieval and individual record deletion.
- `server/tests/api.test.ts`:
  - `GET /api/health` — live health status and metadata.
  - `POST /api/analyze` — input validation (< 5 chars, > 10,000 chars, empty strings).
  - Malicious input containment (XSS script tags treated as untrusted text, never executed).
  - History CRUD endpoints (`GET /api/history`, `GET /api/history/:id`, `DELETE /api/history/:id`).

---

## 🔍 How Analysis Works

### Threat Vector Detection Matrix

| Category | Typical Scam Indicators | Why It Matters |
| :--- | :--- | :--- |
| **1. Credential Harvesting** | Requests for OTP, password, PIN, CVV, SSN | Legitimate banks and services never ask for authentication codes or passwords. |
| **2. Advance-Fee Fraud** | "Refundable deposit", "processing fee", gift cards, crypto | Legitimate employers, lottery winnings, and grants never require upfront fees. |
| **3. Artificial Urgency** | "Account suspended in 2 hours", "immediate action required" | Fabricated deadlines induce panic and suppress careful human verification. |
| **4. Exaggerated Promises** | "$650/day no experience", "selected for $15,000 grant" | Outlandish financial gains disarm critical thinking. |
| **5. Brand Impersonation** | Claims to be PayPal, Amazon Security, IRS, FedEx, Banks | Pretexting as trusted institutions creates false authority. |
| **6. Suspicious URLs** | URL shorteners (bit.ly), raw IP addresses, `.xyz`, `.top` | Obfuscates real destinations and leads to credential-stealing portals. |
| **7. Channel Shifting** | "Contact recruiter on Telegram @...", "DM on WhatsApp" | Lures targets off protected corporate platforms onto unmonitored channels. |

### Scoring & Synergy Algorithm
Each matched rule contributes an initial score with sub-additive dampening for duplicate keywords in the same rule. Categories are accumulated sub-additively. A **Critical Synergy Floor** applies when high-risk pairs are detected:
- Credential Harvesting + Artificial Urgency / Brand Impersonation: **Floor = 85 (Critical)**
- Advance Fee + Urgency / Impersonation: **Floor = 75 (High to Critical)**
- Credential Harvesting alone: **Floor = 65 (High)**
- Final deterministic score is bounded: $\text{score} \in [0, 100]$.

When Gemini is active, the overall score is computed as a weighted blend ($45\%$ deterministic $+ 55\%$ Gemini), ensuring critical safety floors are respected.

---

## 🔒 Security & Privacy Directives

1. **Untrusted Data Isolation**: All submitted messages and URLs are treated strictly as untrusted text strings. URLs are **never** visited, scraped, or crawled automatically.
2. **Zero Code Execution**: Submitted scripts, HTML tags, or attachments are never evaluated or injected into the DOM.
3. **Privacy Protection**: The logging middleware masks submitted message contents (`safeLogger`) so full message texts are never written to operational logs.
4. **Data Minimization**: History saves only necessary metadata and the truncated snippet; no personal identifier tracking or cookies are used.
5. **Security Headers**: Configured with `helmet` Content Security Policy, X-Content-Type-Options, and frame restrictions.
6. **Rate Limiting**: Protects backend endpoints against brute-force spam or resource exhaustion.

---

## 📡 API Reference

### Health Check
- **`GET /api/health`**
- Returns backend operational status, uptime, database connectivity, and whether Gemini is enabled.

### Analyze Content
- **`POST /api/analyze`**
- Request Body:
  ```json
  {
    "content": "Text of suspicious email or message..."
  }
  ```
- Returns complete `AnalysisReport` JSON with `overallScore`, `overallRiskLevel`, `deterministic` breakdown, `gemini` breakdown, `combinedWarningSigns`, `recommendedNextSteps`, and `limitationsAndCaveats`.

### History Endpoints
- **`GET /api/history`**: Returns list of recent analyses with score, risk level, timestamp, and snippet.
- **`GET /api/history/:id`**: Returns full analysis report for a specific record.
- **`DELETE /api/history/:id`**: Deletes a specific analysis record from the local database.

---

## 📜 License
MIT License. Created for TrustLens AI.
