import { useAuth0 } from "@auth0/auth0-react";
import {
  MutationFunction,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import fetch from "isomorphic-fetch";
import { useState, useEffect } from "react";
import {
  ConsistencyAction,
  DATA_MUTATION_EVENT,
} from "./components/DataReloader";
import { useLocalStorage } from "./utils/use-local-storage";

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

type FetchOptions = Partial<Parameters<typeof fetch>[1]> & {
  consistencyAction?: ConsistencyAction;
};

function makeAuthenticatedRequest(
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

function useKey(
  customKey: readonly unknown[] | undefined,
  urlSuffix: string,
): readonly unknown[] {
  const { isAuthenticated } = useAuth0();
  const key = customKey ?? [urlSuffix, { isAuthenticated }];
  if (Array.isArray(key) && key[1] && typeof key[1] === "object") {
    // Spread them in this order so that callers can choose to ignore the
    // isAuthenticated variable if they choose to.
    key[1] = {
      isAuthenticated,
      ...key[1],
    };
  }
  return key;
}

function usePostData<TVariables, TData = Response>(
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
      select: (
        response: Response,
        variables: TVariables,
      ) => TData | Promise<TData>;
    }
  > = {},
) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const mutationKey = useKey(options.mutationKey, urlSuffix);

  const mutationFn: MutationFunction<TData, TVariables> = async (variables) => {
    const accessToken = isAuthenticated ? await getAccessTokenSilently() : null;

    const url = createUrl(variables);

    const res = await makeAuthenticatedRequest(accessToken, url, {
      method: "POST",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
      ...fetchOptions,
    });

    return select(res, variables);
  };

  return useMutation<TData, unknown, TVariables>(mutationKey, mutationFn, {
    ...options,
  });
}

export function useData<TQueryData = any, TData = TQueryData>(
  urlSuffix: string,
  {
    queryKey: customQueryKey,
    ...options
  }: Partial<
    Omit<
      UseQueryOptions,
      | "queryFn"
      | "select"
      | "placeholderData"
      | "initialData"
      | "structuralSharing"
    > & {
      select: (queryData: TQueryData) => TData;
      placeholderData: TQueryData | (() => TQueryData);
      initialData: TQueryData | (() => TQueryData);
    }
  > = {},
) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const queryKey = useKey(customQueryKey, urlSuffix);

  const queryFn: () => Promise<TQueryData> = async (): Promise<TQueryData> => {
    const accessToken = isAuthenticated ? await getAccessTokenSilently() : null;
    const res = await makeAuthenticatedRequest(accessToken, urlSuffix);
    return res.json();
  };

  return useQuery<TQueryData, unknown, TData>(queryKey, queryFn, options);
}

