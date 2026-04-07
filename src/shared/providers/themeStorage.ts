export type ThemePreference = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme_preference';

export function readStoredTheme(): ThemePreference | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw == null) return null;
    const v = JSON.parse(raw) as unknown;
    if (v === 'light' || v === 'dark') return v;
    return null;
  } catch {
    return null;
  }
}

/**
 * No saved preference yet: match OS when it reports light or dark; otherwise default **dark**
 * (`prefers-color-scheme: no-preference`, broken `matchMedia`, etc.).
 */
export function resolveThemeFromSystem(): ThemePreference {
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function applyDomTheme(resolved: ThemePreference) {
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved === 'dark' ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    /* Light mode uses a dark app header — match mobile browser chrome to that strip */
    meta.setAttribute('content', resolved === 'dark' ? '#060709' : '#13151a');
  }
}

/** Sync `<html>` + meta from `localStorage` + system preference (see `index.html` inline script — keep in sync). */
export function applyThemeFromStorage() {
  const stored = readStoredTheme();
  const resolved = stored ?? resolveThemeFromSystem();
  applyDomTheme(resolved);
}
