# Open Questions

These are unresolved repository/team questions. They are references, not mandatory rules for every task.

- `pageName` meta values and i18n model keys are inconsistent (`model_user` flat vs `model.role.table` nested) — new modules use nested `model.<table>.*`; should the existing flat keys be migrated (breaks key compatibility)?

- Server imports mix `#server/...`, `~~/server/...`, relative paths, and auto-imports — pick one style for new code?

- WebSocket demo broadcasts from `/api/test-socket-send` now carry `senderId` from the session (string) instead of the client-sent number — adjust `app/pages/example/websocket.vue` if it compares sender IDs.

## Resolved on 2026-09-25

Decisions applied in code (see `docs/agent/structure-review-2026-09-25.md`):

- Orphan duplicate migrations (`0000`–`0003` not in the journal) removed; the journal chain already contained their changes.
- File access policy: login required; owners manage their own files; `file_manager_{list,view,delete}` grants the same action on all files (`server/utils/files.ts` → `assertFileAccess` / `canAccessAllFiles`). My-drive menu/page use `file_manager_list`.
- `server/api/meta.ts` requires login and only fetches public http(s) URLs (`server/utils/safeFetch.ts`); `test-socket-send` requires login; `server/api/test/**` is dev-only + `app_user_add`.
- Upsert handlers (`appUser`, `appRole`, `permission`) now also require the exact `_add` / `_edit` code for the mode.
- `permission` handlers keep 404/409 errors and no longer leak driver messages; `permission/index.get.ts` returns string IDs.
- Dead imports removed from `favoriteMenu/*.ts`; `/ai-document-meta` menu item gated by `ai_document_meta_list`.
- Seed is idempotent.
