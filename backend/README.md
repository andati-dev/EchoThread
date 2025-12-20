# Backend (Express + TypeScript + Prisma)

- Start postgres locally (recommended): `docker compose up -d`
- Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`
- Install deps: `npm install`
- Generate Prisma client: `npx prisma generate`
- Run migrations (after Postgres is available): `npx prisma migrate dev --name init`
- To apply subsequent schema changes (e.g., comment votes): `npx prisma migrate dev --name add-comment-votes`

## API (developer)

- POST `/auth/register` { email, name?, password } → { token }
- POST `/auth/login` { email, password } → { token }
- GET `/auth/me` (Bearer token) → { user }

- POST `/posts` (Bearer token) { title, content? } → create post
- GET `/posts` → list posts (query: page, limit)
- GET `/posts/:id` → single post with nested comments
- POST `/posts/:id/vote` (Bearer token) { value: 1|-1 } → upvote/downvote post. Response: `{ score, userVote }` where `userVote` is the calling user's vote value (1|-1|0).
- POST `/posts/:id/comments` (Bearer token) { content, parentId? } → create nested comment
- POST `/comments/:id/vote` (Bearer token) { value: 1|-1 } → upvote/downvote comment. Response: `{ score, userVote }` where `userVote` is the calling user's vote value.

Notes: `GET /posts` and `GET /posts/:id` support optional authentication — when a valid token is provided the response includes `userVote` for each post and comment to allow the frontend to render the active vote state.- Start dev server: `npm run dev`

> Note: If Docker is not installed on your machine, you can provide a PostgreSQL URL to `DATABASE_URL` (hosted or local DB) and then run the migration command. In this environment Docker was not available to start Postgres automatically, so `prisma migrate` will fail until a reachable DB is running.
