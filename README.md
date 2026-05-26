# Portuguese Learning Platform

A full-stack European Portuguese learning app with **AI-powered grammar feedback**, phrase browsing by category, native audio playback, flashcards, and conversation practice. Built with React, TypeScript, tRPC, Node.js, Express, and MySQL — deployed live on Railway.

## 🔴 Live Demo

**[https://portuguese-learning-production.up.railway.app](https://portuguese-learning-production.up.railway.app)**

---
### May 2026 – AI grammar feedback update

- Added an **AI-powered grammar feedback page** (`/grammar`) that gives:
  - Instant corrections for European Portuguese sentences
  - Error tags (e.g. tense, word order, agreement) with colour-coded badges
  - A detailed explanation of corrections and a follow-up practice sentence
- Wired the grammar feature to an **LLM backend** via a shared `invokeLLM` helper:
  - Normalises messages, tool calls and response formats
  - Uses a structured JSON schema for consistent outputs
- Restored the **category selector** on the grammar page so users can tag sentences (e.g. grammar / vocabulary / phrases), ready for future filtering and analytics.
  
- Confirmed the app runs end-to-end with the existing Railway MySQL database and OpenAI-compatible LLM, suitable for portfolio demos.
## ✨ AI Grammar Feedback (Featured)

The headline AI feature of this project. Available at `/grammar`.

A learner types any Portuguese sentence. The server sends it to an LLM (via a structured JSON schema prompt) and returns:

| Field | What it provides |
|---|---|
| **Corrected sentence** | The grammatically fixed version |
| **Explanation** | Plain-English summary of what changed and why |
| **Per-change breakdown** | Each individual error with original/corrected pair and reason |
| **Error tags** | Categorical labels: `article`, `tense`, `word_order`, `agreement`, `vocabulary`, `spelling`, `preposition`, `accent` |
| **Practice sentence** | A new, harder PT-PT sentence that exercises the same grammar point |

### How it works technically

```
POST /trpc/grammar.check
  input:  { sentence: string }          // user's Portuguese sentence
  output: GrammarCorrection             // typed, Zod-validated structured response
```

1. **Structured output**: The LLM is called with an `outputSchema` (JSON Schema) so the response is always a typed object — no regex parsing or hallucinated formats.
2. **Zod validation**: The raw JSON is validated at runtime with a Zod schema before being returned to the client, so TypeScript types are guaranteed end-to-end.
3. **tRPC**: The endpoint is a `publicProcedure` mutation in `server/grammar-router.ts`, wired into the main `appRouter`. The client calls it with `trpc.grammar.check.useMutation()`.
4. **European Portuguese focus**: The system prompt explicitly instructs the model to apply PT-PT grammar rules, not Brazilian Portuguese.

### Key files

```
server/grammar-router.ts           ← LLM call, outputSchema, Zod validation
client/src/pages/GrammarFeedback.tsx  ← React UI with error tag badges, diff view, practice card
client/src/App.tsx                 ← /grammar route
```

---

## Features

- **AI grammar feedback** — structured LLM analysis with error tagging and practice sentences
- Browse phrases by category (greetings, shopping, travel, food, social)
- View Portuguese phrases with English translations
- Native audio playback for pronunciation support
- Flashcard system for active recall practice
- AI-powered conversation practice
- Pronunciation recording with AI feedback
- User accounts, session management
- Admin panel for content management
- Fully responsive, mobile-friendly UI

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, Wouter |
| Backend | Node.js, Express, tRPC |
| AI | OpenAI API (structured JSON output via `outputSchema`) |
| Database | MySQL, Drizzle ORM |
| Deployment | Railway (app + MySQL service) |
| Styling | Tailwind CSS, shadcn/ui |

## Project Structure

```
.
├── client/
│   └── src/
│       ├── pages/
│       │   ├── GrammarFeedback.tsx   ← AI grammar UI
│       │   ├── ConversationPractice.tsx
│       │   ├── Flashcards.tsx
│       │   └── …
│       └── App.tsx
├── server/
│   ├── grammar-router.ts             ← AI grammar endpoint
│   ├── routers.ts                    ← main tRPC router
│   └── _core/
│       ├── llm.ts                    ← LLM abstraction layer
│       └── …
├── shared/
├── seed-db.mjs
└── package.json
```

## Local Development

### 1. Clone

```bash
git clone https://github.com/Wancing/portuguese-learning.git
cd portuguese-learning
```

### 2. Install

```bash
pnpm install
```

### 3. Environment variables

Create a `.env` file:

```env
DATABASE_URL=mysql://root:password@localhost:3306/railway
OPENAI_API_KEY=sk-…           # required for AI grammar feedback
NODE_ENV=development
PORT=5000
```

### 4. Run

```bash
pnpm dev
```

### 5. Seed the database

```bash
node seed-db.mjs
```

## Deployment (Railway)

1. Push to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add a MySQL service in the same Railway project.
4. Set environment variables (including `OPENAI_API_KEY`).
5. Generate a public Railway domain in service Settings → Networking.

### Production environment variables

```env
DATABASE_URL=your-mysql-connection-string
OPENAI_API_KEY=sk-…
NODE_ENV=production
PORT=5000
```

## Why this project matters (for recruiters)

This app demonstrates the full product engineering stack:

- **AI integration** — structured LLM outputs with runtime type validation, not just a raw chat wrapper
- **Full-stack TypeScript** — shared types from server to client via tRPC; no REST guesswork
- **Production deployment** — live on Railway with a real MySQL database, not a demo on localhost
- **Language learning domain** — a real use-case that non-technical stakeholders immediately understand
- **Tested patterns** — existing test files for phrases, auth, and flashcards

## Roadmap

- Save grammar check history per user
- Personalised exercise generation based on repeated error patterns
- Expand phrase library and category coverage
- Improve analytics and learner progress tracking

## Credits

Built by [Wancing](https://github.com/Wancing) as a portfolio project focused on full-stack development, AI integration, and language learning product design.

## License

MIT License
