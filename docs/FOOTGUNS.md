# Known Footguns

Read this when debugging related behavior or touching the affected area. Do not load it for unrelated tasks.

- NEVER trust `v-rbac` / `byPassPermission` / client middleware as security — `v-rbac` only removes DOM nodes; `fileManager/index.get.ts` (missing server check) proves the gap. Server `requirePermission` is the ONLY gate.

- NEVER call `db:push` outside local dev; NEVER commit duplicate migration numbers again (`drizzle/0001-0003` duplicates already exist — verify `drizzle/meta` journal before generating).

- NEVER compare IDs with `===` against numbers; NEVER return raw bigint without transform or confirmed `bigint.ts` plugin coverage.

- NEVER use `readBody` for untrusted input (use `readValidatedBody` + Zod); NEVER `select()` without explicit columns on joined queries; NEVER forget `.$dynamic()` on `paginate` inputs (runtime error).

- NEVER rely on `UButton`/theme defaults for critical actions (global default is `subtle/neutral`); NEVER add global CSS/SCSS files; NEVER use `UPageSection`-style slot assumptions without checking — slot passthrough here is explicit (`BaseTable` forwards `$slots` to `UTable`; `BaseForm` field override is `#field-<key>` only).

- NEVER run `pnpm lint` as a gate until TS 7 support lands (it crashes the whole run); NEVER "fix" login's 403-wrong-credentials to 401 or "fix" create's `{status:200}+201 header` duality without team approval — both are intentional.

- NEVER store files outside `cdnDirectory` (`NUXT_CDN_DIRECTORY=data`) or serve outside `/cdn/**`; NEVER accept uploads outside `acceptFiles`/`acceptIngestFiles` + `limitFileUploadSize` (50 MB) in `nuxt.config.ts`; temp cleanup runs via `cleanup-temp` nightly at 3 AM — do not add ad-hoc cron.
