import { useEffect, useRef } from 'react';
import { useSetLanguagePreference } from '../../api';
import { isSupportedLanguage, resolveLanguageForMeta } from '../../i18n/config';
import { readStoredLanguage } from '../../i18n/languageStorage';
import { useLanguage } from '../../i18n/useLanguage';
import { useMeta } from './Meta/context';

/**
 * Syncs the backend `languagePreference` into the active locale once the meta loads, mirroring `ThemeSync`.
 *
 * The backend is the source of truth for a signed-in user — their locale follows them across devices — while an
 * anonymous visitor falls back to the region's language, and then to whatever the browser asked for.
 */
export function LanguageSync() {
  const meta = useMeta();
  const { mutateAsync: setLanguagePreference } = useSetLanguagePreference();
  const { applyLanguage, setLanguage } = useLanguage();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;

    if (isSupportedLanguage(meta.languagePreference)) {
      // Backend has a preference — it is the user's own choice, so it overrides the local locale and is
      // stored: `resolveInitialLanguage()` then applies it on the next boot without waiting for `/meta`.
      setLanguage(meta.languagePreference);
    } else {
      const stored = readStoredLanguage();
      if (meta.isAuthenticated && isSupportedLanguage(stored)) {
        // Logged in, no backend preference yet but a local one exists — save it so other devices pick it
        // up. Only for authenticated users: the endpoint requires a session.
        setLanguagePreference(stored).catch(() => {
          /* Silently ignore — the locale still applies locally */
        });
      } else {
        // Anonymous visitor (or nothing stored yet): follow the region. `resolveLanguageForMeta` answers
        // `null` for a code this bundle ships no catalog for, which keeps the boot-time locale.
        const regionDefault = resolveLanguageForMeta(meta.defaultLanguage);
        if (regionDefault) applyLanguage(regionDefault);
      }
    }

    synced.current = true;
  }, [
    meta.languagePreference,
    meta.isAuthenticated,
    meta.defaultLanguage,
    applyLanguage,
    setLanguage,
    setLanguagePreference,
  ]);

  return null;
}
