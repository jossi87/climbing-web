import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { DATA_MUTATION_EVENT } from "../components/DataReloader";
import { FetchOptions } from "./types";
import fetch from "isomorphic-fetch";

export function getLocales() {
  return "nb-NO";
}

export function getBaseUrl(): string {
  if (process.env.REACT_APP_ENV === "development") {
    return process.env.REACT_APP_API_URL ?? "https://brattelinjer.no";
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

export function getImageUrl(
  id: number,
  checksum: number,
  minDimension?: number,
): string {
  const crc32 = checksum || 0;
  if (minDimension) {
    return getUrl(
      `/images?id=${id}&crc32=${crc32}&minDimention=${minDimension}`,
    );
  }
  return getUrl(`/images?id=${id}&crc32=${crc32}`);
}

export function getBuldreinfoMediaUrlSupported(id: number): string {
  const video = document.createElement("video");
  const webm = video.canPlayType("video/webm");
  return getBuldreinfoMediaUrl(id, webm ? "webm" : "mp4");
}

export function getBuldreinfoMediaUrl(id: number, suffix: string): string {
  if (suffix === "jpg") {
    return (
      getBaseUrl() +
      "/buldreinfo_media/original/jpg/" +
      Math.floor(id / 100) * 100 +
      "/" +
      id +
      ".jpg"
    );
  } else if (suffix === "webm") {
    return (
      getBaseUrl() +
      "/buldreinfo_media/webm/" +
      Math.floor(id / 100) * 100 +
      "/" +
      id +
      ".webm"
    );
  } else if (suffix === "mp4") {
    return (
      getBaseUrl() +
      "/buldreinfo_media/mp4/" +
      Math.floor(id / 100) * 100 +
      "/" +
      id +
      ".mp4"
    );
  }
  return (
    getBaseUrl() +
    "/buldreinfo_media/webp/" +
    Math.floor(id / 100) * 100 +
    "/" +
    id +
    ".webp"
  );
}

export function getAreaPdfUrl(accessToken: string | null, id: number): string {
  return getUrl(`/areas/pdf?accessToken=${accessToken}&id=${id}`);
}

export function getSectorPdfUrl(
  accessToken: string | null,
  id: number,
): string {
  return getUrl(`/sectors/pdf?accessToken=${accessToken}&id=${id}`);
}

export function getProblemPdfUrl(
  accessToken: string | null,
  id: number,
): string {
  return getUrl(`/problem/pdf?accessToken=${accessToken}&id=${id}`);
}

export function numberWithCommas(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function convertFromDateToString(date: Date): string | null {
  if (!date) {
    return null;
  }
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
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

export function makeAuthenticatedRequest(
  accessToken: string | null,
  urlSuffix: string,
  extraOptions?: FetchOptions,
) {
  const { consistencyAction, ...opts } = extraOptions || {};
  const options = {
    ...opts,
    mode: "cors" as const,
    headers: {
      ...opts?.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  };
  return fetch(getUrl(urlSuffix), options).then((res) => {
    if ((options.method ?? "GET") !== "GET") {
      window.dispatchEvent(
        new CustomEvent(DATA_MUTATION_EVENT, {
          detail: { mode: consistencyAction ?? "refetch" },
        }),
      );
    }
    return res;
  });
}
