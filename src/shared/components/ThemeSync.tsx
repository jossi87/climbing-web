import { useEffect } from 'react';
import { useProfile } from '../../api';
import { useTheme } from '../providers/useTheme';

/**
 * Syncs the backend `themePreference` into the frontend theme when the profile loads,
 * but only if the user hasn't explicitly set a preference in localStorage.
 *
 * This ensures that a user who has `themePreference: "dark"` saved in the database
 * will see the dark theme after logging in, even if they've never toggled the theme
 * on this device before.
 */
export function ThemeSync() {
  const { data: profile } = useProfile();
  const { stored, setStored } = useTheme();

  useEffect(() => {
    if (!profile?.themePreference) return;
    // Only apply backend preference if user hasn't explicitly set one locally
    if (stored !== null) return;
    const backendTheme = profile.themePreference;
    if (backendTheme === 'light' || backendTheme === 'dark') {
      setStored(backendTheme);
    }
  }, [profile?.themePreference, stored, setStored]);

  return null;
}
