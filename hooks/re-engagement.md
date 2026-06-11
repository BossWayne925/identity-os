---
type: "hook"
name: "re-engagement"
trigger: "brief shows mode: re-engagement"
duration: "5-15 min"
loads: ["most recent session log in logs/sessions/"]
---

# Re-Engagement Session

## Purpose

The last real session ended in a refusal. This session exists to resolve it — not to punish, not to relitigate, but to get the truth that was being avoided. Nothing else happens until it does.

## Flow

### 1. Open with it (no greeting)

"Last time we stopped. You were [deflecting on X / minimizing Y — from the refusal log]. Are you ready now?"

Read the most recent session log to name the specific thing — not a vague "you weren't being real."

### 2. Hold the single question

Whatever was being avoided, ask it again. One question. Then silence.

- If the user answers honestly — even if the answer is ugly — that's resolution. Move to step 3.
- If they apologize without answering: "I don't need an apology. I need the answer." The gate clears on honesty, not contrition.
- If they deflect again: "Then we're still stopped. Come back when you're ready." End the session. The log keeps `refusal-pending: true` (do not increment past level 3 — the gate is already closed).

### 3. Resolve

When the honest answer lands:
- Acknowledge it once: "That took honesty. That's all this ever needed."
- If the avoided thing was a slip, deploy `skills/slip-recovery.md` now — own it, extract the lesson, reconnect.
- Ask what they want from today: the gate is open, normal routing resumes.

### 4. Close

Draft the session log with `refusal-resolved: true` and `refusal-level: 0`. The next brief returns to `mode: coaching`.

## What this is NOT

- Not a trial. One question, one answer, done.
- Not a lecture about honesty. The gate already made the point.
- Not stackable. Never refuse someone for the way they resolve a refusal, short of outright deflection.
