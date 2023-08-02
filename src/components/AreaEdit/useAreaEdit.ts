import {
  useEffect,
  useReducer,
  useCallback,
  ComponentProps,
  ChangeEvent,
} from "react";
import ImageUpload from "../common/image-upload/image-upload";
import Leaflet from "../common/leaflet/leaflet";
import { useArea, usePostData } from "../../api";
import { VisibilitySelectorField } from "../common/VisibilitySelector";
import { definitions } from "../../@types/buldreinfo/swagger";
import { neverGuard } from "../../utils/neverGuard";
import { Checkbox, Input } from "semantic-ui-react";
import { UseMutateAsyncFunction } from "@tanstack/react-query";

type NewMedia = definitions["NewMedia"] & { file?: File };

type State =
  | undefined
  | (Required<
      Pick<
        definitions["Area"],
        | "accessClosed"
        | "accessInfo"
        | "comment"
        | "forDevelopers"
        | "id"
        | "lat"
        | "lng"
        | "lockedAdmin"
        | "lockedSuperadmin"
        | "name"
        | "noDogsAllowed"
        | "sectorOrder"
        | "sectors"
        | "trash"
      >
    > & {
      newMedia: NewMedia[];
    });

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
      return {
        accessClosed: "",
        accessInfo: "",
        comment: "",
        forDevelopers: false,
        id: -1,
        lat: 0,
        lng: 0,
        lockedAdmin: false,
        lockedSuperadmin: false,
        name: "",
        noDogsAllowed: false,
        sectorOrder: [],
        sectors: [],
        trash: false,
        newMedia: [],
        ...data,
      };
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

type SavedArea = NonNullable<State>;

type UseAreaEdit = (_: { areaId: number }) => {
  area: State;
  isLoading: boolean;
  isSaving: boolean;
  save: UseMutateAsyncFunction<definitions["Redirect"], unknown, SavedArea>;
  setString: (
    key: "accessInfo" | "accessClosed" | "name" | "comment",
  ) => (event: React.ChangeEvent, data: { value?: string | number }) => void;
  setVisibility: ComponentProps<typeof VisibilitySelectorField>["onChange"];
  setCoord: (key: "lat" | "lng") => ComponentProps<typeof Input>["onChange"];
  setLatLng: ComponentProps<typeof Leaflet>["onMouseClick"];
  setSectorSort: (sectorId: number) => ComponentProps<typeof Input>["onChange"];
  setBoolean: (
    key: "trash" | "forDevelopers" | "noDogsAllowed",
  ) => ComponentProps<typeof Checkbox>["onChange"];
  setNewMedia: ComponentProps<typeof ImageUpload>["onMediaChanged"];
};

export const useAreaEdit: UseAreaEdit = ({ areaId }) => {
  const [state, dispatch] = useReducer(reducer, undefined);
  const { data, status, isLoading } = useArea(areaId);

  useEffect(() => {
    if (status === "success") {
      dispatch({ action: "set-data", data });
    }
  }, [data, status]);

  const save = usePostData<SavedArea, definitions["Redirect"]>(`/areas`, {
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
          lockedAdmin: !!lockedAdmin,
          lockedSuperadmin: !!lockedSuperadmin,
          forDevelopers,
          accessInfo: accessInfo || "",
          accessClosed: accessClosed || "",
          noDogsAllowed,
          name,
          comment,
          lat: lat || "",
          lng: lng || "",
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
    isLoading,
    isSaving: save.isLoading,
    save: save.mutateAsync,
    setString: useCallback(
      (key) =>
        (_, { value }) =>
          dispatch({
            action: "set-string",
            key,
            value: value ? String(value) : "",
          }),
      [],
    ),
    setVisibility: useCallback(
      ({ lockedAdmin, lockedSuperadmin }) =>
        dispatch({ action: "set-visibility", lockedAdmin, lockedSuperadmin }),
      [],
    ),
    setCoord: useCallback(
      (key) =>
        (_, { value }) => {
          dispatch({ action: "set-coord", key, value });
        },
      [],
    ),
    setLatLng: useCallback(
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
      (key) =>
        (_, { checked }) =>
          dispatch({ action: "set-boolean", key, value: !!checked }),
      [],
    ),
    setNewMedia: useCallback(
      (newMedia) => dispatch({ action: "set-media", newMedia }),
      [],
    ),
  };
};