export function getImageUrl(
  id: number,
  checksum: number,
  minDimention?: number,
): string {
  const crc32 = checksum || 0;
  if (minDimention) {
    return getUrl(
      `/images?id=${id}&crc32=${crc32}&minDimention=${minDimention}`,
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

export function useProblems() {
  const [cachedData, _, writeCachedData] = useLocalStorage<ProblemArea[]>(
    "cache/problems",
    [],
  );

  return useData<ProblemArea[]>("/problems", {
    placeholderData: cachedData,
    select(data) {
      writeCachedData(data);
      return data;
    },
  });
}

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

export function useActivity({
  idArea,
  idSector,
  lowerGrade,
  fa,
  comments,
  ticks,
  media,
}: {
  idArea: number;
  idSector: number;
  lowerGrade: number;
  fa: boolean;
  comments: boolean;
  ticks: boolean;
  media: boolean;
}) {
  return useData(
    `/activity?idArea=${idArea}&idSector=${idSector}&lowerGrade=${lowerGrade}&fa=${fa}&comments=${comments}&ticks=${ticks}&media=${media}`,
  );
}

export function useAreas() {
  return useData(`/areas`, {
    queryKey: [`/areas`],
  });
}

export function useArea(id: number) {
  return useData(`/areas?id=${id}`, {
    queryKey: [`/areas`, { id }],
  });
}

export function getArea(accessToken: string | null, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`)
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          "Cannot find the specified area because it does not exist or you do not have sufficient permissions.",
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
  id: number,
): Promise<any> {
  if (id == -1) {
    return Promise.resolve({
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
      latStr: "",
      lngStr: "",
      newMedia: [],
      polygons: null,
      polylines: null,
    });
  } else {
    return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`)
      .then((data) => data.json())
      .then((res) => {
        return {
          id: res[0].id,
          lockedAdmin: res[0].lockedAdmin,
          lockedSuperadmin: res[0].lockedSuperadmin,
          forDevelopers: res[0].forDevelopers,
          accessInfo: res[0].accessInfo,
          accessClosed: res[0].accessClosed,
          noDogsAllowed: res[0].noDogsAllowed,
          name: res[0].name,
          comment: res[0].comment,
          lat: res[0].lat,
          lng: res[0].lng,
          latStr: res[0].lat,
          lngStr: res[0].lng,
          newMedia: [],
          sectorOrder: res[0].sectorOrder,
          polygons: res[0].sectors
            ?.filter((s) => s.polygonCoords)
            .map((s) => ({
              polygon: s.polygonCoords
                .split(";")
                .filter((i) => i)
                .map((c) => {
                  const latLng = c.split(",");
                  return [parseFloat(latLng[0]), parseFloat(latLng[1])];
                }),
              background: true,
              label: s.name,
            })),
          polylines: res[0].sectors
            ?.filter((s) => s.polyline)
            .map((s) => ({
              polyline: s.polyline
                .split(";")
                .filter((i) => i)
                .map((e) => e.split(",").map(Number)),
              background: true,
            })),
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
  idSector: number,
): Promise<any> {
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

export function useMediaSvg(idMedia: number) {
  const { data, ...dataResult } = useData(`/media?idMedia=${idMedia}`, {
    queryKey: [`/media`, { idMedia }],
  });

  const mutation = usePostData(`/media/svg`);

  return { media: data, save: mutation.mutateAsync, ...dataResult };
}

export function getMeta(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/meta`)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getPermissions(accessToken: string | null): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/permissions`)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function useProblem(id: number, showHiddenMedia: boolean) {
  const client = useQueryClient();
  const problem = useData(
    `/problem?id=${id}&showHiddenMedia=${showHiddenMedia}`,
    { queryKey: [`/problem`, { id, showHiddenMedia }] },
  );
  const { data: profile } = useProfile(-1);
  const toggleTodo = usePostData(`/todo?idProblem=${id}`, {
    mutationKey: [`/todo`, { id }],
    onSuccess: () => {
      problem.refetch();
      if (problem.data?.sectorId) {
        client.refetchQueries({
          queryKey: [
            `/sectors`,
            {
              isAuthenticated: true,
              id: problem.data.sectorId,
            },
          ],
        });
      }
      if (problem.data?.areaId) {
        client.refetchQueries({
          queryKey: [
            `/areas`,
            {
              isAuthenticated: true,
              id: problem.data.areaId,
            },
          ],
        });
      }
      if (profile?.id) {
        client.refetchQueries({
          queryKey: [`/profile/todo`, { id: +profile.id }],
        });
      }
    },
    fetchOptions: {
      consistencyAction: "nop",
    },
  });

  return { ...problem, toggleTodo: toggleTodo.mutateAsync };
}

export function getProblem(
  accessToken: string | null,
  id: number,
  showHiddenMedia: boolean,
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/problem?id=${id}&showHiddenMedia=${showHiddenMedia}`,
    null,
  )
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          "Cannot find the specified problem because it does not exist or you do not have sufficient permissions.",
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
  sectorId: number,
  problemId: number,
): Promise<any> {
  if (!problemId) {
    return getSector(accessToken, sectorId)
      .then((res) => {
        return {
          id: -1,
          areaId: res.areaId,
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
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return getProblem(accessToken, problemId, false)
      .then((res) => {
        return {
          id: res.id,
          areaId: res.areaId,
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

export function useProfile(userId: number = -1) {
  const client = useQueryClient();
  const { isAuthenticated } = useAuth0();
  const profile = useData<Profile>(`/profile?id=${userId}`, {
    queryKey: [`/profile`, { id: userId }],
    enabled: userId > 0 || isAuthenticated,
  });

  const addRegion = usePostData<number>(`/user/regions`, {
    createUrl: (regionId) =>
      `/user/regions?regionId=${regionId}&delete=${false}`,
  });

  const removeRegion = usePostData<number>(`/user/regions`, {
    createUrl: (regionId) =>
      `/user/regions?regionId=${regionId}&delete=${true}`,
  });

  const setRegion = usePostData<{ region: Region; del: boolean }>(
    `/user/regions`,
    {
      createUrl: ({ region: { id }, del }) =>
        `/user/regions?regionId=${id}&delete=${del}`,
      fetchOptions: {
        consistencyAction: "nop",
      },
      onMutate: ({ region, del }) => {
        client.setQueryData<Profile>(
          [`/profile`, { id: userId, isAuthenticated }],
          (old) => {
            if (old && typeof old === "object") {
              const next = {
                ...old,
                userRegions: old.userRegions.map((oldRegion) => {
                  if (oldRegion.id !== region.id) {
                    return oldRegion;
                  }
                  return {
                    ...oldRegion,
                    enabled: !del,
                  };
                }),
              };
              return next;
            }
            return old;
          },
        );
      },
      onError: () => {
        client.refetchQueries({
          queryKey: [`/profile`, { id: -1 }],
        });
      },
      onSettled: () => {
        client.refetchQueries({
          queryKey: [`/areas`],
        });
        client.refetchQueries({
          queryKey: [`/problems`],
        });
        client.refetchQueries({
          queryKey: [`/dangerous`],
        });
      },
    },
  );

  return {
    ...profile,
    addRegion: addRegion.mutateAsync,
    removeRegion: removeRegion.mutateAsync,
    setRegion: setRegion.mutateAsync,
  };
}

export function useProfileMedia({
  userId,
  captured,
}: {
  userId: number;
  captured: boolean;
}) {
  return useData(`/profile/media?id=${userId}&captured=${captured}`, {
    queryKey: [`/profile/media`, { id: userId, captured }],
  });
}

export function useProfileStatistics(id: number) {
  return useData<ProfileStatistics>(`/profile/statistics?id=${id}`, {
    queryKey: [`/profile/statistics`, { id }],
  });
}

export function useProfileTodo(id: number) {
  return useData(`/profile/todo?id=${id}`, {
    queryKey: [`/profile/todo`, { id }],
  });
}

export function useSector(
  id: number | undefined,
  options?: Parameters<typeof useData>[1],
) {
  return useData<any>(`/sectors?id=${id}`, {
    ...(options ?? {}),
    queryKey: [`/sectors`, { id }],
  });
}

export function getSector(
  accessToken: string | null,
  id: number,
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/sectors?id=${id}`)
    .then((response) => {
      if (response.status === 500) {
        return Promise.reject(
          "Cannot find the specified sector because it does not exist or you do not have sufficient permissions.",
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
  areaId: number,
  sectorId: number,
): Promise<any> {
  if (!sectorId) {
    return getArea(accessToken, areaId)
      .then((res) => {
        return {
          areaId: res[0].id,
          id: -1,
          lockedAdmin: res[0].lockedAdmin,
          lockedSuperadmin: res[0].lockedSuperadmin,
          name: "",
          comment: "",
          accessInfo: "",
          accessClosed: "",
          lat: 0,
          lng: 0,
          latStr: "",
          lngStr: "",
          newMedia: [],
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
          problemOrder: res.problemOrder,
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  }
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

export function getTicks(
  accessToken: string | null,
  page: number,
): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/ticks?page=${page}`)
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function useTodo({
  idArea,
  idSector,
}: {
  idArea: number;
  idSector: number;
}) {
  return useData(`/todo?idArea=${idArea}&idSector=${idSector}`);
}

export function useTop({
  idArea,
  idSector,
}: {
  idArea: number;
  idSector: number;
}) {
  return useData(`/top?idArea=${idArea}&idSector=${idSector}`);
}

export function getUserSearch(
  accessToken: string | null,
  value: string,
): Promise<any> {
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
  sectorOrder: any,
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
    }),
  );
  media.forEach(
    (m) =>
      m.file &&
      formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, "_"), m.file),
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
  comment: string | null,
  danger: boolean,
  resolved: boolean,
  del: boolean,
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

export function useSearch() {
  const { mutateAsync, data, ...rest } = usePostData<
    { value: string },
    SearchResult[]
  >(`/search`, {
    select(response) {
      return response.json();
    },
    fetchOptions: {
      consistencyAction: "nop",
    },
  });

  return { search: mutateAsync, ...rest, data: data ?? [] };
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
      lat,
      lng,
      polygonCoords,
      polyline,
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
): Promise<any> {
  return makeAuthenticatedRequest(
    accessToken,
    `/media/jpeg/rotate?idMedia=${idMedia}&degrees=${degrees}`,
    {
      method: "PUT",
    },
  );
}

export function useTrash() {
  const { data } = useData<Trash[]>(`/trash`, { select: (v) => v });

  const restore = usePostData<Trash, string>(`/trash`, {
    fetchOptions: {
      method: "PUT",
      body: undefined,
    },
    createUrl: ({ idArea, idProblem, idSector, idMedia }) =>
      `/trash?idArea=${idArea}&idSector=${idSector}&idProblem=${idProblem}&idMedia=${idMedia}`,
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
