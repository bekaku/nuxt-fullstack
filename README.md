# Nuxt 4 + Drizzle + PostgreSQL 18 — JWT HTTP-Only Auth + RBAC Starter

This project converts the uploaded `starter_postgres.sql` (22 tables) to a Drizzle ORM
schema with **JWT HTTP-Only Cookie + Refresh Token + RBAC Middleware on the server side** authentication system.

✅ **This project has been successfully run through testing** (build, migrate, seed, login, refresh,
RBAC 200/403/401 all tested via localhost)

## Stack

| Layer | Version |
|---|---|
| Nuxt | 4.4.8 |
| Nuxt UI | 4.10.0 |
| Drizzle ORM | 0.45.2 (+ drizzle-kit 0.31.10) |
| PostgreSQL | 18 (via Docker) |
| TypeScript | 5.7+ |
| bcryptjs | 3.0.3 (via Password) |
| jsonwebtoken | 9.0.3 (sign/verify JWT) |
| zod | 4.4.3 (validate request body) |

## Project structure

```
app/
  pages/
    index.vue            Home
    login.vue             Login page
    admin/index.vue       Dashboard (ต้อง login)
    admin/users.vue       ตัวอย่างหน้าที่ใช้ v-can + RBAC API
  middleware/
    auth.global.ts         Client route middleware ป้องกัน /admin/**
  composables/
    useAuth.ts              login/logout/fetchMe/can()/hasRole()
    useApi.ts               ofetch wrapper + silent refresh อัตโนมัติเมื่อเจอ 401
  plugins/
    permission.client.ts    v-can="'permission_code'" directive

server/
  database/
    schema.ts               Drizzle schema (22 ตาราง แปลงจาก starter_postgres.sql)
    client.ts               useDb() — postgres.js connection (singleton)
    seed.ts                 Create basic permissions + Admin/Viewer roles + admin user.
  middleware/
    00.auth.ts               Check the JWT from the cookie for every request at /api/** (except login/refresh/logout).
  utils/
    jwt.ts                    sign/verify access token, generate refresh token
    password.ts               hash/verify ด้วย bcryptjs
    permission.ts             loadUserPermissions(), requirePermission(), getAuthUser()
    snowflake.ts              Time-sortable bigint ID generator (replaces the original ID in the dump)
  api/
    auth/login.post.ts
    auth/refresh.post.ts
    auth/logout.post.ts
    auth/me.get.ts
    users/index.get.ts        Examples of routes that require permission."app_user_list"
    users/index.post.ts       Examples of routes that require permission."app_user_add"
    permissions/index.get.ts

drizzle/                     The generated SQL migration (0000_*.sql, 22 tables)
docker-compose.yml            Postgres 18
```

## Auth Design Concepts (Important: Must understand before reading the code)

1. **Access Token** = JWT (stateless, short-lived (15 minutes)). `permissions[]` and
`roles[]` are stored in the payload to avoid querying the database for every request. — **Not saved to the database.**
2. **Refresh Token** = Random string (opaque, not a JWT). Long-lived (default 7 days).
**Save to a table.** 1. **`access_token`** (column `token`) to allow revoke/rotate.
— Matches the sample data in the dump where the `token` column is the UUID.
3. Both tokens are returned as **HTTP-Only Cookie** (`access_token`,
`refresh_token`) — there's no way for browser-side JavaScript to read the values.
4. When the Access Token expires → API responds with `401` → the client side
(`app/composables/useApi.ts`) will silently call `/api/auth/refresh`
and retry the original request once (Silent Refresh).
5. RBAC: `server/middleware/00.auth.ts` checks the JWT and pastes
`event.context.user = { permissions: [...] }`, then each API route calls
`requirePermission(event, 'app_user_add')`. To check permissions by name:
`"<table name>_<action>"` (list/view/add/edit/delete) — If there are no permissions, respond with `403`.

## How to run the test (follow these steps)

### 1) Prepare PostgreSQL 18

```bash
docker compose -f docker-compose-postgres.yml up-d
```

Wait 5-10 seconds for Postgres to prepare (the healthcheck is already included in compose).

### 2) Install dependencies

```bash
pnpm install
```

### 3) config .env

