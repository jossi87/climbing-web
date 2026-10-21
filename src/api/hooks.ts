import { useAuth0 } from '@auth0/auth0-react';
import {
  type QueryClient,
  type UseMutationOptions,
  type MutationFunction,
  useMutation,
  type UseQueryOptions,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { Success, WithoutFirstParameter } from '../@types/buldreinfo';
import type { components } from '../@types/buldreinfo/swagger';
import { useLanguage } from '../i18n/useLanguage';
import { useLocalStorage } from '../utils/use-local-storage';
import { useRedirect } from '../utils/useRedirect';
import { makeAuthenticatedRequest, useAccessToken, mediaIdentityId, mediaIdentityVersionStamp } from './utils';
import type { FetchOptions } from './types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteMergeDismissal,
  postMergeDismissal,
  postMergeUsers,
  postPermissions,
  postUserRename,
} from './operations';
import { captureSentryException } from '../utils/sentry';
import { type MediaRegion, calculateMediaRegion, isPathVisible, scaleCoordsJson, scalePath } from '../utils/svg-scaler';
import type { SvgType } from '../utils/svg-helpers';

import { createHttpErrorFromResponse, isHttpError } from './httpError';
import { applyEntityRedirectUrl } from './redirectResponse';

/**
 * React Query key for an API call: the caller's key with `isAuthenticated` and the active locale folded in.
 *
 * Only keys the caller shaped `[url, { … }]` receive them, so pass such an object for anything the API
 * personalizes or localizes (or omit `queryKey`, which defaults to that shape).
 */
function useKey(customKey: readonly unknown[] | undefined, urlSuffix: string): readonly unknown[] {
  const { isAuthenticated } = useAuth0();
  const { active: language } = useLanguage();
  const key = customKey ?? [urlSuffix, { isAuthenticated }];
  if (Array.isArray(key) && key[1] && typeof key[1] === 'object') {
    // Spread them in this order so that callers can choose to ignore the
    // isAuthenticated or language variables if they choose to.
    key[1] = {
      isAuthenticated,
      // The API localizes every payload it is asked for (`lang`, see `getApiLanguage`), so the active locale
      // is part of what identifies a cached payload. Without it a language switch kept serving the previous
      // language for the rest of the 30 min `staleTime` — and `/meta` is cached with `staleTime: Infinity`,
      // so its types, compass labels and regions would never have been refetched at all.
      language,
      ...key[1],
    };
  }
  return key;
}

/**
 * `select` for the Area/Sector/Problem GETs that may answer with `redirectUrl` for a hidden entity.
 *
 * Module level on purpose: React Query only reuses a `select` result while the function keeps the same identity, and
 * an inline arrow is a new function on every render, so it re-ran on each render of the page.
 */
function selectEntityWithRedirect<T extends { redirectUrl?: string } | undefined | null>(data: T): T {
  applyEntityRedirectUrl(data);
  return data;
}

export { invalidateActivityAndFrontpageQueries } from './activityFeedInvalidation';

/**
 * Call after tick/comment POSTs so `useProblem` refetches (cache is not updated automatically).
 *
 * `refetchType: 'all'` ensures the problem payload is refetched even when its query is **inactive** (e.g. the
 * topo editor `/problem/svg-edit/:id` page has unmounted the problem page). The default `refetchType: 'active'`
 * only marks inactive queries stale without refetching, so navigating back would serve the stale cached payload
 * (the app's global `staleTime` is 30 min) until a manual refresh.
 */
export function invalidateProblemQueries(client: QueryClient, problemId: number) {
  return client.invalidateQueries({
    predicate: (q) => {
      const key = q.queryKey;
      if (!Array.isArray(key) || key[0] !== '/problems') return false;
      const meta = key[1];
      if (meta == null || typeof meta !== 'object') return false;
      return 'id' in meta && (meta as { id: number }).id === problemId;
    },
    refetchType: 'all',
  });
}

/**
 * Refetch every cached problem payload (`/media/svg` overlays update `mediaSvgs` only — those rows are not listed in
 * `svgs[]`, so per-id {@link invalidateProblemQueries} misses the problems that embed this image).
 *
 * `refetchType: 'all'` is required: these queries are typically **inactive** while the user is on the
 * `/media/svg-edit/:id` page (the problem/sector/area page that embeds the image is unmounted). The default
 * `refetchType: 'active'` only marks inactive queries stale without refetching them, so navigating back would
 * serve the stale cached payload (the app's global `staleTime` is 30 min) until a manual refresh.
 */
export function invalidateAllProblemQueries(client: QueryClient) {
  return client.invalidateQueries({ queryKey: ['/problems'], refetchType: 'all' });
}

