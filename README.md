# Reddit Clone (Portfolio)

A Reddit-style full-stack web app built as a portfolio project.

Stack
- Frontend: React (Vite) + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL

Phases
1. Scaffold repo and Docker Compose
2. Backend: Prisma schema, auth (JWT), APIs
3. Frontend: Vite + React + auth, posts, comments, votes UI
4. Tests, CI, docs, deploy

Run (overview)
- Start PostgreSQL: `docker compose up -d`
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`

Next: I will initialize the backend dependencies and wire up Prisma.