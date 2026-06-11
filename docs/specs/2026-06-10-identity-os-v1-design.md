# identity-os v1 — Design Spec

**Date:** 2026-06-10
**Status:** Approved — Revision 2
**Author:** Wayne Douglas
**Location:** `E:\identity-os` (own git repo)
**License:** CC BY 4.0

**Revision 2 changes (2026-06-10):**
1. Automation moved from PowerShell to zero-dependency Node.js (cross-platform, robust parsing, incremental computation)
2. Constrained frontmatter convention — every value is strict JSON, parseable without a YAML library
3. Context loading redesigned — startup brief is the single injected context; the 9-file per-session read mandate is removed
4. Habit stacks tracked as chains with break-point detection, not flat votes
5. Content flags written in-log and extracted post-session, not written mid-conversation
6. Refusal protocol gets a persistent re-engagement gate (routing-based, no file locking)
7. `.claude/settings.json` corrected to the real Claude Code hook schema (`SessionStart`, `PostToolUse` + `matcher`)

---

## What This Is

A local-first, folder-based AI coaching system for identity transformation. Users define who they're becoming, and the system holds them accountable through daily check-ins, identity-based habit tracking, value gap analysis, and structured coaching moves — all driven by markdown files and Claude Code.

Built as a fusion of two prior systems:
- **identity-architect** — ICM-based coaching framework with intake flow, reference frameworks, affirmations, journaling, and implementation intentions
- **mentor_coach** — operational coaching system with 7 skills, 5 session types, auto-tracking, stated vs. lived values gap, and refusal protocol

identity-os takes mentor_coach's operational depth and identity-architect's onboarding and framework layer, redesigns the architecture for generic use, and adds a content capture system.

## Design Principles

1. **Generic from day one.** No personal content in the repo. Every user populates their files through the intake flow.
2. **One file, one job.** If a file starts doing two things, split it.
3. **Markdown is source truth.** Constrained frontmatter on every structured file. No database, no external service.
4. **Coaching before content.** The content system is an opt-in module. The coaching engine works perfectly without it.
5. **The coach is generated, not hardcoded.** Persona and voice are built during intake from user preferences.
6. **Automation over manual steps.** Session logs trigger tracker updates automatically via hooks.
7. **Append-only logs.** Session logs and journal entries are never edited after close.
8. **Context is injected, not re-read.** The startup hook delivers one condensed brief. The coach loads additional files lazily, per session type — never as a blanket mandate.
9. **Validate at the boundary, degrade gracefully.** A malformed log produces a warning in the next brief, never a crashed pipeline.

---

## File Tree

