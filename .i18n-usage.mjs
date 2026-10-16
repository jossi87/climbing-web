/*
 * Advisory check (NOT part of `npm run i18n:check` — it has known false positives): node .i18n-usage.mjs
 *
 * Every dotted string literal in `src` is treated as a candidate catalog key and looked up in `en.ts` (a plural key
 * counts as present when `key_one` / `key_other` / … exists, since plural keys have no base entry).
 *
 * Known false positives, safe to ignore when they show up in the report:
 *   - hostnames / URLs (`vimeo.com`, `climbing.eu.auth0.com`, …)
 *   - bare module specifiers (`leaflet.markercluster`, `hls.js`, `image.jpeg`)
 *   - `localStorage`-style app keys (`problemList.detailed` in `ProblemList`)
 */
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';

/**
 * `.ts`/`.tsx` sources under `src`, excluding the catalogs and the generated swagger types.
 * Walks the working tree instead of shelling out to `git ls-files`: the Docker image build has no `git` binary
 * (node:alpine) and no `.git` directory (.dockerignore), which used to break `npm run build`.
 */
const EXCLUDED_DIRS = new Set(['src/i18n', 'src/@types']);

function listSourceFiles(dir = 'src', out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(path)) listSourceFiles(path, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out.sort();
}

function collectKeys(file) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const keys = new Set();
  const walk = (node, prefix) => {
    if (!ts.isObjectLiteralExpression(node)) return;
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : null;
      if (!name) continue;
      const path = prefix ? `${prefix}.${name}` : name;
      if (ts.isObjectLiteralExpression(prop.initializer)) walk(prop.initializer, path);
      else keys.add(path);
    }
  };
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node) && !ts.isPropertyAssignment(node.parent)) walk(node, '');
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return keys;
}

const en = collectKeys('src/i18n/locales/en.ts');
const cs = collectKeys('src/i18n/locales/cs.ts');

const files = listSourceFiles();

const KEY_RE = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9_]+){1,}$/;
/** A plural key has no base entry: `t('counts.points', { count })` resolves `counts.points_one` / `_other` / … */
const hasKey = (key) => en.has(key) || [...en].some((k) => k.startsWith(`${key}_`));
const missing = new Map();

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isStringLiteralLike(node) && KEY_RE.test(node.text)) {
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      if (!hasKey(node.text)) {
        if (!missing.has(file)) missing.set(file, []);
        missing.get(file).push({ line, key: node.text, inCs: cs.has(node.text) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

let total = 0;
for (const [file, hits] of missing) {
  console.log(`### ${file}`);
  for (const h of hits) {
    total += 1;
    console.log(`  ${String(h.line).padStart(4)} ${h.key}${h.inCs ? '  [exists in cs!]' : ''}`);
  }
}
console.log(`\nkeys referenced but absent from en.ts: ${total}`);

/*
 * Informational only — deliberately no non-zero exit. This tool scans *every* dotted string literal in `src`, so its
 * output always contains the documented false positives above (hostnames, module specifiers, `localStorage` keys).
 * The deterministic gates that run in CI are parity / plurals / vars / trans; use this one by hand when adding a
 * namespace to find keys that code already references.
 */

