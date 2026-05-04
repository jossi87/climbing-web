import { useEffect } from 'react';
import { useProfile } from '../../api';
import { useTheme } from '../providers/useTheme';

/**
 * Syncs the backend `themePreference` into the frontend theme when the profile loads.
 * The backend is the source of truth — always overrides any local preference so that
 * the user gets a consistent theme across all devices.
 */
export function ThemeSync() {
  const { data: profile } = useProfile();
  const { setStored } = useTheme();

  useEffect(() => {
    if (!profile?.themePreference) return;
    const backendTheme = profile.themePreference;
    if (backendTheme === 'light' || backendTheme === 'dark') {
      setStored(backendTheme);
    }
  }, [profile?.themePreference, setStored]);

  return null;
}