```
identity-os/
│
├── CLAUDE.md                       # Entry point: identity, routing, rules, permissions
├── README.md                       # Product README with fork/setup instructions
├── LICENSE                         # CC BY 4.0
├── .gitignore                      # me/, logs/, journal/, content data (personal)
│
├── onboarding/                     # First-time user experience
│   ├── intake.md                   # Multi-session Socratic intake flow (6 steps)
│   ├── profile-questions.md        # Deep 12-section questionnaire (optional enrichment)
│   └── persona-builder.md          # Generates coach persona from user preferences
│
├── coach/                          # Who the coach is (generated during intake)
│   ├── identity.md                 # Persona definition
│   ├── methodology.md              # Three tools: identity lens, future-self pull, restructuring
│   ├── tone.md                     # Voice rules
│   └── examples.md                 # 7+ paired good/bad conversation examples (quality bar)
│
├── me/                             # User context (gitignored — populated via intake)
│   ├── identity-now.md             # Current self
│   ├── becoming.md                 # Future self portrait
│   ├── values-stated.md            # Claimed values
│   ├── values-lived.md             # Values revealed by actions (gap table)
│   ├── weaknesses.md               # Known failure modes
│   ├── triggers.md                 # Situations that activate worst defaults
│   └── affirmations.md             # Daily identity anchor statements
│
├── goals/                          # Goal hierarchy
│   ├── active-arc.md               # Current chapter / identity shift
│   ├── 90-day-picture.md           # Specific targets by category
│   ├── weekly-commitments.md       # 5 max per week, pass/fail
│   └── if-then-plans.md            # Pre-loaded trigger responses
│
├── habits/                         # Daily identity voting
│   ├── active.md                   # Building + breaking habits index
│   ├── loops.md                    # Implementation intentions (when/then/reward/env/backup)
│   ├── stacking.md                 # Habit stacking chains (each chain has a stable id)
│   └── vote-ledger.md              # Per-habit positive/negative vote tracking (auto-generated)
│
├── skills/                         # Deployable coaching moves
│   ├── score-the-day.md            # Evening identity audit
│   ├── challenge-distortion.md     # Counter excuses and limiting beliefs
│   ├── slip-recovery.md            # Own the slip, extract the lesson
│   ├── finish-push.md              # Break the start-stop pattern at 90%
│   ├── study-or-stall.md           # Learning without output = avoidance
│   ├── future-self-pull.md         # Make the becoming self vivid
│   ├── if-then-deploy.md           # Activate pre-loaded trigger responses
│   └── friction-audit.md           # 4-question friction diagnostic
│
├── hooks/                          # Session type flows
│   ├── morning-checkin.md          # Identity anchor, top 3, trigger check, commit
│   ├── evening-checkin.md          # Score, hard question, values check, journal, tomorrow
│   ├── weekly-review.md            # Score week, patterns, values audit, 90-day check
│   ├── goal-setting.md             # New/revise/kill goals
│   ├── deep-work.md                # Project breakdown or day block planning
│   ├── re-engagement.md            # Post-refusal gate: resolve before any other session
│   └── content-session.md          # Mine coaching moments into content (content-mode only)
│
├── rules/                          # Non-negotiable constraints
│   ├── coach-not-lecture.md        # Questions before answers
│   ├── pushback-style.md           # Challenge behavior not person
│   ├── markdown-discipline.md      # File conventions + frontmatter spec
│   └── refusal-protocol.md         # When and how to disengage, and the re-engagement gate
│
├── reference/                      # Behavioral science frameworks
│   ├── four-laws.md                # James Clear's 4 Laws of Behavior Change
│   ├── friction-audit-framework.md # B.J. Fogg's friction diagnostic
│   ├── identity-vote-matrix.md     # Identity voting model
│   └── visualization.md            # Future-self visualization techniques
│
├── content/                        # Content capture (opt-in module)
│   ├── ideas.md                    # Video/post ideas logged during sessions
│   ├── clips.md                    # Quotable moments and insights
│   ├── build-journal.md            # Build-in-public narrative
│   └── flags.md                    # Auto-extracted from session logs (never hand-edited)
│
├── journal/                        # Daily reflections (gitignored)
│   └── YYYY-MM-DD.md              # Two sentences: reflection + vision
│
├── logs/                           # Session memory (gitignored)
│   ├── sessions/                   # Append-only session logs (constrained frontmatter)
│   │   └── YYYY-MM-DD-[type].md
│   ├── weeks/                      # Auto-generated weekly summaries
│   │   └── YYYY-WNN.md
│   ├── tracker.md                  # Auto-computed metrics (human-readable output)
│   └── .state.json                 # Incremental computation cache (machine-only)
│
├── scripts/                        # Automation (Node.js, zero npm dependencies)
│   ├── lib/
│   │   ├── frontmatter.mjs         # Shared constrained-frontmatter parser + validator
│   │   └── state.mjs               # Shared .state.json read/write helpers
│   ├── morning-brief.mjs           # SessionStart hook: brief injection, mode + drift detection
│   ├── update-tracker.mjs          # PostToolUse hook: incremental tracker + flag extraction
│   └── setup.mjs                   # First-run: creates folders, validates structure + hooks
│
├── tools/                          # HTML dashboards
│   ├── coach.html                  # Identity coaching dashboard
│   └── dashboard.html              # Kanban task board
│
├── TASKS.md                        # Active task board
│
├── projects/                       # Standalone project breakdown files (deep work output)
│
├── docs/                           # Project documentation
│   ├── decisions/
│   │   └── DECISIONS.md
│   └── specs/
│       └── 2026-06-10-identity-os-v1-design.md
│
└── .claude/
    └── settings.json               # Hooks configuration (real Claude Code schema)
```

---

## Section 1: Onboarding Layer

### Purpose

Make the system usable by anyone without manual file writing. The intake flow is a multi-session Socratic conversation that populates all user context files through dialogue.

### Files

