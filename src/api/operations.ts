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
};
import { downloadFileWithProgress, getUrl, makeAuthenticatedRequest } from './utils';

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
  return downloadFileWithProgress(accessToken, '/toc/xlsx');
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
): Promise<Success<'putMedia'>> {
  const url = `/media?id=${id}&left=${left}&toIdArea=${toIdArea}&toIdSector=${toIdSector}&toIdProblem=${toIdProblem}`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'PUT',
    ...invalidateQueriesAfter,
  }).then((response) => ensureOkResponse(response, url));
}

export function setMediaAsAvatar(accessToken: string | null, id: number): Promise<Success<'putMediaAvatar'>> {
  const url = `/media/avatar?id=${id}`;
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
  media: UploadMedia[],
): Promise<Response> {
  const url = `/comments`;
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, '_'),
      photographer: m.photographer,
      inPhoto: m.inPhoto,
      pitch: m.pitch,
      trivia: m.trivia,
      description: m.description,
      embedVideoUrl: m.embedVideoUrl,
      embedThumbnailUrl: m.embedThumbnailUrl,
      embedMilliseconds: m.embedMilliseconds,
    };
  });
  formData.append(
    'json',
    JSON.stringify({
      id,
      idProblem,
      comment,
      danger,
      resolved,
      delete: del,
      newMedia,
    }),
  );
  media.forEach((m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file));

  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    invalidateActivityFeed: true,
  }).then((response) => ensureOkResponse(response, url));
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
  routeLength: string,
  descent: string,
): Promise<Success<'postProblems'>> {
  const url = `/problems`;
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, '_'),
      photographer: m.photographer,
      inPhoto: m.inPhoto,
      pitch: m.pitch,
      trivia: m.trivia,
      description: m.description,
      embedVideoUrl: m.embedVideoUrl,
      embedThumbnailUrl: m.embedThumbnailUrl,
      embedMilliseconds: m.embedMilliseconds,
    };
  });
  formData.append(
    'json',
    JSON.stringify({
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
      routeLength,
      descent,
    }),
  );
  media.forEach((m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file));
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: formData,
    headers: {
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

export function postProblemMedia(
  accessToken: string | null,
  id: number,
  media: UploadMedia[],
): Promise<Success<'postProblemsMedia'>> {
  const url = `/problems/media`;
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, '_'),
      photographer: m.photographer,
      inPhoto: m.inPhoto,
      pitch: m.pitch,
      trivia: m.trivia,
      description: m.description,
      embedVideoUrl: m.embedVideoUrl,
      embedThumbnailUrl: m.embedThumbnailUrl,
      embedMilliseconds: m.embedMilliseconds,
    };
  });
  formData.append('json', JSON.stringify({ id, newMedia }));
  media.forEach((m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file));
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    ...invalidateQueriesAfter,
  })
    .then((response) => ensureOkJson(response, url, {} as Success<'postProblemsMedia'>))
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
  approach: components['schemas']['Slope'],
  descent: components['schemas']['Slope'],
  externalLinks: components['schemas']['ExternalLink'][],
  media: UploadMedia[],
  problemOrder: components['schemas']['SectorProblemOrder'][] | undefined,
): Promise<Success<'postSectors'>> {
  const url = `/sectors`;
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, '_'),
      photographer: m.photographer,
      inPhoto: m.inPhoto,
      description: m.description,
      trivia: m.trivia,
      embedVideoUrl: m.embedVideoUrl,
      embedThumbnailUrl: m.embedThumbnailUrl,
      embedMilliseconds: m.embedMilliseconds,
    };
  });
  formData.append(
    'json',
    JSON.stringify({
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
      wallDirectionManual,
      outline,
      approach,
      descent,
      externalLinks,
      newMedia,
      problemOrder,
    }),
  );
  media.forEach((m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file));
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
    consistencyAction: 'nop',
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

export function putMediaInfo(
  accessToken: string | null,
  mediaId: number,
  description: string,
  pitch: number,
  trivia: boolean,
): Promise<Success<'putMediaInfo'>> {
  const url = `/media/info`;
  return makeAuthenticatedRequest(accessToken, url, {
    method: 'PUT',
    body: JSON.stringify({ mediaId, description, pitch, trivia }),
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
