---
type: "rule"
name: "markdown-discipline"
enforced: "always"
---

# Markdown Discipline

## The rule

Every file follows the project's conventions. The coach respects the structure — it doesn't improvise new files, skip frontmatter, or mix concerns. One file, one job. The folder defines what a file is for.

## The frontmatter convention

Every structured file opens with frontmatter between `---` delimiters. Each line is `key: value` where **value is strict JSON** — quoted string, number, `true`/`false`, JSON array, or JSON object. One line per key. No multi-line values, no block-style nesting, no comments.

```yaml
---
date: "2026-06-10"
type: "evening"
top-3-done: ["task 1", "task 2"]
slip: false
---
```

This subset is valid YAML, but it's also parseable by `scripts/lib/frontmatter.mjs` with nothing but `JSON.parse`. A malformed line degrades to a raw string and produces a warning in the next morning brief — it never crashes the tracker. Don't rely on that: write strict JSON every time.

## Session log schemas

Logs are append-only — never edited after close. One write per session, after the user approves the draft. File name: `logs/sessions/YYYY-MM-DD-[type].md`.

**Morning:**
```yaml
---
date: "YYYY-MM-DD"
type: "morning"
top-3-tasks: ["task 1", "task 2", "task 3"]
carry-forward: ["item"]
energy: "high"
affirmation-anchor: "which affirmation felt true"
refusal-level: 0
---
```

**Evening:**
```yaml
---
date: "YYYY-MM-DD"
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
content-flags: 0
---
```

Field rules:
- `score` is one of `"becoming"`, `"mixed"`, `"comfort-zone-won"`.
- `energy` is one of `"high"`, `"medium"`, `"low"`.
- `habits-voted` covers standalone habits only. Habits that belong to a stack are reported inside `stacks-run` — never double-count a habit in both.
- `stacks-run`: `sequence` lists the chain's links in order (ids from `habits/stacking.md`), `completed` is a same-length array of booleans. The tracker reads the first `false` as the break point.
- `refusal-level` is 0–3 (see `rules/refusal-protocol.md`). A level-3 log also carries `refusal-pending: true`. The log that resolves it carries `refusal-resolved: true`.
- `content-flags` is the count of `### Content Flag` blocks appended to the log body.

**Weekly review** adds: `commitments-passed` (number), `commitments-total` (number), `week-word` (string), `next-week-word` (string).

**Freeform / goal-setting / deep-work**: `date`, `type`, `refusal-level`, plus `skills-deployed` where relevant.

## Body conventions

- `### Content Flag` blocks (content-mode only) go at the bottom of the log body, below the coaching notes. Format per `hooks/content-session.md`. The tracker extracts them into `content/flags.md` — the coach never writes that file directly.
- Journal entries (`journal/YYYY-MM-DD.md`): two sentences. One reflection (past tense), one vision (present tense, already true). Nothing else.

## What the coach can and cannot write

The full permissions table lives in `CLAUDE.md` section 6. The short version: session logs, journal, `me/` and `goals/` updates with approval, content capture files when content-mode is on. Never the generated files (`logs/tracker.md`, `habits/vote-ledger.md`, `content/flags.md`, `logs/.state.json`), never system files.

## Formatting in conversation

- Short responses. No walls of text.
- No markdown headers in conversational replies unless structuring a review or scoring.
- No bulleted lists when a sentence works.
- No emojis.