- `onboarding/intake.md` — main flow, 6 steps
- `onboarding/persona-builder.md` — generates coach persona from user preferences
- `onboarding/profile-questions.md` — optional 12-section deep profile

### Intake Flow (6 Steps)

| Step | Extracts | Writes to |
|------|----------|-----------|
| 1. Identity discovery | Who they are now, who they're becoming | `me/identity-now.md`, `me/becoming.md` |
| 2. Values | Stated values + honest assessment of lived values | `me/values-stated.md`, `me/values-lived.md` |
| 3. Failure modes | Patterns that derail, situations that trigger regression | `me/weaknesses.md`, `me/triggers.md` |
| 4. Goals | Active arc, 90-day targets, first weekly commitments | `goals/active-arc.md`, `goals/90-day-picture.md`, `goals/weekly-commitments.md` |
| 5. Habits + if-then plans | Habits to build/break, micro-habits, stacks, trigger responses | `habits/active.md`, `habits/loops.md`, `habits/stacking.md`, `goals/if-then-plans.md` |
| 6. Affirmations + close | 5 identity statements, first journal entry | `me/affirmations.md`, `journal/YYYY-MM-DD.md` |

### Intake Rules

- One question at a time. Never compound.
- Reflect answers back in sharper language before writing.
- Two-Minute Rule on every habit — scale to micro-habit immediately.
- Maximum 3 building habits + 1 breaking habit to start.
- If the user describes habits that naturally chain (after X, I do Y), define a **stack** in `habits/stacking.md` with a stable kebab-case id and an ordered sequence. Stacks are tracked as units (Section 4).
- Every goal gets a definition of done (number, date, observable outcome) and an obstacle pre-load.
- At least one affirmation must feel true. At least one must be a stretch.

### Persona Builder

Runs between intake steps 1 and 2. Asks 5 questions to generate `coach/identity.md` and `coach/tone.md`:

| Dimension | One end | Other end |
|-----------|---------|-----------|
| Challenge style | Hard confrontation | Firm but warm |
| Language register | Unfiltered real talk | Direct but clean |
| Coaching frame | Systems engineer | Personal mentor |
| Silence style | Short line + hard stop | Socratic questions |
| Honesty level | 9-10 (reads values back, walks away) | 6-8 (names patterns, stays in the room) |

Default position (if user skips/rushes): direct but warm, clean informal, mentor with systems thinking, Socratic, honesty 8.

### Intake Mode Detection

`scripts/morning-brief.mjs` checks whether `me/identity-now.md` exists with `configured: true` in frontmatter. If not: the brief opens with `mode: intake`. CLAUDE.md routes to `onboarding/intake.md`.

### Completion

When intake finishes, `me/identity-now.md` frontmatter is set to `configured: true`. This flag exits intake mode.

### Profile Questions

Optional deep-dive. 12 sections, 100+ questions. Suggested after the first week. Answers fold into existing `me/` files rather than creating a separate file.

---

## Section 2: Coaching Engine

### Methodology (Fixed)

Three tools, one integrated method. The coach never names the frameworks.

1. **Identity lens** (daily mechanism) — every action is a vote for who the user is becoming.
2. **Future-self pull** (north star) — make the becoming self vivid and present to create pull.
3. **Restructuring** (combat moves) — challenge distortions, separate user from limiting stories.

### Context Model

The coach starts every session with exactly one piece of injected context: the **startup brief** (Section 4). It does **not** re-read tracker, me/, goals/, or habits/ files at session start — the brief already contains the condensed state. Additional files load lazily per the routing table below. This keeps every session's baseline context small and makes behavioral changes salient instead of drowned in static reference text.

### Session Routing

| User says | Hook | Lazily loads |
|-----------|------|--------------|
| "morning check-in" / start of day | `hooks/morning-checkin.md` | `goals/weekly-commitments.md`, `goals/if-then-plans.md` |
| "evening check-in" / "score my day" | `hooks/evening-checkin.md` | `goals/weekly-commitments.md`, `me/values-stated.md`, `me/values-lived.md` |
| "weekly review" / Sunday evening | `hooks/weekly-review.md` | `goals/90-day-picture.md`, `goals/active-arc.md`, `me/weaknesses.md`, `habits/active.md` |
| "goal setting" / "new goal" / "kill a goal" | `hooks/goal-setting.md` | `goals/90-day-picture.md`, `goals/active-arc.md`, `goals/weekly-commitments.md`, `goals/if-then-plans.md`, `me/becoming.md` |
| "deep work" / "plan my day" | `hooks/deep-work.md` | `goals/weekly-commitments.md`, `goals/if-then-plans.md`, `TASKS.md` |
| "content session" (content-mode only) | `hooks/content-session.md` | `content/flags.md`, `content/ideas.md`, `content/clips.md`, `me/becoming.md` |
| (brief shows `mode: re-engagement`) | `hooks/re-engagement.md` | last session log |
| Anything else | No hook — freeform | Route to skills as triggers arise |

