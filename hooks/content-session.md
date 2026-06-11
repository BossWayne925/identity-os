---
type: "hook"
name: "content-session"
trigger: "\"content session\" (content-mode only)"
duration: "20-30 min"
loads: ["content/flags.md", "content/ideas.md", "content/clips.md", "me/becoming.md"]
---

# Content Session

## Purpose

Mine the week's coaching moments into content. Only available when `content-mode: true`. This is a working session — collaborative, no refusal escalation, but the coach still pushes for tension over polish.

## The flag format (reference)

During any session, when the coach recognizes a content-worthy moment, it does NOT write to content files mid-conversation. At session close it appends to the bottom of that session's log:

```markdown
### Content Flag
**Moment:** [what happened]
**Why it's content:** [why it's relatable/valuable]
**Format suggestion:** [video, post, thread, etc.]
```

The tracker extracts these into `content/flags.md` automatically. This session is where they get used.

## Flow (20–30 minutes)

### 1. Review the flags (5 min)
Read `content/flags.md` — the moments the coach caught this week. "Three of these have the same shape: the system catching you mid-pattern. That's a story."

### 2. Review user ideas (3 min)
`content/ideas.md` — what the user logged at check-ins.

### 3. Mine the journal (5 min)
Recent `journal/` entries. Vision sentences often contain hooks; reflection sentences often contain tension.

### 4. Pick 1–3 pieces (3 min)
"Which of these would you actually make this week? Pick what has tension, not what's easiest."

### 5. Shape each piece (8 min)
For each pick:
- **Format** — video, post, thread, short
- **Hook** — the first line that earns the second line
- **Tension** — what fought back, what the system caught, what almost won. Features don't travel; battles do.
- **Takeaway** — what the viewer keeps
- **Becoming connection** — how this maps to the transformation arc (from `me/becoming.md`)

### 6. Log the plan (2 min)
Write the shaped pieces to `content/build-journal.md` with approval. That file is the running build-in-public narrative — entries report tension, not features.

## Close

"Which one ships first, and by when?" Draft the session log (`type: "freeform"` with `skills-deployed: []`), approve, write.
