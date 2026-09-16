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
| Framework | Nuxt 4.5 (SSR) |
| UI | Nuxt UI 4 + Tailwind CSS 4 |
| ORM | Drizzle ORM 0.45 / drizzle-kit 0.31 |
| Database | PostgreSQL 18 (Docker) |
| Language | TypeScript 7 |
| Auth | jsonwebtoken 9 (JWT), bcryptjs 3 (password hashing) |
| Validation | Zod 4 |
| AI / LLM | Vercel AI SDK 7, Ollama (local + cloud), OpenRouter |
| Vector DB | Qdrant (RAG document embeddings) |
| Embeddings | Ollama `bge-m3` model |
| File Storage | Local filesystem (`/data/cdn/`), chunked upload |
| WebSocket | Nitro built-in WebSocket (crossws) |
| i18n | @nuxtjs/i18n (Thai `th` default, English `en`) |
| Charts | ApexCharts 5 |
| Deployment | Docker + PM2 cluster mode |

## Features

### Authentication & Security

- **Login / Logout / Refresh** — `server/api/auth/` endpoints
- **JWT dual-token model** — Short-lived access token (15m default) + opaque refresh token (7 days), stored in HTTP-only cookies (`_session_` / `_slid_`)
- **Refresh token DB tracking** — `accessToken` table tracks active sessions; enables revocation and rotation
- **Server middleware** (`server/middleware/00.auth.ts`) — Intercepts all `/api/**` routes, verifies JWT, checks session in DB, attaches `event.context.user`
- **Client middleware** — `app/middleware/01.auth.global.ts` (auth guard), `app/middleware/02.check-permit.global.ts` (permission guard)
- **bcrypt password hashing** with salt
- **Login rate limiting** (`server/utils/loginRateLimit.ts`) — In-memory rate limiter: 5 attempts per 15-minute window per email+IP
- **Session management** — `loginLog`, `userAgent`, `apiClient` tables for tracking login sources (web/mobile/API)
- **Device detection** — `@nuxtjs/device` + `@capacitor/device` for device ID and platform detection

### RBAC (Role-Based Access Control)

- **Database schema** — `appUser`, `appRole`, `permission`, `appUserRole`, `rolePermission` (many-to-many junction tables)
- **Permission codes** — Convention: `<resource>_<action>` (e.g., `app_user_list`, `file_manager_manage`)
- **Permission types** — Enum: `CRUD`, `REPORT`, `OTHER`, `FEATURE`
- **Seed script** (`server/database/seed.ts`) — Auto-generates 35 permissions (7 resources x 5 actions), creates Admin (all) + Viewer (read-only) roles, default admin user
- **Server-side enforcement** — `requirePermission()`, `requireAnyPermission()`, `requireAllPermission()` helpers in `server/utils/permission.ts`
- **Client-side enforcement** — `useRbac()` composable with `hasPermission()`, `isHavePermission()`, `isHaveAllPermission()` checks
- **Dynamic menu filtering** — `useMenu().initialAppNav()` filters sidebar navigation items based on user permissions
- **Page-level protection** — `meta.requiresPermission` in route definitions triggers `02.check-permit.global.ts` middleware
- **JWT-embedded permissions** — Permissions loaded at login/refresh and embedded in JWT payload (no DB query per request)

### AI Chat (with RAG)

- **Streaming chat** — `server/api/aiChat/stream.post.ts` using Vercel AI SDK's `streamText()` + `createUIMessageStream`
- **Multi-model support** — Ollama (local `gemma4:31b` / cloud), OpenRouter (configurable)
- **Conversation management** — Create / rename / delete / pin chats, paginated message history, stored in `aiChat` + `aiChatMessage` tables
- **RAG pipeline** — Full document ingestion workflow:
  1. **Parse** — `document-parser.ts` (PDF, DOCX, PPTX, XLSX, images, text, HTML)
  2. **Chunk** — `document-chunker.ts` (configurable chunk size 1000 / overlap 200)
  3. **Embed** — `embedding.ts` via Ollama `bge-m3` model
  4. **Store** — Qdrant vector DB + PostgreSQL metadata (`aiDocumentMeta`, `aiDocumentVectorIds`, `aiDocumentMetadata`)
  5. **Query** — At chat time, embed user query → Qdrant similarity search (top 4) → inject as context
- **AI tools** — `chartTool` (generate chart configs), `weatherTool` (weather data), `webSearchTool` (Tavily search)
- **Auto-title generation** — AI generates a short title for new conversations
- **Thinking mode** — Ollama provider supports `think: true` option
- **UI** — Custom AI layout (`layouts/ai.vue`) with sidebar chat list (pinned/recent), rename modal, pagination
- **Client composable** — `useAiChat()` with `@ai-sdk/vue` `useChat()`, custom transport, load-more messages, scroll management