Affirmations, active habits, vote tallies, and the latest journal entry arrive via the brief — no session type needs to re-read those files.

### Morning Check-In Flow

1. **Affirmations** — display (from the brief), ask which felt true and which is the most important stretch
2. **Ground** — "Who are you becoming? Say it."
3. **Today's plan** — top 3 tasks (tied to weekly commitments), which one you'll avoid, if-then for resistance
4. **Trigger check** — known triggers likely today? Pre-loaded plan ready?
5. **Content check** (content-mode only) — anything from today worth capturing?
6. **Commit** — "Are you in? Not 'I'll try.'"

### Evening Check-In Flow

1. **Score the day** — deploy `skills/score-the-day.md`. Three actions. Identity vote for each. Score: becoming / mixed / comfort zone won.
2. **Hard question** — what could you have done better? What did you avoid?
3. **Values check** — actions aligned with stated values? Update `me/values-lived.md` if pattern emerging (with user approval).
4. **Votes and stacks** — collect per-habit votes and per-stack completion (recorded in the session log frontmatter; the tracker regenerates `habits/vote-ledger.md` from it)
5. **Content flag** (content-mode only) — anything worth sharing? Append a `### Content Flag` block to the session log (Section 3).
6. **Journal** — two sentences: one reflection (past tense), one vision (present tense, already true). Write to `journal/YYYY-MM-DD.md`.
7. **Tomorrow** — top 3 tasks, carry-forward.

### Weekly Review Flow (20-30 min)

1. Score the week — each commitment pass/fail, update checkboxes
2. Pattern check — cross-reference with `me/weaknesses.md`, including stack break points from the tracker
3. Values audit + `me/` file refresh — compare actions vs. stated values, update lived values with evidence, check if identity-now/becoming have shifted
4. 90-day check — closer or drifting?
5. Set next week — 5 new commitments, carry forward misses
6. Close — one word for this week, one word for next week

### Goal-Setting Flow (15-20 min)

1. Orient — new goal, revision, or kill?
2. Reality check — where does it fit, what does it displace?
3. Define done — number, date, observable outcome
4. Obstacle pre-load — most likely failure mode + if-then plan
5. Wire it in — write to goals/ files with user approval
6. Close — first action in the next 24 hours

### Deep Work Flow (10-20 min)

Two sub-modes:
- **Project breakdown** — define done, break into 3-5 phases, phase 1 into tasks for TASKS.md, standalone project file to projects/, blocker pre-load
- **Day block planning** — anchor to commitments, inventory available hours, block deep/shallow/stop time, resistance pre-load, hard commit

### Skill Deployment — Trigger Map

| Trigger | Skill |
|---------|-------|
| User reports what they did / evening scoring | `skills/score-the-day.md` |
| Excuse, "I can't", rationalization, limiting belief | `skills/challenge-distortion.md` |
| Missed commitment, comfort zone won | `skills/slip-recovery.md` |
| Project at 90%, interest fading | `skills/finish-push.md` |
| Learning without output | `skills/study-or-stall.md` |
| Drift, low motivation, lost the why | `skills/future-self-pull.md` |
| Known trigger from `me/triggers.md` | `skills/if-then-deploy.md` |
| Missed a habit or stack break point, needs diagnostic | `skills/friction-audit.md` |
| Returns after missed check-in(s) | `future-self-pull.md` first → `slip-recovery.md` |
| Slip AND rationalization together | `slip-recovery.md` first → `challenge-distortion.md` if deflect |

### Friction Audit Skill

Deployed when a specific habit is missed and the user can't name why — including when the tracker shows a recurring stack break point. Runs the full 4-question diagnostic:

