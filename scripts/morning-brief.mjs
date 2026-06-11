#!/usr/bin/env node
// SessionStart hook. Prints the brief to stdout — Claude Code injects it as
// session context. This is the ONLY context the coach gets at session start;
// everything else loads lazily per the routing table in CLAUDE.md.
//
// Reads logs/.state.json aggregates plus a handful of small files. Never
// scans the full session history.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { loadState } from "./lib/state.mjs";
import { todayStr, daysBetween } from "./lib/dates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readIfExists(rel) {
  const full = path.join(ROOT, rel);
  try {
    return fs.readFileSync(full, "utf8");
  } catch {
    return null;
  }
}

function bodyOf(text, file) {
  if (text === null) return null;
  const { body } = parseFrontmatter(text, file);
  return body.trim();
}

const today = todayStr();
const dayName = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" });
const state = loadState(ROOT);
const agg = state.aggregates;

// ---------- mode detection ----------

let mode = "coaching";
const identityNow = readIfExists("me/identity-now.md");
if (identityNow === null) {
  mode = "intake";
} else {
  const { data } = parseFrontmatter(identityNow, "me/identity-now.md");
  if (data?.configured !== true) mode = "intake";
}
if (mode === "coaching" && agg?.refusalPending) mode = "re-engagement";

const contentMode = (() => {
  if (identityNow === null) return false;
  const { data } = parseFrontmatter(identityNow, "me/identity-now.md");
  return data?.["content-mode"] === true;
})();

// ---------- alerts ----------

const alerts = [];
if (agg?.lastSession?.date) {
  const gap = daysBetween(agg.lastSession.date, today);
  if (gap >= 3) alerts.push(`DRIFT ALERT: ${gap} days since the last session (${agg.lastSession.date}). Run missed check-in recovery before anything else.`);
  else if (gap === 2) alerts.push(`Heads up: 2 days since the last session (${agg.lastSession.date}). Name the gap before moving on.`);
}
if (dayName === "Sunday" && mode === "coaching") {
  alerts.push("It's Sunday — nudge the weekly review if it hasn't happened yet.");
}
if (agg?.warnings?.length > 0) {
  alerts.push(`${agg.warnings.length} session log(s) have malformed frontmatter — metrics from those days may be incomplete:`);
  for (const w of agg.warnings.slice(0, 5)) alerts.push(`  - ${w}`);
  if (agg.warnings.length > 5) alerts.push(`  - ...and ${agg.warnings.length - 5} more`);
}
for (const p of agg?.patterns ?? []) alerts.push(`Pattern: ${p}`);

// ---------- render ----------

const L = [];
L.push("=== IDENTITY-OS BRIEF ===");
L.push(`date: ${today} (${dayName})`);
L.push(`mode: ${mode}`);
L.push(`content-mode: ${contentMode}`);
L.push("");

if (mode === "intake") {
  L.push("INTAKE MODE — me/identity-now.md is missing or not configured.");
  L.push("Run the intake flow from onboarding/intake.md instead of a normal session.");
  L.push("On completion, set configured: true in me/identity-now.md frontmatter.");
  console.log(L.join("\n"));
  process.exit(0);
}

if (mode === "re-engagement") {
  L.push(`RE-ENGAGEMENT REQUIRED — a refusal from ${agg.refusalSince} is unresolved.`);
  L.push("Run hooks/re-engagement.md before anything else. Decline deep work, goal");
  L.push("setting, and content sessions until the next log carries refusal-resolved: true.");
  L.push("");
}

L.push("--- tracker ---");
if (!agg || agg.sessionsLogged === 0) {
  L.push("No sessions logged yet.");
} else {
  L.push(`sessions: ${agg.sessionsLogged} | becoming streak: ${agg.streak} | plan-vs-done: ${agg.hitRate === null ? "—" : agg.hitRate + "%"}`);
  if (agg.commitments.total > 0) L.push(`weekly commitments: ${agg.commitments.done}/${agg.commitments.total} complete`);
  const stacks = Object.entries(agg.stacks ?? {});
  if (stacks.length > 0) {
    L.push(
      `stacks: ${stacks
        .map(([name, s]) => {
          const bp = Object.entries(s.breakPoints).sort((a, b) => b[1] - a[1])[0];
          return `${name} ${s.full}/${s.runs} full${bp ? ` (breaks at ${bp[0]})` : ""}`;
        })
        .join(" | ")}`
    );
  }
}
L.push("");

L.push("--- last session ---");
if (agg?.lastSession) {
  L.push(`${agg.lastSession.date} (${agg.lastSession.type})${agg.lastSession.score ? ` — score: ${agg.lastSession.score}` : ""}`);
  // carry-forward from the latest log, if present
  const last = state.files[agg.lastSession.file];
  const cf = last?.fm?.["carry-forward"] ?? last?.fm?.["top-3-tasks"];
  if (Array.isArray(cf) && cf.length > 0) L.push(`carry-forward: ${cf.join("; ")}`);
} else {
  L.push("None yet.");
}
L.push("");

if (alerts.length > 0) {
  L.push("--- alerts ---");
  for (const a of alerts) L.push(a);
  L.push("");
}

const affirmations = bodyOf(readIfExists("me/affirmations.md"), "me/affirmations.md");
if (affirmations) {
  L.push("--- affirmations ---");
  L.push(affirmations);
  L.push("");
}

const habitsIndex = bodyOf(readIfExists("habits/active.md"), "habits/active.md");
if (habitsIndex) {
  L.push("--- active habits ---");
  L.push(habitsIndex.split("\n").slice(0, 40).join("\n"));
  if (agg && Object.keys(agg.habits ?? {}).length > 0) {
    L.push("");
    L.push(
      `7-day votes: ${Object.entries(agg.habits)
        .map(([name, h]) => `${name} +${h.pos7}/−${h.neg7}`)
        .join(" | ")}`
    );
  }
  L.push("");
}

// latest journal entry
try {
  const journalDir = path.join(ROOT, "journal");
  const entries = fs
    .readdirSync(journalDir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();
  const latest = entries[entries.length - 1];
  if (latest) {
    const text = bodyOf(fs.readFileSync(path.join(journalDir, latest), "utf8"), latest);
    if (text) {
      L.push(`--- journal (${latest.replace(".md", "")}) ---`);
      L.push(text);
      L.push("");
    }
  }
} catch {
  // no journal yet — fine
}

L.push("=== END BRIEF ===");
console.log(L.join("\n"));
