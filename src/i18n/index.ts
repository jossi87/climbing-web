import i18n from 'i18next';
import type { ParseKeys } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, resolveInitialLanguage } from './config';
import { applyDomLanguage } from './languageStorage';
import { cs } from './locales/cs';
import { en } from './locales/en';

/** One namespace for now; split per feature only if the catalog becomes unwieldy. */
const DEFAULT_NAMESPACE = 'translation';

/**
 * A valid catalog key, as `tsc` knows it.
 *
 * `i18next.d.ts` binds i18next's key unions to the `en` catalog, so a literal key passed to `t()` is checked at the
 * call site. That check is lost the moment a key travels through a variable (a module-scope option table, a prop
 * holding "which key am I"), because the variable widens to `string` and i18next accepts any string as a key. Annotate
 * those declarations with this type and the table/prop keeps the same guarantee: a renamed catalog key breaks the
 * build instead of rendering the raw key at runtime.
 */
export type TranslationKey = ParseKeys;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { [DEFAULT_NAMESPACE]: en },
      cs: { [DEFAULT_NAMESPACE]: cs },
    },
    lng: resolveInitialLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: DEFAULT_NAMESPACE,
    load: 'languageOnly',
    /* React already escapes interpolated values. */
    interpolation: { escapeValue: false },
  });

  applyDomLanguage(i18n.resolvedLanguage ?? FALLBACK_LANGUAGE);
  i18n.on('languageChanged', applyDomLanguage);
}
