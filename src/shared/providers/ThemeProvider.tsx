import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from './themeContext';
import {
  applyDomTheme,
  readStoredTheme,
  resolveThemeFromSystem,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from './themeStorage';

export type { ThemePreference };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStoredState] = useState<ThemePreference | null>(() =>
    typeof window === 'undefined' ? null : readStoredTheme(),
  );
  const [systemTheme, setSystemTheme] = useState<ThemePreference>(() =>
    typeof window === 'undefined' ? 'dark' : resolveThemeFromSystem(),
  );

  const resolved = useMemo((): ThemePreference => {
    if (stored === 'light' || stored === 'dark') return stored;
    return systemTheme;
  }, [stored, systemTheme]);

  useLayoutEffect(() => {
    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    const mqLight = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setSystemTheme(resolveThemeFromSystem());
    mqDark.addEventListener('change', onChange);
    mqLight.addEventListener('change', onChange);
    return () => {
      mqDark.removeEventListener('change', onChange);
      mqLight.removeEventListener('change', onChange);
    };
  }, []);

  useLayoutEffect(() => {
    applyDomTheme(resolved);
  }, [resolved]);

  const setStored = useCallback((value: ThemePreference | null) => {
    setStoredState(value);
    try {
      if (value == null) localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* ignore quota */
    }
  }, []);

  const toggle = useCallback(() => {
    const next: ThemePreference = resolved === 'dark' ? 'light' : 'dark';
    setStored(next);
  }, [resolved, setStored]);

  const value = useMemo(() => ({ resolved, stored, setStored, toggle }), [resolved, stored, setStored, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
