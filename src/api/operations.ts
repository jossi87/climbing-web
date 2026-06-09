import type { Success } from '../@types/buldreinfo';
import type { components } from '../@types/buldreinfo/swagger';
import { createHttpErrorFromResponse } from './httpError';

type UploadMedia = {
  file?: File | null;
  photographer?: string;
  inPhoto?: components['schemas']['User'][];
  pitch?: number;
  trivia?: boolean;
  description?: string;
  embedVideoUrl?: string;
  embedThumbnailUrl?: string;
  embedMilliseconds?: number;
  thumbnailSeconds?: number;
};
import { uploadFilenameForApi } from '../utils/uploadFilenameForApi';
import { downloadFileWithProgress, getUrl, makeAuthenticatedRequest } from './utils';

export type { UploadMedia };

/** Media writes change problem/area/sector payloads; opt into global invalidation (default mutation event is `nop`). */
const invalidateQueriesAfter = { consistencyAction: 'invalidate' as const };

async function ensureOkResponse(response: Response, url: string): Promise<Response> {
  if (response.ok) return response;
  throw await createHttpErrorFromResponse(response, url);
}

async function ensureOkJson<T>(response: Response, url: string, fallback: T): Promise<T> {
  await ensureOkResponse(response, url);
  return response.json().catch(() => fallback) as Promise<T>;
}

export function downloadTocXlsx(accessToken: string | null) {
  return downloadFileWithProgress(accessToken, getUrl('/toc/xlsx'));
}

export function deleteMedia(accessToken: string | null, id: number): Promise<Success<'deleteMedia'>> {
  const url = `/media?id=${id}`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'DELETE',
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}

export function moveMedia(
  accessToken: string | null,
  id: number,
  left: boolean,
  toIdArea: number,
  toIdSector: number,
  toIdProblem: number,
): Promise<Response> {
  const url = `/media/location?id=${id}&left=${left}&toIdArea=${toIdArea}&toIdSector=${toIdSector}&toIdProblem=${toIdProblem}`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'PUT',
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}

export function downloadUsersTicks(accessToken: string | null) {
  return downloadFileWithProgress(accessToken, getUrl(`/users/ticks`));
}

export function postComment(
  accessToken: string | null,
  id: number,
  idProblem: number,
  comment: string | null,
  danger: boolean,
  resolved: boolean,
  del: boolean,
): Promise<number> {
  const url = `/comments`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      id,
      idProblem,
      comment,
      danger,
      resolved,
      delete: del,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    invalidateActivityFeed: true,
  })
    .then((response) => ensureOkResponse(response, url))
    .then((response) => response.json() as Promise<number>);
}

export function postPermissions(
  accessToken: string | null,
  userId: number,
  adminRead: boolean,
  adminWrite: boolean,
  superadminRead: boolean,
  superadminWrite: boolean,
): Promise<Success<'postPermissions'>> {
  const url = `/permissions`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      userId,
      adminRead,
      adminWrite,
      superadminRead,
      superadminWrite,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => ensureOkResponse(response, url));
}

export function postProblem(
  accessToken: string | null,
  sectorId: number,
  id: number,
  broken: string,
  trash: boolean,
  lockedAdmin: boolean,
  lockedSuperadmin: boolean,
  name: string,
  rock: string,
  comment: string,
  originalGrade: string,
  fa: components['schemas']['User'][] | undefined,
  faDate: string,
  nr: number,
  t: components['schemas']['Type'] | undefined,
  coordinates: components['schemas']['Coordinates'],
  sections: components['schemas']['ProblemSection'][] | undefined,
  media: UploadMedia[],
  faAid: components['schemas']['FaAid'] | undefined,
  trivia: string,
  externalLinks: components['schemas']['ExternalLink'][],
  startingAltitude: string,
  aspect: string,
  lengthMeter: number,
  descent: string,
): Promise<Success<'postProblems'>> {
  const url = `/problems`;
  const newMedia = media.map((m) => {
    return {
      name: m.file && uploadFilenameForApi(m.file),
      photographer: m.photographer,
      inPhoto: m.inPhoto,
      pitch: m.pitch,
      trivia: m.trivia,
      description: m.description,
      embedVideoUrl: m.embedVideoUrl,
      embedThumbnailUrl: m.embedThumbnailUrl,
      embedMilliseconds: m.embedMilliseconds,
      thumbnailSeconds: m.thumbnailSeconds,
    };
  });
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      sectorId,
      id,
      broken,
      trash,
      lockedAdmin,
      lockedSuperadmin,
      name,
      rock,
      comment,
      originalGrade,
      fa,
      faDate,
      nr,
      t,
      coordinates,
      sections,
      newMedia,
      faAid,
      trivia,
      externalLinks,
      startingAltitude,
      aspect,
      lengthMeter,
      descent,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    /** Avoid refetching every cached query — that floods the network/console after save. */
    consistencyAction: 'nop',
    invalidateActivityFeed: true,
  })
    .then((response) => ensureOkJson(response, url, {} as Success<'postProblems'>))
    .catch((error) => {
      console.warn(error);
      throw error;
    });
}

