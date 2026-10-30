import i18n from 'i18next';
import type { ParseKeys } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { captureSentryException } from '../utils/sentry';
import { BASE_CATALOG, DEFAULT_NAMESPACE, loadCatalog } from './catalogs';
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, resolveInitialLanguage, type SupportedLanguage } from './config';
import { applyDomLanguage } from './languageStorage';
import type { Catalog } from './locales/en';

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

/**
 * Catalog for the boot locale, or `null` when it is not needed (the boot locale *is* the base locale) or
 * cannot be fetched — in which case the app boots on `en` instead of painting catalog keys.
 */
async function loadInitialCatalog(language: SupportedLanguage): Promise<Catalog | null> {
  if (language === FALLBACK_LANGUAGE) return null;

  try {
    return await loadCatalog(language);
  } catch (error) {
    captureSentryException(error, { scope: 'i18n initial catalog', language });
    return null;
  }
}

async function initI18n(): Promise<void> {
  if (i18n.isInitialized) return;

  const language = resolveInitialLanguage();
  const catalog = await loadInitialCatalog(language);

  // Both bundles go in through `resources` rather than `addResourceBundle`: `init` replaces i18next's store
  // from this option, so a bundle registered before it would be dropped.
  await i18n.use(initReactI18next).init({
    resources: {
      [FALLBACK_LANGUAGE]: { [DEFAULT_NAMESPACE]: BASE_CATALOG },
      ...(catalog ? { [language]: { [DEFAULT_NAMESPACE]: catalog } } : {}),
    },
    // A catalog that failed to load boots on the base locale, rather than keeping a `lng` i18next would
    // report as resolved while every key renders English.
    lng: catalog ? language : FALLBACK_LANGUAGE,
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

/**
 * Resolves once i18next can translate — i.e. once the boot locale's catalog is registered. `index.tsx` waits
 * for it before rendering: a render before that would paint catalog keys (`header.signIn`) for a frame.
 *
 * The wait is one network round-trip only for a visitor whose locale is not the base one (the boot catalog is
 * a chunk, see `catalogs.ts`). Never rejects: a failure here degrades the page, it must not blank it.
 */
export const i18nReady = initI18n().catch((error: unknown) => {
  captureSentryException(error, { scope: 'i18n init' });
});
