#!/usr/bin/env node
// PostToolUse hook. Claude Code matches hooks on TOOL NAME (Write|Edit) —
// there is no path-pattern field — so this script self-filters: it reads the
// hook payload from stdin and exits immediately unless the written file is a
// session log. Run with --force to rebuild manually (no stdin needed).
//
// Incremental: only new/changed logs are re-parsed (fingerprints in
// logs/.state.json). Outputs: logs/tracker.md, habits/vote-ledger.md,
// content/flags.md (extraction), logs/weeks/YYYY-WNN.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./lib/frontmatter.mjs";
import { loadState, saveState } from "./lib/state.mjs";
import { todayStr, daysBetween, isoWeek, weekDates, DAY_LABELS } from "./lib/dates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESSIONS_DIR = path.join(ROOT, "logs", "sessions");

// ---------- hook payload filter ----------

function shouldRun() {
  if (process.argv.includes("--force")) return true;
  if (process.stdin.isTTY) return true; // manual invocation
  let raw = "";
  try {
    raw = fs.readFileSync(0, "utf8");
  } catch {
    return true;
  }
  if (!raw.trim()) return true;
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return true; // unexpected stdin — run anyway, running is cheap and idempotent
  }
  const fp = payload?.tool_input?.file_path;
  if (!fp) return true;
  const norm = path.resolve(fp).replace(/\\/g, "/");
  return norm.includes("/logs/sessions/") && norm.endsWith(".md");
}

// ---------- content flag extraction ----------

function extractFlagBlocks(body) {
  const blocks = [];
  const lines = body.split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    if (/^###\s+Content Flag\s*$/i.test(line.trim())) {
      if (current) blocks.push(current.join("\n").trim());
      current = [];
      continue;
    }
    if (current !== null && /^#{1,3}\s/.test(line)) {
      blocks.push(current.join("\n").trim());
      current = null;
      continue;
    }
    if (current !== null) current.push(line);
  }
  if (current) blocks.push(current.join("\n").trim());
  return blocks.filter((b) => b.length > 0);
}

// ---------- incremental scan ----------

function scanSessions(state) {
  if (!fs.existsSync(SESSIONS_DIR)) return;
  const onDisk = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".md"));
  // drop deleted files from cache
  for (const cached of Object.keys(state.files)) {
    if (!onDisk.includes(cached)) delete state.files[cached];
  }
  for (const file of onDisk) {
    const full = path.join(SESSIONS_DIR, file);
    const st = fs.statSync(full);
    const cached = state.files[file];
    if (cached && cached.mtimeMs === st.mtimeMs && cached.size === st.size) continue;
    const text = fs.readFileSync(full, "utf8");
    const { data, body, warnings } = parseFrontmatter(text, `logs/sessions/${file}`);
    state.files[file] = {
      mtimeMs: st.mtimeMs,
      size: st.size,
      fm: data ?? {},
      warnings,
      flagBlocks: extractFlagBlocks(body),
      flagsExtracted: cached?.flagsExtracted ?? 0,
    };
  }
}

// ---------- vote normalization ----------

// Spec form: [{"habit": "name", "vote": "+"}]. Tolerate the legacy object
// form {"name": "+"} so hand-migrated logs still count.
function votesOf(fm) {
  const v = fm["habits-voted"];
  if (Array.isArray(v)) {
    return v.filter((e) => e && typeof e.habit === "string" && (e.vote === "+" || e.vote === "-"));
  }
  if (v && typeof v === "object") {
    return Object.entries(v)
      .filter(([, vote]) => vote === "+" || vote === "-")
      .map(([habit, vote]) => ({ habit, vote }));
  }
  return [];
}

function stacksOf(fm) {
  const s = fm["stacks-run"];
  if (!Array.isArray(s)) return [];
  return s.filter(
    (e) =>
      e &&
      typeof e.stack === "string" &&
      Array.isArray(e.sequence) &&
      Array.isArray(e.completed) &&
      e.sequence.length === e.completed.length
  );
}