### File Manager & CDN

- **Chunked file upload** — Client-side `useUpload()` splits files into 1MB chunks with retry logic (3 attempts), server reassembles
- **Server validation** — MIME type whitelist, file size limits, path traversal prevention, sanitized filenames
- **CDN serving** — `server/routes/cdn/[...filename].ts` serves static files from `/data/` directory
- **File metadata** — `fileManager` table with name, path, size, MIME, owner, thumbnail, description, duration, hidden/locked/readable/writable flags
- **Directory structure** — `filesDirectory` + `filesDirectoryPath` (hierarchical folder system)
- **File streaming download** — `files-stream.get.ts` endpoint with progress tracking
- **Download composable** — `useDownload()` with abort support, speed calculation, download history
- **Media viewer** — `pages/watch/v/` for video playback, `pages/my-drive/folder/` for folder browsing
- **Thumbnail support** — Self-referencing `thumbnailFile` FK in `fileManager`
- **Temp cleanup** — Scheduled task (`cleanup-temp.ts`) runs daily at 3 AM, deletes orphaned temp chunks older than 24 hours

### Document Ingestion (AI Knowledge Base)

- **Ingest endpoint** — `server/api/aiDocumentMeta/ingest/[id].post.ts` triggers full ingestion pipeline
- **Document types** — PDF, Word, PowerPoint, Excel, images, text, CSV, JSON, YAML, XML, HTML
- **Upsert behavior** — If document already exists, deletes old vectors from Qdrant + old metadata, then re-ingests
- **Rollback** — If PostgreSQL metadata insert fails, vectors are cleaned up from Qdrant
- **Document management** — `aiDocumentMeta` CRUD pages with list/delete

### CRUD Framework

- **`useCrudList<T>()`** — Reusable composable providing: pagination, sorting, search (keyword + advanced operators like `:`, `>`, `<`, `=`), delete, copy, view/edit navigation
- **`useCrudForm()`** — Form handling composable
- **`usePagefecth<T>()`** — Generic API data fetching with URL query sync
- **Convention-based routing** — `/entity/crud-action/id` pattern (e.g., `/app-user/edit/123`)
- **Active CRUD modules** — App Users, App Roles, Permissions, AI Document Meta

### Dashboard

- **Hero cards** — Summary statistics with avatars/icons
- **Statistic cards** — Numeric KPIs with trend descriptions
- **Sparkline charts** — Area charts per metric (ApexCharts)
- **Bar chart overview** — Multi-series bar chart with date range filter (14-day default)
- **Recent sales list** — User avatars + amounts
- **Keyboard shortcuts** — `g-h` (home), `g-i` (inbox), `g-c` (customers), `g-s` (settings), `n` (notifications)

### WebSocket

- **Nitro WebSocket** — Built-in at `/ws` endpoint (`server/routes/ws.ts`)
- **Pub/sub model** — Topic-based subscription: clients `SUBSCRIBE` to topics, `BROADCAST` sends to all subscribers
- **Server manager** — `wsManager.ts` tracks topic→peer mappings in memory, cleanup on disconnect
- **Client composable** — `useSocket()` with auto-reconnect (3 retries), heartbeat (30s ping/pong), VueUse `useWebSocket`
- **Broadcast channels** — `useAppBroadcastChannels()` for cross-tab synchronization

### Internationalization (i18n)

- **Two locales** — Thai (`th`, default) and English (`en`)
- **No prefix strategy** — Locale switching via cookie, not URL prefix
- **Language files** — Split into `app.json`, `base.json`, `helper.json`, `model.json`, `error.json` per locale

### Theming & Layout

- **Dark/Light mode** — Via Nuxt UI `useColorMode()`
- **Layout modes** — `fluid` (full width) and `boxed` (centered container with border)
- **Custom fonts** — NotoSansThaiLooped (3 weights), Google Sans (3 weights)
- **Sidebar** — Collapsible + resizable, with logo, search, favorites section, navigation menu, user menu
- **Command palette** — `UDashboardSearch` with keyboard navigation
- **Notifications** — `NotificationsSlideover` component
- **Toast** — Bottom-left position, cookie consent banner
- **Favorite menus** — Users can pin/unpin sidebar menu items, persisted to DB

### Example Pages (22 demos)

Blank, Chats, Charts (ApexCharts), Content text, Customers, Drag & Drop, Download files, Forms, Image cropper, Inbox, Infinite scroll (2 variants), File viewer, Modal, Markdown editor, RBAC demo, Social feed, Transitions, Upload files, WebSocket

### Settings Pages

