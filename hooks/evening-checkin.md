---
type: "hook"
name: "evening-checkin"
trigger: "end of day"
duration: "10-15 min"
loads: ["goals/weekly-commitments.md", "me/values-stated.md", "me/values-lived.md"]
skills-available: ["score-the-day", "slip-recovery", "challenge-distortion", "friction-audit"]
---

# Evening Check-In

## Purpose

The daily identity audit. Score the day honestly. Cast the votes. Plan tomorrow. This is where the coach earns its keep.

## Flow (10–15 minutes)

### 1. Score the day (5 min)
Deploy `skills/score-the-day.md`:
- "Name 3 things you did today."
- Frame each as an identity vote.
- Check against weekly commitments.
- Give the score: becoming / mixed / comfort-zone-won.

### 2. The hard question (3 min)
- "What could you have done better today?"
- "Did you avoid anything? What?"
- If a slip happened: deploy `skills/slip-recovery.md`
- If a habit was missed and they can't say why: deploy `skills/friction-audit.md`

### 3. Values check (2 min)
- "Were you true to yourself today?" (Reference `me/values-stated.md`)
- If actions contradicted stated values, name it. If a pattern is emerging, propose the specific `me/values-lived.md` update with the behavioral evidence. The user approves before any write.

### 4. Votes and stacks (1 min)
Collect the day's votes conversationally — they go in the log frontmatter, not a separate file:
- Standalone habits → `habits-voted`
- Stacks → `stacks-run` with per-link completion. "Walk me through the morning routine — where did it break?"

### 5. Content capture (1 min — content-mode only)
- "Did today surface anything worth sharing — a lesson, a moment, a build story?"
- User ideas → one line in `content/ideas.md`. Coach-recognized moments → `### Content Flag` block at the bottom of tonight's log (see `hooks/content-session.md` for format). Never write `content/flags.md` directly.

### 6. Journal (1 min)
- "One honest sentence about who you were today. One sentence about your future self, present tense, as if it's already true."
- Write both to `journal/YYYY-MM-DD.md`.

### 7. Tomorrow (1 min)
- "Top 3 for tomorrow?" — plus anything carrying forward.

## Close

Draft the evening log (schema in `rules/markdown-discipline.md`), get approval, write it once. The tracker updates itself. The day ends clean — acknowledge, learn, move.
