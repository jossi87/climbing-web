import { readStoredLanguage } from './languageStorage';

/**
 * Locales the app ships a catalog for. `en` is the base locale and the i18next fallback; `cs` is
 * Czech.
 *
 * Codes are plain language codes: a region can only pick a default among them, never add one. A
 * language the backend offers is not enough either — only codes listed here can be picked for a
 * visitor automatically and only they are offered by the header selector (`LanguageSelect` intersects
 * this list with `meta.languages`, so an unshipped code — or one the backend does not offer — simply
 * drops out).
 *
 * Adding a locale takes four edits: a `locales/<code>.ts` catalog, a loader for it in `catalogs.ts` (only
 * the base locale's catalog is in the entry chunk; every other one is fetched on demand), an entry here,
 * and the inline `<html lang>` bootstrap in `index.html`.
 */
export const SUPPORTED_LANGUAGES = ['en', 'cs'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

export function isSupportedLanguage(value: string | null | undefined): value is SupportedLanguage {
  return value != null && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Boot-time resolution order: stored override → browser → `en`.
 *
 * The region default (`meta.defaultLanguage`, the language the region is configured with) cannot
 * take part here: it only arrives with `/meta`, which is fetched after this has already run. It slots
 * in between the override and the browser as soon as the meta lands — see `resolveLanguageForMeta`.
 */
export function resolveInitialLanguage(): SupportedLanguage {
  const stored = readStoredLanguage();
  if (isSupportedLanguage(stored)) return stored;

  const browser = typeof navigator === 'undefined' ? null : navigator.language;
  const base = browser?.split('-')[0];
  if (isSupportedLanguage(base)) return base;

  return FALLBACK_LANGUAGE;
}

/**
 * Locale to switch to once `/meta` is available.
 *
 * Precedence: stored override → region default → `null`. `null` means "keep what
 * `resolveInitialLanguage()` already picked" (the browser match or `en`), so a visitor browsing in a
 * shipped locale is not re-rendered for nothing.
 *
 * A code outside `SUPPORTED_LANGUAGES` is skipped, never applied: the language list is data, so the
 * backend can offer `de` long before `locales/de.ts` ships here.
 */
export function resolveLanguageForMeta(regionDefault: string | null | undefined): SupportedLanguage | null {
  const stored = readStoredLanguage();
  if (isSupportedLanguage(stored)) return stored;
  if (isSupportedLanguage(regionDefault)) return regionDefault;

  return null;
}
