# Real-Time Client Project Dashboard

A full-stack internal dashboard for managing client projects, tasks, and team activity in real time — built with role-based access control (Admin / Project Manager / Developer), JWT authentication, and a WebSocket-driven, role-filtered activity feed.

Built for the Velozity Global Solutions Full Stack Developer technical assessment.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript (Vite), Tailwind CSS, Zustand, React Router, Axios, Socket.io-client |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 (with `@prisma/adapter-pg`) |
| Real-time | Socket.io |
| Background jobs | node-cron |
| Auth | JWT (access + refresh), HttpOnly cookies |

---

## Local Setup

### Prerequisites

- Node.js 22+
- Docker Desktop (recommended) — or a local PostgreSQL install

### 1. Clone the repo

```bash
git clone https://github.com/r1tamdev/realtime-client-project-dashboard.git
cd realtime-client-project-dashboard
```

### 2. Start PostgreSQL (Docker — preferred)

From `server/`, a `docker-compose.yml` spins up Postgres with no local install required:

```bash
cd server
docker compose up -d
```

This starts a Postgres 16 container on port `5432`, with the database `velozity_dashboard` created automatically and data persisted in a named volume.

> **Without Docker:** install PostgreSQL locally and create a database named `velozity_dashboard` manually, then point `DATABASE_URL` (below) at it.

### 3. Configure environment variables

**`server/.env`**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/velozity_dashboard?schema=public"
JWT_ACCESS_SECRET="<generate — see below>"
JWT_REFRESH_SECRET="<generate — see below>"
PORT=8000
CLIENT_URL="http://localhost:5173"
```

Generate strong random secrets (run twice, once per secret):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**`client/.env`**

```
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

### 4. Install dependencies and set up the database

```bash
# from server/
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

The seed script creates 1 Admin, 2 Project Managers, and 4 Developers across 3 projects with 15 tasks in mixed statuses (2 pre-flagged as overdue), plus sample activity log entries and notifications. These credentials are also printed to the console after seeding.

### Seeded login credentials

Only the 7 accounts below exist in the seeded database — log in with any of these to test the corresponding role's dashboard and permissions.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@velozity.com` | `Password123!` |
| PM | `ravi.pm@velozity.com` | `Password123!` |
| PM | `neha.pm@velozity.com` | `Password123!` |
| Developer | `arjun.dev@velozity.com` | `Password123!` |
| Developer | `priya.dev@velozity.com` | `Password123!` |
| Developer | `karan.dev@velozity.com` | `Password123!` |
| Developer | `simran.dev@velozity.com` | `Password123!` |

### 5. Run the app

```bash
# terminal 1 — backend
cd server
npm run dev

# terminal 2 — frontend
cd client
npm run dev
```

Backend runs on `http://localhost:8000`, frontend on `http://localhost:5173`.

---

## Database Schema

Core entities and relationships:

```
User (id, name, email, passwordHash, role: ADMIN | PM | DEVELOPER)
  ├── manages many Projects (as PM)
  ├── is assigned many Tasks (as Developer)
  ├── has many RefreshTokens
  ├── has many Notifications
  └── has many TaskActivityLog entries (as the person who made a change)

Client (id, name)
  └── has many Projects

Project (id, name, clientId → Client, managerId → User)
  └── has many Tasks

Task (id, title, description, projectId → Project, assigneeId → User,
      status, priority, dueDate, isOverdue)
  ├── has many TaskActivityLog entries
  └── has many Notifications

TaskActivityLog (id, taskId → Task, changedById → User,
                 fromStatus, toStatus, createdAt)
  — append-only; one row per status change, never overwritten

Notification (id, userId → User, taskId → Task, message, isRead, createdAt)

RefreshToken (id, userId → User, tokenHash, expiresAt, revoked)
```

### Indexing decisions

| Index | Reason |
|---|---|
| `Task.status`, `Task.dueDate` | Filtered constantly by every dashboard and the overdue-task cron job |
| `Task.projectId`, `Task.assigneeId` | Foreign keys used in nearly every task query (PM's projects, a developer's assigned tasks); Postgres does not auto-index foreign keys |
| `TaskActivityLog(taskId, createdAt)` composite | The activity feed's access pattern is always "logs for a task/project, ordered by time" — a composite index lets Postgres satisfy both the filter and the sort in one index scan |
| `Notification(userId, isRead)` composite | The unread-count badge query filters on both fields simultaneously |
| `RefreshToken.userId` | Needed to look up and revoke a user's tokens on logout |
| `User.role` | Used when branching dashboard/query logic by role |

---

## Architectural Decisions