// ---------- aggregates ----------

// chronological order within a day: morning first, evening/review last —
// filename sort alone would put "evening" before "morning" alphabetically,
// which breaks refusal-resolution scans for same-day logs
const TYPE_RANK = { morning: 0, "deep-work": 1, "goal-setting": 1, freeform: 1, evening: 2, "weekly-review": 3 };

function computeAggregates(state, today) {
  const entries = Object.entries(state.files)
    .map(([file, rec]) => ({ file, ...rec }))
    .filter((e) => e.fm && typeof e.fm.date === "string" && typeof e.fm.type === "string")
    .sort(
      (a, b) =>
        a.fm.date.localeCompare(b.fm.date) ||
        (TYPE_RANK[a.fm.type] ?? 1) - (TYPE_RANK[b.fm.type] ?? 1) ||
        a.file.localeCompare(b.file)
    );

  const evenings = entries.filter((e) => e.fm.type === "evening");
  const mornings = entries.filter((e) => e.fm.type === "morning");

  // becoming streak — consecutive most-recent evening "becoming" scores
  let streak = 0;
  for (let i = evenings.length - 1; i >= 0; i--) {
    if (evenings[i].fm.score === "becoming") streak++;
    else break;
  }
  let lastComfortZone = null;
  for (let i = evenings.length - 1; i >= 0; i--) {
    if (evenings[i].fm.score === "comfort-zone-won") {
      lastComfortZone = evenings[i].fm.date;
      break;
    }
  }

  // this week's grid
  const week = isoWeek(today);
  const grid = weekDates(today).map((date, i) => {
    const m = mornings.find((e) => e.fm.date === date);
    const ev = evenings.find((e) => e.fm.date === date);
    return {
      day: DAY_LABELS[i],
      date,
      morning: !!m,
      evening: !!ev,
      score: ev ? ev.fm.score ?? "—" : null,
    };
  });

  // plan vs done hit rate
  let planned = 0;
  let done = 0;
  for (const e of evenings) {
    planned += Array.isArray(e.fm["top-3-planned"]) ? e.fm["top-3-planned"].length : 0;
    done += Array.isArray(e.fm["top-3-done"]) ? e.fm["top-3-done"].length : 0;
  }
  const hitRate = planned > 0 ? Math.round((done / planned) * 100) : null;

  // per-habit votes (total / 7d / 30d)
  const habits = {};
  for (const e of evenings) {
    const age = daysBetween(e.fm.date, today);
    for (const { habit, vote } of votesOf(e.fm)) {
      habits[habit] ??= { pos: 0, neg: 0, pos7: 0, neg7: 0, pos30: 0, neg30: 0, recent: [] };
      const h = habits[habit];
      if (vote === "+") h.pos++;
      else h.neg++;
      if (age < 7) vote === "+" ? h.pos7++ : h.neg7++;
      if (age < 30) vote === "+" ? h.pos30++ : h.neg30++;
      h.recent.push({ date: e.fm.date, vote });
    }
  }

  // stacks — integrity + break points
  const stacks = {};
  for (const e of evenings) {
    for (const run of stacksOf(e.fm)) {
      stacks[run.stack] ??= { runs: 0, full: 0, breakPoints: {}, sequence: run.sequence };
      const s = stacks[run.stack];
      s.runs++;
      s.sequence = run.sequence; // latest definition wins
      const firstFail = run.completed.findIndex((c) => c !== true);
      if (firstFail === -1) s.full++;
      else {
        const link = run.sequence[firstFail] ?? `link-${firstFail + 1}`;
        s.breakPoints[link] = (s.breakPoints[link] ?? 0) + 1;
      }
    }
  }

  // affirmation anchors
  const anchors = {};
  for (const m of mornings) {
    const a = m.fm["affirmation-anchor"];
    if (typeof a === "string" && a.trim()) anchors[a] = (anchors[a] ?? 0) + 1;
  }

  // refusal gate — latest log wins; resolved by any later log
  let refusalPending = false;
  let refusalSince = null;
  for (const e of entries) {
    if (e.fm["refusal-pending"] === true) {
      refusalPending = true;
      refusalSince = e.fm.date;
    }
    if (e.fm["refusal-resolved"] === true && refusalPending) {
      refusalPending = false;
      refusalSince = null;
    }
  }

  // weekly commitments completion from checkboxes
  let commitments = { total: 0, done: 0 };
  const commitFile = path.join(ROOT, "goals", "weekly-commitments.md");
  if (fs.existsSync(commitFile)) {
    const text = fs.readFileSync(commitFile, "utf8");
    for (const m of text.matchAll(/^\s*(?:[-*]|\d+\.)\s+\[([ xX])\]/gm)) {
      commitments.total++;
      if (m[1].toLowerCase() === "x") commitments.done++;
    }
  }

  // auto-flagged patterns
  const patterns = [];
  let czStreak = 0;
  for (let i = evenings.length - 1; i >= 0; i--) {
    if (evenings[i].fm.score === "comfort-zone-won") czStreak++;
    else break;
  }
  if (czStreak >= 2) patterns.push(`Comfort zone has won ${czStreak} evenings in a row.`);
  const recentEv = evenings.filter((e) => daysBetween(e.fm.date, today) < 7);
  let rp = 0;
  let rd = 0;
  for (const e of recentEv) {
    rp += Array.isArray(e.fm["top-3-planned"]) ? e.fm["top-3-planned"].length : 0;
    rd += Array.isArray(e.fm["top-3-done"]) ? e.fm["top-3-done"].length : 0;
  }
  if (rp >= 6 && rd / rp < 0.5)
    patterns.push(`Plan-vs-done hit rate under 50% this week (${rd}/${rp}). Plans are outrunning execution.`);
  for (const [name, s] of Object.entries(stacks)) {
    for (const [link, count] of Object.entries(s.breakPoints)) {
      if (count >= 3) patterns.push(`Stack "${name}" keeps breaking at "${link}" (${count} times). Run a friction audit on that link.`);
    }
  }

  // validation warnings (for the brief)
  const warnings = entries.flatMap((e) => e.warnings ?? []);

  const lastEntry = entries[entries.length - 1] ?? null;

  return {
    sessionsLogged: entries.length,
    lastSession: lastEntry
      ? { file: lastEntry.file, date: lastEntry.fm.date, type: lastEntry.fm.type, score: lastEntry.fm.score ?? null }
      : null,
    streak,
    lastComfortZone,
    week: week.key,
    grid,
    hitRate,
    planned,
    done,
    habits,
    stacks,
    anchors,
    refusalPending,
    refusalSince,
    commitments,
    patterns,
    warnings,
  };
}

