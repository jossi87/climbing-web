import { Success } from '../@types/buldreinfo';
import { components, operations } from '../@types/buldreinfo/swagger';

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
import { downloadFile, makeAuthenticatedRequest } from './utils';

export function downloadTocXlsx(accessToken: string | null) {
  return downloadFile(accessToken, '/toc/xlsx');
}

export function deleteMedia(
  accessToken: string | null,
  id: number,
): Promise<Success<'deleteMedia'>> {
  return makeAuthenticatedRequest(accessToken, `/media?id=${id}`, {
    method: 'DELETE',
  });
}

export function moveMedia(
  accessToken: string | null,
  id: number,
  left: boolean,
  toIdArea: number,
  toIdSector: number,
  toIdProblem: number,
): Promise<Success<'putMedia'>> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media?id=${id}&left=${left}&toIdArea=${toIdArea}&toIdSector=${toIdSector}&toIdProblem=${toIdProblem}`,
    {
      method: 'PUT',
    },
  );
}

export function setMediaAsAvatar(
  accessToken: string | null,
  id: number,
): Promise<Success<'putMediaAvatar'>> {
  return makeAuthenticatedRequest(accessToken, `/media/avatar?id=${id}`, {
    method: 'PUT',
  });
}

export function downloadUsersTicks(accessToken: string | null) {
  return downloadFile(accessToken, `/users/ticks`);
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
): Promise<operations['postComments']['responses']['default']['content']['application/json']> {
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
  media.forEach(
    (m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file),
  );

  return makeAuthenticatedRequest(accessToken, `/comments`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });
}

export function postPermissions(
  accessToken: string | null,
  userId: number,
  adminRead: boolean,
  adminWrite: boolean,
  superadminRead: boolean,
  superadminWrite: boolean,
): Promise<Success<'postPermissions'>> {
  return makeAuthenticatedRequest(accessToken, `/permissions`, {
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
  });
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
  media.forEach(
    (m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file),
  );
  return makeAuthenticatedRequest(accessToken, `/problems`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  })
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      alert(error);
    });
}

export function postProblemMedia(
  accessToken: string | null,
  id: number,
  media: UploadMedia[],
): Promise<Success<'postProblemsMedia'>> {
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
  media.forEach(
    (m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file),
  );
  return makeAuthenticatedRequest(accessToken, `/problems/media`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  })
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      alert(error);
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
  return makeAuthenticatedRequest(
    accessToken,
    `/problems/svg?problemId=${problemId}&pitch=${pitch}&mediaId=${mediaId}`,
    {
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
    },
  );
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
  media.forEach(
    (m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file),
  );
  return makeAuthenticatedRequest(accessToken, `/sectors`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  })
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      alert(error);
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
  return makeAuthenticatedRequest(accessToken, `/ticks`, {
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
  });
}

export function postUserRegion(
  accessToken: string | null,
  regionId: number,
  del: boolean,
): Promise<Success<'postUserRegions'>> {
  return makeAuthenticatedRequest(accessToken, `/user/regions?regionId=${regionId}&delete=${del}`, {
    method: 'POST',
  });
}

export function putMediaInfo(
  accessToken: string | null,
  mediaId: number,
  description: string,
  pitch: number,
  trivia: boolean,
): Promise<Success<'putMediaInfo'>> {
  return makeAuthenticatedRequest(accessToken, `/media/info`, {
    method: 'PUT',
    body: JSON.stringify({ mediaId, description, pitch, trivia }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function putMediaJpegRotate(
  accessToken: string | null,
  idMedia: number,
  degrees: number,
): Promise<unknown> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media/jpeg/rotate?idMedia=${idMedia}&degrees=${degrees}`,
    {
      method: 'PUT',
    },
  );
}