/** After topo/SVG edits on a shared image — `useMedia` / modals refetch. Query key matches {@link useMediaSvg}. */
export function invalidateMediaQueries(client: QueryClient, idMedia: number) {
  return client.invalidateQueries({
    predicate: (q) => {
      const key = q.queryKey;
      if (!Array.isArray(key) || key[0] !== '/media') return false;
      const meta = key[1];
      if (meta == null || typeof meta !== 'object') return false;
      return 'idMedia' in meta && (meta as { idMedia: number }).idMedia === idMedia;
    },
    refetchType: 'all',
  });
}

/** Sector problem lists (`hasTopo`, etc.) — invalidate after edits that change problem-level topo flags. */
/** Same identity as activity feed row keys — skip duplicates when the same row appears across pages. */
function activityStableKey(a: components['schemas']['Activity']): string {
  if (a.activityIds && a.activityIds.length > 0) return a.activityIds.join('+');
  return `activity-${a.id ?? 'unknown'}`;
}

/** Backend `offset` advances by the **count** of `activityIds` per row (underlying rows), not feed row count. */
function activityIdsCountForOffset(row: components['schemas']['Activity']): number {
  const ids = row.activityIds;
  if (!ids?.length) return 1;
  return ids.length;
}

/**
 * Refetch a sector payload after edits. `refetchType: 'all'` ensures the sector query is refetched even when it is
 * **inactive** (e.g. the `/media/svg-edit/:id` page has unmounted the sector page). The default `refetchType:
 * 'active'` only marks inactive queries stale without refetching, so navigating back would serve the stale cached
 * payload (the app's global `staleTime` is 30 min) until a manual refresh.
 */
export function invalidateSectorQueries(client: QueryClient, sectorId: number) {
  return client.invalidateQueries({
    predicate: (q) => {
      const key = q.queryKey;
      if (!Array.isArray(key) || key[0] !== '/sectors') return false;
      const meta = key[1];
      if (meta == null || typeof meta !== 'object') return false;
      return 'id' in meta && (meta as { id: number }).id === sectorId;
    },
    refetchType: 'all',
  });
}

/**
 * Refetch every cached sector payload. A media image can be shown on a sector page even when it is **not** directly
 * connected to that sector via `media_sector` — the sector page's media list also includes images connected via
 * `media_problem` (a problem's image). The media payload's `sectors[]` only reflects direct `media_sector` links, so
 * per-id {@link invalidateSectorQueries} can miss the sector the user actually came from. Refetching all sector
 * queries guarantees the sector page shows the freshly drawn SVG elements.
 *
 * `refetchType: 'all'` is required: these queries are typically **inactive** while the user is on the
 * `/media/svg-edit/:id` page (the sector page is unmounted). The default `refetchType: 'active'` only marks inactive
 * queries stale without refetching them, so navigating back would serve the stale cached payload (the app's global
 * `staleTime` is 30 min) until a manual refresh.
 */
export function invalidateAllSectorQueries(client: QueryClient) {
  return client.invalidateQueries({ queryKey: ['/sectors'], refetchType: 'all' });
}

/**
 * Refetch every cached area payload. The area page's query key is `['/areas/:id', { id }]` (see {@link useArea}), so
 * a `queryKey: ['/areas']` prefix match would miss it — match on the `/areas/` prefix instead. Like sectors, an image
 * can be shown on an area page even when it is only connected via a problem, so refetching all areas guarantees the
 * area page the user came from shows the freshly drawn SVG elements.
 *
 * `refetchType: 'all'` is required: these queries are typically **inactive** while the user is on the
 * `/media/svg-edit/:id` page (the area page is unmounted). The default `refetchType: 'active'` only marks inactive
 * queries stale without refetching them, so navigating back would serve the stale cached payload (the app's global
 * `staleTime` is 30 min) until a manual refresh.
 */
export function invalidateAllAreaQueries(client: QueryClient) {
  return client.invalidateQueries({
    predicate: (q) => {
      const key = q.queryKey;
      if (!Array.isArray(key) || typeof key[0] !== 'string') return false;
      return key[0].startsWith('/areas/');
    },
    refetchType: 'all',
  });
}

export function usePostData<TVariables, TData = Response>(
  urlSuffix: string,
  {
    fetchOptions,
    createUrl = () => urlSuffix,
    select = (resp) => resp as TData,
    ...options
  }: Partial<
    UseMutationOptions<TData, unknown, TVariables> & {
      fetchOptions: FetchOptions;
      createUrl: (variables: TVariables) => string;
      select: (response: Response, variables: TVariables) => TData | Promise<TData>;
      createBody: (variables: TVariables) => BodyInit;
    }
  > = {},
) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const mutationKey = useKey(options.mutationKey, urlSuffix);

  const mutationFn: MutationFunction<TData, TVariables> = async (variables) => {
    // `getAccessTokenSilently` may resolve `undefined` when no token can be minted; the API layer
    // models "no token" as `null`.
    const accessToken = isAuthenticated ? ((await getAccessTokenSilently()) ?? null) : null;

    const url = createUrl(variables);
    const createBody = options.createBody ?? JSON.stringify;

    const body = fetchOptions?.body ?? createBody(variables);
    const isFormData = body instanceof FormData;
    const res = await makeAuthenticatedRequest(accessToken, url, {
      ...fetchOptions,
      method: fetchOptions?.method ?? 'POST',
      body,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...fetchOptions?.headers,
      },
    });

    return select(res, variables);
  };

  return useMutation<TData, unknown, TVariables>({
    mutationKey,
    mutationFn,
    ...options,
  });
}

