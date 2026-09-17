---
name: testing-debugging
description: Use for diagnosing failures and verifying changes in this repo, which has no test framework — verification is pnpm typecheck, pnpm build, log inspection, and targeted manual checks. Load when debugging, validating, or reviewing a diff.
---

# Testing & Debugging

## Purpose

Defines how to verify work and diagnose failures in a repository with no test
runner: static gates, build checks, log inspection, and focused manual testing.

## When to Use

- Verifying any code change (with the layer skill for the changed code).
- Debugging runtime errors, SSR/hydration issues, failing builds, or DB problems.
- Reviewing a diff before finishing a task.

## When Not to Use

- As a substitute for the layer skill that owns the changed code — combine them.
- To introduce a test framework (requires an explicit task and team sign-off).

## Required Reading

- `AGENTS.md` (sections 11, 12, 13).
- `docs/FOOTGUNS.md` (known traps) and `docs/OPEN_QUESTIONS.md` (unresolved behavior).
- `docs/agent/project-map.md` (build and verification commands).

## Repository Evidence

- Gates: `package.json` scripts (`typecheck: nuxt typecheck`, `build: nuxt build`).
- Zero test files: no `*.test.*` / `*.spec.*`, no vitest/jest/playwright/cypress config.
- Dev aids: `app/composables/useApi.ts` dev-mode request logging; `server/utils/exception.ts`
  (strips driver internals); Nitro `bigint`/`date` plugins; `docker-compose-postgres.yml` (local DB).

## Workflow

1. Reproduce first: narrow the failing layer (client, API, DB, auth) and read the
   involved files plus `docs/FOOTGUNS.md` before changing anything.
2. Fix at the owning layer following that layer's skill; keep the change minimal.
3. Verify narrowly: `pnpm typecheck` always;
   `pnpm build` for runtime-affecting changes.
4. Inspect the final diff: only relevant files changed, no secrets, no drive-by refactors.
5. Report what was verified and what could not be executed (e.g. no live DB, no browser).

## Implementation Rules

- Never add `vitest`/`jest`/`playwright`/`cypress` config in a feature or fix task.
- Never run migrations, seed against shared databases, or destructive DB commands to "test".
- Never weaken intentional behavior to silence an error (login 403, create 201-header/200-body).
- Preserve `.env` / `.env.example` hygiene: real secrets never enter code, logs, or the diff.

## Anti-Patterns

- Claiming verification that was not executed; hiding failing checks.
- Mass-refactoring `any`s or reformatting unrelated files inside a fix.
- "Fixing" documented intentional behavior instead of the actual defect.

## Verification

- `pnpm typecheck` (required for every change).
- `pnpm build` when runtime behavior changed.
- Targeted manual checks of the affected page/endpoint/flow where possible.

## Completion Criteria

- Root cause addressed at the owning layer; gates pass for the change's scope.
- Diff reviewed and minimal; unverifiable checks explicitly reported with residual risks.
