import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FALLBACK_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from './config';
import { writeStoredLanguage } from './languageStorage';

/**
 * Active locale plus the two ways to change it — the locale counterpart of `shared/providers/useTheme`.
 *
 * No React context: i18next owns the locale and `useTranslation` already subscribes to it, so a
 * provider would only mirror state the i18n singleton holds anyway.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const resolved = i18n.resolvedLanguage;
  const active: SupportedLanguage = isSupportedLanguage(resolved) ? resolved : FALLBACK_LANGUAGE;

  /**
   * Derived locale — the region default or a browser match. Applied for this session but deliberately
   * not stored: a derived default must never outrank another region's default later on.
   */
  const applyLanguage = useCallback(
    (next: SupportedLanguage) => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  /**
   * Locale the user owns — their own pick, or the one their profile carries. Stored so the next boot
   * resolves it in `resolveInitialLanguage()` without waiting for `/meta` to answer.
   */
  const setLanguage = useCallback(
    (next: SupportedLanguage) => {
      writeStoredLanguage(next);
      applyLanguage(next);
    },
    [applyLanguage],
  );

  return { active, applyLanguage, setLanguage };
}