export function useData<TQueryData = unknown, TData = TQueryData>(
  urlSuffix: string,
  {
    queryKey: customQueryKey,
    ...options
  }: Partial<Omit<UseQueryOptions<TQueryData, unknown, TData>, 'queryFn' | 'structuralSharing'>> = {},
) {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const authReady = !isLoading;
  const { enabled, ...restOptions } = options;
  const queryKey = useKey(customQueryKey, urlSuffix);

  /**
   * Follow API semantics: do not retry deterministic client errors (4xx).
   * Retry only transient/network-like failures a limited number of times.
   */
  const retryOption =
    restOptions.retry ??
    ((failureCount: number, error: unknown) => {
      if (isHttpError(error) && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    });

  const queryFn: () => Promise<TQueryData> = async (): Promise<TQueryData> => {
    // If the access token can't be obtained (e.g. a revoked refresh token),
    // fall back to an anonymous request rather than failing the query.
    // SessionGuard resets the session, but this prevents a black screen in the
    // meantime and keeps public content renderable.
    let accessToken: string | null = null;
    if (isAuthenticated) {
      try {
        accessToken = (await getAccessTokenSilently()) ?? null;
      } catch {
        accessToken = null;
      }
    }
    const res = await makeAuthenticatedRequest(accessToken, urlSuffix);
    if (!res.ok) {
      throw await createHttpErrorFromResponse(res, urlSuffix);
    }
    return res.json();
  };

  const data = useQuery<TQueryData, unknown, TData>({
    queryKey,
    queryFn,
    enabled: authReady && (enabled ?? true),
    retry: retryOption,
    ...restOptions,
  });
  const redirectUi = useRedirect(data.data);
  return { ...data, redirectUi };
}

export function useToc() {
  const [cachedData, _, writeCachedData] = useLocalStorage<components['schemas']['Toc']>('cache/toc', {});
  const query = useData<components['schemas']['Toc']>('/toc', { placeholderData: cachedData });

  /**
   * Persisted here rather than in `select`: an inline `select` gets a new identity on every render, so React Query
   * re-ran it — `JSON.stringify` plus `localStorage.setItem` of the whole TOC — on every render of `/problems` and
   * `/dangerous`. `writeCachedData` only writes to `localStorage` (never state), so its identity is stable and this
   * effect is limited to real TOC loads. `isPlaceholderData` skips re-writing what was just read back from the cache.
   */
  const { data, isPlaceholderData } = query;
  useEffect(() => {
    if (data && !isPlaceholderData) {
      writeCachedData(data);
    }
  }, [data, isPlaceholderData, writeCachedData]);

  return query;
}

/** Lowest grade (by weight) included for one grade system. Thresholds for different systems apply independently. */
export type ActivityGradeFilter = {
  gradeSystemId: number;
  minWeight: number;
};

export function useActivity({
  idArea,
  idSector,
  gradeFilters,
  fa,
  comments,
  ticks,
  media,
}: {
  idArea: number;
  idSector: number;
  /** One threshold per filtered grade system; a threshold only applies to problems graded in its own system. */
  gradeFilters: ActivityGradeFilter[];
  fa: boolean;
  comments: boolean;
  ticks: boolean;
  media: boolean;
}) {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const authReady = !isLoading;

  /** Stable `gradeSystemId:weight` signature, used both as cache-key part and as the `gradeFilters` param. */
  const gradeFiltersParam = useMemo(
    () =>
      [...gradeFilters]
        .filter(({ gradeSystemId, minWeight }) => gradeSystemId > 0 && minWeight > 0)
        .sort((a, b) => a.gradeSystemId - b.gradeSystemId)
        .map(({ gradeSystemId, minWeight }) => `${gradeSystemId}:${minWeight}`)
        .join(','),
    [gradeFilters],
  );
  const gradeFiltersQuery = gradeFiltersParam ? `&gradeFilters=${encodeURIComponent(gradeFiltersParam)}` : '';
  const queryParams = `idArea=${idArea}&idSector=${idSector}${gradeFiltersQuery}&fa=${fa}&comments=${comments}&ticks=${ticks}&media=${media}`;

  const queryKey = useKey(
    [`/activity`, { idArea, idSector, gradeFiltersParam, fa, comments, ticks, media }],
    `/activity?${queryParams}`,
  );

  const query = useInfiniteQuery({
    queryKey,
    enabled: authReady,
    initialPageParam: 0,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      // Fall back to anonymous if the token can't be obtained (dead session) —
      // see SessionGuard.
      let accessToken: string | null = null;
      if (isAuthenticated) {
        try {
          accessToken = (await getAccessTokenSilently()) ?? null;
        } catch {
          accessToken = null;
        }
      }
      const url = `/activity?${queryParams}&offset=${pageParam}`;
      const res = await makeAuthenticatedRequest(accessToken, url);
      if (!res.ok) {
        throw await createHttpErrorFromResponse(res, url);
      }
      return res.json() as Promise<Success<'getActivity'>>;
    },
    retry: (failureCount, error) => {
      if (isHttpError(error) && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    /**
     * Inner query uses offset/limit; outer permission filter can shrink pages — do not infer “end” from length.
     * Only an empty page means no more rows.
     */
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage?.length) return undefined;
      const delta = lastPage.reduce((acc, row) => acc + activityIdsCountForOffset(row), 0);
      return lastPageParam + delta;
    },
  });

  const flat = useMemo(() => {
    const pages = query.data?.pages;
    if (!pages?.length) return [];
    const seen = new Set<string>();
    const out: Success<'getActivity'> = [];
    for (const page of pages) {
      for (const row of page) {
        const k = activityStableKey(row);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(row);
      }
    }
    return out;
  }, [query.data?.pages]);
  const redirectUi = useRedirect(query.data?.pages?.[0]);

  return {
    ...query,
    data: flat,
    refetch: query.refetch,
    redirectUi,
  };
}

