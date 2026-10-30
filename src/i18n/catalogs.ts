import i18n from 'i18next';
import { captureSentryException } from '../utils/sentry';
import type { SupportedLanguage } from './config';
import { en, type Catalog } from './locales/en';

/**
 * Catalog loading: the base locale ships in the entry chunk, every other locale is a chunk of its own.
 *
 * `en` is the base locale *and* the i18next fallback (`config.ts`), so it can never be fetch-on-demand: a
 * key the active locale does not carry resolves against it, and the first render needs it before anything
 * else. Every other catalog is dead weight for the visitors who do not read it — `cs` is 59 KB of source
 * that used to be parsed and registered on every English visit, before the app could issue its first API
 * request.
 *
 * `CATALOG_LOADERS` is keyed by `SupportedLanguage`, so a locale added to `SUPPORTED_LANGUAGES` without a
 * catalog (or the other way round) is a compile error, and no caller ever special-cases `en`.
 */
export const DEFAULT_NAMESPACE = 'translation';

/** The catalog that ships eagerly — see the note above on why this one cannot be a chunk. */
export const BASE_CATALOG: Catalog = en;

const CATALOG_LOADERS: Record<SupportedLanguage, () => Promise<Catalog>> = {
  /** Already in the entry chunk: "make sure `en` is registered" is a real request that costs nothing. */
  en: () => Promise.resolve(BASE_CATALOG),
  cs: () => import('./locales/cs').then((module) => module.cs),
};

/** Settled and in-flight loads: two callers asking for the same locale share one chunk request. */
const catalogLoads = new Map<SupportedLanguage, Promise<Catalog>>();

/**
 * The locale's catalog, fetched at most once per page load.
 *
 * Rejects when the chunk cannot be fetched (offline, or a deploy that retired the hash between the HTML and
 * this request); the rejection is dropped from {@link catalogLoads} so a later switch retries instead of
 * staying broken.
 */
export function loadCatalog(language: SupportedLanguage): Promise<Catalog> {
  const cached = catalogLoads.get(language);
  if (cached) return cached;

  const load = CATALOG_LOADERS[language]().catch((error: unknown) => {
    catalogLoads.delete(language);
    throw error;
  });
  catalogLoads.set(language, load);
  return load;
}

/**
 * Register a locale picked *after* boot (the header selector, `LanguageSync`'s region default), so
 * `changeLanguage` never resolves keys against the fallback while the catalog is still in flight.
 *
 * Never rejects, deliberately: an unfetchable catalog leaves the visitor on English for this session rather
 * than blocking the switch they asked for. `lazyRetry`'s reload-once trick is aimed at *route* chunks, where
 * a stale hash means the whole page is behind a deploy; a stale catalog is a degraded-but-working page, and
 * reloading before the first render would be strictly worse. The failure is reported instead.
 */
export async function ensureCatalog(language: SupportedLanguage): Promise<void> {
  if (i18n.hasResourceBundle(language, DEFAULT_NAMESPACE)) return;

  try {
    const catalog = await loadCatalog(language);
    // `skipCopy`: this object is never mutated afterwards, and i18next would otherwise deep-clone it.
    i18n.addResourceBundle(language, DEFAULT_NAMESPACE, catalog, true, true, { skipCopy: true });
  } catch (error) {
    captureSentryException(error, { scope: 'i18n catalog', language });
  }
}