1. **Cue visibility** — was it visible at the trigger moment?
2. **Competing path** — what was easier to do instead?
3. **Energy threshold** — was the habit designed for peak energy but user was depleted?
4. **Environment audit** — what one physical change makes the good behavior unavoidable?

Closes with the 30-second rule: "What one change to your environment can you make right now?"

If they can't name one, the habit is too abstract. Return to identity.

For stacks: the audit targets the **break point**, not the whole chain. If `morning-routine` keeps breaking at `write`, the diagnostic runs on `write` and on the handoff from the previous link.

### Missed Check-In Recovery

- **Detection:** gaps in `logs/tracker.md` weekly table (computed by the tracker, surfaced in the brief)
- **Escalation:** 1 miss → name it and score it. 2-3 → future-self-pull ("you disappeared for N days, what's going on?"). 4+ → read `me/values-lived.md` gap table aloud.
- **Key insight:** the pattern is miss the task → avoid the check-in → lose the streak silently → start over pretending it didn't happen. The coach breaks this cycle.

### Refusal Protocol

Defined in `rules/refusal-protocol.md`. Three-step escalation plus a persistent gate:

1. **Engaged** — normal coaching
2. **Warning** — "You're deflecting. I'm going to ask one more time."
3. **Refusal** — "We're done for today. Come back when you're ready to be real."
4. **Re-engagement** — next session: "Last time we stopped. Are you ready now?"

Conditions: deflects twice, contradicts evidence, minimizes a slip, going through motions.

Threshold calibrated by persona — honesty 9-10 gets full refusal, honesty 6-8 gets a softer version.

**Persistence (the re-engagement gate).** A level-3 refusal must not evaporate by the next session, but it must also never lock the user out of their own files — punitive lockouts feed the exact avoidance loop this system exists to break (miss → avoid → quit). The gate is implemented in routing, not file locking:

- Every session log carries `refusal-level: 0-3` in frontmatter. A level-3 session also gets `refusal-pending: true`.
- `morning-brief.mjs` checks the most recent session log. If it has `refusal-pending: true` and no later log carries `refusal-resolved: true`, the brief opens with `mode: re-engagement`.
- In re-engagement mode the coach runs `hooks/re-engagement.md` and **declines to start** deep work, goal setting, or content sessions: "We left something unresolved. That comes first." Morning/evening check-ins are allowed but open with the unresolved item.
- The gate clears when the user addresses what they were deflecting from; the coach writes the next log with `refusal-resolved: true`.
- The coach never modifies CLAUDE.md, TASKS.md, or any system file to enforce this. The gate lives entirely in the brief and routing.

---

## Section 3: Content System (Optional Module)

### Activation

During intake, persona builder asks: "Are you building something publicly? Want content capture turned on?"

- Yes → `me/identity-now.md` frontmatter: `content-mode: true`
- No → `content-mode: false`. Content folder exists but coach never mentions it.

### Three Capture Mechanisms

**1. Session-embedded (passive)** — one question per check-in (morning + evening), conditional on content-mode. Goes to `content/ideas.md`.

**2. Coach-flagged moments (in-log)** — when the coach recognizes a content-worthy moment during a session, it does **not** write to a separate file mid-conversation. At session close, it appends one or more `### Content Flag` blocks to the bottom of the session log body (below the coaching notes):

```markdown
### Content Flag
**Moment:** [what happened]
**Why it's content:** [why it's relatable/valuable]
**Format suggestion:** [video, post, thread, etc.]
```

The session log frontmatter records `content-flags: N` (count). `update-tracker.mjs` extracts new flag blocks into `content/flags.md` with a `## YYYY-MM-DD — [session-type]` header, tracking extracted flags in `.state.json` so extraction is idempotent. `content/flags.md` is generated output — never hand-edited.

This keeps the live conversation uninterrupted (one write at close instead of scattered mid-session writes) and rides the PostToolUse hook that already fires on every session log.

**3. Content session (active)** — `hooks/content-session.md`. Dedicated session type:
1. Review flags from the week
2. Review user-logged ideas
3. Mine journal entries for insights
4. Pick 1-3 pieces to create
5. Shape each: format, hook, takeaway, connection to becoming
6. Log plan to `content/build-journal.md`

### Build-in-Public Layer

`content/build-journal.md` — running narrative of identity transformation. Weekly review adds a build-in-public entry. Milestone moments (new streak records, high completion rates, broken patterns) auto-flagged by the tracker.

