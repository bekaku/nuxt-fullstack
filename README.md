# Nuxt Fullstack Starter

Production-ready fullstack starter built on **Nuxt 4 (SSR)** with a complete authentication and authorization layer: **JWT access tokens delivered via HTTP-Only cookies, opaque refresh tokens with rotation/revocation, and server-enforced RBAC**.

- **Stateless auth** — permissions and roles are embedded in the short-lived JWT payload; no per-request database lookup for authorization.
- **HTTP-Only cookies** — tokens are inaccessible to client-side JavaScript.
- **Silent refresh** — the API client retries through `/api/auth/refresh` transparently on `401`.
- **RBAC everywhere** — enforced on the server (`requirePermission`) and mirrored in the UI (`v-rbac` directive).
- **22-table Drizzle schema** — fully typed, migrated, and seeded.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 4.4 (SSR) |
| UI | Nuxt UI 4 + Tailwind CSS 4 |
| ORM | Drizzle ORM 0.45 / drizzle-kit 0.31 |
| Database | PostgreSQL 18 (Docker) |
| Language | TypeScript 5.7+ |
| Auth | jsonwebtoken 9 (JWT), bcryptjs 3 (password hashing) |
| Validation | Zod 4 |

## Project Structure

```
app/
  pages/
    index.vue                 Landing page
    login.vue                 Login
    admin/index.vue           Dashboard (auth required)
  middleware/
    01.auth.global.ts         Client route guard for protected pages
  composables/
    useAuth.ts                login/logout/fetchMe/can()/hasRole()
    useApi.ts                 ofetch wrapper with silent refresh on 401
  plugins/
    rbac.ts                   Registers the v-rbac directive

server/
  database/
    schema.ts                 Drizzle schema (22 tables)
    client.ts                 useDb() — singleton postgres.js connection
    seed.ts                   Permissions, Admin/Viewer roles, admin user
  middleware/
    00.auth.ts                Global JWT guard for /api/** (login/refresh/logout excluded)
  utils/
    jwt.ts                    Access token sign/verify, refresh token generation
    password.ts               bcryptjs hash/verify
    permission.ts             loadUserPermissions(), requirePermission(), getAuthUser()
    snowflake.ts              Time-sortable bigint ID generator
  api/
    auth/login.post.ts
    auth/refresh.post.ts
    auth/logout.post.ts
    auth/me.get.ts
    users/index.get.ts        Requires app_user_list permission
    users/index.post.ts       Requires app_user_add permission

drizzle/                     Generated SQL migrations
docker-compose-postgres.yml  PostgreSQL 18
```

## Authentication Design

1. **Access token** — stateless JWT with a 15-minute TTL. The payload embeds `permissions[]` and `roles[]`, so authorization requires no database round-trip.
2. **Refresh token** — opaque random string (not a JWT), valid for 7 days by default. Persisted in the `access_token` table to support revocation and rotation.
3. **Transport** — both tokens are set as HTTP-Only cookies (`access_token`, `refresh_token`), invisible to browser JavaScript.
4. **Silent refresh** — when an access token expires, the API responds `401`; `app/composables/useApi.ts` calls `/api/auth/refresh` once and retries the original request.
5. **RBAC enforcement** — `server/middleware/00.auth.ts` verifies the JWT and attaches `event.context.user = { permissions: [...] }`. Each route then calls `requirePermission(event, 'app_user_add')`. Permissions follow the `<table>_<action>` convention (`list` / `view` / `add` / `edit` / `delete`). Unauthorized requests receive `403`.

## Getting Started

### 1. Start PostgreSQL 18

```bash
docker compose -f docker-compose-postgres.yml up -d
```

Wait a few seconds for the healthcheck to pass.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Generate strong secrets for `NUXT_JWT_ACCESS_SECRET` and `NUXT_JWT_REFRESH_SECRET`:

```bash
openssl rand -hex 64
```

The default `NUXT_DATABASE_URL` matches `docker-compose-postgres.yml` (`app_user` / `app_password`, database `nuxt4_rbac`) — no changes needed if you use the provided compose file.

### 4. Run migrations

```bash
pnpm db:migrate
```

After modifying `schema.ts`, generate a new migration instead:

```bash
pnpm db:generate   # Generate SQL from schema.ts
pnpm db:migrate    # Apply generated migrations
# or, dev only:
pnpm db:push       # Push schema directly without generating SQL files
```

### 5. Seed the database

```bash
pnpm db:seed
```

Creates an `Admin` role (all permissions) and a `Viewer` role (list/view only), plus this user:

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Username | `admin` |
| Password | `Admin@12345` |

> Change this password immediately before any real use.

### 6. Start the dev server

```bash
pnpm dev
```

Open http://localhost:3000, log in with the admin account, and you will be redirected to `/admin`, which displays the current user's roles and permissions.

### 7. Verify the API (optional)

```bash
# Log in and persist cookies
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"emailOrUsername":"admin@example.com","password":"Admin@12345"}'

# Route requiring the app_user_list permission
curl -b cookies.txt http://localhost:3000/api/users

# Rotate the refresh token
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh

# Log out
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

### Utilities

```bash
pnpm db:studio   # Browse the database in Drizzle Studio
```

## Adding Permissions

Permissions follow the `<table>_<action>` naming convention.

1. Insert a row into the `permission` table — or extend `RESOURCES` / `ACTIONS` in `server/database/seed.ts` and re-run the seed (e.g. `files_directory_add`).
2. Guard the new API route by calling `requirePermission(event, 'files_directory_add')` at the top of the handler (see `server/api/users/index.post.ts`).
3. In the UI, hide gated elements with the `v-rbac` directive:

   ```vue
   <UButton
     label="Any of multiple permissions"
     v-rbac="{
       permissions: ['user_manage_not_exist', 'app_role_add'],
       condition: 'any',
     }"
   />
   ```

> The `v-rbac` directive is UX only — actual security is enforced server-side by `requirePermission`.

## Schema Notes

- All 22 tables from the original dump are converted to a fully typed Drizzle schema (`server/database/schema.ts`), including foreign keys, check constraints (e.g. `service >= 0 AND service <= 1`), and indexes (e.g. on `token`, `revoked`, `lastest_active` of the `access_token` table).
- Primary keys are **Snowflake-style `bigint`s** generated application-side via `server/utils/snowflake.ts`, matching the ID style of the original dump rather than relying on `bigserial`.
- The `performance_dashboard` view and `create_monthly_partitions` function are **not converted** — Drizzle does not yet support these Postgres-specific objects. Add them as raw SQL migrations if needed (`npx drizzle-kit generate --custom`).
- **No sample rows are imported** from the original dump (e.g. `audit_log`, `file_manager` contain real user data). Use `pnpm db:seed` to create a clean initial dataset.

## Roadmap

- [ ] Admin UI for role/permission mapping (API + seed exist today)
- [ ] Rate limiting on `/api/auth/login` against brute-force attacks
- [ ] Redis-backed permission cache for deployments where the embedded JWT payload grows too large
- [ ] File upload API (`file_manager`, `files_directory` schemas are ready)
