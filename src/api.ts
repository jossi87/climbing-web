import { useAuth0 } from "@auth0/auth0-react";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import fetch from "isomorphic-fetch";
import { useState, useEffect } from "react";

export function getLocales() {
  return "nb-NO";
}

export function getBaseUrl(): string {
  if (process.env.REACT_APP_ENV === "development") {
    return process.env.REACT_APP_API_URL ?? "https://brattelinjer.no";
  }
  return window.origin;
}

function getUrl(urlSuffix: string): string {
  return encodeURI(`${getBaseUrl()}/com.buldreinfo.jersey.jaxb/v2${urlSuffix}`);
}

function makeAuthenticatedRequest(
  accessToken: string | null,
  urlSuffix: string,
  opts?: Partial<Parameters<typeof fetch>[1]>
) {
  const options = {
    ...opts,
    mode: "cors",
    headers: {
      ...opts?.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  };
  return fetch(getUrl(urlSuffix), options);
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

export function useData(
  urlSuffix: string,
  options: Partial<QueryOptions> = {}
) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  return useQuery<any>({
    queryKey: [urlSuffix, isAuthenticated],
    queryHash: `auth=${isAuthenticated}/${urlSuffix}`,
    queryFn: async () => {
      const accessToken = isAuthenticated
        ? await getAccessTokenSilently()
        : null;
      const res = await makeAuthenticatedRequest(accessToken, urlSuffix);
      return res.json() as T;
    },
    ...options,
  });
}

export function getImageUrl(
  id: number,
  checksum: number,
  minDimention?: number
): string {
  const crc32 = checksum || 0;
  if (minDimention) {
    return getUrl(
      `/images?id=${id}&crc32=${crc32}&minDimention=${minDimention}`
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
  id: number
): string {
  return getUrl(`/sectors/pdf?accessToken=${accessToken}&id=${id}`);
}

export function getProblemPdfUrl(
  accessToken: string | null,
  id: number
): string {
  return getUrl(`/problems/pdf?accessToken=${accessToken}&id=${id}`);
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

export function deleteMedia(
  accessToken: string | null,
  id: number
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
  toIdProblem: number
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media?id=${id}&left=${left}&toIdSector=${toIdSector}&toIdProblem=${toIdProblem}`,
    {
      method: "PUT",
    }
  );
}

export function getActivity(
  accessToken: string | null,
  idArea: number,
  idSector: number,
  lowerGrade: number,
  fa: boolean,
  comments: boolean,
  ticks: boolean,
  media: boolean
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/activity?idArea=${idArea}&idSector=${idSector}&lowerGrade=${lowerGrade}&fa=${fa}&comments=${comments}&ticks=${ticks}&media=${media}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getArea(accessToken: string | null, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`, null)
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          "Cannot find the specified area because it does not exist or you do not have sufficient permissions."
        );
      }
      return response.json();
    })
    .then((data) => {
      if (data.redirectUrl && data.redirectUrl != window.location.href) {
        window.location.href = data.redirectUrl;
      }
      return data;
    });
}

export function getAreaEdit(
  accessToken: string | null,
  id: number
): Promise<any> {
  if (id == -1) {
    return getMeta(accessToken)
      .then((res) => {
        return {
          id: -1,
          lockedAdmin: false,
          lockedSuperadmin: false,
          forDevelopers: false,
          accessInfo: "",
          accessClosed: "",
          noDogsAllowed: false,
          name: "",
          comment: "",
          lat: 0,
          lng: 0,
          newMedia: [],
          metadata: {
            title: "New area | " + res.metadata.title,
            defaultZoom: res.metadata.defaultZoom,
            defaultCenter: res.metadata.defaultCenter,
            isAdmin: res.metadata.isAdmin,
            isSuperAdmin: res.metadata.isSuperAdmin,
          },
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`, null)
      .then((data) => data.json())
      .then((res) => {
        return {
          id: res.id,
          lockedAdmin: res.lockedAdmin,
          lockedSuperadmin: res.lockedSuperadmin,
          forDevelopers: res.forDevelopers,
          accessInfo: res.accessInfo,
          accessClosed: res.accessClosed,
          noDogsAllowed: res.noDogsAllowed,
          name: res.name,
          comment: res.comment,
          lat: res.lat,
          lng: res.lng,
          newMedia: [],
          metadata: res.metadata,
          sectorOrder: res.sectorOrder,
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  }
}

export function getGradeDistribution(
  accessToken: string | null,
  idArea: number,
  idSector: number
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/grade/distribution?idArea=${idArea}&idSector=${idSector}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getMediaSvg(
  accessToken: string | null,
  idMedia: number
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media/svg?idMedia=${idMedia}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getMeta(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/meta`, null)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getPermissions(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/permissions`, null)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getProblem(
  accessToken: string | null,
  id: number,
  showHiddenMedia: boolean
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/problems?id=${id}&showHiddenMedia=${showHiddenMedia}`,
    null
  )
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          "Cannot find the specified problem because it does not exist or you do not have sufficient permissions."
        );
      }
      return response.json();
    })
    .then((data) => {
      if (data.redirectUrl && data.redirectUrl != window.location.href) {
        window.location.href = data.redirectUrl;
      }
      return data;
    });
}