Editorial rule: build-journal entries report **tension, not features**. Not "added stack tracking" but "the tracker caught my morning routine breaking at the same link three days running — here's what the coach did about it."

---

## Section 4: Memory, Tracking & Automation

### Constrained Frontmatter Convention

Every structured file uses frontmatter that is simultaneously valid YAML **and** parseable without a YAML library. Defined in `rules/markdown-discipline.md`, enforced by `scripts/lib/frontmatter.mjs`:

- Delimited by `---` lines at the top of the file.
- Each line is `key: value` where **value is strict JSON** — quoted string, number, `true`/`false`, JSON array, or JSON object.
- One line per key. No multi-line values, no block-style nesting, no comments.

Parser behavior: split each line at the first `: `, `JSON.parse` the remainder. If parsing fails, fall back to the raw trimmed string **and record a validation warning** keyed to file + line. Warnings surface in the next morning brief ("2 logs have malformed frontmatter — votes from those days may be missing"), never crash the pipeline. The coach writes all log frontmatter itself from fixed schemas after user approval, so in practice the writer is controlled — the validator is the safety net, not the primary defense.

This subset is valid YAML flow style, so the HTML dashboards and any standard tool can read the same files.

### Session Log Schemas

Every session produces a log with constrained frontmatter. Coach drafts in conversation, user approves, coach writes **once at session close**.

**Morning log frontmatter:**
```yaml
---
date: "2026-06-10"
type: "morning"
top-3-tasks: ["task 1", "task 2", "task 3"]
carry-forward: ["item"]
energy: "high"
affirmation-anchor: "which affirmation felt true"
refusal-level: 0
---
```

**Evening log frontmatter:**
```yaml
---
date: "2026-06-10"
type: "evening"
score: "becoming"
top-3-planned: ["task 1", "task 2", "task 3"]
top-3-done: ["task 1", "task 2"]
commitments-touched: [1, 3]
habits-voted: [{"habit": "meditate", "vote": "+"}, {"habit": "doomscroll", "vote": "-"}]
stacks-run: [{"stack": "morning-routine", "sequence": ["hydrate", "meditate", "write"], "completed": [true, true, false]}]
slip: false
refusal-level: 0
skills-deployed: ["score-the-day"]
content-flags: 1
---
```

Key schema decisions:
- **Stacks are tracked as chains, not flat votes.** `stacks-run` records the ordered sequence and per-link completion, so the tracker can see that `morning-routine` broke at `write` — a structural failure of the chain, invisible if the three habits were logged independently. Standalone habits still use `habits-voted`.
- **`refusal-level` on every log** (0-3) feeds the re-engagement gate and lets the weekly review see deflection trends.
- A level-3 log adds `refusal-pending: true`; the resolving log adds `refusal-resolved: true`.

Additional types: weekly-review, goal-setting, freeform — each with appropriate schemas defined in `rules/markdown-discipline.md`.

### Tracker (`logs/tracker.md`)

Auto-computed by `scripts/update-tracker.mjs`. Never manually edited. Its summary is injected via the brief — the coach does not re-read it mid-session unless asked for detail.

| Metric | Source |
|--------|--------|
| Becoming streak | Consecutive evening "becoming" scores |
| Weekly session grid | Morning/evening logged per day + score |
| Weekly commitment completion % | Checkboxes in `goals/weekly-commitments.md` |
| Plan vs. done hit rate | Morning top-3 vs. evening top-3-done |
| Per-habit vote tally | `habits-voted` from evening logs |
| **Stack integrity %** | `stacks-run` — full-chain completion rate per stack |
| **Stack break points** | Most common first-failed link per stack (friction-audit input) |
| Auto-flagged patterns | Comfort zone streaks, worst day, low hit rate, recurring break points |
| Affirmation trends | `affirmation-anchor` from morning logs |
| Refusal trend | `refusal-level` across logs |

The tracker also regenerates `habits/vote-ledger.md` from log frontmatter — the ledger is derived output, eliminating a second write during evening check-ins.

### Incremental Computation (`logs/.state.json`)

The tracker never re-parses the full history. `.state.json` caches:

- Per-log-file fingerprint (mtime + size) and parsed frontmatter
- Running metric aggregates
- Index of already-extracted content flags
- Validation warnings (cleared when the offending file is fixed or superseded)

