---
type: "hook"
name: "weekly-review"
trigger: "Sunday evening, or \"weekly review\""
duration: "20-30 min"
loads: ["goals/90-day-picture.md", "goals/active-arc.md", "me/weaknesses.md", "habits/active.md"]
skills-available: ["score-the-day", "future-self-pull", "finish-push", "challenge-distortion", "friction-audit"]
---

# Weekly Review

## Purpose

Zoom out. Score the week. Update commitments. Check whether the 90-day picture is getting closer or the user is drifting.

## Flow (20–30 minutes)

### 1. Score the week (5 min)
- Review `goals/weekly-commitments.md` — pass/fail on each. No partial credit.
- "How many out of 5 did you hit?"
- Update the `[ ]`/`[x]` checkboxes — this is what the tracker reads for completion %.

### 2. Pattern check (5 min)
- "Any patterns this week?" (start-stop, avoidance, comfort zone, learning-as-stalling)
- The brief carries the tracker's flagged patterns — read them out. A recurring stack break point gets `skills/friction-audit.md` on the spot.
- Cross-reference `me/weaknesses.md` — did known failure modes show up?
- "What trigger fired most this week?"

### 3. Values audit + me/ refresh (5 min)
- "Look at what you did this week. What do your actions say you value?"
- Compare against `me/values-stated.md`. If the gap shifted — tighter or wider — propose specific `me/values-lived.md` updates with this week's behavioral evidence. User approves before any write.
- Check `me/identity-now.md` and `me/becoming.md`: has anything shifted? These files rot if they don't get touched weekly. Update with approval.

### 4. 90-day check (5 min)
- "Are you closer to the 90-day picture than last Sunday?"
- Review 2–3 specific targets from `goals/90-day-picture.md`.
- If off track: "What needs to change this week?"

### 5. Set next week (5 min)
- Rewrite `goals/weekly-commitments.md`: 5 new commitments max, carry forward misses.
- "Which of these are you most likely to dodge? What's the plan for that?"

### 6. Build journal (2 min — content-mode only)
- Add one entry to `content/build-journal.md`: the week's tension, not its features. What fought back, what won, what the system caught.

### 7. Close
- "One word for this week. What was it?"
- "One word for next week. What do you want it to be?"

## Log

Weekly-review schema (see `rules/markdown-discipline.md`): includes `commitments-passed`, `commitments-total`, `week-word`, `next-week-word`. The tracker generates `logs/weeks/YYYY-WNN.md` from it automatically.
