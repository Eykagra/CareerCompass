<div align="center">

# 🧭 CareerCompass

### AI career-path generator + mentor

Tell it your goal and where you are today. Get a personalized, **branching** career roadmap — and an **AI mentor** that explains every step and adapts the plan as your life changes.

Built with **React / Vite** · **FastAPI (Python 3.11)** · **Tailwind CSS** · **XYFlow (React Flow)** · provider-agnostic LLM layer (**Gemini / NVIDIA NIM / Mistral AI / AWS Bedrock**)

</div>

---

## ✨ Features

- **Branching roadmaps** — real decision forks, not a flat checklist, rendered as an interactive node-and-arrow canvas using **XYFlow**.
- **Starts where you are** — intake (stage, skills, time, budget, timeline) tailors the plan to your real starting point, supporting both a guided form and **free-text AI intake**.
- **AI mentor** — chatbot that knows your roadmap context, explains steps, and recommends resources.
- **Progress tracking** — mark nodes as complete and persist your path progression.
- **Saved maps & dashboard** — roadmaps are stored in a SQLite database with a personal dashboard to open, manage, or delete them. Free plan keeps up to **3 maps**.
- **Premium, animated UI** — features Aurora backgrounds, custom animations (Framer Motion), glassmorphism, and responsive layouts.
- **Provider-agnostic LLM Layer** — swap between Gemini, NVIDIA NIM, Mistral AI, or AWS Bedrock with a single environment variable. **Runs in demo mode with no keys at all.**
- **Production-ready** — multi-stage Docker build that compiles the Vite frontend and packages it inside the FastAPI backend.

---

## 🏗️ Architecture

```
                       ┌───────────────────────────────────────┐
                       │   Browser (Vite + React + Tailwind)   │
                       └───────────────────┬───────────────────┘
                                           │
                                           │  HTTP /api/
                                           ▼
                       ┌───────────────────────────────────────┐
                       │          FastAPI App Server           │
                       └─────┬───────────────────────────┬─────┘
                             │                           │
                             ▼                           ▼
              ┌─────────────────────────────┐     ┌─────────────┐
              │    LLM Provider Service     │     │ SQLite DB   │
              │  (Gemini, NVIDIA, Mistral,  │     │ (db.py via  │
              │      Bedrock, or Demo)      │     │  sqlite3)   │
              └─────────────────────────────┘     └─────────────┘
```

The application is structured as a client-server architecture:
1. **Frontend (`/frontend`)**: A React Single Page Application (SPA) powered by Vite, Tailwind CSS, Framer Motion, and XYFlow. It proxies all API calls (`/api/*`) to the backend during development.
2. **Backend (`/backend`)**: A FastAPI web server that handles:
   - **Authentication**: Custom Google OAuth 2.0 flow yielding HttpOnly JWT session cookies.
   - **Roadmap Generation**: Interactive node/edge generation via structured prompts and LLM validation.
   - **AI Mentor**: Chat sessions referencing user profiles and current roadmap structures.
   - **Persistence**: Saved roadmaps, progress, and user mappings in a SQLite database.

---

## 🚀 Quick Start (Local Development)

To run the application locally, you will spin up the FastAPI backend and the Vite frontend separately.