export function useAreas() {
  return useData<components['schemas']['AreaBasic'][]>(`/areas`, {
    queryKey: [`/areas`],
  });
}

export function useArea(id: number) {
  return useData<Success<'getArea'>>(`/areas/${id}`, {
    queryKey: [`/areas/${id}`, { id }],
    enabled: id > 0,
    select: selectEntityWithRedirect,
  });
}

export function useMediaSvg(idMedia: number, enabled?: boolean) {
  const { data, ...dataResult } = useData<Success<'getMedia'>>(`/media?idMedia=${idMedia}`, {
    queryKey: [`/media`, { idMedia }],
    enabled: enabled ?? idMedia > 0,
  });

  const mutation = usePostData(`/media/svg`);

  return { media: data, save: mutation.mutateAsync, ...dataResult };
}

export function useProblem(id: number, showHiddenMedia: boolean) {
  const client = useQueryClient();
  const problem = useData<Success<'getProblems'>>(`/problems?id=${id}&showHiddenMedia=${showHiddenMedia}`, {
    enabled: id > 0,
    queryKey: [`/problems`, { id, showHiddenMedia }],
    select: selectEntityWithRedirect,
  });
  const toggleTodo = usePostData(`/todo?idProblem=${id}`, {
    mutationKey: [`/todo`, { id }],
    onSuccess: () => {
      problem.refetch();
      if (problem.data?.sectorId) {
        invalidateSectorQueries(client, problem.data.sectorId);
      }
      if (problem.data?.areaId) {
        client.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey;
            if (!Array.isArray(key) || key[0] !== '/areas') return false;
            const meta = key[1];
            if (meta == null || typeof meta !== 'object') return false;
            return 'id' in meta && (meta as { id: number }).id === problem.data!.areaId;
          },
        });
      }
      client.refetchQueries({
        queryKey: [`/profiles/todo`],
      });
    },
    fetchOptions: {
      consistencyAction: 'nop',
    },
  });

  return { ...problem, toggleTodo: toggleTodo.mutateAsync };
}

