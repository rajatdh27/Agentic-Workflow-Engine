# Agentic Workflow Engine

A customer support workflow engine: a fixed DAG of steps (stored in the
database) combined with AI-powered decision nodes (classify the issue, draft
a reply). Node/Express backend, React/Vite frontend, PostgreSQL.

## Setup

```bash
# 1. Create databases
createdb libra_agentic_workflow
createdb libra_agentic_workflow_test

# 2. Backend
cd backend
npm install
cp .env.example .env   # edit DATABASE_URL if needed
npm run migrate
npm run seed
npm start               # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Open `http://localhost:5173` and submit a request.

## AI provider

Set in `backend/.env`:

```
AI_PROVIDER=fake      # fake | gemini | claude | openai
AI_API_KEY=
AI_MODEL=
```

`fake` is a deterministic keyword-based client, used by default and by the
tests — no API key needed. Set `AI_PROVIDER` to `gemini`, `claude`, or
`openai` plus a real `AI_API_KEY` and `AI_MODEL` to use a real LLM.

## Tests

```bash
cd backend
npm test
```

Covers the 5 required scenarios: branching, retry, human approval,
validation failure, and idempotency (`backend/tests/*.test.js`).
