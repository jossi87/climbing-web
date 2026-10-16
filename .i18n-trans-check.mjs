/*
 * i18n gate: node .i18n-trans-check.mjs
 *
 * Renders `profile.statistics.overviewAscents` (a counted key that interpolates two already-rendered counted
 * fragments and wraps the main number in a react-i18next `<count>` slot) through the REAL catalog values, for both
 * locales, to confirm the composition renders as written instead of leaking a raw key or a mangled sentence.
 */
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInstance } from 'i18next';
import { I18nextProvider, Trans } from 'react-i18next';

const KEYS = [
  'profile.statistics.overviewAscents_one',
  'profile.statistics.overviewAscents_few',
  'profile.statistics.overviewAscents_other',
  'profile.statistics.overviewFa',
  'profile.statistics.overviewTicks_one',
  'profile.statistics.overviewTicks_few',
  'profile.statistics.overviewTicks_other',
];

function collectValues(file) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out = {};
  const walk = (node, prefix) => {
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : null;
      if (!name) continue;
      const path = prefix ? `${prefix}.${name}` : name;
      if (ts.isObjectLiteralExpression(prop.initializer)) walk(prop.initializer, path);
      else if (ts.isStringLiteral(prop.initializer) && KEYS.includes(path)) out[path] = prop.initializer.text;
    }
  };
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node) && !ts.isPropertyAssignment(node.parent)) walk(node, '');
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

const resources = {
  en: { translation: collectValues('src/i18n/locales/en.ts') },
  cs: { translation: collectValues('src/i18n/locales/cs.ts') },
};
for (const [lng, res] of Object.entries(resources)) {
  const missing = KEYS.filter((k) => !(k in res.translation));
  if (missing.length) throw new Error(`${lng} is missing ${missing.join(', ')}`);
}

const Overview = ({ lng, totalAscents, totalFas, totalTicks }) => {
  const i18n = React.useMemo(() => {
    const instance = createInstance();
    instance.init({
      lng,
      fallbackLng: lng,
      resources,
      interpolation: { escapeValue: false },
    });
    return instance;
  }, [lng]);
  const t = i18n.t.bind(i18n);
  return React.createElement(
    I18nextProvider,
    { i18n },
    React.createElement(Trans, {
      i18nKey: 'profile.statistics.overviewAscents',
      count: totalAscents,
      values: {
        fa: t('profile.statistics.overviewFa', { numFa: totalFas }),
        ticks: t('profile.statistics.overviewTicks', { count: totalTicks }),
      },
      components: { count: React.createElement('span', { className: 'font-medium' }) },
    }),
  );
};

/** `[totalAscents, totalFas, totalTicks]` — covers every plural form plus a zero/one edge inside the parentheses. */
const CASES = [
  [3, 1, 2],
  [1, 1, 0],
  [5, 0, 5],
  [21, 3, 18],
];

let leaks = 0;
for (const lng of ['en', 'cs']) {
  for (const [totalAscents, totalFas, totalTicks] of CASES) {
    const html = renderToStaticMarkup(React.createElement(Overview, { lng, totalAscents, totalFas, totalTicks }));
    // A raw key leaking through means the lookup (or the `<count>` slot) failed.
    if (html.includes('profile.statistics') || html.includes('<count>')) leaks += 1;
    console.log(`${lng} ${totalAscents}/${totalFas}/${totalTicks}: ${html}`);
  }
}
console.log(`\nleaked keys: ${leaks}`);

// Non-zero exit when a raw i18n key (or a broken `<count>` slot) leaks into rendered HTML.
process.exitCode = leaks > 0 ? 1 : 0;

