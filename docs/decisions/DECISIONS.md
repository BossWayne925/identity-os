# identity-os — Decision Log

Format: one entry per decision. Newest first. Each entry records what was decided, the alternatives considered, and why.

---

## 2026-06-10 — D-008: Hook config must use the real Claude Code schema

**Decision:** `.claude/settings.json` uses `SessionStart` and `PostToolUse` event names; `PostToolUse` matches on tool name (`Write|Edit`); path filtering happens inside `update-tracker.mjs` via the stdin JSON payload. `setup.mjs` validates the hook config at install time.

**Why:** Revision 1 used a `"startup"` event key and a `"pattern"` path field — neither exists in Claude Code's hook schema. The same bug exists silently in identity-architect's settings.json (its morning brief likely never fires via that entry). This was the only Revision-1 flaw that would have broken the product on day one.

---

## 2026-06-10 — D-007: Refusal persistence via routing gate, not file locking

**Decision:** A level-3 refusal writes `refusal-pending: true` to the session log. The morning brief detects it and sets `mode: re-engagement`; the coach declines deep-work/goal-setting/content sessions until a log carries `refusal-resolved: true`. The coach never modifies CLAUDE.md, TASKS.md, or any system file to enforce accountability.

**Alternative rejected:** An external review proposed appending an "ACCOUNTABILITY LOCK" banner to CLAUDE.md and locking TASKS.md. Rejected because (a) it violates the system-files-are-read-only permission rule, and (b) punitive lockouts feed the exact avoidance loop the system targets (miss → avoid → quit silently). The legitimate kernel — a refusal shouldn't evaporate overnight — is preserved by the routing gate.

---

## 2026-06-10 — D-006: Habit stacks tracked as chains with break-point detection

**Decision:** Evening logs record `stacks-run` with ordered sequence + per-link completion (`[true, true, false]`). The tracker computes per-stack integrity % and most-common break point, which feeds the friction-audit skill. Standalone habits keep flat `habits-voted` entries.

**Why:** Stacks fail as units. Logging chained habits independently makes a structural chain failure look like unrelated individual misses. (Credit: external review — best catch in it.)

---

## 2026-06-10 — D-005: Content flags written in-log, extracted post-session

**Decision:** The coach appends `### Content Flag` blocks to the session log at close; `update-tracker.mjs` extracts them into `content/flags.md` idempotently (tracked in `.state.json`). `content/flags.md` becomes generated output, never written directly by the coach.

**Why:** One write at session close instead of scattered mid-conversation writes, and it rides the PostToolUse hook that already fires on session logs. (The review's claim that mid-stream writes are *impossible* was wrong — they're just worse.)

---

## 2026-06-10 — D-004: Startup brief is the only injected context; lazy loads per session type

**Decision:** Removed the Revision-1 mandate that CLAUDE.md read 9 files every session. The SessionStart brief carries condensed state (tracker summary, last session, alerts, affirmations, habits, latest journal); the routing table lazy-loads only what each session type needs.

**Why:** The 9-file mandate duplicated what morning-brief already injects and diluted context with static text on every turn. The fix was a deletion, not a new mechanism.

---

## 2026-06-10 — D-003: Constrained frontmatter — every value is strict JSON

**Decision:** Frontmatter is `key: value` lines where value is strict JSON (quoted string, number, boolean, array, object). One line per key, no block nesting, no multi-line values. Still valid YAML flow style. Parse failures degrade to raw string + a warning surfaced in the next brief.

**Why:** Reduces parsing to `JSON.parse` per line — robust without a YAML dependency, shared between Node scripts and the HTML dashboards. The coach is the controlled writer; the validator is the safety net.

---

## 2026-06-10 — D-002: Automation in zero-dependency Node.js, not PowerShell

**Decision:** `scripts/*.mjs`, Node ≥ 18, no npm install. Shared parser in `scripts/lib/frontmatter.mjs`. Incremental computation via `logs/.state.json` (per-file fingerprints; delete the file to force full rebuild).

**Why:** The product is a public forkable repo — PowerShell locks it to Windows, while anyone running Claude Code effectively has Node already. The external review's performance argument was overstated (360 small files is trivial), but cross-platform + one shared parser + JSON-native parsing decided it. Incremental state makes performance a non-issue permanently.

---

## 2026-06-10 — D-001: identity-os = mentor_coach operations + identity-architect onboarding

**Decision:** Fuse the two prior systems into one generic, forkable repo (see Revision 1 of the design spec for the full original architecture).

**Why:** mentor_coach had the operational depth (skills, session types, auto-tracking, refusal protocol); identity-architect had the onboarding and framework layer. Neither was generic; both had personal content baked in.
