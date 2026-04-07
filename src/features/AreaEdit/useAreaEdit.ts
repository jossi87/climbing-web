import { useEffect, useReducer, useCallback } from 'react';
import { useArea, usePostData } from '../../api';
import type { components } from '../../@types/buldreinfo/swagger';
import { neverGuard } from '../../utils/neverGuard';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';

type NewMedia = components['schemas']['NewMedia'] & { file?: File };
type ExternalLink = components['schemas']['ExternalLink'];
type Redirect = components['schemas']['Redirect'];

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
      value: number | undefined;
    }
  | { action: 'set-coord'; key: 'latitude' | 'longitude'; value: string | number }
  | { action: 'set-lat-lng'; lat: number; lng: number }
  | { action: 'set-sort'; sectorId: number; sorting: number }
  | { action: 'set-media'; newMedia: NewMedia[] }
  | { action: 'set-external-links'; externalLinks: ExternalLink[] };

const getCoordValue = (value: string | number): number => {
  const str = String(value).replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

const DEFAULT_STATE: State = {
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
  switch (update.action) {
    case 'set-data':
      return { ...DEFAULT_STATE, ...update.data, newMedia: [] };
    case 'set-string':
      return { ...state, [update.key]: update.value };
    case 'set-visibility':
      return {
        ...state,
        lockedAdmin: update.lockedAdmin,
        lockedSuperadmin: update.lockedSuperadmin,
      };
    case 'set-number':
      return { ...state, [update.key]: update.value ?? 0 };
    case 'set-coord':
      return {
        ...state,
        coordinates: {
          ...state.coordinates,
          [update.key]: getCoordValue(update.value),
        },
      };
    case 'set-lat-lng':
      return {
        ...state,
        coordinates: {
          latitude: getCoordValue(update.lat),
          longitude: getCoordValue(update.lng),
        },
      };
    case 'set-sort':
      return {
        ...state,
        sectorOrder: state.sectorOrder.map((order) =>
          order.id === update.sectorId ? { ...order, sorting: update.sorting } : order,
        ),
      };
    case 'set-boolean':
      return { ...state, [update.key]: update.value };
    case 'set-media':
      return { ...state, newMedia: update.newMedia };
    case 'set-external-links':
      return { ...state, externalLinks: update.externalLinks };
    default:
      return neverGuard(update, state);
  }
};

export const useAreaEdit = ({ areaId }: { areaId: number }) => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const { data, status, isLoading } = useArea(areaId);

  useEffect(() => {
    if (status === 'success' && data) {
      dispatch({ action: 'set-data', data });
    }
  }, [data, status]);

  const saveMutation = usePostData<State, Redirect>(`/areas`, {
    mutationKey: [`/areas`, { id: areaId }],
    createBody(area) {
      const formData = new FormData();
      const sanitizedMedia = area.newMedia.map((m) => ({
        name: m.file?.name.replace(/[^-a-z0-9.]/gi, '_'),
        photographer: m.photographer,
        inPhoto: m.inPhoto,
        description: m.description,
        trivia: m.trivia,
        embedVideoUrl: m.embedVideoUrl,
        embedThumbnailUrl: m.embedThumbnailUrl,
        embedMilliseconds: m.embedMilliseconds,
      }));

      formData.append(
        'json',
        JSON.stringify({
          ...area,
          lockedAdmin: !!area.lockedAdmin,
          lockedSuperadmin: !!area.lockedSuperadmin,
          accessInfo: area.accessInfo || '',
          accessClosed: area.accessClosed || '',
          externalLinks: area.externalLinks?.filter((l) => l.title && l.url),
          newMedia: sanitizedMedia,
        }),
      );

      area.newMedia.forEach((m) => {
        if (m.file) {
          formData.append(m.file.name.replace(/[^-a-z0-9.]/gi, '_'), m.file);
        }
      });
      return formData;
    },
    select: (res) => res.json(),
    fetchOptions: {
      headers: { Accept: 'application/json' },
      consistencyAction: 'nop',
    },
  });

  return {
    area: state,
    isLoading: areaId > 0 ? isLoading : false,
    isSaving: saveMutation.isPending,
    save: saveMutation.mutateAsync as UseMutateAsyncFunction<Redirect, unknown, State>,
    setString: useCallback(
      (key: 'accessInfo' | 'accessClosed' | 'name' | 'comment') => (_: unknown, d: { value?: string | number }) =>
        dispatch({ action: 'set-string', key, value: d.value ? String(d.value) : '' }),
      [],
    ),
    setVisibility: useCallback(
      ({ lockedAdmin, lockedSuperadmin }: { lockedAdmin: boolean; lockedSuperadmin: boolean }) =>
        dispatch({ action: 'set-visibility', lockedAdmin, lockedSuperadmin }),
      [],
    ),
    setNumber: useCallback(
      (key: 'sunFromHour' | 'sunToHour') => (_: unknown, d: { value?: number }) =>
        dispatch({ action: 'set-number', key, value: d.value ? Number(d.value) : undefined }),
      [],
    ),
    setCoord: useCallback(
      (key: 'latitude' | 'longitude') => (_: unknown, d: { value?: string | number }) =>
        dispatch({ action: 'set-coord', key, value: d.value ?? '' }),
      [],
    ),
    setLatLng: useCallback(
      (payload: { latlng: { lat: number; lng: number } }) =>
        dispatch({
          action: 'set-lat-lng',
          lat: payload.latlng?.lat || 0,
          lng: payload.latlng?.lng || 0,
        }),
      [],
    ),
    setSectorSort: useCallback(
      (sectorId: number) => (_: unknown, d: { value?: string | number }) =>
        dispatch({ action: 'set-sort', sectorId, sorting: Number(d.value) || 0 }),
      [],
    ),
    setBoolean: useCallback(
      (key: 'trash' | 'forDevelopers' | 'noDogsAllowed') => (_: unknown, d: { checked?: boolean }) =>
        dispatch({ action: 'set-boolean', key, value: !!d.checked }),
      [],
    ),
    setNewMedia: useCallback((newMedia: NewMedia[]) => dispatch({ action: 'set-media', newMedia }), []),
    setExternalLinks: useCallback(
      (externalLinks: ExternalLink[]) => dispatch({ action: 'set-external-links', externalLinks }),
      [],
    ),
  };
};
