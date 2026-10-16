/* i18n gate: node .i18n-vars.mjs — every `{{placeholder}}` and <Trans> slot in en.ts must
 * exist in the matching cs.ts value (extra cs placeholders are also reported). Catches typo'd
 * or dropped interpolation variables, which key-parity alone cannot see. */
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function flatten(file) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out = new Map();

  const walk = (node, prefix) => {
    if (!ts.isObjectLiteralExpression(node)) return;
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : null;
      if (!name) continue;
      const path = prefix ? `${prefix}.${name}` : name;
      if (ts.isObjectLiteralExpression(prop.initializer)) walk(prop.initializer, path);
      else out.set(path, prop.initializer.getText(sf));
    }
  };

  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node) && !ts.isPropertyAssignment(node.parent)) walk(node, '');
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/** `{{name}}` variables plus `<0>`-style Trans slot indices, in stable order. */
const tokens = (raw) => {
  const t = new Set();
  for (const m of raw.matchAll(/\{\{\s*([A-Za-z0-9_]+)\s*[,}]/g)) t.add(`{{${m[1]}}}`);
  for (const m of raw.matchAll(/<(\d+)>/g)) t.add(`<${m[1]}>`);
  return t;
};

const en = flatten('src/i18n/locales/en.ts');
const cs = flatten('src/i18n/locales/cs.ts');

const strip = (raw) => raw.replace(/^['"`]|['"`]$/g, '');
let problems = 0;

for (const [key, enRaw] of en) {
  if (!cs.has(key)) {
    console.log(`MISSING   ${key}`);
    problems++;
    continue;
  }
  const enTokens = tokens(strip(enRaw));
  const csTokens = tokens(strip(cs.get(key)));
  const missing = [...enTokens].filter((x) => !csTokens.has(x));
  const extra = [...csTokens].filter((x) => !enTokens.has(x));
  if (missing.length || extra.length) {
    console.log(`MISMATCH  ${key}`);
    if (missing.length) console.log(`  missing in cs: ${missing.join(' ')}`);
    if (extra.length) console.log(`  unknown in cs: ${extra.join(' ')}`);
    problems++;
  }
}

console.log(`\nkeys with placeholders checked: ${[...en.values()].filter((v) => tokens(strip(v)).size).length}, problems: ${problems}`);
process.exitCode = problems ? 1 : 0;
