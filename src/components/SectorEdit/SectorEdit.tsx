import React, { useState, ComponentProps, useCallback } from 'react';
import ImageUpload from '../common/image-upload/image-upload';
import { Loading } from '../common/widgets/widgets';
import {
  Checkbox,
  Form,
  Dropdown,
  Button,
  Input,
  TextArea,
  Segment,
  Accordion,
  Icon,
  Message,
} from 'semantic-ui-react';
import { useMeta } from '../common/meta';
import { postSector, useAccessToken, useArea, useElevation, useSector } from '../../api';
import Leaflet from '../common/leaflet/leaflet';
import { useNavigate, useParams } from 'react-router-dom';
import { VisibilitySelectorField } from '../common/VisibilitySelector';
import { components } from '../../@types/buldreinfo/swagger';
import { ProblemOrder } from './ProblemOrder';
import { PolylineEditor } from './PolylineEditor';
import { ZoomLogic } from './ZoomLogic';
import { PolylineMarkers } from './PolylineMarkers';
import { captureMessage } from '@sentry/react';
import { hours } from '../../utils/hours';
import ExternalLinks from '../common/external-links/external-links';

type Area = components['schemas']['Area'];
type Sector = components['schemas']['Sector'];

const useIds = (): { areaId: number; sectorId: number } => {
  const { sectorId, areaId } = useParams();
  if (!sectorId) {
    throw new Error('Missing sectorId parameter');
  }

  if (!areaId) {
    throw new Error('Missing areaId parameter');
  }

  return { sectorId: +sectorId, areaId: +areaId };
};

export const SectorEditLoader = () => {
  const { areaId, sectorId } = useIds();
  const { data: area } = useArea(areaId);
  const { data: sector, error } = useSector(sectorId);

  if (error) {
    return (
      <Message
        size='huge'
        style={{ backgroundColor: '#FFF' }}
        icon='meh'
        header='404'
        content={
          'Cannot find the specified sector because it does not exist or you do not have sufficient permissions.'
        }
      />
    );
  }

  if (!area) {
    return <Loading />;
  }

  const value =
    sector ??
    ({
      areaId,
      id: -1,
      lockedAdmin: area.lockedAdmin,
      lockedSuperadmin: area.lockedSuperadmin,
      name: '',
      comment: '',
      accessInfo: '',
      accessClosed: '',
      parking: undefined,
      newMedia: [],
      problemOrder: [],
    } satisfies Sector);

  return <SectorEdit key={value.id} sector={value} area={area} />;
};

type Props = {
  sector: Sector;
  area: Area;
};

type OnChange = (_: unknown, { value }: { value: string }) => void;

