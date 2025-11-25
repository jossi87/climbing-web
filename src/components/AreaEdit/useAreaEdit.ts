import { useEffect, useReducer, useCallback, ComponentProps, ChangeEvent } from 'react';
import ImageUpload from '../common/image-upload/image-upload';
import Leaflet from '../common/leaflet/leaflet';
import { useArea, usePostData } from '../../api';
import { VisibilitySelectorField } from '../common/VisibilitySelector';
import { components } from '../../@types/buldreinfo/swagger';
import { neverGuard } from '../../utils/neverGuard';
import { Checkbox, Input } from 'semantic-ui-react';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import ExternalLinks from '../common/external-links/external-links';

type NewMedia = components['schemas']['NewMedia'] & { file?: File };

type ExternalLink = components['schemas']['ExternalLink'];

type State = Required<
  Pick<
    components['schemas']['Area'],
    | 'accessClosed'
    | 'accessInfo'
    | 'comment'
    | 'forDevelopers'
    | 'id'
    | 'coordinates'
    | 'lockedAdmin'
    | 'lockedSuperadmin'
    | 'name'
    | 'noDogsAllowed'
    | 'sunFromHour'
    | 'sunToHour'
    | 'sectorOrder'
    | 'sectors'
    | 'trash'
    | 'externalLinks'
  >
> & {
  newMedia: NewMedia[];
};

type Update =
  | { action: 'set-data'; data: components['schemas']['Area'] }
  | {
      action: 'set-string';
      key: 'accessInfo' | 'accessClosed' | 'name' | 'comment';
      value: string;
    }
  | {
      action: 'set-boolean';
      key: 'trash' | 'forDevelopers' | 'noDogsAllowed';
      value: boolean;
    }
  | {
      action: 'set-visibility';
      lockedAdmin: boolean;
      lockedSuperadmin: boolean;
    }
  | {
      action: 'set-number';
      key: 'sunFromHour' | 'sunToHour';
      value: number;
    }
  | { action: 'set-coord'; key: 'latitude' | 'longitude'; value: string }
  | { action: 'set-lat-lng'; lat: number; lng: number }
  | { action: 'set-sort'; sectorId: number; sorting: number }
  | { action: 'set-media'; newMedia: NewMedia[] }
  | { action: 'set-external-links'; externalLinks: ExternalLink[] };

const getCoord = (value: string | number) => {
  const str = String(value).replace(',', '.');
  if (isNaN(+str)) {
    return 0;
  }
  return +str;
};

const DEFAULT_STATE: NonNullable<State> = {
  accessClosed: '',
  accessInfo: '',
  comment: '',
  forDevelopers: false,
  id: -1,
  coordinates: { latitude: 0, longitude: 0 },
  lockedAdmin: false,
  lockedSuperadmin: false,
  name: '',
  noDogsAllowed: false,
  sunFromHour: 0,
  sunToHour: 0,
  sectorOrder: [],
  sectors: [],
  trash: false,
  newMedia: [],
  externalLinks: [],
};

