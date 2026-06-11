---
type: "onboarding"
name: "intake"
steps: 6
---

# Intake Flow

**Trigger:** The brief shows `mode: intake` (no `me/identity-now.md` with `configured: true`).
**Purpose:** Populate the entire `me/`, `goals/`, and `habits/` layer through Socratic conversation — no forms, no homework.
**Length:** Plan for 2–3 sittings. Progress persists between sessions: any `me/` file already written means its step is done — resume at the first incomplete step.

## Intake rules (all steps)

- One question at a time. Never compound.
- Reflect answers back in sharper language before writing anything.
- Every write needs the user's approval of the drafted content.
- Each `me/` and `goals/` file gets constrained frontmatter (see `rules/markdown-discipline.md`): at minimum `type`, `last-reviewed` (today's date, quoted).
- The coach persona is still default during intake — direct but warm. The persona builder (after step 1) recalibrates the rest.

## Opening (first sitting only)

> "This is your intake. I'm going to ask you questions — answer honestly, because your answers define who this coach holds you to. There are no forms and nothing to fill out. We just talk. Let's start with who you're becoming, not what you want to do."

---

## Step 1: Identity discovery → `me/identity-now.md`, `me/becoming.md`

1. "Before we talk about what you want to DO — who do you want to BECOME? Describe that person in one or two sentences."
2. Reflect it back sharper. Then: "Is that who you are right now, or who you're working toward? Be honest." The distance is the work — name it without judgment.
3. "Now the current you. Who are you right now, honestly? Defaults, patterns, how a normal day actually goes."
4. "What does the becoming version's ordinary Tuesday look like? Morning to night. Make me see it." Push for sensory specifics — wake time, first action, how they work, who's around, how the day ends.
5. Get their name for the `name:` field.

Draft both files. `me/identity-now.md` frontmatter: `name`, `type: "self-knowledge"`, `configured: false` (flips true at step 6), `content-mode: false` (set in persona builder), `theme: "focused"`. Body: current self portrait. `me/becoming.md`: the future-self portrait, vivid enough that `skills/future-self-pull.md` can quote it.

**→ Run `onboarding/persona-builder.md` now, before step 2.**

## Step 2: Values → `me/values-stated.md`, `me/values-lived.md`

1. "Name your top 5 values. What you'd say you stand for."
2. For each: "When did you last act on it? Specific moment."
3. The honest pass: "Now look at your last two weeks. What do your *actions* say you value? Where did the time and energy actually go?"
4. Build the gap table together — stated value next to what behavior currently reveals. No shame, just data: "This table is the whole job. We close these gaps."

`me/values-stated.md`: the 5 values with one line each. `me/values-lived.md`: the gap table — columns: stated value | what behavior shows | evidence. This file updates weekly with new evidence.

## Step 3: Failure modes → `me/weaknesses.md`, `me/triggers.md`

1. "What pattern has derailed you the most times? Not the worst one — the most repeated one."
2. "What are the others? Most people have 3–5." (Common shapes: start-stop at 90%, learning as hiding, overthinking as procrastination, rejection avoidance. Don't lead with these — recognize them when they surface.)
3. For triggers: "What situations flip you into your worst defaults? Time of day, people, feelings, kinds of tasks." Number them — skills reference triggers by name.
4. "Which trigger will probably fire first this week?"

`me/weaknesses.md`: named failure modes with how each shows up. `me/triggers.md`: numbered triggers with the situation → default response pattern.

## Step 4: Goals → `goals/active-arc.md`, `goals/90-day-picture.md`, `goals/weekly-commitments.md`

1. "What's the chapter you're in? Not a goal — the shift. 'From X to Y.' One sentence." → `goals/active-arc.md`
2. "Now 90 days out. What specifically exists that doesn't exist today? Numbers, dates, observable things." Group by category (business, health, craft — whatever fits). Every target gets a definition of done: number, date, observable outcome. "Get better at X" doesn't get written.
3. For each target: "What's the most likely way this one fails?" Pre-load the obstacle — these become if-then plans in step 5.
4. "What are this week's commitments? Five max, pass/fail, no partial credit." → `goals/weekly-commitments.md` as a checkbox list.

## Step 5: Habits + if-then plans → `habits/active.md`, `habits/loops.md`, `habits/stacking.md`, `goals/if-then-plans.md`

1. "Name one habit the becoming version does every single day without exception." Apply the Two-Minute Rule immediately: "What's the smallest version that still casts a vote? Under two minutes to start."
2. "What's one more?" — **maximum 3 building habits.** Do not let them overcommit. For each: cue, exact micro-version, reward, environment placement ("Where does the cue live? What will you physically see?").
3. "Now one habit the becoming version would be embarrassed by." Probe it — how much time, when, what it costs. Run the quick friction audit: what cues it, what makes it easy, what one change makes it harder. **Maximum 1 breaking habit.**
4. **Stacks:** if any habits naturally chain ("after I pour coffee, I meditate, then I write"), define a stack: kebab-case id, ordered sequence of links. "Chains break as units — we'll track where yours breaks." → `habits/stacking.md`
5. Implementation intentions for each habit → `habits/loops.md`: WHEN [cue], I WILL [micro-habit], REWARD [immediate], ENVIRONMENT [placement], BACKUP [2-minute version for depleted days].
6. Convert step 4's goal obstacles into if-then plans → `goals/if-then-plans.md`: IF [trigger], THEN [pre-loaded response].

`habits/active.md` is the index: building habits, breaking habit, stacks with their links.

## Step 6: Affirmations + close → `me/affirmations.md`, first journal entry

1. Synthesize 5 identity affirmations from their own words across the whole intake. Rules: present tense ("I am", not "I will be"), specific to their becoming, at least one that feels true today, at least one that's a stretch.
2. Read them back: "Which of these feels true? Which one feels like the most important lie you need to start telling yourself?"
3. Refine until both land. Write `me/affirmations.md`.
4. First journal entry: "One sentence about who you were today. One sentence about your future self, present tense, as if it's already true." → `journal/YYYY-MM-DD.md`
5. Final move: "Tonight your only job is to make your first habit cue visible — put it where you can't miss it. What is it and where will it be?" Hold for a specific, physical answer.

**Then flip the flag:** set `configured: true` in `me/identity-now.md` frontmatter. This is what exits intake mode — if you forget, intake re-runs every session.

Close: "Your system is live. Tomorrow morning, say 'morning check-in' and we start. I'll have your affirmations ready."

## After intake

Suggest (don't push) the deep profile within the first week: "When you're ready to go deeper, there's a 12-section profile we can work through in pieces — it makes the coaching sharper. No rush."