export function getProblemEdit(
  accessToken: string | null,
  sectorIdProblemId: string
): Promise<any> {
  const parts = sectorIdProblemId.split("-");
  const sectorId = parseInt(parts[0]);
  const problemId = parseInt(parts[1]);
  if (problemId === 0) {
    return getSector(accessToken, sectorId)
      .then((res) => {
        let defaultCenter = res.metadata.defaultCenter;
        let defaultZoom = res.metadata.defaultZoom;
        if (res.lat && res.lng && parseFloat(res.lat) > 0) {
          defaultCenter = {
            lat: parseFloat(res.lat),
            lng: parseFloat(res.lng),
          };
          defaultZoom = 15;
        }
        return {
          id: -1,
          sectorId: res.id,
          lockedAdmin: res.lockedAdmin,
          lockedSuperadmin: res.lockedSuperadmin,
          name: "",
          comment: "",
          rock: null,
          originalGrade: "n/a",
          fa: [],
          faDate: convertFromDateToString(new Date()),
          nr: 0,
          lat: 0,
          lng: 0,
          latStr: "",
          lngStr: "",
          trivia: "",
          startingAltitude: "",
          aspect: "",
          routeLength: "",
          descent: "",
          newMedia: [],
          metadata: {
            title: "New problem | " + res.metadata.title,
            defaultZoom: defaultZoom,
            defaultCenter: defaultCenter,
            grades: res.metadata.grades,
            types: res.metadata.types,
            isAdmin: res.metadata.isAdmin,
            isSuperAdmin: res.metadata.isSuperAdmin,
            gradeSystem: res.metadata.gradeSystem,
          },
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return getProblem(accessToken, problemId, false)
      .then((res) => {
        const m = res.metadata;
        if (res.sectorLat && res.sectorLng && parseFloat(res.sectorLat) > 0) {
          m.defaultCenter = {
            lat: parseFloat(res.sectorLat),
            lng: parseFloat(res.sectorLng),
          };
          m.defaultZoom = 15;
        }
        return {
          id: res.id,
          sectorId: res.sectorId,
          lockedAdmin: res.lockedAdmin,
          lockedSuperadmin: res.lockedSuperadmin,
          name: res.name,
          rock: res.rock,
          comment: res.comment,
          originalGrade: res.originalGrade,
          fa: res.fa,
          faDate: res.faDate,
          nr: res.nr,
          typeId: res.t.id,
          lat: res.lat,
          lng: res.lng,
          latStr: res.lat,
          lngStr: res.lng,
          sections: res.sections,
          faAid: res.faAid,
          metadata: m,
          newMedia: [],
          trivia: res.trivia,
          startingAltitude: res.startingAltitude,
          aspect: res.aspect,
          routeLength: res.routeLength,
          descent: res.descent,
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  }
}

export function getProfile(
  accessToken: string | null,
  id: number
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/profile?id=${id}`, null)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getProfileMedia(
  accessToken: string | null,
  id: number,
  captured: boolean
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/profile/media?id=${id}&captured=${captured}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getProfileStatistics(
  accessToken: string | null,
  id: number
): Promise<{
  numImageTags: number;
  numImagesCreated: number;
  numVideoTags: number;
  numVideosCreated: number;
  orderByGrade: boolean;
  ticks: {
    idProblem: number;
    dateHr: string;
    areaName: string;
    areaLockedAdmin: boolean;
    areaLockedSuperadmin: boolean;
    sectorName: string;
    sectorLockedAdmin: boolean;
    sectorLockedSuperadmin: boolean;
    name: string;
    grade: string;
    lockedAdmin: boolean;
    lockedSuperadmin: boolean;
    stars: number;
    idTick: number;
    fa: boolean;
    idTickRepeat: number;
    subType: string;
    numPitches: number;
    comment: string;
    lat: number;
    lng: number;
    gradeNumber: number;
    num: number;
  }[];
}> {
  return makeAuthenticatedRequest(
    accessToken,
    `/profile/statistics?id=${id}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getProfileTodo(
  accessToken: string | null,
  id: number
): Promise<{
  areas: {
    name: string;
    lockedAdmin: boolean;
    lockedSuperadmin: boolean;
    url: string;
    sectors: {
      name: string;
      lockedAdmin: boolean;
      lockedSuperadmin: boolean;
      url: string;
      problems: {
        name: string;
        lockedAdmin: boolean;
        lockedSuperadmin: boolean;
        url: string;
        nr: number;
        grade: number;
        partners?: {
          name: string;
          id: string;
        }[];
        lat: number;
        lng: number;
        id: number;
      }[];
    }[];
  }[];
}> {
  return makeAuthenticatedRequest(accessToken, `/profile/todo?id=${id}`, null)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getSector(
  accessToken: string | null,
  id: number
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/sectors?id=${id}`, null)
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          "Cannot find the specified sector because it does not exist or you do not have sufficient permissions."
        );
      }
      return response.json();
    })
    .then((data) => {
      if (data.redirectUrl && data.redirectUrl != window.location.href) {
        window.location.href = data.redirectUrl;
      }
      return data;
    });
}

export function getSectorEdit(
  accessToken: string | null,
  areaIdSectorId: string
): Promise<any> {
  const parts = areaIdSectorId.split("-");
  const areaId = parseInt(parts[0]);
  const sectorId = parseInt(parts[1]);
  if (sectorId === 0) {
    return getArea(accessToken, areaId)
      .then((res) => {
        const defaultCenter =
          res.lat && res.lng && parseFloat(res.lat) > 0
            ? { lat: parseFloat(res.lat), lng: parseFloat(res.lng) }
            : res.metadata.defaultCenter;
        return {
          areaId: res.id,
          id: -1,
          lockedAdmin: res.lockedAdmin,
          lockedSuperadmin: res.lockedSuperadmin,
          name: "",
          comment: "",
          accessInfo: "",
          accessClosed: "",
          lat: 0,
          lng: 0,
          latStr: "",
          lngStr: "",
          newMedia: [],
          metadata: {
            title: "New sector | " + res.metadata.title,
            defaultZoom: 12,
            defaultCenter: defaultCenter,
            isAdmin: res.metadata.isAdmin,
            isSuperAdmin: res.metadata.isSuperAdmin,
          },
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return getSector(accessToken, sectorId)
      .then((res) => {
        return {
          id: res.id,
          areaId: res.areaId,
          lockedAdmin: res.lockedAdmin,
          lockedSuperadmin: res.lockedSuperadmin,
          name: res.name,
          comment: res.comment,
          accessInfo: res.accessInfo,
          accessClosed: res.accessClosed,
          lat: res.lat,
          lng: res.lng,
          latStr: res.lat,
          lngStr: res.lng,
          polygonCoords: res.polygonCoords,
          polyline: res.polyline,
          newMedia: [],
          metadata: res.metadata,
          problemOrder: res.problemOrder,
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  }
}

export function getSites(
  accessToken: string | null,
  type: string
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/sites?type=${type}`, null)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getSvgEdit(
  accessToken: string | null,
  problemIdMediaId: string
): Promise<any> {
  const parts = problemIdMediaId.split("-");
  const problemId = parts[0];
  const mediaId = parts[1];
  return makeAuthenticatedRequest(
    accessToken,
    `/problems?id=${problemId}&showHiddenMedia=true`,
    null
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
        metadata: res.metadata,
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getTicks(
  accessToken: string | null,
  page: number
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/ticks?page=${page}`, null)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getTodo(
  accessToken: string | null,
  idArea: number,
  idSector: number
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/todo?idArea=${idArea}&idSector=${idSector}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getTop(
  idArea: number,
  idSector: number
): Promise<
  {
    rank: number;
    picture: string;
    userId: string | number;
    name: string;
    percentage: string | number;
  }[]
> {
  return makeAuthenticatedRequest(
    null,
    `/top?idArea=${idArea}&idSector=${idSector}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getTocXlsx(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/toc/xlsx`, {
    expose: ["Content-Disposition"],
  }).catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserSearch(
  accessToken: string | null,
  value: string
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/users/search?value=${value}`,
    null
  )
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getUsersTicks(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/users/ticks`, {
    expose: ["Content-Disposition"],
  }).catch((error) => {
    console.warn(error);
    return null;
  });
}

export function postArea(
  accessToken: string | null,
  id: number,
  trash: boolean,
  lockedAdmin: number,
  lockedSuperadmin: number,
  forDevelopers: boolean,
  accessInfo: string,
  accessClosed: string,
  noDogsAllowed: boolean,
  name: string,
  comment: string,
  lat: number,
  lng: number,
  media: any,
  sectorOrder: any
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
      id,
      trash,
      lockedAdmin,
      lockedSuperadmin,
      forDevelopers,
      accessInfo,
      accessClosed,
      noDogsAllowed,
      name,
      comment,
      lat,
      lng,
      newMedia,
      sectorOrder,
    })
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file)
  );
  return makeAuthenticatedRequest(accessToken, `/areas`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  }).then((data) => data.json());
}

export function postComment(
  accessToken: string | null,
  id: number,
  idProblem: number,
  comment: string,
  danger: boolean,
  resolved: boolean,
  del: boolean,
  media: any
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
      id,
      idProblem,
      comment,
      danger,
      resolved,
      delete: del,
      newMedia,
    })
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file)
  );

  return makeAuthenticatedRequest(accessToken, `/comments`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
}

export function postFilter(
  accessToken: string | null,
  grades: Array<number>,
  types: Array<number>
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/filter`, {
    method: "POST",
    body: JSON.stringify({ grades, types }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((data) => data.json());
}

export function postMediaSvg(
  accessToken: string | null,
  mediaSvg: any
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/media/svg`, {
    method: "POST",
    body: JSON.stringify(mediaSvg),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function postPermissions(
  accessToken: string | null,
  userId: number,
  adminRead: boolean,
  adminWrite: boolean,
  superadminRead: boolean,
  superadminWrite: boolean
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
  trash: boolean,
  lockedAdmin: number,
  lockedSuperadmin: number,
  name: string,
  rock: string,
  comment: string,
  originalGrade: string,
  fa: any,
  faDate: string,
  nr: number,
  t: any,
  lat: number,
  lng: number,
  sections: any,
  media: any,
  faAid: any,
  trivia: string,
  startingAltitude: string,
  aspect: string,
  routeLength: string,
  descent: string
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
      lat,
      lng,
      sections,
      newMedia,
      faAid,
      trivia,
      startingAltitude,
      aspect,
      routeLength,
      descent,
    })
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file)
  );
  return makeAuthenticatedRequest(accessToken, `/problems`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  })
    .catch((error) => {
      console.warn(error);
      alert(error);
    })
    .then((data) => data.json());
}

export function postProblemMedia(
  accessToken: string | null,
  id: number,
  media: any
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
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file)
  );
  return makeAuthenticatedRequest(accessToken, `/problems/media`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  })
    .catch((error) => {
      console.warn(error);
      alert(error);
    })
    .then((data) => data.json());
}

export function postSearch(
  accessToken: string | null,
  value: string
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/search`, {
    method: "POST",
    body: JSON.stringify({ value }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((data) => data.json());
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
  texts: string
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
    }
  );
}

export function postSector(
  accessToken: string | null,
  areaId: number,
  id: number,
  trash: boolean,
  lockedAdmin: number,
  lockedSuperadmin: number,
  name: string,
  comment: string,
  accessInfo: string,
  accessClosed: string,
  lat: number,
  lng: number,
  polygonCoords: any,
  polyline: any,
  media: any,
  problemOrder: any
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
      lat,
      lng,
      polygonCoords,
      polyline,
      newMedia,
      problemOrder,
    })
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file)
  );
  return makeAuthenticatedRequest(accessToken, `/sectors`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  })
    .catch((error) => {
      console.warn(error);
      alert(error);
    })
    .then((data) => data.json());
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
  repeats: any
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

export function postTodo(
  accessToken: string | null,
  problemId: number
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/todo?idProblem=${problemId}`, {
    method: "POST",
  });
}

export function postUserRegion(
  accessToken: string | null,
  regionId: number,
  del: boolean
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/user/regions?regionId=${regionId}&delete=${del}`,
    {
      method: "POST",
    }
  );
}

export function putMediaInfo(
  accessToken: string | null,
  mediaId: number,
  description: string,
  pitch: number,
  trivia: boolean
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
  degrees: number
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media/jpeg/rotate?idMedia=${idMedia}&degrees=${degrees}`,
    {
      method: "PUT",
    }
  );
}

export function putTrash(
  accessToken: string | null,
  idArea: number,
  idSector: number,
  idProblem: number,
  idMedia: number
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/trash?idArea=${idArea}&idSector=${idSector}&idProblem=${idProblem}&idMedia=${idMedia}`,
    {
      method: "PUT",
    }
  );
}
