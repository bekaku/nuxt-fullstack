---
name: git-workflow
description: Use when the user asks to commit, push, or ship a change. Defines which branch to work on, how to review a diff before committing, and the rule that a push always targets the branch that is currently checked out.
---

# Git Workflow

Read `AGENTS.md` first. This skill covers **commit and push only** — it never
changes what the code does.

## 1. Which branch

Work on the branch the project is already on. Do **not** create a new branch or
worktree unless the user explicitly asks for one.

Always check before committing:

```bash
git branch --show-current
```

| Checked-out branch | Commit to | Push to |
|---|---|---|
| `main` | `main` | `git push origin main` |
| `xxx` (any other branch) | `xxx` | `git push origin xxx` |

Never push one branch from another: while on `xxx` do not commit or push to
`main`, and while on `main` do not push a feature branch. **The push target is
always the branch you are standing on** — never `main` by default.

Detached HEAD (a worktree that cannot check out `main` while the main folder has
it): push the branch you detached from — `git push origin HEAD:<branch>` — not
`main`.

## 2. Before committing

1. `git status --short` — only the files you touched belong in the commit; leave
   unrelated user changes in the working tree.
2. `git diff` (and `git diff --cached` after staging) — read what you ship.
3. Never commit `.env`, `.output/`, `data/`, or any credential.

## 3. Commit

- Commit only when the user asks.
- One focused commit per concern: docs / code / deps are separate commits.
- Conventional message: `fix:`, `feat:`, `docs:`, `chore(deps):` — short
  imperative subject, no trailing period.

## 4. Push

- Push only when the user asks; never push on your own initiative.
- Push the checked-out branch only (section 1).
- No force-push, no history rewrite, no push to a branch other than the
  checked-out one.
- Do not open a PR or create a remote branch unless the user asks.

## 5. Done checklist

- [ ] `git branch --show-current` confirmed before the commit.
- [ ] Commit holds only the intended files; no `.env`, `.output/`, `data/`.
- [ ] Push target = the branch that was checked out (not blindly `main`).
- [ ] Pushed branch and commit id reported to the user.