- General settings
- Members management
- Notifications settings
- Security settings

## Project Structure

```
app/
  app.vue                       Root app component (UApp, NuxtLayout, NuxtPage)
  error.vue                     Custom error page
  pages/
    index.vue                   Dashboard home (hero, stats, charts, recent sales)
    settings.vue                Settings layout redirect
    settings/                   Settings sub-pages (general, members, notifications, security)
    auth/login.vue              Login page
    ai-chats/
      c/                        AI chat conversation page
      recent.vue                Recent chats list
    ai-document-meta/           AI document management (list + CRUD)
    app-user/                   User management (list + CRUD)
    app-role/                   Role management (list + CRUD)
    permission/                 Permission management (list + CRUD)
    my-drive/folder/            File manager / drive browser
    watch/v/                    Media viewer (video)
    example/                    22 demo/example pages
    test/                       Test pages
  layouts/
    default.vue                 Main dashboard layout (sidebar, nav, search, notifications)
    ai.vue                      AI chat layout (sidebar with chat list)
    empty.vue                   Empty layout
    feed.vue                    Social feed layout
  middleware/
    00.seo.global.ts            SEO middleware
    01.auth.global.ts           Client auth guard
    02.check-permit.global.ts   Client RBAC guard
  components/                   Reusable components (base, chart, chat, customers, etc.)
  composables/                  27 composables (auth, rbac, upload, download, ai, etc.)
  plugins/                      Client/server plugins (auth, chart, cropperjs, pdf, plyr, etc.)
  utils/                        Utility functions (date, file, snowflake, etc.)
  libs/                         Constants and Snowflake class
  types/                        TypeScript types (chart, common, models, props)
  api/                          Client-side API helpers
  assets/css/                   Global CSS

server/
  api/
    auth/                       login.post, logout.post, refresh.post, me.get
    appUser/                    User CRUD (list, get, create, update, delete, password, profile)
    appRole/                    Role CRUD (list, get, create, update, delete, findAll)
    permission/                 Permission CRUD (list, get, create, update, delete, findAllPermission)
    aiChat/                     AI chat (list, update, stream, messages/)
    aiDocumentMeta/             Document meta (list, delete, ingest/[id])
    fileManager/                File upload/download (chunked POST, GET, DELETE, files-stream)
    favoriteMenu/               Favorite menu add/remove
    mock/                       Mock data endpoints for dashboard
    test/                       Test endpoints
    meta.ts                     URL OpenGraph meta scraper
  database/
    schema.ts                   Drizzle schema (20+ tables with relations)
    client.ts                   useDb() singleton with postgres.js
    seed.ts                     Seeds permissions, roles, admin user
    migrate/                    MySQL to PostgreSQL migration utilities
  middleware/
    00.auth.ts                  Global JWT guard for /api/**
  utils/                        17 server utilities (jwt, password, permission, storage, etc.)
  services/ai/                  AI document pipeline (parser, chunker, embedding, ingestion)
  routes/
    cdn/[...filename].ts        Static file CDN serving
    ws.ts                       WebSocket handler (pub/sub)
  tasks/
    cleanup-temp.ts             Scheduled task: cleanup orphaned temp files (daily 3 AM)
  plugins/                      Nitro plugins (bigint, date handling)

shared/
  types/                        Shared TypeScript type definitions

drizzle/                        Generated SQL migrations
docker/
  ollama/                       Ollama Docker config
  qdrant/                       Qdrant Docker config
data/                           CDN file storage (year/month subdirectories + temp/)
i18n/locales/                   Translation files (en/, th/)
public/                         Static assets (fonts, images, logos)
```

## Authentication Design

1. **Access token** — stateless JWT with a 15-minute TTL. The payload embeds `permissions[]` and `roles[]`, so authorization requires no database round-trip.
2. **Refresh token** — opaque random string (not a JWT), valid for 7 days by default. Persisted in the `access_token` table to support revocation and rotation.
3. **Transport** — both tokens are set as HTTP-Only cookies (`_session_`, `_slid_`), invisible to browser JavaScript.
4. **Silent refresh** — when an access token expires, the API responds `401`; `app/composables/useApi.ts` calls `/api/auth/refresh` once and retries the original request.
5. **RBAC enforcement** — `server/middleware/00.auth.ts` verifies the JWT and attaches `event.context.user`. Each route then calls `requirePermission(event, 'app_user_add')`. Permissions follow the `<table>_<action>` convention (`list` / `view` / `add` / `edit` / `delete`). Unauthorized requests receive `403`.

## Database Schema

### Tables (20+)

**Core RBAC:** `appUser`, `appRole`, `appUserRole`, `permission`, `rolePermission`