```bash
cp .env.example .env
```

Change `NUXT_JWT_ACCESS_SECRET` and `NUXT_JWT_REFRESH_SECRET` to true random values ​​(do not use the default values ​​in production):

```bash
openssl rand -hex 64
```

ค่า `NUXT_DATABASE_URL` ใน `.env.example` ตรงกับ `docker-compose-postgres.yml` อยู่แล้ว
(`app_user` / `app_password` / db ชื่อ `nuxt4_rbac`) ไม่ต้องแก้ถ้าใช้ docker-compose ได้เลย

### 4) Create a table in the database.

The SQL migration has already been generated in `drizzle/0000_*.sql` (complete with 22 tables + FK + Index + Check Constraints according to `starter_postgres.sql`). You can apply it directly:

```bash
pnpm db:migrate
```

Or, if you've modified schema.ts and need to generate a new migration:

```bash
pnpm db:generate   #Create a new SQL file from schema.ts.
pnpm db:migrate    # apply to DB
```

### 5) Seed - Initial Information

```bash
pnpm db:seed
```

You will receive the `Admin` role (all privileges) and `Viewer` (list/view only) with the following user:

```
Email:    admin@example.com
Username: admin
Password: Admin@12345
```

⚠️ Change this password immediately before use.

### 6) Run the project.

```bash
pnpm dev
```

Open http://localhost:3000 → Click "Login" → Log in with the admin account above.
→ You will be taken to the `/admin` page which displays all roles/permissions for the current user.

### 7)Test the API with curl (optional).

```bash
# Log in and save cookies.
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"emailOrUsername":"admin@example.com","password":"Admin@12345"}'

# Calling a route that requires app_user_list permission.
curl -b cookies.txt http://localhost:3000/api/users

# try refresh token
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh

# logout
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

### Accessories

```bash
pnpm db:studio  # Open Drizzle Studio and view the database information via the web.
```

## Adding new permissions to other routes.

1. Add a row to the `permission` table (or modify `RESOURCES`/`ACTIONS` in
`server/database/seed.ts` and run the seed again) following the convention
`"<table_name>_<action>"`, e.g., `files_directory_add`.
2. In the new API route, call `requirePermission(event, 'files_directory_add')` at the beginning of the function (see example in `server/api/users/index.post.ts`).
3. On the UI side, use `v-can="'files_directory_add'"` with the button/element you want to hide.
(This hiding is just UX – the actual security lies in the `requirePermission` on the server side.)

## Notes on Schema

- All 22 tables from `starter_postgres.sql` have been converted to a complete Drizzle schema (`server/database/schema.ts`), including Foreign Keys, Check Constraints (e.g.,
`service >= 0 AND service <= 1`), and Indexes (e.g., index on `token`,
`revoked`, `lastest_active` of the `access_token` table).
- **The `performance_dashboard` view and the function
`create_monthly_partitions` have not been converted because they are Postgres-specific objects that Drizzle
ORM does not yet support direct generation — if you want to use them, add them as raw SQL
migration separately (`drizzle-kit` supports custom SQL migration via
`npx drizzle-kit generate --custom`).
- The Primary key is a `bigint` in Snowflake-style (created on the app side via
Use `server/utils/snowflake.ts` to match the original id style in the dump (e.g.,
350885844724224000`) instead of just using `bigserial`.
- **Do not import sample data (rows) from the original dump**, such as audit_log,
file_manager which includes the actual data — intentionally omitted to prevent password/IP/
original files from being transferred to the new project. Use `pnpm db:seed` to create a clean initial dataset instead.

## ขั้นต่อไปที่แนะนำ (ยังไม่ได้ทำในสตาร์ทเตอร์นี้)

- หน้า UI สำหรับจัดการ Role / Permission mapping (ตอนนี้มีแค่ API + seed)
- Rate limiting ที่ `/api/auth/login` กัน brute-force
- Redis cache สำหรับ permission ถ้าระบบใหญ่ขึ้นจนฝัง JWT payload ใหญ่เกินไป
- อัปโหลดไฟล์ (ตาราง `file_manager`, `files_directory` มี schema พร้อมแล้ว
  แต่ยังไม่มี API)
