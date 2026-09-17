# Compatibility

Canonical source of truth: `AGENTS.md`. Canonical skills: `.agents/skills/`
(Agent Skills open specification — `SKILL.md` with `name` + `description`
frontmatter; agents discover by description and load the full file on demand).
All six target agents list Agent Skills support on the open specification's
client showcase (https://agentskills.io), which is the basis for the
DOCUMENTED BUT NOT TESTED ratings below. Only OpenCode was VERIFIED in this session
(it loaded `AGENTS.md` automatically).

Legend: VERIFIED (tested here) · DOCUMENTED BUT NOT TESTED (spec/listing claims
support, not exercised) · UNKNOWN (no local evidence).

| Agent | Native instructions | Native skills location | Canonical files discovered? | Adapter | Activation | Status |
|---|---|---|---|---|---|---|
| OpenCode | `AGENTS.md` | `.agents/skills/` (Agent Skills) | Yes — both | None needed | Automatic | VERIFIED |
| OpenAI Codex | `AGENTS.md` | Agent Skills (`SKILL.md`) | Yes — both (per spec listing) | None — canonical files suffice | Automatic | DOCUMENTED BUT NOT TESTED |
| Claude Code | `CLAUDE.md` (+ `AGENTS.md` memory support) | Agent Skills | Via `CLAUDE.md` adapter below | `CLAUDE.md` (points to `AGENTS.md` + `.agents/skills/`) | Adapter instructs manual load | DOCUMENTED BUT NOT TESTED |
| Cursor | `AGENTS.md` / `.cursor/rules/` | Agent Skills | Yes — both (per spec listing) | None — canonical files suffice | Automatic | DOCUMENTED BUT NOT TESTED |
| GitHub Copilot | `.github/copilot-instructions.md` | Agent Skills | Via adapter below | `.github/copilot-instructions.md` (points to `AGENTS.md` + `.agents/skills/`) | Automatic (repo file) | DOCUMENTED BUT NOT TESTED |
| Gemini CLI | `GEMINI.md` | Agent Skills | Via `GEMINI.md` adapter below | `GEMINI.md` (points to `AGENTS.md` + `.agents/skills/`) | Adapter instructs manual load | DOCUMENTED BUT NOT TESTED |

## Adapter Policy

- Adapters are minimal pointers: they name `AGENTS.md` as canonical, reference
  `.agents/skills/`, and duplicate NO project rules (no conflicting instructions).
- No copies of skills under vendor directories. If an agent cannot discover
  `.agents/skills/` directly, the adapter tells it to read the relevant `SKILL.md`
  by path — no sync mechanism, nothing to drift, works on all operating systems
  (no symlinks, which are unreliable on Windows).
- If compatibility cannot be verified for an agent, it is marked as above —
  never claimed as working.

## Validation Status

- `AGENTS.md` loading: VERIFIED (OpenCode session).
- Skill frontmatter (name = directory, description present, no vendor keys):
  validated locally, see validation in the final report (Phase 10).
- Runtime skill activation on Codex / Claude / Cursor / Copilot / Gemini:
  NOT tested here (no installs performed without authorization) — marked accordingly.
