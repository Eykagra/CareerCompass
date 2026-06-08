<div align="center">

# 🧭 CareerCompass

### AI career-path generator + mentor

Tell it your goal and where you are today. Get a personalized, **branching** career roadmap — and an **AI mentor** that explains every step and adapts the plan as your life changes.

Built with **Next.js 14** · **TypeScript** · **Tailwind** · **React Flow** · provider-agnostic LLM layer (**Gemini / NVIDIA NIM / Mistral AI / AWS Bedrock**)

</div>

---

## ✨ Features

- **Branching roadmaps** — real decision forks, not a flat checklist, rendered as an interactive node-and-arrow canvas.
- **Starts where you are** — a quick intake (stage, skills, time, budget, timeline) tailors the plan to your real starting point.
- **AI mentor** — chat that knows your roadmap and re-routes it live.
- **Progress tracking** — mark steps complete and watch your progress update. Saved to your account.
- **Saved maps & dashboard** — every roadmap is stored in a database, with a dashboard to open, export, or delete them. Free plan keeps up to **3 maps**.
- **Export** — download any roadmap as JSON.
- **Premium, animated UI** — aurora gradients, glassmorphism, scroll reveals, fully responsive.
- **Provider-agnostic** — swap between Gemini, NVIDIA NIM, or AWS Bedrock with one env var. **Runs in demo mode with no key at all.**
- **Production-ready** — multi-stage Docker build using Next.js `standalone` output. Deploy on EC2 in minutes.

## 🏗️ Architecture

```
Browser (Next.js App Router, React Flow, Tailwind)
        │  fetch
        ▼
/api/roadmap     /api/mentor     /api/intake     /api/maps     /api/health
        │
        ▼
LLM provider abstraction  (src/lib/llm)        SQLite (src/lib/db.ts)
  ├── Gemini      (REST)                          └── saved maps, per-user,
  ├── NVIDIA NIM  (OpenAI-compatible REST)            free limit of 3
  ├── Mistral AI  (OpenAI-compatible REST)
  ├── Bedrock     (AWS SDK, optional dependency)
  └── demo        (built-in sample roadmap, no key needed)
```

Saved roadmaps persist in a SQLite database (mount `DATA_DIR` as a volume in production). The mentor chat and in-progress session still use `localStorage` for instant restore.

## 🚀 Quick start (local)

```bash
npm install
cp .env.example .env   # optional — app works in demo mode without keys
npm run dev            # http://localhost:3000
```

## 🔑 Choosing an LLM provider

Set keys in `.env`. With **no keys**, CareerCompass serves a curated demo roadmap so it is always presentable.

| Provider | Env vars | Notes |
| --- | --- | --- |
| **Gemini** | `GEMINI_API_KEY`, `GEMINI_MODEL` | Free tier at [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **NVIDIA NIM** | `NVIDIA_API_KEY`, `NVIDIA_MODEL` | OpenAI-compatible, free tier at [build.nvidia.com](https://build.nvidia.com) |
| **Mistral AI** | `MISTRAL_API_KEY`, `MISTRAL_MODEL` | Fast and reliable at [console.mistral.ai](https://console.mistral.ai) |
| **AWS Bedrock** | `BEDROCK_MODEL_ID`, `AWS_REGION` | Uses IAM role on EC2 — ideal with AWS Activate credits |

Force a provider with `LLM_PROVIDER=gemini|nvidia|mistral|bedrock|demo`, or leave it unset to auto-detect.

### Performance Tips

- **Faster models**: Use `mistral-small-latest` or `gemini-1.5-flash` for quicker responses (5-15s vs 30-60s)
- **Token limits**: Reduced to 2500 tokens by default for optimal speed
- **Timeout handling**: All providers include 55-second timeouts to prevent gateway errors
- **JSON repair**: Automatic detection and repair of truncated JSON responses

## 🐳 Run with Docker

```bash
docker compose up --build -d   # http://localhost:3000
```

or plain Docker:

```bash
docker build -t career-compass .
docker run -p 3000:3000 --env-file .env career-compass
```

## ☁️ Deploy on AWS EC2

1. **Launch** an EC2 instance (Amazon Linux 2023, t3.small or larger). Open port **3000** (or 80 behind a proxy) in the security group.
2. **Install Docker:**
   ```bash
   sudo yum install -y docker
   sudo systemctl enable --now docker
   sudo usermod -aG docker ec2-user   # re-login after this
   # Docker Compose plugin
   sudo mkdir -p /usr/local/lib/docker/cli-plugins
   sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
     -o /usr/local/lib/docker/cli-plugins/docker-compose
   sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
   ```
3. **Copy the project** to the instance (git clone or `scp`), then:
   ```bash
   cd career-compass
   cp .env.example .env && nano .env    # add your key (or leave for demo mode)
   docker compose up --build -d
   ```
4. Visit `http://<EC2_PUBLIC_IP>:3000`.

### Using Bedrock on EC2 (recommended for AWS credits)
Attach an **IAM role** to the instance with `bedrock:InvokeModel` permission and set `LLM_PROVIDER=bedrock`. No API keys to manage — the AWS SDK picks up the role automatically.

> **Tip:** For a real domain + HTTPS, put Nginx or an Application Load Balancer in front of port 3000.

## 📂 Project structure

```
src/
  app/
    page.tsx              # premium animated landing page
    app/page.tsx          # the product (intake → roadmap → mentor)
    api/                  # roadmap, mentor, intake, health routes
  components/
    landing/              # Navbar, Hero, Sections, Footer
    app/                  # IntakeForm, RoadmapCanvas, NodeDetail, MentorChat, Workspace
    ui/                   # Button, Badge, Reveal, AuroraBackground
  lib/
    llm/                  # provider abstraction (gemini, nvidia, bedrock, demo)
    schema.ts             # zod schemas (single source of truth)
    layout.ts             # roadmap graph → positioned nodes/edges
    storage.ts            # localStorage persistence
```

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run typecheck` | Type-check with `tsc` |

---

Made for builders who want a clear path forward. 🧭

## 🔐 Authentication (Google sign-in)

The product workspace (`/app`) is gated behind sign-in. Auth is handled by **Auth.js (NextAuth v5)** with a **"Continue with Google"** flow and a **JWT session** — no database required.

### Set up a Google OAuth client
1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. **Create credentials → OAuth client ID → Web application.**
3. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<your-domain>/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret** into `.env`.

### Required env vars

| Var | Notes |
| --- | --- |
| `AUTH_SECRET` | Required. Generate: `openssl rand -base64 33` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_URL` | Public URL in production (e.g. `https://your-domain.com`) |
| `AUTH_TRUST_HOST` | Set `true` when self-hosting behind a proxy/EC2 |

> On EC2 behind Nginx/ALB, make sure `AUTH_URL` matches the public HTTPS URL and that the same URL's `/api/auth/callback/google` is whitelisted in Google Cloud.