const reducer = (state: State, update: Update): State => {
  const { action } = update;
  switch (action) {
    case 'set-data': {
      const { data } = update;
      return {
        ...DEFAULT_STATE,
        ...data,
      };
    }
    case 'set-string': {
      return { ...state, [update.key]: update.value };
    }
    case 'set-visibility': {
      const { lockedAdmin, lockedSuperadmin } = update;
      return { ...state, lockedAdmin, lockedSuperadmin };
    }
    case 'set-number': {
      return { ...state, [update.key]: update.value };
    }
    case 'set-coord': {
      const { key, value } = update;
      const coordinates = state.coordinates || { latitude: 0, longitude: 0 };
      coordinates[key] = getCoord(value as string | number);
      return { ...state, coordinates };
    }
    case 'set-lat-lng': {
      const { lat: latitude, lng: longitude } = update;
      return {
        ...state,
        coordinates: {
          latitude: getCoord(latitude),
          longitude: getCoord(longitude),
        },
      };
    }
    case 'set-sort': {
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
    case 'set-boolean': {
      const { key, value } = update;
      return { ...state, [key]: value };
    }
    case 'set-media': {
      return { ...state, newMedia: update.newMedia };
    }
    case 'set-external-links': {
      return { ...state, externalLinks: update.externalLinks };
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
  save: UseMutateAsyncFunction<components['schemas']['Redirect'], unknown, SavedArea>;
  setString: (
    key: 'accessInfo' | 'accessClosed' | 'name' | 'comment',
  ) => (event: React.ChangeEvent, data: { value?: string | number }) => void;
  setVisibility: ComponentProps<typeof VisibilitySelectorField>['onChange'];
  setNumber: (
    key: 'sunFromHour' | 'sunToHour',
  ) => (event: React.ChangeEvent, data: { value?: number }) => void;
  setCoord: (key: 'latitude' | 'longitude') => ComponentProps<typeof Input>['onChange'];
  setLatLng: ComponentProps<typeof Leaflet>['onMouseClick'];
  setSectorSort: (sectorId: number) => ComponentProps<typeof Input>['onChange'];
  setBoolean: (
    key: 'trash' | 'forDevelopers' | 'noDogsAllowed',
  ) => ComponentProps<typeof Checkbox>['onChange'];
  setNewMedia: ComponentProps<typeof ImageUpload>['onMediaChanged'];
  setExternalLinks: ComponentProps<typeof ExternalLinks>['onExternalLinksUpdated'];
};

export const useAreaEdit: UseAreaEdit = ({ areaId }) => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const { data, status, isLoading } = useArea(areaId);

  useEffect(() => {
    if (status === 'success' && data) {
      dispatch({ action: 'set-data', data });
    }
  }, [data, status]);

  const save = usePostData<SavedArea, components['schemas']['Redirect']>(`/areas`, {
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
      sunFromHour,
      sunToHour,
      name,
      comment,
      coordinates,
      newMedia: media,
      externalLinks,
      sectorOrder,
    }) {
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
          id,
          trash,
          lockedAdmin: !!lockedAdmin,
          lockedSuperadmin: !!lockedSuperadmin,
          forDevelopers,
          accessInfo: accessInfo || '',
          accessClosed: accessClosed || '',
          noDogsAllowed,
          sunFromHour,
          sunToHour,
          name,
          comment,
          coordinates,
          newMedia,
          externalLinks: externalLinks?.filter((l) => l.title && l.url),
          sectorOrder,
        }),
      );
      media.forEach(
        (m) => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file),
      );
      return formData;
    },
    select: (res) => res.json(),
    fetchOptions: {
      headers: {
        Accept: 'application/json',
      },
    },
  });

  return {
    area: state,
    isLoading: areaId > 0 ? isLoading : false,
    isSaving: save.isPending,
    save: save.mutateAsync,
    setString: useCallback(
      (key) =>
        (_, { value }) =>
          dispatch({
            action: 'set-string',
            key,
            value: value ? String(value) : '',
          }),
      [],
    ),
    setVisibility: useCallback(
      ({ lockedAdmin, lockedSuperadmin }) =>
        dispatch({ action: 'set-visibility', lockedAdmin, lockedSuperadmin }),
      [],
    ),
    setNumber: useCallback(
      (key) =>
        (_, { value }) =>
          dispatch({
            action: 'set-number',
            key,
            value: value ? Number(value) : 0,
          }),
      [],
    ),
    setCoord: useCallback(
      (key) =>
        (_, { value }) => {
          dispatch({ action: 'set-coord', key, value });
        },
      [],
    ),
    setLatLng: useCallback(
      (payload: { latlng: { lat: number; lng: number } }) =>
        dispatch({
          action: 'set-lat-lng',
          lat: +(payload.latlng?.lat || 0),
          lng: +(payload.latlng?.lng || 0),
        }),
      [],
    ),
    setSectorSort: useCallback(
      (sectorId: number) =>
        (_, { value }) =>
          dispatch({ action: 'set-sort', sectorId, sorting: +value || 0 }),
      [],
    ),
    setBoolean: useCallback(
      (key) =>
        (_, { checked }) =>
          dispatch({ action: 'set-boolean', key, value: !!checked }),
      [],
    ),
    setNewMedia: useCallback((newMedia) => dispatch({ action: 'set-media', newMedia }), []),
    setExternalLinks: useCallback(
      (externalLinks) => dispatch({ action: 'set-external-links', externalLinks }),
      [],
    ),
  };
};
