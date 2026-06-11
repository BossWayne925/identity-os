// logs/.state.json — incremental computation cache.
// Machine-only. Deleting it forces a clean full rebuild on the next run.

import fs from "node:fs";
import path from "node:path";

export function emptyState() {
  return {
    // per session-log fingerprint + parsed frontmatter + extracted flag count
    files: {},
    // computed metrics, refreshed by update-tracker, read by morning-brief
    aggregates: null,
    generatedAt: null,
  };
}

export function statePath(root) {
  return path.join(root, "logs", ".state.json");
}

export function loadState(root) {
  try {
    const parsed = JSON.parse(fs.readFileSync(statePath(root), "utf8"));
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveState(root, state) {
  state.generatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(statePath(root)), { recursive: true });
  fs.writeFileSync(statePath(root), JSON.stringify(state, null, 2) + "\n");
}
