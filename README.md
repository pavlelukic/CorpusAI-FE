# CorpusAI Frontend

Frontend for a RAG-based, subject-specific AI tutor, built with React, Vite, and
TypeScript. Talks to the CorpusAI backend (Spring Boot + LangChain4j) over REST and SSE.
Developed as part of a master's thesis: *Analysis and Implementation of the LangChain4j
Library in a Java Programming Environment*.

## Tech Stack

- React 19 / Vite 8 / TypeScript
- Tailwind CSS v4 + shadcn/ui — styling and accessible components
- TanStack Query v5 — server state for subjects and quiz generation
- React Router v8 — client-side routing, with a shared route-level error boundary
- `@microsoft/fetch-event-source` — POST + SSE streaming for chat (native `EventSource`
  only supports GET)
- `react-markdown` + `remark-gfm` — markdown rendering for chat replies and flashcard
  answers
- `next-themes` — dark mode
- `sonner` — toast notifications

## Prerequisites

- Node.js 20+
- A running instance of CorpusAI-BE, reachable at the URL configured in `.env`

## Setup

**1. Clone and configure the environment**

```bash
cp .env.example .env
```

Fill in `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the backend**

This app expects CorpusAI-BE running and reachable at `VITE_API_BASE_URL`. See that
repo's README for setup — nothing here will work without it, since every page depends on
its API (subjects list, chat streaming, quiz generation).

**4. Run the dev server**

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Features

- **Home** — subject grid fetched from `GET /api/subjects`, with loading skeletons and an
  error/retry state
- **Chat** — SSE-streamed responses rendered as markdown, with a blinking cursor while a
  reply is still streaming; history is persisted to `localStorage`, scoped per subject
  *and* language, so switching languages doesn't show a wrong language conversation
- **Quiz** — generate a set of flashcards (5, 10, or 20 cards, optional topic), reviewed
  one at a time via a 3D flip card with a difficulty badge and optional source hint; ends
  on a completion screen with the choice to review the same deck again or start a new one
- **Language toggle** — EN / SR (Latin script). Locked once a chat or quiz session has
  content, so a single thread can't end up straddling two languages
- **Dark mode** — toggle in the header, persisted across visits
- **Responsive** — Completely responsive, across all three main pages

## Project Structure

```
src/
├── api/          # typed fetch wrappers — one file per backend resource
├── components/   # shared UI (AppHeader, ChatMessage, FlashCard, SubjectCard, ...)
│   └── ui/       # shadcn/ui primitives (do not hand-edit)
├── hooks/        # useSubjects, useChat, useQuiz
├── lib/          # API client, i18n, localStorage helpers, LangContext, cn util
├── pages/        # HomePage, ChatPage, QuizPage, NotFoundPage
├── router/       # React Router config, including the shared error boundary
└── types/        # TypeScript interfaces mirroring backend DTOs
```

## API Contract

This app expects three endpoints from the backend:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subjects` | List available subjects |
| `POST` | `/api/chat/{subjectId}/message` | Stream a chat response (SSE) |
| `POST` | `/api/quiz/{subjectId}/generate` | Generate flashcards |

### Chat request
```json
{
  "sessionId": "unique-session-id",
  "message": "What is the Waterfall model?",
  "lang": "en"
}
```

### Quiz request
```json
{
  "topic": "design patterns",
  "count": 5,
  "lang": "en"
}
```

`topic` and `count` are optional (defaults: no topic filter, 5 flashcards). `lang` is
`"en"` or `"sr"` and tells the backend which language to generate content in — it doesn't
translate the `difficulty` field itself, which always stays the literal `EASY` / `MEDIUM`
/ `HARD` enum value.