// ---------- output generation ----------

function pct(n, d) {
  return d > 0 ? `${Math.round((n / d) * 100)}%` : "—";
}

function renderTracker(agg, today) {
  const L = [];
  L.push("---");
  L.push(`generated: ${JSON.stringify(new Date().toISOString())}`);
  L.push(`sessions-logged: ${agg.sessionsLogged}`);
  L.push("---");
  L.push("");
  L.push("# Tracker");
  L.push("");
  L.push("Auto-generated by `scripts/update-tracker.mjs`. Do not edit.");
  L.push("");
  L.push("## Current streak");
  L.push(`Becoming: ${agg.streak} day${agg.streak === 1 ? "" : "s"}`);
  L.push(`Last comfort-zone-won: ${agg.lastComfortZone ?? "none"}`);
  L.push("");
  L.push(`## This week (${agg.week})`);
  L.push("| Day | Morning | Evening | Score |");
  L.push("|-----|---------|---------|-------|");
  for (const d of agg.grid) {
    L.push(`| ${d.day} | ${d.morning ? "logged" : "—"} | ${d.evening ? "logged" : "—"} | ${d.score ?? "—"} |`);
  }
  L.push("");
  L.push("## Weekly commitments");
  L.push(
    agg.commitments.total > 0
      ? `Completion: ${agg.commitments.done}/${agg.commitments.total} (${pct(agg.commitments.done, agg.commitments.total)})`
      : "No commitments file or no checkboxes found."
  );
  L.push("");
  L.push("## Plan vs. done (all sessions)");
  L.push(`Tasks planned: ${agg.planned} | Tasks done: ${agg.done} | Hit rate: ${agg.hitRate === null ? "—" : agg.hitRate + "%"}`);
  L.push("");
  L.push("## Habit votes");
  const habitNames = Object.keys(agg.habits).sort();
  if (habitNames.length === 0) L.push("No votes recorded yet.");
  else {
    L.push("| Habit | 7d | 30d | All time |");
    L.push("|-------|----|----|----------|");
    for (const name of habitNames) {
      const h = agg.habits[name];
      L.push(`| ${name} | +${h.pos7}/−${h.neg7} | +${h.pos30}/−${h.neg30} | +${h.pos}/−${h.neg} |`);
    }
  }
  L.push("");
  L.push("## Stack integrity");
  const stackNames = Object.keys(agg.stacks).sort();
  if (stackNames.length === 0) L.push("No stacks run yet.");
  else {
    L.push("| Stack | Runs | Full completions | Integrity | Most common break point |");
    L.push("|-------|------|------------------|-----------|--------------------------|");
    for (const name of stackNames) {
      const s = agg.stacks[name];
      const bp = Object.entries(s.breakPoints).sort((a, b) => b[1] - a[1])[0];
      L.push(`| ${name} | ${s.runs} | ${s.full} | ${pct(s.full, s.runs)} | ${bp ? `${bp[0]} (${bp[1]}×)` : "—"} |`);
    }
  }
  L.push("");
  L.push("## Affirmation anchors");
  const anchorEntries = Object.entries(agg.anchors).sort((a, b) => b[1] - a[1]);
  if (anchorEntries.length === 0) L.push("None recorded yet.");
  else for (const [a, n] of anchorEntries) L.push(`- "${a}" — ${n}×`);
  L.push("");
  L.push("## Patterns flagged");
  if (agg.patterns.length === 0) L.push("- None detected");
  else for (const p of agg.patterns) L.push(`- ${p}`);
  L.push("");
  if (agg.refusalPending) {
    L.push("## Refusal gate");
    L.push(`OPEN since ${agg.refusalSince}. Re-engagement required before normal coaching resumes.`);
    L.push("");
  }
  return L.join("\n") + "\n";
}

