/*
 * i18n gate: node .i18n-plurals.mjs
 *
 * Two checks against the catalogs:
 *  1. Every base key that has plural forms must carry the forms its locale needs: `en` → `_one`/`_other`,
 *     `cs` → `_one`/`_few`/`_other` (i18next/Intl.PluralRules).
 *  2. Every `t('key', { count })` call site must have plural forms behind `key` — a count-driven lookup with a
 *     single (un-suffixed) entry falls back to the base key and renders the same string for every number.
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

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
const REQUIRED = { en: ['one', 'other'], cs: ['one', 'few', 'other'] };

const catalogs = { en: collectKeys('src/i18n/locales/en.ts'), cs: collectKeys('src/i18n/locales/cs.ts') };

console.log('— catalogs: bases with plural forms —');
let catalogProblems = 0;
for (const [lng, keys] of Object.entries(catalogs)) {
  const bases = new Map();
  for (const key of keys) {
    if (!PLURAL_SUFFIX.test(key)) continue;
    const base = key.replace(PLURAL_SUFFIX, '');
    if (!bases.has(base)) bases.set(base, new Set());
    bases.get(base).add(key.slice(base.length + 1));
  }
  const extra = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
  for (const [base, forms] of bases) {
    // `_few` is harmless to keep in `en` (present in this catalog), but the locale's *required* forms must exist.
    const missing = REQUIRED[lng].filter((f) => ![...forms].some((form) => form === f));
    if (missing.length) {
      catalogProblems += 1;
      console.log(`  ${lng}: ${base}  missing ${missing.join(', ')} (has ${[...forms].join(', ')})`);
    }
    void extra;
  }
}
console.log(`  problems: ${catalogProblems}`);

console.log('\n— call sites: t(key, { count }) —');
const files = listSourceFiles();

/**
 * Count-driven keys that are *count-independent* on purpose, so a single entry is correct: the placeholder is a bare
 * number or a count-invariant abbreviation, not a noun that has to agree with it.
 *   - `filterSummary.namesMore` → `+5` (an overflow badge, no word to inflect)
 *   - `problems.metaPitches`    → `3p` / `3d.` (pitch / day marker; the suffix is an abbreviation, same for every count)
 * i18next's lookup order is `key_<plural>` then `key`, so these fall back to the base entry and render as written.
 */
const COUNT_INDEPENDENT = new Set(['filterSummary.namesMore', 'problems.metaPitches']);

const used = new Map();
for (const file of files) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      /(^|\.)t$/.test(node.expression.getText(sf)) &&
      node.arguments.length >= 2 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      const options = node.arguments[1];
      const hasCount =
        ts.isObjectLiteralExpression(options) &&
        options.properties.some(
          (p) => ts.isPropertyAssignment(p) && p.name.getText(sf).replace(/['"]/g, '') === 'count',
        );
      if (hasCount) {
        const key = node.arguments[0].text;
        const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
        used.set(`${file}:${line}:${key}`, key);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

let callSiteProblems = 0;
const intentional = [];
for (const [site, key] of used) {
  const bad = Object.entries(catalogs).filter(([, keys]) => ![...keys].some((k) => k.startsWith(`${key}_`)));
  if (!bad.length) continue;
  if (COUNT_INDEPENDENT.has(key)) {
    intentional.push(`${site} (count-independent)`);
    continue;
  }
  callSiteProblems += 1;
  console.log(`  ${site}  → no plural forms in ${bad.map(([lng]) => lng).join(', ')}`);
}
console.log(`  count-driven keys checked: ${used.size}, problems: ${callSiteProblems}`);
if (intentional.length) console.log(`  reviewed count-independent: ${intentional.length}\n    ${intentional.join('\n    ')}`);

// Non-zero exit on any catalog or call-site problem, so `npm run i18n:check` can gate CI.
process.exitCode = catalogProblems + callSiteProblems > 0 ? 1 : 0;

