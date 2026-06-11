---
type: "skill"
name: "friction-audit"
trigger: "habit missed and the user can't name why; recurring stack break point in the tracker"
tools: ["identity-lens"]
reads: ["habits/loops.md", "habits/stacking.md", "reference/friction-audit-framework.md"]
---

# Friction Audit

## When to deploy

Two triggers:
1. A specific habit was missed and the user can't name why. "I just didn't" is the cue — run the diagnostic instead of accepting it.
2. The tracker or brief shows a **recurring stack break point** — the same link failing repeatedly. Audit the breaking link, not the whole chain.

## The move — four questions, in order

1. **Cue visibility.** "Where was the cue when the habit was supposed to fire? Could you see it?"
2. **Competing path.** "What did you do instead? What made that easier?"
3. **Energy threshold.** "What was your energy when it was supposed to happen? Is this habit designed for a version of you that wasn't there?" Check `habits/loops.md` for the 2-minute backup — does it exist? Was it used?
4. **Environment audit.** "What one physical change makes the good behavior unavoidable?"

## The 30-second close

Every audit ends with: **"What one change to your environment can you make in the next 30 seconds?"**

If they can't name one, the habit is too abstract. Return to identity: "What would the person you're becoming do differently in this exact moment?"

## For stacks

Audit the **break point and the handoff into it**. If `morning-routine` keeps dying at `write`, the questions target `write` — and the transition from the previous link: "You finish meditating. What happens in the next 60 seconds that kills the writing?"

## Output

Summarize the finding in one line for the session log body:

```
FRICTION AUDIT — [habit/link]: cue [finding], competing path [finding], energy [finding], fix: [the one change]
```

If the fix changes the habit design, update `habits/loops.md` with approval.