export function postProblemSvg(
  accessToken: string | null,
  problemId: number,
  pitch: number,
  mediaId: number,
  del: boolean,
  id: number,
  path: string,
  hasAnchor: boolean,
  anchors: string,
  tradBelayStations: string,
  texts: string,
): Promise<Success<'postProblemsSvg'>> {
  const url = `/problems/svg?problemId=${problemId}&pitch=${pitch}&mediaId=${mediaId}`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      delete: del,
      id,
      path,
      hasAnchor,
      anchors,
      tradBelayStations,
      texts,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((response) => ensureOkResponse(response, url));
}

export function postSector(
  accessToken: string | null,
  areaId: number,
  id: number,
  trash: boolean,
  lockedAdmin: boolean,
  lockedSuperadmin: boolean,
  name: string,
  comment: string,
  accessInfo: string,
  accessClosed: string,
  sunFromHour: number,
  sunToHour: number,
  parking: components['schemas']['Coordinates'],
  outline: components['schemas']['Coordinates'][],
  wallDirectionManual: components['schemas']['CompassDirection'],
  trails: components['schemas']['Trail'][],
  externalLinks: components['schemas']['ExternalLink'][],
  media: UploadMedia[],
  problemOrder: components['schemas']['SectorProblemOrder'][] | undefined,
): Promise<Success<'postSectors'>> {
  const url = `/sectors`;
  const newMedia = media.map((m) => {
    return {
      name: m.file && uploadFilenameForApi(m.file),
      photographer: m.photographer,
      inPhoto: m.inPhoto,
      description: m.description,
      trivia: m.trivia,
      embedVideoUrl: m.embedVideoUrl,
      embedThumbnailUrl: m.embedThumbnailUrl,
      embedMilliseconds: m.embedMilliseconds,
      thumbnailSeconds: m.thumbnailSeconds,
    };
  });
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      areaId,
      id,
      trash,
      lockedAdmin,
      lockedSuperadmin,
      name,
      comment,
      accessInfo,
      accessClosed,
      sunFromHour,
      sunToHour,
      parking,
      outline,
      wallDirectionManual,
      trails,
      externalLinks,
      newMedia,
      problemOrder,
    }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...invalidateQueriesAfter,
    invalidateActivityFeed: true,
  })
    .then((response) => ensureOkJson(response, url, {} as Success<'postSectors'>))
    .catch((error) => {
      console.warn(error);
      throw error;
    });
}

export function postTicks(
  accessToken: string | null,
  del: boolean,
  id: number,
  idProblem: number,
  comment: string,
  date: string | undefined,
  stars: number,
  grade: string,
  repeats: components['schemas']['TickRepeat'][] | undefined,
): Promise<Success<'postTicks'>> {
  const url = `/ticks`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      delete: del,
      id,
      idProblem,
      comment,
      date,
      stars,
      grade,
      repeats,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    invalidateActivityFeed: true,
  }).then((response) => ensureOkResponse(response, url));
}

export function postTrails(accessToken: string | null, trails: components['schemas']['Trail'][]): Promise<Response> {
  const url = `/trails`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify(trails),
    headers: {
      'Content-Type': 'application/json',
    },
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}

