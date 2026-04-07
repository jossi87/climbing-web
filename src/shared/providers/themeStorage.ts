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

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
  const resolved = stored ?? (systemPrefersDark() ? 'dark' : 'light');
  applyDomTheme(resolved);
}
