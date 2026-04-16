import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { DATA_MUTATION_EVENT } from '../shared/providers/DataReloader';
import { ACTIVITY_AND_FRONTPAGE_INVALIDATION_EVENT } from './activityFeedInvalidation';
import type { FetchOptions } from './types';
import type { MediaRegion } from '../utils/svg-scaler';
import type { components } from '../@types/buldreinfo/swagger';

export type MediaIdentity = components['schemas']['MediaIdentity'];

export function mediaIdentityId(identity?: MediaIdentity | null): number {
  return identity?.id ?? 0;
}

export function mediaIdentityVersionStamp(identity?: MediaIdentity | null): number {
  return Number(identity?.versionStamp ?? 0);
}

function mediaFocusPercentPair(identity?: MediaIdentity | null): string | undefined {
  if (!identity) return undefined;
  const x = identity.focusX;
  const y = identity.focusY;
  if (x == null && y == null) return undefined;
  /** API uses `0,0` as "no focus" — same as omitting; real top-left would be e.g. `0` with a non-zero other axis. */
  if (x === 0 && y === 0) return undefined;
  return `${x ?? 50}% ${y ?? 50}%`;
}

/**
 * CSS `object-position` from API focus (percent 0–100). Omitted when neither axis is set (browser default center).
 * Use only where the image is **cropped** (`object-fit: cover`); not for letterboxed `object-contain` viewers (e.g. media modal).
 */
export function mediaObjectPositionStyle(identity?: MediaIdentity | null): { objectPosition: string } | undefined {
  const pair = mediaFocusPercentPair(identity);
  return pair ? { objectPosition: pair } : undefined;
}

/** Same percentages as {@link mediaObjectPositionStyle} for `background-size: cover` tiles using `background-image`. */
export function mediaBackgroundPositionStyle(
  identity?: MediaIdentity | null,
): { backgroundPosition: string } | undefined {
  const pair = mediaFocusPercentPair(identity);
  return pair ? { backgroundPosition: pair } : undefined;
}

export function getLocales() {
  return 'nb-NO';
}

export function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    return import.meta.env.REACT_APP_API_URL ?? 'https://brattelinjer.no';
  }
  return window.origin;
}

export function getUrl(urlSuffix: string): string {
  return encodeURI(`${getBaseUrl()}/com.buldreinfo.jersey.jaxb/v2${urlSuffix}`);
}

export function useAccessToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently().then((token) => setAccessToken(token));
    }
  }, [getAccessTokenSilently, isAuthenticated]);
  return accessToken;
}

export function getMediaFileUrl(
  id: number,
  versionStamp: number,
  isMovie: boolean,
  options?: {
    original?: boolean;
    mediaRegion?: MediaRegion;
    targetWidth?: number;
    minDimension?: number;
  },
): string {
  let url = `/media/file?id=${id}&isMovie=${isMovie}&versionStamp=${versionStamp}`;
  if (options?.original) {
    url += '&original=true';
  } else if (options?.mediaRegion) {
    const r = options.mediaRegion;
    url += `&x=${r.x}&y=${r.y}&width=${r.width}&height=${r.height}`;
  } else if (options?.targetWidth) {
    url += `&targetWidth=${options.targetWidth}`;
  } else if (options?.minDimension) {
    url += `&minDimension=${options.minDimension}`;
  }
  return getUrl(url);
}

/** `originalWidth` caps which `targetWidth` steps appear — only widths ≤ this value are listed (plus `originalWidth`). */
export function getMediaFileUrlSrcSet(id: number, versionStamp: number, originalWidth: number): string {
  const SIZES = [300, 400, 480, 600, 800, 1280, 1920, 2560, 3840, 5120];
  const finalSizes = Array.from(new Set([...SIZES.filter((s) => s <= originalWidth), originalWidth])).sort(
    (a, b) => a - b,
  );

  return finalSizes
    .map((size) => `${getMediaFileUrl(id, versionStamp, false, { targetWidth: size })} ${size}w`)
    .join(',\n');
}

/**
 * Return a stable minDimension based on coarse DPR tiers.
 * This avoids generating many near-identical on-demand variants (e.g. 116/117/118/119...).
 */
export function getTieredMinDimension(baseCssPx: number): number {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const dprTier = dpr >= 1.5 ? 2 : 1;
  return Math.round(baseCssPx * dprTier);
}

export function numberWithCommas(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function convertFromDateToString(date: Date | null): string | undefined {
  if (!date || isNaN(date.getTime())) {
    return undefined;
  }
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

export function convertFromStringToDate(yyyy_MM_dd: string): Date | null {
  if (!yyyy_MM_dd) {
    return null;
  }
  const year = parseInt(yyyy_MM_dd.substring(0, 4));
  const month = parseInt(yyyy_MM_dd.substring(5, 7));
  const day = parseInt(yyyy_MM_dd.substring(8, 10));
  return new Date(year, month - 1, day);
}

const ABSOLUTE_PATTERN = /^https?:\/\//;

export function makeAuthenticatedRequest(accessToken: string | null, incomingUrl: string, extraOptions?: FetchOptions) {
  const url = ABSOLUTE_PATTERN.test(incomingUrl)
    ? // If we already have an absolute URL (eg: https://...), then we don't
      // need to do anything.
      incomingUrl
    : // Otherwise, append the link to the correct backend instance.
      getUrl(incomingUrl);

  const { consistencyAction, invalidateActivityFeed, ...opts } = extraOptions || {};
  const baseHeaders = (opts?.headers as Record<string, string> | undefined) ?? {};
  const headers: Record<string, string> = {
    ...baseHeaders,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const options: RequestInit = {
    ...opts,
    mode: 'cors',
    headers,
  };

  return fetch(url, options).then((res) => {
    if ((options.method ?? 'GET') !== 'GET') {
      window.dispatchEvent(
        new CustomEvent(DATA_MUTATION_EVENT, {
          /** Default `nop`: global refetch was refetching every query and flooding errors/network. Opt in with `consistencyAction: 'refetch'`. */
          detail: { mode: consistencyAction ?? 'nop' },
        }),
      );
      if (res.ok && invalidateActivityFeed) {
        window.dispatchEvent(new CustomEvent(ACTIVITY_AND_FRONTPAGE_INVALIDATION_EVENT));
      }
    }
    return res;
  });
}

export function downloadFileWithProgress(
  accessToken: string | null,
  fullUrl: string,
  onProgress?: (percent: number | null) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const separator = fullUrl.includes('?') ? '&' : '?';
    const authenticatedUrl = `${fullUrl}${separator}access_token=${accessToken}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', authenticatedUrl, true);
    xhr.responseType = 'blob';
    xhr.onprogress = (event) => {
      if (onProgress) {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        } else {
          onProgress(null);
        }
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const disposition = xhr.getResponseHeader('Content-Disposition');
        let filename = '';

        if (disposition && disposition.includes('filename')) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        if (!filename) {
          const parts = fullUrl.split('/');
          filename = parts[parts.length - 1].split('?')[0] || 'download';
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        resolve();
      } else {
        reject(new Error(`Server error: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}