export const SectorEdit = ({ sector, area }: Props) => {
  const navigate = useNavigate();
  const meta = useMeta();
  const accessToken = useAccessToken();
  const { areaId, sectorId } = useIds();
  const [leafletMode, setLeafletMode] = useState('PARKING');
  const { elevation, setLocation } = useElevation();

  const [data, setData] = useState<Sector>(sector);

  const [showProblemOrder, setShowProblemOrder] = useState(false);
  const [sectorMarkers, setSectorMarkers] = useState<ComponentProps<typeof Leaflet>['markers']>([]);

  const [saving, setSaving] = useState(false);

  let defaultCenter;
  let defaultZoom;
  if (data.parking?.latitude && data.parking?.longitude) {
    defaultCenter = { lat: data.parking.latitude, lng: data.parking.longitude };
    defaultZoom = 14;
  } else if (area.coordinates?.latitude && area.coordinates?.longitude) {
    defaultCenter = {
      lat: area.coordinates.latitude,
      lng: area.coordinates.longitude,
    };
    defaultZoom = 14;
  } else {
    defaultCenter = meta.defaultCenter;
    defaultZoom = meta.defaultZoom;
  }

  const onNameChanged: OnChange = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, name: value }));
  }, []);

  const onWallDirectionManualIdChanged: OnChange = useCallback(
    (_, { value }) => {
      const compassDirectionId = +value;
      const wallDirectionManual =
        compassDirectionId == 0
          ? undefined
          : meta.compassDirections.filter((cd) => cd.id === compassDirectionId)[0];
      setData((prevState) => ({ ...prevState, wallDirectionManual }));
    },
    [meta.compassDirections],
  );

  const onLockedChanged = useCallback(
    ({
      lockedAdmin,
      lockedSuperadmin,
    }: Required<Pick<Sector, 'lockedAdmin' | 'lockedSuperadmin'>>) => {
      setData((prevState) => ({
        ...prevState,
        lockedAdmin,
        lockedSuperadmin,
      }));
    },
    [],
  );

  const onSunFromHourChanged: OnChange = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, sunFromHour: +value }));
  }, []);

  const onSunToHourChanged: OnChange = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, sunToHour: +value }));
  }, []);

  const onCommentChanged: OnChange = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, comment: value }));
  }, []);

  const onAccessInfoChanged: OnChange = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, accessInfo: value }));
  }, []);

  const onAccessClosedChanged: OnChange = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, accessClosed: value }));
  }, []);

  const onExternalLinksUpdated = useCallback(
    (externalLinks: components['schemas']['ExternalLink'][]) => {
      setData((prevState) => ({ ...prevState, externalLinks: externalLinks }));
    },
    [],
  );

  const onNewMediaChanged = useCallback((newMedia: Sector['newMedia']) => {
    setData((prevState) => ({ ...prevState, newMedia }));
  }, []);

  const save = (event: React.UIEvent) => {
    event.preventDefault();
    const trash = !!data.trash;
    if (!trash || confirm('Are you sure you want to move sector to trash?')) {
      setSaving(true);
      postSector(
        accessToken,
        areaId,
        sectorId,
        !!data.trash,
        !!data.lockedAdmin,
        !!data.lockedSuperadmin,
        data.name ?? '',
        data.comment ?? '',
        data.accessInfo ?? '',
        data.accessClosed ?? '',
        data.sunFromHour ?? 0,
        data.sunToHour ?? 0,
        data.parking ?? ({} as components['schemas']['Coordinates']),
        data.outline ?? [],
        data.wallDirectionManual ?? ({} as components['schemas']['CompassDirection']),
        data.approach ?? {},
        data.descent ?? {},
        data.externalLinks ?? [],
        data.newMedia ?? [],
        data.problemOrder,
      )
        .then(async (res) => {
          if (!res.destination) {
            captureMessage('Missing res.destination');
            navigate(-1);
          } else {
            navigate(res.destination);
          }
        })
        .catch((error) => {
          console.warn(error);
        });
    }
  };

  const onMapMouseClick: ComponentProps<typeof Leaflet>['onMouseClick'] = (event) => {
    if (leafletMode == 'PARKING') {
      setData((prevState) => ({
        ...prevState,
        parking: {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        },
      }));
    } else if (leafletMode == 'POLYGON') {
      const outline = data.outline || [];
      outline.push({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
      setData((prevState) => ({ ...prevState, outline }));
    } else if (leafletMode == 'APPROACH') {
      const coordinates = data.approach?.coordinates || [];
      coordinates.push({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
      setData((prevState) => ({ ...prevState, approach: { coordinates } }));
    } else if (leafletMode == 'DESCENT') {
      const coordinates = data.descent?.coordinates || [];
      coordinates.push({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
      setData((prevState) => ({ ...prevState, descent: { coordinates } }));
    }
  };

  const onMouseMove: NonNullable<ComponentProps<typeof Leaflet>['onMouseMove']> = useCallback(
    (event) => {
      if (leafletMode == 'POLYGON') {
        setLocation(event.latlng);
      }
    },
    [leafletMode, setLocation],
  );

  function clearDrawing() {
    if (leafletMode == 'PARKING') {
      setData((prevState) => ({ ...prevState, parking: undefined }));
    } else if (leafletMode == 'POLYGON') {
      setData((prevState) => ({ ...prevState, outline: undefined }));
    } else if (leafletMode == 'APPROACH') {
      setData((prevState) => ({ ...prevState, approach: undefined }));
    } else if (leafletMode == 'DESCENT') {
      setData((prevState) => ({ ...prevState, descent: undefined }));
    }
  }

  const onLatChanged: OnChange = useCallback((_, { value }) => {
    let lat = parseFloat(value.replace(',', '.'));
    if (isNaN(lat)) {
      lat = 0;
    }
    setData((prevState) => ({
      ...prevState,
      parking: {
        longitude: 0,
        ...prevState.parking,
        latitude: lat,
      },
    }));
  }, []);

  const onLngChanged: OnChange = useCallback((_, { value }) => {
    let lng = parseFloat(value.replace(',', '.'));
    if (isNaN(lng)) {
      lng = 0;
    }
    setData((prevState) => ({
      ...prevState,
      parking: {
        latitude: 0,
        ...prevState.parking,
        longitude: lng,
      },
    }));
  }, []);

  const outlines: ComponentProps<typeof Leaflet>['outlines'] = [];
  const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];
  area.sectors?.forEach((sector) => {
    if (sector.id != data.id) {
      if (sector.outline?.length) {
        outlines.push({
          outline: sector.outline,
          background: true,
          label: sector.name,
        });
      }
      if (sector.approach?.coordinates?.length) {
        slopes.push({
          slope: sector.approach,
          backgroundColor: 'lime',
          background: true,
        });
      }
      if (sector.descent?.coordinates?.length) {
        slopes.push({
          slope: sector.descent,
          backgroundColor: 'purple',
          background: true,
        });
      }
    }
  });

  if (data.outline?.length) {
    outlines.push({ outline: data.outline, background: false });
  }
  if (data.approach?.coordinates?.length) {
    slopes.push({
      slope: data.approach,
      backgroundColor: 'lime',
      background: false,
    });
  }
  if (data.descent?.coordinates?.length) {
    slopes.push({
      slope: data.descent,
      backgroundColor: 'purple',
      background: false,
    });
  }

  const markers: ComponentProps<typeof Leaflet>['markers'] = [];
  if (data.parking) {
    markers.push({
      coordinates: data.parking,
      isParking: true,
    });
  }
  if (sectorMarkers) {
    markers.push(...sectorMarkers);
  }

  return (
    <>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>
      <Message
        size='tiny'
        content={
          <>
            <Icon name='info' />
            Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want to
            move or split sector.
          </>
        }
      />
      <Form>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Field
              label='Sector name'
              control={Input}
              placeholder='Enter name'
              value={data.name}
              onChange={onNameChanged}
              error={data.name ? false : 'Sector name required'}
            />
            {meta.isClimbing && (
              <Form.Field
                label='Wall direction'
                control={Dropdown}
                selection
                value={data.wallDirectionManual?.id || 0}
                onChange={onWallDirectionManualIdChanged}
                options={[
                  {
                    key: 0,
                    value: 0,
                    text: data.wallDirectionCalculated
                      ? `${data.wallDirectionCalculated.direction} (calculated from outline)`
                      : '<calculate from outline>',
                  },
                  ...meta.compassDirections.map((cd) => {
                    return { key: cd.id, value: cd.id, text: cd.direction };
                  }),
                ]}
              />
            )}
            <VisibilitySelectorField
              label='Visibility'
              selection
              value={{
                lockedAdmin: !!data.lockedAdmin,
                lockedSuperadmin: !!data.lockedSuperadmin,
              }}
              onChange={onLockedChanged}
            />
            <Form.Field>
              <label>Move to trash</label>
              <Checkbox
                disabled={!data.id || data.id <= 0}
                toggle
                checked={data.trash}
                onChange={() =>
                  setData((prevState) => ({
                    ...prevState,
                    trash: !data.trash,
                  }))
                }
              />
            </Form.Field>
          </Form.Group>
          {meta.isClimbing && (
            <Form.Group widths='equal'>
              <Form.Field
                label='Sun from hour'
                control={Dropdown}
                selection
                value={data.sunFromHour}
                onChange={onSunFromHourChanged}
                options={hours}
                error={
                  (!data.sunFromHour && !data.sunToHour) || (data.sunFromHour && data.sunToHour)
                    ? false
                    : 'Sun from and to hour must both be empty or set'
                }
              />
              <Form.Field
                label='Sun to hour'
                control={Dropdown}
                selection
                value={data.sunToHour}
                onChange={onSunToHourChanged}
                options={hours}
                error={
                  (!data.sunFromHour && !data.sunToHour) || (data.sunFromHour && data.sunToHour)
                    ? false
                    : 'Sun from and to hour must both be empty or set'
                }
              />
            </Form.Group>
          )}
          <Form.Field
            label={
              <label htmlFor='description'>
                Description (supports&nbsp;
                <a
                  href='https://jonschlinkert.github.io/remarkable/demo/'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  markdown
                </a>
                &nbsp;formatting)
              </label>
            }
            control={TextArea}
            placeholder='Enter description'
            style={{ minHeight: 100 }}
            value={data.comment}
            onChange={onCommentChanged}
          />
          <Form.Field>
            <Input
              label='Sector closed:'
              placeholder='Enter closed-reason...'
              value={data.accessClosed}
              onChange={onAccessClosedChanged}
              icon='attention'
            />
          </Form.Field>
          <Form.Field>
            <Input
              label='Sector restrictions:'
              placeholder='Enter specific restrictions...'
              value={data.accessInfo}
              onChange={onAccessInfoChanged}
            />
          </Form.Field>
        </Segment>

        <ExternalLinks
          externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
          onExternalLinksUpdated={onExternalLinksUpdated}
        />

        <Segment>
          <Form.Field>
            <label>Upload image(s)</label>
            <ImageUpload onMediaChanged={onNewMediaChanged} isMultiPitch={false} />
          </Form.Field>
        </Segment>

        <Segment>
          <Form.Group widths='equal'>
            <Form.Field>
              <Button.Group size='tiny' compact>
                <Button
                  positive={leafletMode == 'PARKING'}
                  onClick={() => setLeafletMode('PARKING')}
                >
                  Parking
                </Button>
                <Button
                  positive={leafletMode == 'POLYGON'}
                  onClick={() => setLeafletMode('POLYGON')}
                >
                  Outline
                </Button>
                <Button
                  positive={leafletMode == 'APPROACH'}
                  onClick={() => setLeafletMode('APPROACH')}
                >
                  Approach
                </Button>
                <Button
                  positive={leafletMode == 'DESCENT'}
                  onClick={() => setLeafletMode('DESCENT')}
                >
                  Descent
                </Button>
                <Button color='orange' onClick={clearDrawing}>
                  Reset selected
                </Button>
              </Button.Group>
            </Form.Field>
            <Form.Field>
              <Button
                size='tiny'
                compact
                positive={sectorMarkers != null}
                onClick={() => {
                  if (sectorMarkers == null) {
                    if (sectorId) {
                      setSectorMarkers(
                        data.problems
                          ?.filter(
                            (p): p is Required<Pick<typeof p, 'coordinates' | 'name'>> =>
                              !!p.coordinates,
                          )
                          .map((p) => ({
                            coordinates: p.coordinates,
                            label: p.name,
                          })),
                      );
                    }
                  } else {
                    setSectorMarkers([]);
                  }
                }}
              >
                Include all markers in sector
              </Button>
            </Form.Field>
          </Form.Group>
          <Form.Group widths='equal'>
            <Form.Field>
              <Leaflet
                markers={markers}
                outlines={outlines}
                slopes={slopes}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onMouseClick={onMapMouseClick}
                onMouseMove={onMouseMove}
                height={'300px'}
                showSatelliteImage={meta.isBouldering}
                clusterMarkers={false}
                rocks={undefined}
                flyToId={null}
              >
                <ZoomLogic area={area} sector={data} />
                {leafletMode === 'POLYGON' && <PolylineMarkers coordinates={data.outline ?? []} />}
                {leafletMode === 'APPROACH' && (
                  <PolylineMarkers coordinates={data.approach?.coordinates ?? []} />
                )}
                {leafletMode === 'DESCENT' && (
                  <PolylineMarkers coordinates={data.descent?.coordinates ?? []} />
                )}
              </Leaflet>
            </Form.Field>
          </Form.Group>
          <Form.Group widths='equal'>
            {leafletMode === 'PARKING' && (
              <>
                <Form.Field>
                  <label>Latitude</label>
                  <Input
                    placeholder='Latitude'
                    value={data.parking?.latitude ?? ''}
                    onChange={onLatChanged}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Longitude</label>
                  <Input
                    placeholder='Longitude'
                    value={data.parking?.longitude ?? ''}
                    onChange={onLngChanged}
                  />
                </Form.Field>
              </>
            )}
            {leafletMode === 'POLYGON' && (
              <Form.Field>
                <label>{['Outline', elevation].filter(Boolean).join(' ')}</label>
                <PolylineEditor
                  coordinates={data.outline ?? []}
                  parking={data.parking ?? {}}
                  onChange={(coordinates) => {
                    setData((prevState) => ({
                      ...prevState,
                      outline: coordinates,
                    }));
                  }}
                />
              </Form.Field>
            )}
            {leafletMode === 'APPROACH' && (
              <Form.Field>
                <label>Approach</label>
                <PolylineEditor
                  coordinates={data.approach?.coordinates ?? []}
                  parking={data.parking ?? {}}
                  onChange={(coordinates) => {
                    setData((prevState) => ({
                      ...prevState,
                      approach: { coordinates },
                    }));
                  }}
                  upload
                />
              </Form.Field>
            )}
            {leafletMode === 'DESCENT' && (
              <Form.Field>
                <label>Descent</label>
                <PolylineEditor
                  coordinates={data.descent?.coordinates ?? []}
                  parking={data.parking ?? {}}
                  onChange={(coordinates) => {
                    setData((prevState) => ({
                      ...prevState,
                      descent: { coordinates },
                    }));
                  }}
                  upload
                />
              </Form.Field>
            )}
          </Form.Group>
        </Segment>

        {(data.problemOrder?.length ?? 0) > 1 && (
          <Segment>
            <Accordion>
              <Accordion.Title
                active={showProblemOrder}
                onClick={() => setShowProblemOrder(!showProblemOrder)}
              >
                <Icon name='dropdown' />
                Change order of problems in sector
              </Accordion.Title>
              <Accordion.Content
                active={showProblemOrder}
                content={
                  <ProblemOrder
                    problemOrder={data.problemOrder}
                    onChange={(problemOrder) =>
                      setData((prevValue) => ({ ...prevValue, problemOrder }))
                    }
                  />
                }
              />
            </Accordion>
          </Segment>
        )}

        <Button.Group>
          <Button
            negative
            onClick={() => {
              if (sectorId) {
                navigate(`/sector/${sectorId}`);
              } else {
                navigate(`/area/${areaId}`);
              }
            }}
          >
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            loading={saving}
            onClick={save}
            disabled={Boolean(
              !data.name ||
                (data.sunFromHour && !data.sunToHour) ||
                (!data.sunFromHour && data.sunToHour),
            )}
          >
            Save sector
          </Button>
        </Button.Group>
      </Form>
    </>
  );
};
