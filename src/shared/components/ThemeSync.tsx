import { useEffect, useRef } from 'react';
import { useProfile } from '../../api';
import { useTheme } from '../providers/useTheme';

/**
 * Syncs the backend `themePreference` into the frontend theme when the profile loads.
 * The backend is the source of truth — always overrides any local preference so that
 * the user gets a consistent theme across all devices.
 *
 * When the user logs in and has no backend preference yet (null), the current frontend
 * preference is saved to the backend so that subsequent logins on other devices pick it up.
 */
export function ThemeSync() {
  const { data: profile, setThemePreference } = useProfile();
  const { stored, setStored } = useTheme();
  const synced = useRef(false);

  useEffect(() => {
    if (!profile) return;
    if (synced.current) return;

    const backendTheme = profile.themePreference;
    if (backendTheme === 'light' || backendTheme === 'dark') {
      // Backend has a preference — override local state so the user gets a consistent
      // experience across all devices.
      setStored(backendTheme);
    } else if (stored) {
      // Backend has no preference but the user has a local preference — save it to the
      // backend so it persists across devices.
      setThemePreference(stored).catch(() => {
        /* Silently ignore — localStorage fallback is sufficient */
      });
    }

    synced.current = true;
  }, [profile, stored, setStored, setThemePreference]);

  return null;
}