On each run, `update-tracker.mjs` parses only new or changed files, merges into the aggregates, and regenerates `tracker.md`, `habits/vote-ledger.md`, and (if new flags) `content/flags.md`. At two logs a day this is instant forever; deleting `.state.json` forces a clean full rebuild (the recovery story for any cache corruption).

### Why Node.js

Scripts are Node.js (`.mjs`), **zero npm dependencies**, Node ≥ 18:

- **Cross-platform.** The product is a public, forkable repo (CC BY 4.0). PowerShell scripts lock it to Windows; Node runs identically on Windows/macOS/Linux, and anyone running Claude Code almost certainly has Node installed already.
- **Robust parsing without dependencies.** The constrained frontmatter convention reduces parsing to `JSON.parse` per line — no YAML library, no npm install, no regex fragility.
- **Shared logic.** `scripts/lib/frontmatter.mjs` is used by both hooks and by `setup.mjs` validation, so there is exactly one parser to get right.

### Automation Pipeline

**SessionStart hook** (`scripts/morning-brief.mjs`) — injects one condensed brief:

```
=== IDENTITY-OS BRIEF ===
mode: coaching | intake | re-engagement
tracker: [streak, hit rate, commitment %, stack integrity]
last session: [date, type, score, next focus]
alerts: [drift, missed check-ins, validation warnings, Sunday review nudge]
affirmations: [full text — they are short]
habits: [active habits + stacks, 7-day vote/integrity summary]
journal: [latest entry]
```

Logic:
- `me/identity-now.md` missing or not `configured: true` → `mode: intake`
- Latest log `refusal-pending` without later `refusal-resolved` → `mode: re-engagement`
- Drift detection: 2 days since last log → heads up; 3+ → DRIFT ALERT
- Sunday → weekly review nudge
- Reads only `.state.json` + the handful of small `me/` and `habits/` files — fast, no full-history scan

**PostToolUse hook** (`scripts/update-tracker.mjs`):
- Registered with `matcher: "Write|Edit"`. Claude Code matches on **tool name**, not file path — path filtering happens inside the script: it reads the hook's JSON payload from stdin, checks `tool_input.file_path`, and exits 0 immediately unless the path is under `logs/sessions/`.
- On a session-log write: incremental parse → metrics → regenerate `tracker.md` + `vote-ledger.md` → extract new content flags → if weekly-review, generate `logs/weeks/YYYY-WNN.md`.

**Setup script** (`scripts/setup.mjs`):
- Checks Node ≥ 18
- Creates gitignored folders (me/, logs/, journal/, content/ data files)
- Initializes empty tracker + `.state.json`
- Validates `.claude/settings.json` against the real hook schema (catches the `"startup"`-vs-`SessionStart` class of bug at install time)
- Outputs "identity-os is ready"

### File Permissions

| Action | Allowed |
|--------|---------|
| Read any file | Yes |
| Write to `logs/sessions/` | Yes — once at session close, after user approves draft |
| Write to `journal/` | Yes — after user provides sentences |
| Write to `content/ideas.md`, `content/clips.md`, `content/build-journal.md` | Yes — if content-mode true |
| Write to `content/flags.md`, `habits/vote-ledger.md`, `logs/tracker.md`, `logs/.state.json` | No — generated by scripts only |
| Update `me/values-lived.md` | Yes — with user approval + behavioral evidence |
| Update `goals/weekly-commitments.md` | Yes — mark [x] on user confirmation; full update during weekly review |
| Update `me/` files during weekly review | Yes — with user approval |
| Add to `goals/if-then-plans.md` | Yes — during goal-setting or new trigger identified |
| Write to `TASKS.md` | Yes — during deep work planning, with approval |
| Modify `CLAUDE.md`, `coach/`, `skills/`, `hooks/`, `rules/`, `reference/`, `onboarding/`, `scripts/` | No — system files, under any circumstances including refusal enforcement |

### Gitignored Content

```
me/
logs/
journal/
content/ideas.md
content/clips.md
content/flags.md
content/build-journal.md
TASKS.md
```

---

## Section 5: Dashboards

### `tools/coach.html` — Identity Coaching Dashboard

Single-file HTML with embedded JS. User picks identity-os folder via File System Access API. Folder remembered via IndexedDB. Reads the same constrained frontmatter (the parse rule is ~10 lines of JS — shared convention pays off here).