**Auth / Session:** `accessToken`, `loginLog`, `userAgent`, `apiClient`, `apiClientIp`

**File Management:** `fileManager`, `fileMime`, `filesDirectory`, `filesDirectoryPath`

**AI / RAG:** `aiChat`, `aiChatMessage`, `aiDocumentMeta`, `aiDocumentVectorIds`, `aiDocumentMetadata`

**Geography (Thai):** `province`, `district`, `subDistrict`

**Misc / Logging:** `favoriteMenu`, `auditLog`, `systemActivityLogs`

### Schema Notes

- All tables are fully typed in Drizzle ORM (`server/database/schema.ts`), including foreign keys, check constraints (e.g. `service >= 0 AND service <= 1`), and indexes.
- Primary keys are **Snowflake-style `bigint`s** generated application-side via `server/utils/snowflake.ts`, matching the ID style of the original dump rather than relying on `bigserial`.
- Audit fields (`deleted`, `createdDate`, `createdUser`, `updatedDate`, `updatedUser`) are defined as reusable mixins (`auditFieldsSoftDelete()`).
- Drizzle relations are defined for use with the Query API (e.g., `db.query.appUser.findFirst({ with: { userRoles: true } })`).

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

The default `NUXT_DATABASE_URL` matches `docker-compose-postgres.yml` (`app_user` / `app_password`, database `nuxt_fullstack`) — no changes needed if you use the provided compose file.

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

Open http://localhost:3000, log in with the admin account.

### 7. (Optional) Start AI services

For RAG document ingestion and AI chat with embeddings:

```bash
# Start Qdrant vector database
docker compose -f docker-compose.yml up -d qdrant

# Start Ollama for local LLM inference
docker compose -f docker-compose.yml up -d ollama
```

Configure the following in `.env`:

```bash
NUXT_OPENROUTER_API_KEY=your_openrouter_key     # For OpenRouter models
NUXT_OLLAMA_BASE_URL=http://localhost:11434/api  # For local Ollama
NUXT_QDRANT_URL=http://localhost:6333
NUXT_QDRANT_API_KEY=your_qdrant_key
NUXT_QDRANT_COLLECTION_NAME=rag_documents
NUXT_TAVILY_API_KEY=your_tavily_key              # For web search tool
```

### 8. Verify the API (optional)

```bash
# Log in and persist cookies
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"emailOrUsername":"admin@example.com","password":"Admin@12345"}'

# Route requiring the app_user_list permission
curl -b cookies.txt http://localhost:3000/api/appUser

# Rotate the refresh token
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/auth/refresh

# Log out
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

### Utilities

```bash
pnpm db:studio            # Browse the database in Drizzle Studio
pnpm typecheck            # Run Nuxt type checking
```

## Adding Permissions

Permissions follow the `<table>_<action>` naming convention.

1. Insert a row into the `permission` table — or extend `RESOURCES` / `ACTIONS` in `server/database/seed.ts` and re-run the seed (e.g. `files_directory_add`).
2. Guard the new API route by calling `requirePermission(event, 'files_directory_add')` at the top of the handler.
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

## Nuxt Modules

| Module | Purpose |
|---|---|
| `@nuxt/eslint` | ESLint integration with stylistic rules |
| `@nuxt/ui` | UI component library (dashboard, sidebar, cards, etc.) |
| `@vueuse/nuxt` | VueUse composables auto-imported |
| `@nuxtjs/i18n` | Internationalization (th/en) |
| `@nuxt/icon` | Icon system (Lucide, HugeIcons, etc.) |
| `@nuxtjs/device` | Device detection (desktop/tablet/mobile) |
| `@nuxt/image` | Image optimization and presets |

## Nitro Configuration

- **Target:** Node 22
- **Experimental features:** OpenAPI, WebSocket, Tasks
- **Scheduled tasks:** `cleanup-temp` runs daily at 3 AM (`0 3 * * *`)
- **CORS:** Enabled for all `/api/**` routes
- **Cache:** Disabled for `/api/auth/**` routes

## Docker Deployment

### Production build

```bash
# Build and run with Docker
docker build -t nuxtui-web:latest .
docker compose up -d
```

The Dockerfile uses a multi-stage build:
1. **Build stage** — Node 24, pnpm install, `pnpm build`
2. **Production stage** — Node 24 Alpine, PM2 cluster mode, non-root user, healthcheck

### Available Docker Compose files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Application container (pre-built image) |
| `docker-compose-postgres.yml` | PostgreSQL 18 with healthcheck |
| `docker/ollama/` | Ollama LLM service config |
| `docker/qdrant/` | Qdrant vector DB config |

## License

See [LICENSE](./LICENSE) for details.
