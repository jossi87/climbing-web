import { useEffect, useReducer, useCallback, ComponentProps } from "react";
import ImageUpload from "../common/image-upload/image-upload";
import Leaflet from "../common/leaflet/leaflet";
import { useArea, usePostData } from "../../api";
import { VisibilitySelectorField } from "../common/VisibilitySelector";
import { definitions } from "../../@types/buldreinfo/swagger";
import { neverGuard } from "../../utils/neverGuard";

type NewMedia = definitions["NewMedia"] & { file: File };

type State = Omit<definitions["Area"], "newMedia"> & {
  newMedia: NewMedia[];
};
type Update =
  | { action: "set-data"; data: definitions["Area"] }
  | {
      action: "set-string";
      key: "accessInfo" | "accessClosed" | "name" | "comment";
      value: string;
    }
  | {
      action: "set-boolean";
      key: "trash" | "forDevelopers" | "noDogsAllowed";
      value: boolean;
    }
  | {
      action: "set-visibility";
      lockedAdmin: boolean;
      lockedSuperadmin: boolean;
    }
  | { action: "set-coord"; key: "lat" | "lng"; value: string }
  | { action: "set-lat-lng"; lat: number; lng: number }
  | { action: "set-sort"; sectorId: number; sorting: number }
  | { action: "set-media"; newMedia: NewMedia[] };

const getCoord = (value: string | number) => {
  const str = String(value).replace(",", ".");
  if (isNaN(+str)) {
    return 0;
  }
  return +str;
};

const reducer = (state: State, update: Update): State => {
  const { action } = update;
  switch (action) {
    case "set-data": {
      const { data } = update;
      return { ...state, ...data, newMedia: [] };
    }
    case "set-string": {
      return { ...state, [update.key]: update.value };
    }
    case "set-visibility": {
      const { lockedAdmin, lockedSuperadmin } = update;
      return { ...state, lockedAdmin, lockedSuperadmin };
    }
    case "set-coord": {
      const { key, value } = update;
      return { ...state, [key]: getCoord(value) };
    }
    case "set-lat-lng": {
      const { lat: latitude, lng: longitude } = update;
      return { ...state, lat: getCoord(latitude), lng: getCoord(longitude) };
    }
    case "set-sort": {
      const { sectorId, sorting } = update;
      return {
        ...state,
        sectorOrder: state.sectorOrder.map((order) => {
          if (order.id !== sectorId) {
            return order;
          }
          return {
            ...order,
            sorting,
          };
        }),
      };
    }
    case "set-boolean": {
      const { key, value } = update;
      return { ...state, [key]: value };
    }
    case "set-media": {
      return { ...state, newMedia: update.newMedia };
    }
    default: {
      return neverGuard(action, state);
    }
  }
};

const DEFAULT_AREA: definitions["Area"] = {
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
};

export const useAreaEdit = ({ areaId }: { areaId: number }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...DEFAULT_AREA,
    trash: false,
    newMedia: [],
  });
  const { data, status, isLoading } = useArea(areaId);

  useEffect(() => {
    if (status === "success") {
      dispatch({ action: "set-data", data });
    }
  }, [data, status]);

  const save = usePostData<
    Omit<definitions["Area"], "media" | "newMedia"> &
      Pick<State, "trash" | "newMedia">,
    definitions["Redirect"]
  >(`/areas`, {
    mutationKey: [`/areas`, { id: areaId }],
    createBody({
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
      newMedia: media,
      sectorOrder,
    }) {
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
      return formData;
    },
    select: (res) => res.json(),
    fetchOptions: {
      headers: {
        Accept: "application/json",
      },
    },
  });

  return {
    area: state,
    isLoading: areaId > 0 ? isLoading : false,
    isSaving: save.isLoading,
    save: save.mutateAsync,
    setString: useCallback(
      (key: "accessInfo" | "accessClosed" | "name" | "comment") =>
        (_, { value }) =>
          dispatch({ action: "set-string", key, value }),
      [],
    ),
    setVisibility: useCallback<
      ComponentProps<typeof VisibilitySelectorField>["onChange"]
    >(
      ({ lockedAdmin, lockedSuperadmin }) =>
        dispatch({ action: "set-visibility", lockedAdmin, lockedSuperadmin }),
      [],
    ),
    setCoord: useCallback(
      (key: "lat" | "lng") =>
        (_, { value }) => {
          dispatch({ action: "set-coord", key, value });
        },
      [],
    ),
    setLatLng: useCallback<ComponentProps<typeof Leaflet>["onMouseClick"]>(
      ({ latlng }) =>
        dispatch({
          action: "set-lat-lng",
          lat: +(latlng.lat || 0),
          lng: +(latlng.lng || 0),
        }),
      [],
    ),
    setSectorSort: useCallback(
      (sectorId: number) =>
        (_, { value }) =>
          dispatch({ action: "set-sort", sectorId, sorting: +(value || 0) }),
      [],
    ),
    setBoolean: useCallback(
      (key: "trash" | "forDevelopers" | "noDogsAllowed") =>
        (_, { checked }) =>
          dispatch({ action: "set-boolean", key, value: !!checked }),
      [],
    ),
    setNewMedia: useCallback<
      ComponentProps<typeof ImageUpload>["onMediaChanged"]
    // @ts-expect-error - Evan should fix this
    >((newMedia) => dispatch({ action: "set-media", newMedia }), []),
  };
};
