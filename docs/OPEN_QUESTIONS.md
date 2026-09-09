# Open Questions

These are unresolved repository/team questions. They are references, not mandatory rules for every task.

- `drizzle/` has duplicate migration numbers (`0001` x2, `0002` x2, `0003` x2) — squash or keep?

- `fileManager/index.get.ts` imports `requirePermission` but never calls it — intentional (any authed user can list files) or missing `file_manager_list` check?

- `favoriteMenu/*.ts` import `requirePermission` but never call it (only `getAuthUser`) — remove dead imports or add checks?

- `server/api/test-socket-send.post.ts` and `server/api/meta.ts` have zero auth — intentional public endpoints or missing guards?

- `permission/index.get.ts` returns raw bigint without `mapTo*` transform — rely on `server/plugins/bigint.ts` or add explicit `.toString()`?

- `pageName` meta values are inconsistent (`model_user` vs `model.role.table` vs `model.userProfile.table`) — which namespace is canonical?
