/**
 * Locale persistence, mirroring `shared/providers/themeStorage.ts`: one localStorage key holding a
 * JSON-encoded value.
 *
 * The key is read in three places that must agree — `config.ts` (initial locale), this module, and the
 * inline bootstrap in `index.html` that sets `<html lang>` before the bundle loads. Change the key or
 * the supported codes, and change all of them.
 */
export const LANGUAGE_STORAGE_KEY = 'language_preference';

export function readStoredLanguage(): string | null {
  try {
    const raw = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (raw == null) return null;
    const value = JSON.parse(raw) as unknown;
    return typeof value === 'string' && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredLanguage(value: string | null): void {
  try {
    if (value == null) localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    else localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* Private mode / quota — the in-memory locale still applies for this session. */
  }
}

/** Mirror the active locale onto the document for a11y and `:lang()` selectors. */
export function applyDomLanguage(language: string): void {
  document.documentElement.lang = language;
}
