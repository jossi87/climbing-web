import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { DATA_MUTATION_EVENT } from '../components/DataReloader';
import type { FetchOptions } from './types';
import { captureMessage } from '@sentry/react';
import { saveAs } from 'file-saver';
import type { MediaRegion } from '../utils/svg-scaler';

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

export function getMediaFileUrlSrcSet(
  id: number,
  versionStamp: number,
  originalWidth: number,
): string {
  const SIZES = [480, 800, 1280, 1920, 2560, 3840, 5120];
  const finalSizes = Array.from(
    new Set([...SIZES.filter((s) => s <= originalWidth), originalWidth]),
  ).sort((a, b) => a - b);

  return finalSizes
    .map((size) => `${getMediaFileUrl(id, versionStamp, false, { targetWidth: size })} ${size}w`)
    .join(',\n');
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

export function makeAuthenticatedRequest(
  accessToken: string | null,
  incomingUrl: string,
  extraOptions?: FetchOptions,
) {
  const url = ABSOLUTE_PATTERN.test(incomingUrl)
    ? // If we already have an absolute URL (eg: https://...), then we don't
      // need to do anything.
      incomingUrl
    : // Otherwise, append the link to the correct backend instance.
      getUrl(incomingUrl);

  const { consistencyAction, ...opts } = extraOptions || {};
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
          detail: { mode: consistencyAction ?? 'refetch' },
        }),
      );
    }
    return res;
  });
}

export function downloadFile(accessToken: string | null, url: string) {
  return makeAuthenticatedRequest(accessToken, url, {
    // RequestInit doesn't include 'expose' in standard types, but it's a valid fetch option
  } as RequestInit & { expose?: string[] }).then((response) => {
    const contentDisposition = response.headers.get('content-disposition');
    if (!contentDisposition) {
      captureMessage('No content-disposition header', {
        extra: {
          url,
          contentDisposition,
        },
      });
      return;
    }

    const match = /\bfilename="([^"]+)"/.exec(contentDisposition);
    if (!match) {
      captureMessage('Unable to get filename', {
        extra: {
          url,
          contentDisposition,
        },
      });
      return;
    }

    const [_, filename] = match;
    if (!filename) {
      captureMessage('No filename', {
        extra: {
          url,
          contentDisposition,
        },
      });
      return;
    }

    return response.blob().then((blob) => saveAs(blob, filename));
  });
}