function renderVoteLedger(agg) {
  const L = [];
  L.push("---");
  L.push(`generated: ${JSON.stringify(new Date().toISOString())}`);
  L.push("---");
  L.push("");
  L.push("# Vote Ledger");
  L.push("");
  L.push("Auto-generated from session log frontmatter by `scripts/update-tracker.mjs`. Do not edit.");
  L.push("");
  const names = Object.keys(agg.habits).sort();
  if (names.length === 0) {
    L.push("No votes recorded yet. Votes are cast during evening check-ins.");
  }
  for (const name of names) {
    const h = agg.habits[name];
    L.push(`## ${name}`);
    L.push(`Total: +${h.pos} / −${h.neg} | Last 7 days: +${h.pos7} / −${h.neg7} | Last 30: +${h.pos30} / −${h.neg30}`);
    const recent = h.recent.slice(-14);
    L.push(`Recent: ${recent.map((r) => r.vote).join(" ")} (${recent[0]?.date ?? ""} → ${recent[recent.length - 1]?.date ?? ""})`);
    L.push("");
  }
  const stackNames = Object.keys(agg.stacks).sort();
  if (stackNames.length > 0) {
    L.push("# Stacks");
    L.push("");
    for (const name of stackNames) {
      const s = agg.stacks[name];
      L.push(`## ${name}`);
      L.push(`Chain: ${s.sequence.join(" → ")}`);
      L.push(`Runs: ${s.runs} | Full completions: ${s.full} (${pct(s.full, s.runs)})`);
      const bps = Object.entries(s.breakPoints).sort((a, b) => b[1] - a[1]);
      if (bps.length > 0) L.push(`Break points: ${bps.map(([l, n]) => `${l} (${n}×)`).join(", ")}`);
      L.push("");
    }
  }
  return L.join("\n") + "\n";
}