export function useProfile(userId: number) {
  const client = useQueryClient();
  const { isAuthenticated } = useAuth0();
  const profile = useData<components['schemas']['Profile']>(`/profiles?id=${userId}`, {
    queryKey: [`/profiles`, { id: userId }],
    enabled: userId > 0 && (userId > 0 || isAuthenticated),
  });

  const setProfile = usePostData<{
    firstname: string;
    lastname: string;
    emailVisibleToAll: boolean;
    themePreference?: string;
    /**
     * Optional: the identity form leaves the language to the header selector (`LanguageSelect`).
     * Omitted, the stored value is left untouched.
     */
    languagePreference?: string;
  }>(`/profiles/identity`, {
    createBody({ firstname, lastname, emailVisibleToAll, themePreference, languagePreference }) {
      return JSON.stringify({
        id: userId,
        firstname,
        lastname,
        emailVisibleToAll,
        themePreference,
        languagePreference,
      });
    },
    fetchOptions: {
      headers: {
        Accept: 'application/json',
      },
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [`/profiles`, { id: userId, isAuthenticated }],
      });
    },
    onError: () => {
      client.invalidateQueries({
        queryKey: [`/profiles`, { id: userId, isAuthenticated }],
      });
    },
    onSettled: () => {
      client.invalidateQueries({
        queryKey: [`/permissions`],
      });
    },
  });

  const addRegion = usePostData<number>(`/users/regions`, {
    createUrl: (regionId) => `/users/regions?regionId=${regionId}&delete=${false}`,
  });

  const removeRegion = usePostData<number>(`/users/regions`, {
    createUrl: (regionId) => `/users/regions?regionId=${regionId}&delete=${true}`,
  });

  const setRegion = usePostData<{
    region: components['schemas']['UserRegion'];
    del: boolean;
  }>(`/users/regions`, {
    createUrl: ({ region: { id }, del }) => `/users/regions?regionId=${id}&delete=${del}`,
    fetchOptions: {
      // Followed regions decide what every personalized query returns (areas, problems,
      // dangerous, activity, frontpage, profile …), so sweep the whole cache. The hand-picked
      // refetch list this replaces missed `/profiles`, which is why the checkbox only changed
      // after a page reload.
      consistencyAction: 'invalidate',
    },
    onMutate: ({ region, del }) => {
      // `setQueriesData` matches partially, so this still hits the cached profile query even
      // though `useKey` folds `isAuthenticated` and the active `language` into its key. An
      // exact `setQueryData` key without those never matched, making the patch a silent no-op.
      client.setQueriesData<components['schemas']['Profile']>({ queryKey: [`/profiles`, { id: userId }] }, (old) => {
        if (old && typeof old === 'object') {
          const identity = old.identity;
          if (!identity) return old;
          const next = {
            ...old,
            identity: {
              ...identity,
              userRegions: identity.userRegions?.map((oldRegion) => {
                if (oldRegion.id !== region.id) {
                  return oldRegion;
                }
                return {
                  ...oldRegion,
                  enabled: !del,
                };
              }),
            },
          };
          return next;
        }
        return old;
      });
    },
    onError: () => {
      // Roll back the optimistic onMutate patch if the write fails.
      client.refetchQueries({
        queryKey: [`/profiles`, { id: userId }],
      });
    },
  });

  const setThemePreference = usePostData<string>(`/profiles/theme`, {
    createUrl: (themePreference) => `/profiles/theme?themePreference=${encodeURIComponent(themePreference)}`,
    fetchOptions: {
      consistencyAction: 'nop',
    },
    onMutate: (themePreference) => {
      // Partial match for the same reason as `setRegion` above: `useKey` adds `language` to
      // the cached profile query key, so an exact key would not match.
      client.setQueriesData<components['schemas']['Profile']>({ queryKey: [`/profiles`, { id: userId }] }, (old) => {
        if (old && typeof old === 'object') {
          const identity = old.identity;
          if (!identity) return old;
          return { ...old, identity: { ...identity, themePreference } };
        }
        return old;
      });
    },
    onError: () => {
      // Roll back the optimistic onMutate patch if the write fails.
      client.refetchQueries({
        queryKey: [`/profiles`, { id: userId }],
      });
    },
  });

  return {
    ...profile,
    addRegion: addRegion.mutateAsync,
    setProfile: setProfile.mutateAsync,
    removeRegion: removeRegion.mutateAsync,
    setRegion: setRegion.mutateAsync,
    setThemePreference: setThemePreference.mutateAsync,
  };
}

/**
 * Standalone mutation to set the user's theme preference on the backend.
 * Does not require fetching the profile first — can be used from ThemeSync and ThemeToggle
 * without triggering a `/profile` API call.
 */
export function useSetThemePreference() {
  return usePostData<string>(`/profiles/theme`, {
    createUrl: (themePreference) => `/profiles/theme?themePreference=${encodeURIComponent(themePreference)}`,
    fetchOptions: {
      consistencyAction: 'nop',
    },
  });
}

/**
 * Standalone mutation to set the user's language preference on the backend, mirroring
 * `useSetThemePreference`: it does not require fetching the profile first, so `LanguageSync` and
 * `LanguageSelect` can call it on their own.
 *
 * Only send languages the backend offers (`meta.languages`): an unknown code is answered with 400
 * rather than ignored.
 */
export function useSetLanguagePreference() {
  const client = useQueryClient();
  return usePostData<string>(`/profiles/language`, {
    createUrl: (languagePreference) =>
      `/profiles/language?languagePreference=${encodeURIComponent(languagePreference)}`,
    fetchOptions: {
      consistencyAction: 'nop',
    },
    onSuccess: (_data, languagePreference) => {
      // `/meta` reports the stored preference, and every locale variant of it is cached under its own key
      // (`useKey`). Switching language starts that variant's fetch while this write is still in flight, so its
      // response can predate the update and leave the cached `languagePreference` stale — which `LanguageSync`
      // would then re-apply as the user's choice. Partial match on purpose: an exact key never hits the entries
      // `useKey` shaped. Without a cached payload there is nothing to patch, and a failed write patches nothing.
      client.setQueriesData<{ languagePreference?: string }>({ queryKey: [`/meta`] }, (old) =>
        old && typeof old === 'object' ? { ...old, languagePreference } : old,
      );
    },
  });
}

