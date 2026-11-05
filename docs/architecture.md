# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier: Keep API access in the shared client and have each route component render loading, error, empty, and success states.
- Logic tier: Keep validation and business behavior in explicit service functions; routes translate successful results to response payloads and forward errors to the shared handler.
- Data tier: Enforce required fields and basic value constraints in Mongoose schemas; use idempotent seed upserts that preserve unrelated records.
- Activity tracking: Validate IDs and input in the service, confirm referenced user and team exist, and store points derived from minutes with the occurrence time.
- Team management: Validate the name, mascot, and member IDs in the service, then persist the team through the model.
- Leaderboard: Aggregate activity points by team in the service, order totals descending, and assign 1-based ranks.
- Workout suggestions: Find the requested user, use their goal or recent activity to prioritize matching workouts, and return a reason with each suggestion; return 404 for an unknown email.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — Passed (5 tests), including required-field validation and seed idempotency/data preservation. Failures indicate model validation or seed safety/idempotency regressions.
- API: `npm run test:api --prefix octofit-tracker/backend` — Passed (4 tests). Failures indicate incorrect service behavior, response status/payloads, ranking, or workout recommendations.
- Frontend: `npm test --prefix octofit-tracker/frontend` — Passed (15 tests). Failures indicate missing API-backed rendering or loading, empty, and error states.
- Backend build: `npm run build --prefix octofit-tracker/backend` — Passed. Failures indicate backend TypeScript or compilation errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — Passed. Failures indicate frontend type-checking or production-bundle errors.
