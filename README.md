<p align="center">
  <img src="public/images/DABanner.png" alt="Debate Arena Banner" width="100%" />
</p>

<h1 align="center">AI Debate Arena</h1>

<p align="center">
  <strong>Challenge AI to a live structured debate on any topic.</strong><br/>
  Real-time streaming arguments · Logical fallacy detection · AI judge scoring
</p>

<p align="center">
  <a href="https://debateaii.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-debateaii.vercel.app-f59e0b?style=for-the-badge&logo=vercel&logoColor=black" alt="Live Demo" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  &nbsp;
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-f97316?style=for-the-badge" alt="Groq" />
</p>

---

## What is it?

**AI Debate Arena** is a real-time debate platform where you go head-to-head against an AI opponent on any topic you choose. Pick your side, make your argument, and watch the AI fire back token-by-token. Every message is silently analyzed for logical fallacies in the background, and when you're done — an impartial AI judge scores both sides and declares a winner.

---

## Features

- **⚡ Live Streaming Debates** — AI responses stream token-by-token using Groq's ultra-fast inference (200+ tokens/sec). No waiting, no loading spinners — just live arguments appearing in real time.

- **🧠 Logical Fallacy Detection** — Every argument (yours and the AI's) is automatically analyzed for fallacies like straw man, ad hominem, slippery slope, and 7 more. Fallacy badges appear directly on messages with hover explanations.

- **⚖️ AI Judge Verdict** — After 4+ exchanges, request a verdict. An impartial AI judge scores both sides 0–100, lists strengths and weaknesses, penalizes fallacies, and identifies the key turning point of the debate.

- **🎨 Dark Arena UI** — Purpose-built debate interface with FOR (blue) vs AGAINST (red) visual language, a slide-in fallacy panel, streaming cursor animation, and a full verdict screen with score bars.

- **📱 Fully Responsive** — Works on mobile, tablet, and desktop.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| AI Inference | [Groq API](https://groq.com) — `llama-3.3-70b-versatile` |
| Streaming | Edge Runtime + ReadableStream SSE |
| Deployment | Vercel |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client                          │
│  SetupScreen    DebateArena      VerdictScreen      │
│  topic/side     stream + chat    scores + winner    │
└────────────┬────────────┬───────────────────────────┘
             │            │
    ┌─────────▼──────┐  ┌─▼────────────┐  ┌──────────────┐
    │  /api/debate   │  │ /api/analyze │  │ /api/verdict │
    │ Streaming SSE  │  │ Fallacy JSON │  │  Score JSON  │
    └─────────┬──────┘  └─────┬────────┘  └──────┬───────┘
              │               │                   │
              └───────────────▼───────────────────┘
                         Groq API
                   llama-3.3-70b-versatile
```

- **`/api/debate`** — Edge streaming route. Builds a debate system prompt with side/topic context, pipes Groq SSE directly to the client.
- **`/api/analyze`** — JSON mode. Runs fallacy detection silently after each message. Fire-and-forget so it never blocks the debate.
- **`/api/verdict`** — JSON mode. Receives full transcript + fallacy data, returns scored verdict with winner, strengths, weaknesses, and key moment.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/ShakibCodes/debate.git
cd debate

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the arena.

---

## Project Structure

```
debate-arena/
├── app/
│   ├── globals.css              # Tailwind v4 theme + animations
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Screen router (setup → arena → verdict)
│   └── api/
│       ├── debate/route.ts      # Streaming debate endpoint
│       ├── analyze/route.ts     # Fallacy detection endpoint
│       └── verdict/route.ts     # Scoring endpoint
├── components/
│   ├── SetupScreen.tsx          # Topic input + side picker
│   ├── DebateArena.tsx          # Live debate chat UI
│   ├── MessageBubble.tsx        # Message + fallacy badges
│   ├── FallacyPanel.tsx         # Slide-in fallacy overview
│   └── VerdictScreen.tsx        # Final scores + winner
├── hooks/
│   └── useDebate.ts             # Central state machine
├── lib/
│   ├── groq.ts                  # Groq API client (stream + JSON)
│   └── prompts.ts               # All system/user prompts
└── types/
    └── debate.ts                # TypeScript types
```

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Then add environment variables in your [Vercel dashboard](https://vercel.com) under **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Redeploy after saving the variables.

---

## Fallacies Detected

The platform detects 10 logical fallacies in real time:

| Fallacy | Description |
|---|---|
| Ad Hominem | Attacking the person instead of the argument |
| Straw Man | Misrepresenting the opponent's position |
| False Dichotomy | Presenting only two options when more exist |
| Slippery Slope | Assuming one event leads to extreme consequences |
| Appeal to Authority | Using authority as evidence without support |
| Hasty Generalization | Drawing broad conclusions from limited examples |
| Red Herring | Introducing irrelevant information to distract |
| Circular Reasoning | Using the conclusion as a premise |
| Appeal to Emotion | Manipulating emotions instead of using logic |
| Bandwagon | Arguing something is true because many believe it |

Each is rated **low / medium / high** severity and penalized in the final verdict score.

---

## License

MIT — free to use, modify, and deploy.

---

<p align="center">
  Built with Next.js · Powered by Groq · Deployed on Vercel
</p>