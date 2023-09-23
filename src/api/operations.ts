import { Success } from "../@types/buldreinfo";
import { components, operations } from "../@types/buldreinfo/swagger";
import { makeAuthenticatedRequest } from "./utils";

export function getProblemsXlsx(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/problems/xlsx`, {
    // @ts-expect-error - I don't think that this is necessary, but I'm going
    //                    to investigate this later.
    expose: ["Content-Disposition"],
  }).catch((error) => {
    console.warn(error);
    return null;
  });
}

export function deleteMedia(
  accessToken: string | null,
  id: number,
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/media?id=${id}`, {
    method: "DELETE",
  });
}

export function moveMedia(
  accessToken: string | null,
  id: number,
  left: boolean,
  toIdSector: number,
  toIdProblem: number,
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media?id=${id}&left=${left}&toIdSector=${toIdSector}&toIdProblem=${toIdProblem}`,
    {
      method: "PUT",
    },
  );
}

export function getElevation(
  accessToken: string | null,
  latitude: number,
  longitude: number,
): Promise<Success<"getElevation">> {
  return makeAuthenticatedRequest(
    accessToken,
    `/elevation?latitude=${latitude}&longitude=${longitude}`,
    null,
  )
    .then((res) => res.text())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getGradeDistribution(
  accessToken: string | null,
  idArea: number,
  idSector: number,
): Promise<Success<"getGradeDistribution">> {
  return makeAuthenticatedRequest(
    accessToken,
    `/grade/distribution?idArea=${idArea}&idSector=${idSector}`,
    null,
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getPermissions(
  accessToken: string | null,
): Promise<Success<"getPermissions">> {
  return makeAuthenticatedRequest(accessToken, `/permissions`)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getSvgEdit(
  accessToken: string | null,
  problemId: number,
  mediaId: number,
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/problem?id=${problemId}&showHiddenMedia=true`,
    null,
  )
    .then((data) => data.json())
    .then((res) => {
      const m = res.media.filter((x) => x.id == mediaId)[0];
      const readOnlySvgs: {
        nr: number;
        hasAnchor: boolean;
        path: string;
        anchors: unknown[];
        texts: string[];
      }[] = [];
      let svgId = 0;
      let hasAnchor = true;
      let path = null;
      let anchors = [];
      let texts = [];
      if (m.svgs) {
        for (const svg of m.svgs) {
          if (svg.problemId === res.id) {
            svgId = svg.id;
            path = svg.path;
            hasAnchor = svg.hasAnchor;
            anchors = svg.anchors ? JSON.parse(svg.anchors) : [];
            texts = svg.texts ? JSON.parse(svg.texts) : [];
          } else {
            readOnlySvgs.push({
              nr: svg.nr,
              hasAnchor: svg.hasAnchor,
              path: svg.path,
              anchors: svg.anchors ? JSON.parse(svg.anchors) : [],
              texts: svg.texts ? JSON.parse(svg.texts) : [],
            });
          }
        }
      }
      return {
        mediaId: m.id,
        nr: res.nr,
        w: m.width,
        h: m.height,
        shift: false,
        svgId: svgId,
        path: path,
        anchors: anchors,
        texts: texts,
        readOnlySvgs: readOnlySvgs,
        activePoint: 0,
        draggedPoint: false,
        draggedCubic: false,
        hasAnchor: hasAnchor,
        areaId: res.areaId,
        areaName: res.areaName,
        areaLockedAdmin: res.areaLockedAdmin,
        areaLockedSuperadmin: res.areaLockedSuperadmin,
        sectorId: res.sectorId,
        sectorName: res.sectorName,
        sectorLockedAdmin: res.sectorLockedAdmin,
        sectorLockedSuperadmin: res.sectorLockedSuperadmin,
        id: res.id,
        name: res.name,
        grade: res.grade,
        lockedAdmin: res.lockedAdmin,
        lockedSuperadmin: res.lockedSuperadmin,
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getUserSearch(
  accessToken: string | null,
  value: string,
): Promise<components["schemas"]["UserSearch"][]> {
  return makeAuthenticatedRequest(
    accessToken,
    `/users/search?value=${value}`,
    null,
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getUsersTicks(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/users/ticks`, {
    // @ts-expect-error - I don't think that this is necessary, but I'm going
    //                    to investigate this later.
    expose: ["Content-Disposition"],
  }).catch((error) => {
    console.warn(error);
    return null;
  });
}

export function postComment(
  accessToken: string | null,
  id: number,
  idProblem: number,
  comment: string | null,
  danger: boolean,
  resolved: boolean,
  del: boolean,
  media: any,
): Promise<
  operations["postComments"]["responses"]["default"]["content"]["application/json; charset=utf-8"]
> {
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, "_"),
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
    "json",
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
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file),
  );

  return makeAuthenticatedRequest(accessToken, `/comments`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
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
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/permissions`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      adminRead,
      adminWrite,
      superadminRead,
      superadminWrite,
    }),
    headers: {
      "Content-Type": "application/json",
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
  fa: any,
  faDate: string,
  nr: number,
  t: any,
  coordinates: components["schemas"]["Coordinates"],
  sections: any,
  media: any,
  faAid: any,
  trivia: string,
  startingAltitude: string,
  aspect: string,
  routeLength: string,
  descent: string,
): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, "_"),
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
    "json",
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
      startingAltitude,
      aspect,
      routeLength,
      descent,
    }),
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file),
  );
  return makeAuthenticatedRequest(accessToken, `/problems`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
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
  media: any,
): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, "_"),
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
  formData.append("json", JSON.stringify({ id, newMedia }));
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file),
  );
  return makeAuthenticatedRequest(accessToken, `/problems/media`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
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
  mediaId: number,
  del: boolean,
  id: number,
  path: string,
  hasAnchor: boolean,
  anchors: string,
  texts: string,
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/problems/svg?problemId=${problemId}&mediaId=${mediaId}`,
    {
      method: "POST",
      body: JSON.stringify({
        delete: del,
        id,
        path,
        hasAnchor,
        anchors,
        texts,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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
  parking: components["schemas"]["Coordinates"],
  outline: components["schemas"]["Coordinates"][],
  wallDirectionManual: components["schemas"]["CompassDirection"],
  approach: components["schemas"]["Approach"],
  media: any,
  problemOrder: any,
): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map((m) => {
    return {
      name: m.file && m.file.name.replace(/[^-a-z0-9.]/gi, "_"),
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
    "json",
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
      parking,
      wallDirectionManual,
      outline,
      approach,
      newMedia,
      problemOrder,
    }),
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file),
  );
  return makeAuthenticatedRequest(accessToken, `/sectors`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
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
  date: string,
  stars: number,
  grade: string,
  repeats: any,
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/ticks`, {
    method: "POST",
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
      "Content-Type": "application/json",
    },
  });
}

export function postUserRegion(
  accessToken: string | null,
  regionId: number,
  del: boolean,
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/user/regions?regionId=${regionId}&delete=${del}`,
    {
      method: "POST",
    },
  );
}

export function putMediaInfo(
  accessToken: string | null,
  mediaId: number,
  description: string,
  pitch: number,
  trivia: boolean,
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/media/info`, {
    method: "PUT",
    body: JSON.stringify({ mediaId, description, pitch, trivia }),
    headers: {
      "Content-Type": "application/json",
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
      method: "PUT",
    },
  );
}
