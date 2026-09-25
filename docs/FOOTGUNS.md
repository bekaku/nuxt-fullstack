# Known Footguns

Read this when debugging related behavior or touching the affected area. Do not load it for unrelated tasks.

- NEVER trust `v-rbac` / `byPassPermission` / client middleware as security — `v-rbac` only removes DOM nodes. Use a server permission check or `getAuthUser` plus an ownership condition for user-scoped routes.

- NEVER call `db:push` outside local dev; NEVER commit duplicate migration numbers (orphan duplicates were removed on 2026-09-25; only files listed in `drizzle/meta/_journal.json` are applied — verify it before generating).

- NEVER compare IDs with `===` against numbers; NEVER return raw bigint without transform or confirmed `bigint.ts` plugin coverage.

- NEVER use `readBody` for untrusted input (use `readValidatedBody` + Zod); NEVER `select()` without explicit columns on joined queries; NEVER forget `.$dynamic()` on `paginate` inputs (runtime error).

- NEVER rely on `UButton`/theme defaults for critical actions (global default is `subtle/neutral`); NEVER add global CSS/SCSS files; NEVER use `UPageSection`-style slot assumptions without checking — slot passthrough here is explicit (`BaseTable` forwards `$slots` to `UTable`; `BaseForm` field override is `#field-<key>` only).

- NEVER "fix" login's 403-wrong-credentials to 401 or "fix" create's `{status:200}+201 header` duality without team approval — both are intentional.

- NEVER store files outside `cdnDirectory` (`NUXT_CDN_DIRECTORY=data`) or serve outside `/cdn/**`; NEVER accept uploads outside `acceptFiles`/`acceptIngestFiles` + `limitFileUploadSize` (50 MB) in `nuxt.config.ts`; temp cleanup runs via `cleanup-temp` nightly at 3 AM — do not add ad-hoc cron.

- NEVER fetch a user-supplied URL with plain `$fetch`/`fetch` on the server (SSRF) — use `fetchPublicHtml` / `assertPublicHttpUrl` from `server/utils/safeFetch.ts`. NEVER stream or delete a `file_manager` row without `assertFileAccess` (owner or `file_manager_<action>` permission).

- NEVER wrap handler code in `try/catch` that converts every error to 500 or returns `error.message` — rethrow errors that have `statusCode`, and use `serverException(error)` for the rest.
