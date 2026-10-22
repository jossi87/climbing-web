import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { timeAgoBucket } from '../../utils/relativeTime';

/**
 * Localized “3 days ago” / “před 3 dny” / “včera” for an API timestamp.
 *
 * The API sends raw timestamps (`activity.timestamp`, `lastLogin`, `lastActivity`); the sentence is built here so
 * it follows the visitor's locale instead of being fixed English from the server.
 *
 * Returns an empty string when there is nothing to show (missing timestamp or an epoch sentinel), so a call site
 * can drop the result straight into a span.
 *
 * Each bucket is written out instead of looked up through a table, so a renamed catalog key (or a new bucket) is a
 * compile error here rather than a raw key rendered at runtime.
 */
export function useTimeAgo(): (value: string | null | undefined) => string {
  const { t } = useTranslation();
  return useCallback(
    (value: string | null | undefined) => {
      const bucket = timeAgoBucket(value);
      if (!bucket) return '';
      switch (bucket.unit) {
        case 'today':
          return t('timeAgo.today');
        case 'yesterday':
          return t('timeAgo.yesterday');
        case 'days':
          return t('timeAgo.daysAgo', { count: bucket.count });
        case 'weeks':
          return t('timeAgo.weeksAgo', { count: bucket.count });
        case 'months':
          return t('timeAgo.monthsAgo', { count: bucket.count });
        case 'years':
          return t('timeAgo.yearsAgo', { count: bucket.count });
      }
    },
    [t],
  );
}