export function useProfileAscents(id: number) {
  return useData<Success<'getProfilesAscents'>>(`/profiles/ascents?id=${id}`, {
    queryKey: [`/profiles/ascents`, { id }],
    enabled: id > 0,
  });
}

export function useProfileMedia({ userId, captured }: { userId: number; captured: boolean }) {
  return useData<Success<'getProfilesMedia'>>(`/profiles/media?id=${userId}&captured=${captured}`, {
    queryKey: [`/profiles/media`, { id: userId, captured }],
  });
}

export function useProfileTodo(id: number) {
  return useData<Success<'getProfilesTodo'>>(`/profiles/todo?id=${id}`, {
    queryKey: [`/profiles/todo`, { id }],
  });
}

export function useSector(id: number | undefined) {
  return useData<Success<'getSectors'> | undefined>(`/sectors?id=${id}`, {
    enabled: !!id && id > 0,
    queryKey: [`/sectors`, { id }],
    select: selectEntityWithRedirect,
  });
}

export function useTicks(page: number) {
  return useData<{
    ticks: {
      problemId: number;
      date: string;
      areaName: string;
      areaLockedAdmin: boolean;
      areaLockedSuperadmin: boolean;
      sectorName: string;
      sectorLockedAdmin: boolean;
      sectorLockedSuperadmin: boolean;
      problemName: string;
      problemLockedAdmin: boolean;
      problemLockedSuperadmin: boolean;
      name: string;
      problemGrade: string;
    }[];
    currPage: number | string;
    numPages: number;
    activePage: number;
  }>(`/ticks?page=${page}`, {
    queryKey: [`/ticks`, { page }],
  });
}

export function useTodo({ idArea, idSector }: { idArea: number; idSector: number }) {
  return useData<Success<'getTodo'>>(`/todo?idArea=${idArea}&idSector=${idSector}`);
}

export function useTop({ idArea, idSector }: { idArea: number; idSector: number }) {
  return useData<Success<'getTop'>>(`/top?idArea=${idArea}&idSector=${idSector}`);
}

export function useSearch() {
  const { mutateAsync, data, ...rest } = usePostData<{ value: string }, components['schemas']['Search'][]>(`/search`, {
    select(response) {
      return response.json();
    },
    fetchOptions: {
      consistencyAction: 'nop',
    },
  });

  return { search: mutateAsync, ...rest, data: data ?? [] };
}

export function useTrash() {
  const { data } = useData<components['schemas']['Trash'][]>(`/trash`);

  const restore = usePostData<components['schemas']['Trash'], string>(`/trash`, {
    fetchOptions: {
      method: 'PUT',
      body: undefined,
      consistencyAction: 'invalidate',
    },
    createUrl: ({ idArea, idSector, idProblem, idMedia }) => {
      const params = new URLSearchParams();
      if (idMedia) {
        params.set('idMedia', String(idMedia));
      } else if (idProblem) {
        params.set('idProblem', String(idProblem));
      } else if (idSector) {
        params.set('idSector', String(idSector));
      } else if (idArea) {
        params.set('idArea', String(idArea));
      }
      return `/trash?${params.toString()}`;
    },
    select(_response, { idArea, idSector, idProblem, idMedia }) {
      let url = `/`;
      if (idArea) {
        url = `/area/${idArea}`;
      } else if (idSector) {
        url = `/sector/${idSector}`;
      } else if (idProblem) {
        url = `/problem/${idProblem}`;
      }
      if (idMedia) {
        url += `?idMedia=${idMedia}`;
      }
      return url;
    },
  });

  return {
    data,
    restore: restore.mutateAsync,
  };
}