function extractNewFlags(state) {
  const additions = [];
  const files = Object.keys(state.files).sort();
  for (const file of files) {
    const rec = state.files[file];
    const blocks = rec.flagBlocks ?? [];
    if (blocks.length > rec.flagsExtracted) {
      for (const block of blocks.slice(rec.flagsExtracted)) {
        additions.push({ date: rec.fm.date ?? "unknown", type: rec.fm.type ?? "session", block });
      }
      rec.flagsExtracted = blocks.length;
    }
  }
  if (additions.length === 0) return 0;
  const flagsFile = path.join(ROOT, "content", "flags.md");
  let out = "";
  if (!fs.existsSync(flagsFile)) {
    out += "# Content Flags\n\nAuto-extracted from session logs by `scripts/update-tracker.mjs`. Do not edit.\n";
  }
  for (const a of additions) {
    out += `\n## ${a.date} — ${a.type}\n\n${a.block}\n`;
  }
  fs.mkdirSync(path.dirname(flagsFile), { recursive: true });
  fs.appendFileSync(flagsFile, out);
  return additions.length;
}

function renderWeekSummaries(state, agg) {
  // one summary per ISO week that contains a weekly-review log
  const reviews = Object.entries(state.files)
    .map(([file, rec]) => ({ file, ...rec }))
    .filter((e) => e.fm?.type === "weekly-review" && typeof e.fm.date === "string");
  for (const review of reviews) {
    const wk = isoWeek(review.fm.date);
    const dates = weekDates(review.fm.date);
    const weekLogs = Object.values(state.files).filter((r) => dates.includes(r.fm?.date));
    const evenings = weekLogs.filter((r) => r.fm.type === "evening");
    const scores = evenings.map((r) => `${r.fm.date}: ${r.fm.score ?? "—"}`);
    let votes = { pos: 0, neg: 0 };
    for (const e of evenings) {
      for (const v of votesOf(e.fm)) v.vote === "+" ? votes.pos++ : votes.neg++;
    }
    const L = [];
    L.push("---");
    L.push(`week: ${JSON.stringify(wk.key)}`);
    L.push(`generated: ${JSON.stringify(new Date().toISOString())}`);
    L.push("---");
    L.push("");
    L.push(`# Week ${wk.key}`);
    L.push("");
    L.push(`Sessions logged: ${weekLogs.length} (${evenings.length} evenings)`);
    L.push(`Evening scores: ${scores.length > 0 ? scores.join(" | ") : "none"}`);
    L.push(`Votes: +${votes.pos} / −${votes.neg}`);
    if (typeof review.fm["week-word"] === "string") L.push(`Word for the week: ${review.fm["week-word"]}`);
    if (typeof review.fm["next-week-word"] === "string") L.push(`Word for next week: ${review.fm["next-week-word"]}`);
    L.push("");
    const dir = path.join(ROOT, "logs", "weeks");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${wk.key}.md`), L.join("\n") + "\n");
  }
}

// ---------- main ----------

if (!shouldRun()) process.exit(0);

const state = loadState(ROOT);
scanSessions(state);
const today = todayStr();
const agg = computeAggregates(state, today);
state.aggregates = agg;

fs.mkdirSync(path.join(ROOT, "logs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "logs", "tracker.md"), renderTracker(agg, today));
fs.mkdirSync(path.join(ROOT, "habits"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "habits", "vote-ledger.md"), renderVoteLedger(agg));
const newFlags = extractNewFlags(state);
renderWeekSummaries(state, agg);
saveState(ROOT, state);

console.log(
  `tracker updated: ${agg.sessionsLogged} sessions, streak ${agg.streak}, ${newFlags} new content flag${newFlags === 1 ? "" : "s"} extracted`
);
