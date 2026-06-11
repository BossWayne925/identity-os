// Constrained frontmatter parser — the one parser in the system.
// Convention (rules/markdown-discipline.md): frontmatter is `key: value` lines
// between `---` delimiters, where value is strict JSON (string, number,
// boolean, array, object). One line per key. This subset is valid YAML flow
// style, so standard tools can read the same files.
//
// Parse failures degrade to a raw string plus a warning — never a crash.

export function parseFrontmatter(text, file = "") {
  const warnings = [];
  const lines = text.split(/\r?\n/);

  if (lines[0]?.trim() !== "---") {
    return { data: null, body: text, warnings };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    warnings.push(`${file}: frontmatter opened with --- but never closed`);
    return { data: null, body: text, warnings };
  }

  const data = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const m = line.match(/^([A-Za-z0-9_-]+):(?:\s(.*))?$/);
    if (!m) {
      warnings.push(`${file}:${i + 1}: unparseable frontmatter line: ${line.trim()}`);
      continue;
    }
    const key = m[1];
    const raw = (m[2] ?? "").trim();
    if (raw === "") {
      data[key] = "";
      warnings.push(`${file}:${i + 1}: empty value for "${key}"`);
      continue;
    }
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
      warnings.push(`${file}:${i + 1}: value for "${key}" is not strict JSON (got: ${raw}) — treated as raw string`);
    }
  }

  return { data, body: lines.slice(end + 1).join("\n"), warnings };
}

export function serializeFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}