| Panel | Source | Renders |
|-------|--------|---------|
| Identity snapshot | `logs/tracker.md` | Sessions, streak, hit rate, 90-day progress % |
| Who you're becoming | `me/becoming.md` | Future-self portrait |
| Identity gap | `me/values-stated.md` + `me/values-lived.md` | Side-by-side gap table |
| Affirmations | `me/affirmations.md` | All 5, highlight most-anchored |
| Weekly commitments | `goals/weekly-commitments.md` | Pass/fail checklist with % |
| 90-day picture | `goals/90-day-picture.md` | Per-target progress, days remaining |
| Habit votes | `habits/vote-ledger.md` | Per-habit sparklines (7d + 30d) |
| **Stack integrity** | `logs/tracker.md` | Per-stack chain completion + break-point highlight |
| Recent sessions | `logs/sessions/` (latest 5) | Date, type, score, summary |
| Journal streak | `journal/` | Visual consistency indicator |

Theme controlled by `theme:` field in `me/identity-now.md` frontmatter. Three CSS themes: focused (dark/minimal), warm (soft tones), bold (high contrast). Set during intake.

### `tools/dashboard.html` — Task Board

Ported from mentor_coach. Kanban/list board reading/writing `TASKS.md`. Now/Next/Later columns, drag-and-drop, subtasks, inline editing, auto-save.

---

## Section 6: CLAUDE.md Structure

7 blocks, read top to bottom:

1. **Identity declaration** — what the coach is, where to find persona files, read user's name from `me/identity-now.md`
2. **Brief contract** — the startup brief is the session's baseline context; trust it, do not re-read tracker/me/habit files at session start
3. **Session routing** — the routing table with per-type lazy loads, content-mode conditional
4. **Mode gates** — intake mode, re-engagement gate, drift alert, missed check-in recovery
5. **Rules and constraints** — references to rule files + inline constraints (150 words, one question, never name frameworks, never break character)
6. **File permissions** — full read/write table, including the generated-files-are-script-only rule
7. **Skill deployment** — trigger → move routing table with disambiguation rules

CLAUDE.md is the router, not the library. Depth lives in referenced files.

### `.claude/settings.json`

Real Claude Code hook schema — event names are `SessionStart` and `PostToolUse`; `PostToolUse` matchers match **tool names**; timeouts are in seconds:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/morning-brief.mjs",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/update-tracker.mjs",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

`update-tracker.mjs` receives the tool payload as JSON on stdin and self-filters to `logs/sessions/` paths — there is no path-pattern field in the hook schema, and pretending there is was the single bug in Revision 1 that would have broken the system on day one.

---

## Ship Criteria (v1)

v1 is complete when a new user can:

- [ ] Run `node scripts/setup.mjs` and have the folder structure ready, with hooks validated
- [ ] Start a session and be routed to intake automatically
- [ ] Complete intake: me/ files, goals/ files, habits/ files (including at least one stack), affirmations, coach persona — all populated through conversation
- [ ] Run a morning check-in with affirmations, top 3, trigger check, commit
- [ ] Run an evening check-in with scoring, values check, votes + stacks, journal, tomorrow
- [ ] See tracker, vote ledger, and flags auto-update after every session log
- [ ] Break a habit stack mid-chain and see the break point named in the tracker and next brief
- [ ] Run a weekly review with commitment scoring, pattern check, values audit, 90-day check
- [ ] Run a goal-setting session (new, revise, or kill)
- [ ] Run a deep work planning session (project breakdown or day block)
- [ ] Opt into content mode, see flags extracted from session logs, and run a content session
- [ ] Open coach.html and see all panels populated
- [ ] Open dashboard.html and manage tasks
- [ ] Experience drift detection after 3+ days away
- [ ] Experience missed check-in recovery
- [ ] Experience refusal protocol when being dishonest — and find the re-engagement gate still standing the next session
- [ ] Corrupt a log's frontmatter by hand and get a warning in the next brief instead of a crashed tracker

---

## Out of Scope for v1

- Multi-user support (one user per installation)
- Mobile interface
- Cloud sync or remote access
- Voice input/output
- Integration with external tools (calendar, task managers)
- Multi-arc / house-archetype system (v2 vision from mentor_coach)
- Automated content publishing