### 1. Clone & Setup Backend
Make sure you have Python 3.11+ installed.
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on http://localhost:8000)
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend
Make sure you have Node.js 20+ installed.
```bash
cd frontend
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server is preconfigured to proxy `/api` calls to the FastAPI backend running on port `8000`.

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory. You can copy the template from `.env.example`:

```bash
cp .env.example .env
```

### LLM Provider Selection
Set `LLM_PROVIDER` to force a specific provider, or leave it blank to auto-detect based on the keys provided (defaults to `demo` if no keys are found).

| Provider | `LLM_PROVIDER` | Keys / Env Vars | Description |
| --- | --- | --- | --- |
| **Gemini** | `gemini` | `GEMINI_API_KEY`, `GEMINI_MODEL` | Free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **NVIDIA NIM** | `nvidia` | `NVIDIA_API_KEY`, `NVIDIA_MODEL`, `NVIDIA_BASE_URL` | Free credits available at [NVIDIA Build](https://build.nvidia.com) |
| **Mistral AI** | `mistral` | `MISTRAL_API_KEY`, `MISTRAL_MODEL`, `MISTRAL_BASE_URL` | Fast API model tier at [Mistral Console](https://console.mistral.ai) |
| **AWS Bedrock** | `bedrock` | `BEDROCK_MODEL_ID`, `AWS_REGION` | Uses standard AWS credentials / IAM roles |
| **Demo** | `demo` | None | Uses mock data structures (useful for presentation/no keys) |

### Authentication (Google Sign-In)
The dashboard and saved maps feature are gated behind Google OAuth 2.0.

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create **OAuth 2.0 Client Credentials** (Web Application).
3. Set the **Authorized Redirect URI** to:
   - Development: `http://localhost:5173/api/auth/callback/google` (proxies to backend)
   - Production/Docker: `http://<your-domain-or-ip>:3000/api/auth/callback/google`
4. Set the following keys in your `.env` file:
   - `AUTH_GOOGLE_ID`: Google OAuth client ID.
   - `AUTH_GOOGLE_SECRET`: Google OAuth client secret.
   - `AUTH_SECRET`: Random string for JWT signing (e.g. generated via `openssl rand -base64 33`).
   - `AUTH_URL`: Set to `http://localhost:5173` in development so Google redirects correctly and the session cookie is saved to your dev origin.

### Database Persistence
- `DATA_DIR`: Folder path where SQLite will create the `careercompass.db` database. Defaults to `./backend/data`.
- `DATABASE_PATH`: (Optional) Override path pointing directly to a specific SQLite file.

---

## 🐳 Docker Setup (Production Mode)

A multi-stage `Dockerfile` is provided at the root of the project. It:
1. Builds the React/Vite production bundle.
2. Packages the compiled assets inside a slim Python environment.
3. Serves both static assets and API endpoints together on port `3000`.

To run using **Docker Compose**:
```bash
docker compose up --build -d
```
The app will be accessible at [http://localhost:3000](http://localhost:3000).

Or with raw **Docker**:
```bash
docker build -t career-compass .
docker run -d -p 3000:3000 --env-file .env -v careercompass_data:/app/backend/data career-compass
```

---

## 📂 Project Structure

```
├── backend/                  # FastAPI Application
│   ├── llm/                  # Provider abstractions (Gemini, NVIDIA, Mistral, Bedrock, Demo)
│   ├── data/                 # Local SQLite database files
│   ├── db.py                 # SQLite database initialization & queries
│   ├── main.py               # Main FastAPI entry points, routes, and StaticFiles mount
│   ├── requirements.txt      # Python dependencies
│   ├── schemas.py            # Pydantic schemas (validations)
│   └── sample.py             # Mock data for Demo mode
│
├── frontend/                 # React Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── app/          # Dashboard, IntakeForm, RoadmapCanvas, MentorChat
│   │   │   ├── auth/         # SignInCard
│   │   │   ├── landing/      # Navbar, Hero, Sections, Footer
│   │   │   └── ui/           # AuroraBackground, Button, Badge, Reveal
│   │   ├── lib/              # Client API integrations (auth, maps, custom layouts)
│   │   ├── App.jsx           # Main Router and protected routes
│   │   └── main.jsx          # React entry point
│   ├── package.json          # Node dependencies & npm scripts
│   ├── tailwind.config.js    # Tailwind layout utility configurations
│   └── vite.config.js        # Vite build & proxy settings
│
├── Dockerfile                # Multi-stage production build script
├── docker-compose.yml        # Docker compose definition
└── README.md                 # Project documentation
```