### WebSocket library: Socket.io (not native WebSocket)

Socket.io was chosen over the native `ws` module for three reasons specific to this app's requirements:

1. **Rooms.** The core hard requirement — a role-filtered, project-scoped activity feed — maps directly onto Socket.io's room primitive (`project:{id}`, `user:{id}`, `admin:global`). Building equivalent scoped broadcast groups on raw WebSockets means hand-rolling connection-tracking data structures Socket.io already provides.
2. **Automatic reconnection with fallback.** Socket.io handles dropped connections and transport fallback out of the box — relevant for a dashboard meant to stay live across flaky connections.
3. **Built-in auth hook (`io.use()`).** Middleware-style authentication at the connection handshake, mirroring the same pattern used for REST routes, keeps the security model consistent across both transports.

The trade-off is a slightly heavier client bundle and a small protocol overhead versus raw WebSockets — not a concern at this app's scale.

### Background job scheduler: node-cron (not Bull queue)

The overdue-task checker is a **periodic sweep** — the same fixed unit of work run on a fixed schedule — not a **job queue** processing a variable stream of discrete, event-triggered tasks. Bull is built for the latter: retries, backoff, concurrency control, and a persistent job store, all of which require Redis as an additional service.

For a single recurring "check every N minutes" job, `node-cron` provides exactly what's needed with zero extra infrastructure. Bull would be the right choice if the app later needed genuine queue semantics — e.g., retrying failed notification deliveries — but would be over-engineering for this job as specified.

### Token storage: access token in memory, refresh token in an HttpOnly cookie

- **Access token** (15 min expiry): returned in the login response body, held only in frontend memory (a Zustand store), never written to `localStorage` or `sessionStorage`. This avoids exposing it to any XSS-injected script that could read browser storage.
- **Refresh token** (7 day expiry): set as an `HttpOnly`, `Secure` (in production), `SameSite=Lax` cookie, scoped to `/api/auth`. It is never accessible to JavaScript at all. Its hash (not the raw value) is stored server-side in the `RefreshToken` table, enabling revocation.
- **Rotation on every refresh**: each call to `/api/auth/refresh` revokes the used refresh token and issues a new one. If a stolen refresh token is used after the legitimate user has already rotated it, the reused token fails — a detectable signal of compromise, and a hard limit on the attacker's window.
- **Two separate JWT secrets** for access vs. refresh tokens, so a leak of one does not compromise the other.

### Role enforcement: server-side only

Role checks are enforced exclusively via Express middleware (`authenticate` → `requireRole`) evaluated before any controller logic runs, and independently re-verified on the WebSocket connection handshake. The frontend's route guards (`RoleRoute`) exist purely to avoid rendering a broken UI for a role that shouldn't see a given page — they are not a security boundary, and are not relied upon as one. A Developer directly calling a PM-only endpoint with a modified or forged token is rejected at the API layer regardless of what the frontend does or doesn't show.

### Prisma 7 driver adapter

Prisma 7 decouples the query engine from a bundled native binary, requiring an explicit driver adapter (`@prisma/adapter-pg`) and moving the database connection string out of `schema.prisma` and into `prisma.config.ts`. This was adopted as released; it has no material trade-off for this project beyond one extra configuration file.

---

## Known Limitations

- **WebSocket project-room authorization gap:** the `project:join` socket event currently allows a connected user to join any project's room by ID without a server-side check that they're actually permitted to view that project (i.e., a Developer with no task in that project, or a PM who doesn't manage it). All REST endpoints correctly enforce this; the socket layer's room-join does not yet mirror it. This should be closed by calling the same authorization logic used in `project.service.ts` before allowing a `project:join`.
- **Presence tracking is in-memory, not persisted.** "Users online right now" is tracked in a server-local `Map`, which is appropriate since it's inherently ephemeral state — but it means presence data does not survive a server restart and would not be consistent across multiple server instances if horizontally scaled. A production multi-instance deployment would need a shared store (e.g., Redis) for presence.
- **Dev-mode type-checking is not live.** The dev server runs via `tsx`, which transpiles without type-checking for fast iteration. Type correctness is verified separately via `npx tsc --noEmit` rather than continuously during development.
- **No automated test suite.** Given the assessment timeline, testing was manual (via seeded data and direct API/socket interaction) rather than covered by unit or integration tests.
- **Notification delivery is best-effort over the socket connection.** If a user is disconnected when a notification is created, they will see the updated unread count on next reconnect/page load (since it's read fresh from the database), but there is no push notification channel for a fully offline user.

---

<p align="center">
  Created by <strong>Ritam Chowdhury</strong>
</p>
