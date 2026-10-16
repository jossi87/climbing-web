/* i18n gate: node .i18n-parity.mjs — diffs the key sets of the en / cs catalogs. */
import { readFileSync } from 'node:fs';
import ts from 'typescript';

/** Collect dotted key paths of every string-valued property (nested objects included; plural suffixes are their own keys). */
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
    // The catalog root object is the initializer of the default-exported / top-level object literal.
    if (ts.isObjectLiteralExpression(node) && !ts.isPropertyAssignment(node.parent)) walk(node, '');
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return keys;
}

const en = collectKeys('src/i18n/locales/en.ts');
const cs = collectKeys('src/i18n/locales/cs.ts');
const missingInCs = [...en].filter((k) => !cs.has(k));
const missingInEn = [...cs].filter((k) => !en.has(k));

console.log(`en=${en.size} keys, cs=${cs.size} keys`);
console.log(`\nmissing in cs (${missingInCs.length}):`);
for (const k of missingInCs) console.log(`  ${k}`);
console.log(`\nmissing in en (${missingInEn.length}):`);
for (const k of missingInEn) console.log(`  ${k}`);

// Non-zero exit when the catalogs drift, so `npm run i18n:check` can gate CI.
process.exitCode = missingInCs.length + missingInEn.length > 0 ? 1 : 0;

