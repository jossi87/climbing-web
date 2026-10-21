import type { ReactNode } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useData } from '../../../api';
import { type Metadata } from './context';
import { MetaContext } from './context';

type Props = {
  children: ReactNode;
};

/**
 * Module level on purpose: an inline `select` is a new function on every render, so React Query re-ran it each time.
 *
 * `languages` is optional in the response schema, so normalise it to `[]`: consumers read it as a non-nullable list
 * (see `Metadata`).
 */
const selectNormalisedMeta = (data: Metadata) => {
  if (!data.languages) {
    data.languages = [];
  }
  if (data.faYears) {
    data.faYears.sort((a, b) => a - b);
  }
  /**
   * A payload from an older API has no feed domain; fall back to the active region's own systems so the feed keeps
   * its region filters instead of losing every grade chip.
   */
  if (!data.activityGradeSystemIds?.length) {
    data.activityGradeSystemIds = data.regionGradeSystemIds;
  }
  return data;
};

export const MetaProvider = ({ children }: Props) => {
  const { data: meta, isPending } = useData<Metadata>(`/meta`, {
    select: selectNormalisedMeta,
    staleTime: Infinity,
    /**
     * `/meta` is localized, and `useKey` folds the active locale into every key — so a language switch asks for a
     * second `/meta` under a key that has no data yet. Without placeholder data that fetch is `pending` and the
     * provider below has nothing to hand its children, so the entire shell unmounted and blanked for the round trip.
     * That unmount also disposed `LanguageSync`/`ThemeSync`'s once-per-load guards: they remounted and re-applied
     * `languagePreference`/`themePreference` from the response of a request that had raced the preference POST
     * (both are fired together), which reverted the choice the user had just made. Keeping the previous payload on
     * screen until the localized one lands keeps the tree — and those guards — mounted.
     *
     * The first load has no previous payload, so the provider still holds back until `/meta` answers.
     */
    placeholderData: keepPreviousData,
  });

  if (isPending || !meta) {
    return null;
  }

  return <MetaContext.Provider value={meta}>{children}</MetaContext.Provider>;
};