export function useElevation() {
  const [{ lat, lng }, setLocation] = useState<{
    lat?: number;
    lng?: number;
  }>({});

  const result = useData(`/elevation?latitude=${lat}&longitude=${lng}`, {
    queryKey: [`/elevation`, { lat, lng }],
    enabled: !!lat && !!lng,
    placeholderData: true,
    // We're unlikely to have very many duplicate requests, so set a relatively
    // short cache time to keep them from polluting the in-memory cache.
    gcTime: 30 * 1000,
  });

  const lastCalledTime = useRef(0);
  const pendingTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const throttledSetLocation = useCallback<typeof setLocation>((v) => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
    }

    const elapsed = Date.now() - lastCalledTime.current;
    if (elapsed >= 200) {
      setLocation(v);
      lastCalledTime.current = Date.now();
    } else {
      pendingTimer.current = setTimeout(() => setLocation(v), 200);
    }
  }, []);

  const elevation = [
    lat && lng && ` - ${lat.toFixed(10)},${lng.toFixed(10)}`,
    result.fetchStatus === 'fetching' ? '...' : result.data ? `(${result.data}m)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    elevation,
    setLocation: throttledSetLocation,
  };
}

export function useGradeDistribution(
  idArea: number,
  idSector: number,
  data: components['schemas']['GradeDistribution'][] | undefined,
) {
  return useData<Success<'getGradeDistribution'>>(`/grade/distribution?idArea=${idArea}&idSector=${idSector}`, {
    queryKey: [`/grade/distribution`, { idArea, idSector }],
    enabled: !!idArea || !!idSector,
    initialData: data,
  });
}

export function useUserSearch(value: string) {
  return useData<Success<'getUsersSearch'>>(`/users/search?value=${value}`, {
    queryKey: [`/users/search`, { value }],
    enabled: !!value,
  });
}

export function useProblemSearch(value: string) {
  return useData<Success<'getProblemsSearch'>>(`/problems/search?value=${value}`, {
    queryKey: [`/problems/search`, { value }],
    enabled: !!value,
  });
}

export function usePermissions() {
  const { isAuthenticated } = useAuth0();
  const accessToken = useAccessToken();
  const client = useQueryClient();

  const result = useData<Success<'getPermissions'>>(`/permissions`, {
    queryKey: [`/permissions`],
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const updatePermissions = useCallback(
    (...args: WithoutFirstParameter<typeof postPermissions>): ReturnType<typeof postPermissions> =>
      (postPermissions(accessToken, ...args) as Promise<Response>).then((res) => {
        if (res.ok) {
          void client.invalidateQueries({ queryKey: [`/permissions`] });
        }
        return res as Awaited<ReturnType<typeof postPermissions>>;
      }),
    [accessToken, client],
  );

  return {
    ...result,
    update: updatePermissions,
  };
}

export function useUsers() {
  const { isAuthenticated } = useAuth0();
  const accessToken = useAccessToken();
  const client = useQueryClient();

  const result = useData<Success<'getUsers'>>(`/users`, {
    queryKey: [`/users`],
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const mergeDismissals = useData<Success<'getMergeDismissals'>>(`/users/merge-dismissals`, {
    queryKey: [`/users/merge-dismissals`],
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const merge = useCallback(
    (keepUserId: number, deleteUserId: number): Promise<void> =>
      postMergeUsers(accessToken, keepUserId, deleteUserId).then(() => {
        void client.invalidateQueries({ queryKey: [`/users`] });
        void client.invalidateQueries({ queryKey: [`/users/merge-dismissals`] });
      }),
    [accessToken, client],
  );

  const rename = useCallback(
    (userId: number, firstname: string, lastname: string): Promise<void> =>
      postUserRename(accessToken, userId, firstname, lastname).then(() => {
        void client.invalidateQueries({ queryKey: [`/users`] });
      }),
    [accessToken, client],
  );

  /** Mark a pair as "not merge candidates" so it stops showing up in the merge suggestions. */
  const dismiss = useCallback(
    (userId1: number, userId2: number): Promise<void> =>
      postMergeDismissal(accessToken, userId1, userId2).then(() => {
        void client.invalidateQueries({ queryKey: [`/users/merge-dismissals`] });
        void client.invalidateQueries({ queryKey: [`/users`] });
      }),
    [accessToken, client],
  );

  /** Undo {@link dismiss} so the pair is suggested for merging again. */
  const restore = useCallback(
    (userId1: number, userId2: number): Promise<void> =>
      deleteMergeDismissal(accessToken, userId1, userId2).then(() => {
        void client.invalidateQueries({ queryKey: [`/users/merge-dismissals`] });
        void client.invalidateQueries({ queryKey: [`/users`] });
      }),
    [accessToken, client],
  );

  return {
    ...result,
    merge,
    rename,
    mergeDismissals,
    dismiss,
    restore,
  };
}

export type EditableSvg = {
  svgId: number;
  problemId: number;
  pitch: number;
  mediaId: number;
  mediaWidth: number;
  mediaHeight: number;
  mediaRegion?: MediaRegion;
  sections: components['schemas']['ProblemSection'][];
  versionStamp: number;
  anchors: { x: number; y: number }[];
  hasAnchor: boolean;
  nr: number;
  path: string;
  texts: { x: number; y: number; txt: string }[];
  tradBelayStations: { x: number; y: number }[];
  readOnlySvgs: SvgType[];
};

export function useSvgEdit(problemId: number, pitch: number, mediaId: number, mediaRegion: MediaRegion | null) {
  const { data } = useProblem(problemId, true);

  if (!data) {
    return undefined;
  }

  const m = data.media?.find((x) => mediaIdentityId(x.identity) == mediaId);
  if (!m) {
    return undefined;
  }

  if (!m.svgs) {
    return {
      svgId: 0,
      problemId,
      pitch,
      mediaId,
      mediaWidth: m.width ?? 0,
      mediaHeight: m.height ?? 0,
      mediaRegion,
      versionStamp: mediaIdentityVersionStamp(m.identity),
      sections: data.sections ?? [],
      anchors: [],
      hasAnchor: true,
      nr: 0,
      path: '',
      texts: [],
      tradBelayStations: [],
      readOnlySvgs: [],
    };
  }

  const svg = m.svgs.filter((x) => x.problemId == data.id && x.pitch == pitch)[0];
  let mediaRegionLocal: MediaRegion | null = mediaRegion;
  if (pitch && !mediaRegionLocal) {
    if (svg && svg.path) {
      mediaRegionLocal = calculateMediaRegion(svg.path, m.width ?? 0, m.height ?? 0);
    } else {
      const prevPitchSvg = m.svgs.filter((x) => x.problemId == data.id && x.pitch == pitch - 1)[0];
      if (prevPitchSvg && prevPitchSvg.path) {
        mediaRegionLocal = calculateMediaRegion(prevPitchSvg.path, m.width ?? 0, m.height ?? 0);
        if (mediaRegionLocal) {
          mediaRegionLocal.y = Math.max(0, mediaRegionLocal.y - Math.round(mediaRegionLocal.height / 2));
        }
      }
    }
  }

  const svgId = svg?.id ?? 0;
  const svgNr = svg?.nr ?? 0;
  const hasAnchor = svg?.hasAnchor ?? pitch === 0;
  const path = (svg?.path && mediaRegionLocal ? scalePath(svg.path, mediaRegionLocal) : svg?.path) ?? '';
  const anchors: { x: number; y: number }[] = [];
  if (svg?.anchors) {
    try {
      const scaled = scaleCoordsJson(svg.anchors, mediaRegionLocal);
      const parsed = JSON.parse(scaled);
      anchors.push(...parsed);
    } catch (ex) {
      captureSentryException(ex, { anchors: svg.anchors, problemId, mediaId, svgId: svg.id });
    }
  }
  const tradBelayStations: { x: number; y: number }[] = [];
  if (svg?.tradBelayStations) {
    try {
      const scaled = scaleCoordsJson(svg.tradBelayStations, mediaRegionLocal);
      const parsed = JSON.parse(scaled);
      tradBelayStations.push(...parsed);
    } catch (ex) {
      captureSentryException(ex, { tradBelayStations: svg.tradBelayStations, problemId, mediaId, svgId: svg.id });
    }
  }
  const texts: { txt: string; x: number; y: number }[] = [];
  if (svg?.texts) {
    try {
      const scaled = scaleCoordsJson(svg.texts, mediaRegionLocal);
      const parsed = JSON.parse(scaled);
      texts.push(...parsed);
    } catch (ex) {
      captureSentryException(ex, { texts: svg.texts, problemId, mediaId, svgId: svg.id });
    }
  }

  const readOnlySvgs: EditableSvg['readOnlySvgs'] = [];
  for (const s of m.svgs.filter(
    (x) => !mediaRegionLocal || isPathVisible(x.path ?? '', mediaRegionLocal as MediaRegion),
  )) {
    if (!svg || s !== svg) {
      readOnlySvgs.push({
        nr: s.nr ?? 0,
        pitch: s.pitch ?? 0,
        hasAnchor: !!s.hasAnchor,
        path: (s.path && mediaRegionLocal ? scalePath(s.path, mediaRegionLocal) : s.path) ?? '',
        anchors: s.anchors ? JSON.parse(scaleCoordsJson(s.anchors, mediaRegionLocal)) : [],
        t: 'other',
      });
    }
  }

  // Include the media's own "Draw on image" SVGs (descent path + rappel markers) as
  // read-only overlays so they stay visible while drawing a topo line. Media SVGs are
  // stored in full-image coordinates, so scale them to the cropped media region like
  // the other read-only SVGs above.
  for (const ms of m.mediaSvgs ?? []) {
    if (!ms.t) continue;
    if (ms.t === 'PATH') {
      readOnlySvgs.push({
        t: 'PATH',
        path: (ms.path && mediaRegionLocal ? scalePath(ms.path, mediaRegionLocal) : ms.path) ?? '',
        anchors: [],
        nr: 0,
        pitch: 0,
        hasAnchor: false,
      });
    } else {
      readOnlySvgs.push({
        t: ms.t,
        path: '',
        anchors: [],
        nr: 0,
        pitch: 0,
        hasAnchor: false,
        rappelX: (ms.rappelX ?? 0) - (mediaRegionLocal?.x ?? 0),
        rappelY: (ms.rappelY ?? 0) - (mediaRegionLocal?.y ?? 0),
      });
    }
  }

  return {
    svgId,
    problemId,
    pitch,
    mediaId: mediaIdentityId(m.identity),
    mediaWidth: m.width ?? 0,
    mediaHeight: m.height ?? 0,
    mediaRegion: mediaRegionLocal,
    sections: data.sections ?? [],
    nr: svgNr,
    versionStamp: mediaIdentityVersionStamp(m.identity),
    path: path ?? '',
    anchors,
    tradBelayStations,
    texts,
    readOnlySvgs,
    hasAnchor,
  };
}
