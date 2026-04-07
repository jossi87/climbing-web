import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext } from './themeContext';
import { applyDomTheme, readStoredTheme, THEME_STORAGE_KEY, type ThemePreference } from './themeStorage';

export type { ThemePreference };

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStoredState] = useState<ThemePreference | null>(() =>
    typeof window === 'undefined' ? null : readStoredTheme(),
  );
  const [systemDark, setSystemDark] = useState(() => (typeof window === 'undefined' ? true : systemPrefersDark()));

  const resolved = useMemo((): ThemePreference => {
    if (stored === 'light' || stored === 'dark') return stored;
    return systemDark ? 'dark' : 'light';
  }, [stored, systemDark]);

  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
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
