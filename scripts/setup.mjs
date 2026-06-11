#!/usr/bin/env node
// First-run setup. Creates the gitignored personal folders, initializes the
// tracker and state cache, and validates the hook configuration against the
// real Claude Code schema. Safe to re-run — never overwrites existing content.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const actions = [];

// ---------- node version ----------

const major = Number(process.versions.node.split(".")[0]);
if (major < 18) {
  console.error(`identity-os needs Node 18 or newer. You have ${process.versions.node}.`);
  process.exit(1);
}

// ---------- folders ----------

const dirs = ["me", "goals", "habits", "logs/sessions", "logs/weeks", "journal", "content", "projects"];
for (const dir of dirs) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    actions.push(`created ${dir}/`);
  }
}

// ---------- seed files (only if missing) ----------

function seed(rel, content) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, content);
    actions.push(`created ${rel}`);
  }
}

seed(
  "logs/tracker.md",
  "---\ngenerated: null\nsessions-logged: 0\n---\n\n# Tracker\n\nNo sessions logged yet. This file regenerates automatically after every session log.\n"
);
seed("logs/.state.json", JSON.stringify({ files: {}, aggregates: null, generatedAt: null }, null, 2) + "\n");
seed("TASKS.md", "# Tasks\n\n## Now\n\n## Next\n\n## Later\n");
for (const f of ["ideas.md", "clips.md", "build-journal.md"]) {
  seed(`content/${f}`, `# ${f.replace(".md", "").replace("-", " ")}\n\n`);
}

// ---------- hook validation (the real Claude Code schema) ----------

const settingsPath = path.join(ROOT, ".claude", "settings.json");
if (!fs.existsSync(settingsPath)) {
  problems.push(".claude/settings.json is missing — hooks will not fire.");
} else {
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch (e) {
    problems.push(`.claude/settings.json is not valid JSON: ${e.message}`);
  }
  if (settings) {
    const hooks = settings.hooks ?? {};
    const VALID_EVENTS = new Set([
      "SessionStart",
      "SessionEnd",
      "PreToolUse",
      "PostToolUse",
      "UserPromptSubmit",
      "Notification",
      "Stop",
      "SubagentStop",
      "PreCompact",
    ]);
    for (const key of Object.keys(hooks)) {
      if (!VALID_EVENTS.has(key)) {
        problems.push(
          `hooks key "${key}" is not a Claude Code hook event — the hook will never fire. ` +
            `(Common mistake: "startup" should be "SessionStart".)`
        );
      }
    }
    if (!hooks.SessionStart) problems.push("no SessionStart hook — the morning brief will not be injected.");
    if (!hooks.PostToolUse) problems.push("no PostToolUse hook — the tracker will not auto-update.");
    for (const entry of hooks.PostToolUse ?? []) {
      if (entry.matcher && /\//.test(entry.matcher)) {
        problems.push(
          `PostToolUse matcher "${entry.matcher}" looks like a file path — matchers match TOOL NAMES (e.g. "Write|Edit"). Path filtering happens inside update-tracker.mjs.`
        );
      }
    }
  }
}

// ---------- script smoke check ----------

for (const script of ["scripts/lib/frontmatter.mjs", "scripts/morning-brief.mjs", "scripts/update-tracker.mjs"]) {
  if (!fs.existsSync(path.join(ROOT, script))) problems.push(`${script} is missing.`);
}

// ---------- report ----------

if (actions.length > 0) {
  console.log("Setup actions:");
  for (const a of actions) console.log(`  - ${a}`);
} else {
  console.log("Nothing to create — structure already in place.");
}

if (problems.length > 0) {
  console.log("\nProblems found:");
  for (const p of problems) console.log(`  ! ${p}`);
  process.exit(1);
}

console.log("\nidentity-os is ready. Start a Claude Code session in this folder — intake begins automatically.");