export function postUserRegion(
  accessToken: string | null,
  regionId: number,
  del: boolean,
): Promise<Success<'postUserRegions'>> {
  const url = `/user/regions?regionId=${regionId}&delete=${del}`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
  }).then((response) => ensureOkResponse(response, url));
}

/**
 * Upload an image to POST /media/image (multipart form-data).
 * Max file size: 100 MB (enforced by backend).
 */
export function postMediaImage(
  accessToken: string | null,
  media: components['schemas']['Media'],
  file: File,
): Promise<components['schemas']['Media']> {
  const url = `/media/image`;
  const formData = new FormData();
  formData.append('json', JSON.stringify(media));
  formData.append('file', file);
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkJson(response, url, {} as components['schemas']['Media']));
}

/**
 * Initiate a video upload — returns a presigned S3 URL and a media id.
 * Max file size: 800 MB (enforced by backend).
 */
export function postMediaVideoInitiate(
  accessToken: string | null,
  media: components['schemas']['Media'],
  fileSize: number,
  contentType: string,
): Promise<components['schemas']['VideoInitResponse']> {
  const url = `/media/video/initiate`;
  const body: components['schemas']['VideoInitPayload'] = {
    media,
    fileSize,
    contentType,
  };
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((response) => ensureOkJson(response, url, {} as components['schemas']['VideoInitResponse']));
}

/**
 * Signal that a direct video upload to the presigned URL is complete.
 * Triggers async background processing on the server.
 */
export function postMediaVideoComplete(accessToken: string | null, id: number): Promise<Response> {
  const url = `/media/video/${id}/complete`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}

/**
 * Add an embedded external video (YouTube/Vimeo).
 * Sends a Media payload to POST /media/video/embed and returns the created Media.
 */
export function postMediaVideoEmbed(
  accessToken: string | null,
  media: components['schemas']['Media'],
): Promise<components['schemas']['Media']> {
  const url = `/media/video/embed`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: JSON.stringify(media),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkJson(response, url, {} as components['schemas']['Media']));
}

/**
 * Scrape Instagram URL metadata for frontend preview box.
 * Sends a URL to POST /media/instagram-scrape and returns a list of InstagramMedia items.
 */
export function postMediaInstagramScrape(
  accessToken: string | null,
  url: string,
): Promise<components['schemas']['InstagramMedia'][]> {
  const apiUrl = `/media/instagram-scrape?url=${url}`;
  return makeAuthenticatedRequest(accessToken, apiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => ensureOkJson(response, apiUrl, [] as components['schemas']['InstagramMedia'][]));
}

/**
 * Commit verified Instagram media to application storage.
 * Sends a Media payload to POST /media/instagram-save and returns the created Media.
 * Headers X-Selected-Cdn-Url, X-Selected-Is-Video and X-Selected-Media-Index are passed to avoid re-scraping.
 */
export function postMediaInstagramSave(
  accessToken: string | null,
  media: components['schemas']['Media'],
  selectedCdnUrl: string,
  selectedIsVideo: boolean,
  selectedMediaIndex: number,
): Promise<components['schemas']['Media']> {
  const apiUrl = `/media/instagram-save`;
  return makeAuthenticatedRequest(accessToken, apiUrl, {
    method: 'POST',
    body: JSON.stringify(media),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Selected-Cdn-Url': selectedCdnUrl,
      'X-Selected-Is-Video': String(selectedIsVideo),
      'X-Selected-Media-Index': String(selectedMediaIndex),
    },
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkJson(response, apiUrl, {} as components['schemas']['Media']));
}

/**
 * Upload a file to a presigned S3 URL with the required x-amz-acl: public-read header.
 */
export async function uploadToPresignedUrl(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-amz-acl', 'public-read');

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload to storage'));
    xhr.send(file);
  });
}

export function putMedia(accessToken: string | null, media: components['schemas']['Media']): Promise<Response> {
  const url = `/media`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'PUT',
    body: JSON.stringify(media),
    headers: {
      'Content-Type': 'application/json',
    },
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}

export function putMediaJpegRotate(accessToken: string | null, idMedia: number, degrees: number): Promise<unknown> {
  const url = `/media/jpeg/rotate?idMedia=${idMedia}&degrees=${degrees}`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'PUT',
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}
