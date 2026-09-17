# ScholarizePath

A web platform for students planning to study abroad. It brings universities and
scholarships into one place, lets students compare and track them, estimates the
total cost of a degree, and has an AI advisor that searches the platform's own
database instead of making things up.

Live: [scholarizepath.xyz](https://scholarizepath.xyz)

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Architecture](#architecture)
  - [Request flow and route protection](#request-flow-and-route-protection)
  - [Authentication](#authentication)
  - [Data model](#data-model)
  - [AI features](#ai-features)
  - [Deadline reminders](#deadline-reminders)
  - [Client-side state](#client-side-state)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Features

| Page | Route | What it does |
| --- | --- | --- |
| Landing | `/` | Public home page with feature overview |
| Top rankings | `/top` | Most-favorited universities and scholarships across all users (public, regenerated hourly) |
| Dashboard | `/dashboard` | Interactive world map with university/scholarship counts per country and region filters, plus suggested universities based on the student's profile |
| Scholarships | `/scholarships`, `/scholarships/[id]` | Search, filters (country, level, field, amount, deadline), sorting, pagination. The detail page includes a rule-based eligibility checker and an AI explanation |
| Universities | `/universities`, `/universities/[id]` | Search and filter by country, ranking, tuition, programs and degree level. Detail page shows costs, deadlines, requirements and programs |
| AI Bot | `/aibot` | Chat advisor that returns a short answer plus university/scholarship cards pulled from the database |
| Compare | `/compare` | Side-by-side comparison of universities or scholarships |
| Tracker | `/tracker` | Kanban-style board for applications (not started → in progress → submitted → waiting → accepted / rejected) |
| Calculator | `/calculator` | Total cost of study from real tuition and living-cost data, with an optional scholarship offset |
| Favourites | `/favourites` | Saved universities and scholarships |
| Uni List | `/unilist` | Personal shortlist that can be exported as a formatted `.docx` report |
| Student | `/student` | Profile, academic scores, preferences, notification settings |
| Suggestions | `/suggestions` | Bug report and feature suggestion forms |
| Admin | `/admin` | Stats, user growth chart, recent activity, feedback moderation (admin role only) |
| Support | `/support` | Donation page |

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, MUI, Framer Motion, lucide-react
- **Database:** MongoDB via Mongoose
- **Auth:** JWT in an httpOnly cookie (`jsonwebtoken` for signing, `jose` for verification in the proxy), bcrypt, Google OAuth 2.0
- **AI:** Groq SDK (`openai/gpt-oss-120b`) with tool calling
- **Email:** Resend + React Email templates
- **Rate limiting:** Upstash Redis (`@upstash/ratelimit`, sliding window)
- **Charts and maps:** Recharts, react-simple-maps
- **Documents:** `docx` for report generation
- **Monitoring:** Sentry (errors and tracing only), Google Analytics
- **Hosting:** Vercel (including Vercel Cron)

## Getting started

Requirements: Node.js 20+ (developed on 22), npm, a MongoDB database and an Upstash
Redis instance. Groq, Resend and Google credentials are needed for the features that
use them.

```bash
git clone https://github.com/Emirkhan-Sharshenov/ScholarizePath.git
cd ScholarizePath
npm install
```

The repo has `legacy-peer-deps=true` in `.npmrc`, because some UI packages haven't
updated their peer ranges for React 19 yet.

Create `.env.local` (see below), then:

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # run the production build
npm run lint
```

The `universities` and `scholarships` collections are not seeded by the app. They
need to be filled in MongoDB directly (see [Data model](#data-model) for the fields
the UI reads).

To get an admin account, register normally and set `role: "admin"` on the user
document in the database.

## Environment variables

| Variable | Required | Used for |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signing session and registration tokens |
| `UPSTASH_REDIS_REST_URL` | yes | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Rate limiting |
| `GROQ_API_KEY` | yes | AI chat and eligibility explanations |
| `RESEND_API_KEY` | yes | Verification and reminder emails |
| `RESEND_FROM` | no | Sender address, e.g. `ScholarizePath <noreply@your-domain>` |
| `GOOGLE_CLIENT_ID` | no | Google sign-in (button shows an error if missing) |
| `GOOGLE_CLIENT_SECRET` | no | Google sign-in |
| `NEXT_PUBLIC_APP_URL` | no | Absolute links in emails |
| `CRON_SECRET` | for cron | Bearer token Vercel Cron sends to the reminders endpoint |
| `NEXT_PUBLIC_SENTRY_DSN` | no | Sentry error reporting |
| `SENTRY_AUTH_TOKEN` | no | Source map upload at build time |
| `GA_ID` | no | Google Analytics |

Google OAuth redirect URI to register in Google Cloud Console:
`<your-origin>/api/auth/google/callback`.

## Project structure

`@/*` is aliased to `app/*` in `tsconfig.json`, so `@/lib/mongodb` means
`app/lib/mongodb.ts`.

```
scholarize-path/
├── proxy.ts                  # Runs before every request: rate limiting, auth, redirects
├── instrumentation*.ts       # Sentry setup (client / server / edge)
├── sentry.*.config.ts
├── vercel.json               # Cron schedule
├── public/
│   ├── data/countries-50m.json   # TopoJSON for the world map
│   └── images/
└── app/
    ├── layout.tsx, page.tsx  # Root layout and landing page
    ├── (dashboard)/          # Authenticated pages sharing the sidebar layout
    ├── login/, profile/setup/, top/, support/
    ├── api/                  # Route handlers (see API reference)
    ├── components/           # UI, grouped by feature (dashboard, scholarships, tracker, ...)
    ├── models/               # Mongoose schemas
    ├── services/             # Business logic shared by routes and pages
    │   ├── auth.service.ts       # register, verify, login, logout, Google OAuth
    │   ├── reminders.service.ts  # deadline reminder job
    │   └── stats.service.ts      # top rankings aggregation
    ├── middleware/           # auth token parsing, error wrapper
    ├── lib/                  # DB connection, rate limiter, Groq client, AI tools, hooks, docx builder
    ├── emails/               # React Email templates
    ├── types/
    ├── robots.ts, sitemap.ts, opengraph-image.tsx
    └── global-error.tsx, not-found.tsx
```

Pages are mostly thin: a `page.tsx` renders a feature component from
`app/components/<feature>/`, and that component fetches data from `/api/*` on the
client. The exception is `/top`, which is a server component that calls
`stats.service` directly and is revalidated every hour.

## Architecture

```
Browser
  │
  ▼
proxy.ts ── rate limit (Upstash) ── JWT check ── redirects / 401 / 403
  │
  ├── Pages (app/(dashboard)/…)  ──fetch──┐
  │                                       ▼
  └── Route handlers (app/api/…) ──► services/ ──► Mongoose models ──► MongoDB
                │
                ├── Groq (AI chat, eligibility)
                ├── Resend (emails)
                └── docx (reports)

Vercel Cron ── daily 08:00 UTC ──► /api/cron/deadline-reminders
```

### Request flow and route protection

`proxy.ts` (the Next.js 16 replacement for `middleware.ts`) runs on every route
except static assets and generated metadata files. It handles, in this order:

1. **Rate limiting** for `/api/auth/login`, `/register` and `/verify`: 3 requests per
   40 seconds per IP, scoped per route. If Redis is unreachable the check fails
   open, so a Redis outage doesn't block all logins.
2. **Session redirect.** A logged-in user with a completed profile is sent from `/`
   and `/login` to `/dashboard`.
3. **Public paths** (`/`, `/login`, `/top`, `/support`, auth endpoints, `/api/cron`)
   pass through.
4. **Authentication.** Everything else needs a valid token. Pages redirect to
   `/login?from=<path>`, API routes get a JSON 401.
5. **Profile setup gate.** Until `profileSetupComplete` is true the user is forced to
   `/profile/setup`; API calls (except `/api/auth/profile`) return 403. Setup can
   only be done once.
6. **Admin gate** for `/admin`.

The token payload carries `userId`, `role` and `profileSetupComplete`, so the proxy
makes these decisions without a database query. The proxy only guards the `/admin`
page itself, so every admin endpoint (`/api/admin/*`, `/api/auth/users`, and
`GET`/`DELETE /api/feedback`) calls `lib/requireAdmin.ts`, which re-checks the role in
the database. That also covers the case where a token issued before a role change is
still valid for up to 7 days.

### Authentication

**Email and password**

1. `POST /api/auth/register` validates input, hashes the password with bcrypt and
   emails a 6-digit code through Resend. No user is created yet: the pending
   registration (including the hash and code) is stored in a signed
   `register_session` cookie that expires in 15 minutes.
2. `POST /api/auth/verify` checks the code against that cookie, creates the user
   with `isVerified: true` and sets the `token` cookie.
3. `POST /api/auth/login` compares the password and sets the `token` cookie.

This keeps unverified accounts out of the database entirely.

**Google**

`GET /api/auth/google` redirects to Google with a random `state` stored in a cookie.
The callback checks `state`, exchanges the code, verifies the `id_token` against
Google's JWKS and then either finds the user by `googleId`, links an existing
account with the same email, or creates a new one.

**Session cookie:** `token`, httpOnly, `secure` in production, `sameSite=lax`,
7 days. `lax` rather than `strict` is intentional: `strict` drops the cookie when the
site is opened from an email link or another app.

`PUT /api/auth/self` only accepts an allowlist of fields (name, email, profile,
favorites, notification setting), so users can't change their own `role` or
verification status.

### Data model

| Model | Collection | Notes |
| --- | --- | --- |
| `User` | `users` | Credentials, `authProvider`, `googleId` (sparse unique), `role`, `profileSetupComplete`, `favoriteUniversities` / `favoriteScholarships` (arrays of ids), `profile` (age, nationality, GPA, SAT, IELTS/TOEFL, preferred field/country/level), `deadlineReminders` |
| `Universities` | `universities` | `strict: false`. Commonly used fields: `name`, `location.{city,country}`, `ranking.{global,national}`, `tuition.{bachelor,master}`, `programs`, `degreeLevels`, `deadlines`, `searchKeywords` |
| `Scholarships` | `scholarships` | `strict: false`. Commonly used fields: `scholarshipName`, `country`, `studyLevel`, `fieldOfStudy`, `award.{type,estimatedValue}`, `requirements`, `deadlines`, `isOpen` |
| `Application` | `applications` | Tracker rows. Unique on `(userId, itemType, itemId)`. Item name is denormalized so the board loads without joins |
| `Feedback` | `feedback` | Bug reports and suggestions with a status |
| `ReminderLog` | `reminderlogs` | One row per reminder sent, unique on `(userId, itemType, itemId, deadlineLabel, daysBefore)` |

Universities and scholarships are schema-less because the data is entered by hand
and varies between records. Code that reads them (`stats.service`, `ai/tools`,
`calculatorTypes`) checks for several possible field shapes and skips values it
can't parse.

`lib/mongodb.ts` caches the in-flight `mongoose.connect()` promise, so concurrent
cold starts on Vercel share one connection attempt instead of racing.

### AI features

Both features use Groq with the model set in `lib/groq.ts`, retry transient errors
(429/5xx) twice with backoff, and are rate-limited per user through Upstash.

**Chat advisor** (`POST /api/ai/chat`)

- Loads the student's profile and passes it to the model as context.
- The model has two tools, `search_universities` and `search_scholarships`
  (`lib/ai/tools.ts`), which query MongoDB. The system prompt forbids recommending
  anything that didn't come from a tool call.
- Up to 4 tool-calling rounds. If the model sends badly typed arguments, it is asked
  to retry instead of failing the request.
- Search normalizes country names (`USA` → `united states`) and degree levels
  (`MSc` → `master`) and doesn't hide records with missing data.
- After the tool loop a final call writes a short plain-text reply. The response
  contains the reply plus up to 8 deduplicated university and scholarship cards.
- History is capped at the last 12 messages.
- Limits: 8 messages per minute, 3 per day.

**Eligibility explanation** (`POST /api/ai/eligibility`)

Sends a scholarship's `requirements` and the student's profile to the model in JSON
mode. The response (`verdict`, `summary`, per-criterion `match` / `partial` /
`mismatch`) is validated before it reaches the client. Limits: 3 per minute, 8 per day.

### Deadline reminders

`vercel.json` schedules `GET /api/cron/deadline-reminders` daily at 08:00 UTC. The
route requires `Authorization: Bearer $CRON_SECRET`.

`reminders.service.ts` finds every university and scholarship deadline that is
exactly 7 or 1 days away, looks up users who favorited that item and haven't turned
reminders off, and sends an email for each. Before sending it inserts a
`ReminderLog` row; if the unique index rejects it, that reminder was already sent and
is skipped. This makes the job safe to re-run. The response is a summary:
`{ checked, sent, skipped }`.

### Client-side state

- **Favorites** are stored on the user document and read through `/api/auth/self`
  (`lib/useFavorites.ts`).
- **Compare list** and **Uni List** live in `localStorage`
  (`lib/useCompare.ts`, `lib/useUniList.ts`), so they're per browser.
- The **Uni List report** is generated on the server: the client calls
  `GET /api/unilist/report?items=[...]`, the route loads each item and builds the
  `.docx` with `lib/uniListDocx.ts`.
- Sidebar open/closed state is shared through `SidebarContext`.

## API reference

All endpoints return JSON. Unless marked public, they require the `token` cookie (or
`Authorization: Bearer <token>`) and a completed profile.

**Auth**

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Start registration, send code (public, rate-limited) |
| POST | `/api/auth/verify` | Confirm code, create account (public, rate-limited) |
| POST | `/api/auth/login` | Log in (public, rate-limited) |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/google` | Start Google OAuth (public) |
| GET | `/api/auth/google/callback` | Google OAuth callback (public) |
| POST | `/api/auth/profile` | One-time profile setup |
| GET / PUT | `/api/auth/self` | Current user / update allowed fields |
| GET | `/api/auth/users` | All users (admin) |

**Catalog**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/universities` | List. Query: `page`, `limit` (≤50), `search`, `country`, `minRanking`, `maxRanking`, `minTuition`, `maxTuition`, `programs`, `degreeLevel`, `sortBy` |
| GET | `/api/universities/[id]` | Single university |
| GET | `/api/scholarships` | List. Query: `page`, `limit` (≤50), `search`, `country`, `studyLevel`, `fieldOfStudy`, `minAmount`, `maxDeadline`, `sortBy` |
| GET | `/api/scholarships/[id]` | Single scholarship |
| GET | `/api/dashboard/map-stats` | Counts per country for the map |

**Student tools**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET / POST | `/api/tracker` | List / add tracked applications |
| PATCH / DELETE | `/api/tracker/[id]` | Update status, deadline, notes / remove |
| GET | `/api/unilist/report?items=` | Download `.docx` report |
| POST | `/api/ai/chat` | AI advisor. Body: `{ message, history }` |
| POST | `/api/ai/eligibility` | AI eligibility explanation. Body: `{ scholarshipId }` |
| POST | `/api/feedback` | Submit bug report or suggestion |

**Admin**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/admin/stats` | Totals for users, universities, scholarships |
| GET | `/api/admin/user-growth?range=7d\|30d\|90d` | Daily registrations |
| GET | `/api/admin/recent-activity` | Latest registrations and catalog changes |
| GET | `/api/feedback` | All feedback, newest first |
| DELETE | `/api/feedback` | Delete one item (`{ id }`) or all items of a type (`{ type: "bug" \| "suggestion" }`) |

**System**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/cron/deadline-reminders` | Reminder job (Bearer `CRON_SECRET`) |

## Deployment

The app is deployed on Vercel:

1. Import the repository and set the root directory to `scholarize-path` if the
   project sits in a subfolder.
2. Add the environment variables from the table above.
3. Add `CRON_SECRET`; Vercel sends it automatically to cron routes.
4. Verify the sending domain in Resend and set `RESEND_FROM` to an address on it.
5. Add the production callback URL to the Google OAuth client.

Sentry source maps are uploaded only when `SENTRY_AUTH_TOKEN` is set. Without it,
errors are still reported, just with minified stack traces.

## Known limitations

- There is no seeding script or admin UI for adding universities and scholarships
  yet; the catalog is managed directly in MongoDB.
- Compare and Uni List are stored in `localStorage` and don't sync between devices.
- Deadline reminder email subjects and dates are currently formatted in Russian,
  while the rest of the UI is in English.
- No automated tests.
