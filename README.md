# TSA Skills Assessment – To‑Do App

Full-stack implementation of a to-do management tool for the TSA skills assessment. The backend is a NestJS + Prisma API backed by SQLite, and the frontend is a React + Vite single page app styled with the TSA brand system.

## Project Structure

```
├── client        # React + Vite frontend (TypeScript)
├── server        # NestJS backend with Prisma + SQLite
└── package.json  # (root) placeholder – each workspace manages its own deps
```

## Tech Choices

| Layer    | Stack | Why |
|----------|-------|-----|
| Backend  | NestJS 11, Prisma 6, SQLite | Nest provides opinionated modules/validation and integrates cleanly with Prisma. SQLite keeps setup zero-config and Prisma allows easy migration/typing. |
| Frontend | React 19 + Vite + TypeScript | Fast dev server and modern tooling. React handles state (filters, modal forms) and lets us quickly implement TSA-branded UI. |
| Styling  | Plain CSS with TSA brand tokens | Keeps bundle small and mirrors brand palette directly. |

## Prerequisites

- Node.js ≥ 20 (LTS recommended)
- npm ≥ 10

Each workspace manages its own dependencies; run `npm install` inside both `server` and `client`.

## Environment Variables

| Location | Variable | Default | Purpose |
|----------|----------|---------|---------|
| `server/.env` | `DATABASE_URL` | `file:./dev.db` | Prisma SQLite connection string |
| `client/.env` | `VITE_API_BASE_URL` | `http://localhost:3000/tasks` | Base URL for API requests |

## Backend (server)

```bash
cd server
npm install
npx prisma migrate deploy     # apply schema to dev.db
npm run start:dev             # starts Nest API on http://localhost:3000
```

### Available scripts

- `npm run start:dev` – watch mode server
- `npm run test:e2e` – Jest e2e tests for the `/tasks` API
- `npm run prisma studio` (optional) – inspect the SQLite file visually

### REST API

| Method | Endpoint          | Description |
|--------|-------------------|-------------|
| GET    | `/tasks`          | List all tasks |
| POST   | `/tasks`          | Create task (`title` required, optional `description`, `status`) |
| PUT    | `/tasks/:id`      | Update task (partial updates allowed) |
| DELETE | `/tasks/:id`      | Remove task |
| GET    | `/tasks/stats`    | Status counts + completion percentage |

Validation is handled via `class-validator` DTOs and Nest pipes.

## Frontend (client)

```bash
cd client
npm install
npm run dev                  # starts Vite dev server on http://localhost:5173
```

### Features

- TSA-branded UI (color palette, loader, accent bar)
- Task table with inline status badges and edit/delete actions
- Multi-select status filter (state stored at App level; persists through edits)
- Modal edit form with keyboard escape handling
- Completion percentage indicator fed by `/tasks/stats`

To build for production: `npm run build && npm run preview`.

## Testing

Currently backend e2e tests cover CRUD validation. Run:

```bash
cd server
npm run test:e2e
```

Additional frontend tests can be added via Jest + Testing Library if needed.

## Deployment Notes

- SQLite file (`server/prisma/dev.db`) is lightweight; for production swap `DATABASE_URL` to PostgreSQL/MySQL and run `npx prisma migrate deploy`.
- The client expects `VITE_API_BASE_URL` pointing to `/tasks`; set to the deployed API origin.
- Consider using `npm run build` in both workspaces and serve the frontend via a static host or behind the Nest API (e.g., upload `client/dist` to a CDN).

## Next Steps

- Enhance tests (unit + frontend)
- Add authentication/authorization if required
- Containerize both services for easier deployment

---

For TSA reviewers: run the backend first (`server`), ensure `client/.env` points to it, then run the frontend (`client`). The UI will auto-fetch tasks and display completion stats with filters/editing. Enjoy!

