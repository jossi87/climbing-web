import { useState, useCallback, ComponentProps, UIEvent } from 'react';
import { UsersSelector } from './common/user-selector/user-selector';
import RockSelector from './common/rock-selector/rock-selector';
import ProblemSection from './common/problem-section/problem-section';
import ImageUpload from './common/image-upload/image-upload';
import {
  Icon,
  Form,
  Button,
  Input,
  Dropdown,
  TextArea,
  Segment,
  Message,
  Container,
  Checkbox,
} from 'semantic-ui-react';
import Leaflet from './common/leaflet/leaflet';
import { useMeta } from './common/meta/context';
import {
  convertFromDateToString,
  convertFromStringToDate,
  postProblem,
  useAccessToken,
  useSector,
  useProblem,
} from '../api';
import { Loading } from './common/widgets/widgets';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { VisibilitySelectorField } from './common/VisibilitySelector';
import { useQueryClient } from '@tanstack/react-query';
import { components } from '../@types/buldreinfo/swagger';
import { captureException, captureMessage } from '@sentry/react';
import ExternalLinks from './common/external-links/external-links';

type Problem = components['schemas']['Problem'];

const useIds = (): { sectorId: number; problemId: number } => {
  const { sectorId, problemId } = useParams();
  if (!sectorId) {
    throw new Error('Missing sectorId param');
  }

  if (!problemId) {
    throw new Error('Missing problemId param');
  }

  return { sectorId: +sectorId, problemId: +problemId };
};

const ProblemEditLoader = () => {
  const { sectorId, problemId } = useIds();
  const { data: sector } = useSector(sectorId);
  const { data: problem, status: problemStatus, error } = useProblem(problemId, true);

  if (error) {
    return (
      <Message
        size='huge'
        style={{ backgroundColor: '#FFF' }}
        icon='meh'
        header='404'
        content={
          'Cannot find the specified problem because it does not exist or you do not have sufficient permissions.'
        }
      />
    );
  }

  if (!sector) {
    return <Loading />;
  }

  if (problemStatus === 'pending' && problemId < 0) {
    return <Loading />;
  }

  const prob =
    problem ??
    ({
      id: -1,
      areaId: sector.areaId ?? 0,
      sectorId,
      broken: undefined,
      lockedAdmin: !!sector.lockedAdmin,
      lockedSuperadmin: !!sector.lockedSuperadmin,
      name: '',
      comment: '',
      rock: undefined,
      originalGrade: 'n/a',
      fa: [],
      faDate: convertFromDateToString(new Date()),
      nr: 0,
      coordinates: undefined,
      trivia: '',
      startingAltitude: '',
      aspect: '',
      routeLength: '',
      descent: '',
      newMedia: [],
    } satisfies Problem);

  return <ProblemEdit key={prob.id} problem={prob} sector={sector} />;
};

type Props = {
  problem: Problem;
  sector: components['schemas']['Sector'];
};

type OnChange<V> = (_: unknown, { value }: { value: V }) => void;

type SectorProblem = NonNullable<components['schemas']['Sector']['problems']>[number];
const isPlottableProblem = (
  problem: SectorProblem,
): problem is Required<Pick<SectorProblem, 'coordinates' | 'name'>> => {
  return problem.coordinates !== undefined && problem.name !== undefined;
};

const ProblemEdit = ({ problem, sector }: Props) => {
  const client = useQueryClient();
  const accessToken = useAccessToken();
  const { sectorId, problemId } = useIds();

  const [data, setData] = useState<Problem>(problem);

  const [showSectorMarkers, setShowSectorMarkers] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const meta = useMeta();

  const onNameChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, name: value }));
  }, []);

  const onNrChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, nr: +value }));
  }, []);

  const onLatChanged: OnChange<string> = useCallback((_, { value }) => {
    let lat = parseFloat(value.replace(',', '.'));
    if (isNaN(lat)) {
      lat = 0;
    }
    setData((prevState) => ({
      ...prevState,
      coordinates: { longitude: 0, ...prevState.coordinates, latitude: lat },
    }));
  }, []);

  const onLngChanged: OnChange<string> = useCallback((_, { value }) => {
    let lng = parseFloat(value.replace(',', '.'));
    if (isNaN(lng)) {
      lng = 0;
    }
    setData((prevState) => ({
      ...prevState,
      coordinates: { latitude: 0, ...prevState.coordinates, longitude: lng },
    }));
  }, []);

  const onLockedChanged = useCallback(
    ({
      lockedAdmin,
      lockedSuperadmin,
    }: Required<Pick<Problem, 'lockedAdmin' | 'lockedSuperadmin'>>) => {
      setData((prevState) => ({
        ...prevState,
        lockedAdmin,
        lockedSuperadmin,
      }));
    },
    [],
  );

  const onRockChanged = useCallback((rock: NonNullable<Problem['rock']>) => {
    setData((prevState) => ({ ...prevState, rock }));
  }, []);

  const onCommentChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, comment: value }));
  }, []);

  const onFaDateChanged = useCallback((newFaDate: Date | undefined) => {
    setData((prevState) => ({
      ...prevState,
      faDate: newFaDate ? convertFromDateToString(newFaDate) : undefined,
    }));
  }, []);

  const onOriginalGradeChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, originalGrade: value }));
  }, []);

  const onTypeIdChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({
      ...prevState,
      t: {
        ...prevState.t,
        id: +value,
      },
    }));
  }, []);

  const onExternalLinksUpdated = useCallback(
    (externalLinks: components['schemas']['ExternalLink'][]) => {
      setData((prevState) => ({ ...prevState, externalLinks: externalLinks }));
    },
    [],
  );

  const onNewMediaChanged: ComponentProps<typeof ImageUpload>['onMediaChanged'] = useCallback(
    (newMedia) => {
      setData((prevState) => ({ ...prevState, newMedia }));
    },
    [],
  );

  const onFaAidDateChanged = useCallback((newFaDate: Date | null) => {
    setData((prevState) => ({
      ...prevState,
      faAid: {
        ...prevState.faAid,
        date: newFaDate ? convertFromDateToString(newFaDate) : undefined,
      },
    }));
  }, []);

  const onFaAidDescriptionChanged: NonNullable<ComponentProps<typeof TextArea>['onChange']> =
    useCallback((_, { value }) => {
      setData((prevState) => ({
        ...prevState,
        faAid: {
          ...prevState.faAid,
          description: String(value ?? ''),
        },
      }));
    }, []);

  const onFaAidUsersUpdated: ComponentProps<typeof UsersSelector>['onUsersUpdated'] = useCallback(
    (newUsers) => {
      const fa = newUsers.map((u) => {
        return {
          id: typeof u.value === 'string' ? -1 : u.value,
          name: u.label,
        };
      });
      setData((prevState) => ({
        ...prevState,
        faAid: {
          ...prevState.faAid,
          users: fa,
        },
      }));
    },
    [],
  );

  const onBrokenChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, broken: value }));
  }, []);

  const onTriviaChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, trivia: value }));
  }, []);

  const onStartingAltitudeChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, startingAltitude: value }));
  }, []);

  const onAspectChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, aspect: value }));
  }, []);

  const onRouteLengthChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, routeLength: value }));
  }, []);

  const onDescentChanged: OnChange<string> = useCallback((_, { value }) => {
    setData((prevState) => ({ ...prevState, descent: value }));
  }, []);

  const save = useCallback(
    async (event: UIEvent, data: Problem): Promise<string | false> => {
      event.preventDefault();
      const trash = !!data.trash;
      if (trash) {
        if (!confirm('Are you sure you want to move this problem/route to trash?')) {
          captureMessage('Decided to not delete problem', {
            extra: {
              problemId,
              sectorId,
            },
          });
          return false;
        }

        // Fall through here so that we continue saving.
      }
      setSaving(true);

      // If the item is being moved to the trash, remove the query so that the
      // mutation doesn't trigger an immediate fetch of the now-deleted item.
      // This is handled fine by the client, but it's extra chatter for the
      // service that we can easily avoid.
      if (data.trash) {
        client.removeQueries({
          queryKey: [`/problem`, { id: data.id }],
        });
      }

      try {
        const res = await postProblem(
          accessToken,
          sectorId,
          problemId,
          data.broken ?? '',
          !!data.trash,
          !!data.lockedAdmin,
          !!data.lockedSuperadmin,
          data.name ?? '',
          data.rock ?? '',
          data.comment ?? '',
          data.originalGrade ?? '',
          data.fa,
          data.faDate ?? '',
          data.nr ?? 0,
          data.t?.id ? meta.types.find((t) => t.id === data.t?.id) || meta.types[0] : meta.types[0],
          data.coordinates ?? ({} as components['schemas']['Coordinates']),
          data.sections,
          data.newMedia ?? [],
          data.faAid,
          data.trivia ?? '',
          data.externalLinks ?? [],
          data.startingAltitude ?? '',
          data.aspect ?? '',
          data.routeLength ?? '',
          data.descent ?? '',
        );
        return res.destination ?? '';
      } catch (error) {
        console.warn(error);
        captureException(error);
        return false;
      }
    },
    [accessToken, client, meta.types, problemId, sectorId],
  );

  const onMapClick: NonNullable<ComponentProps<typeof Leaflet>['onMouseClick']> = useCallback(
    (event) => {
      setData((prevState) => ({
        ...prevState,
        coordinates: {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        },
      }));
    },
    [],
  );

  const onUsersUpdated: ComponentProps<typeof UsersSelector>['onUsersUpdated'] = useCallback(
    (newUsers) => {
      const fa = newUsers.map((u) => {
        return {
          id: typeof u.value === 'string' ? -1 : u.value,
          name: u.label,
        };
      });
      setData((prevState) => ({ ...prevState, fa }));
    },
    [],
  );

  const onSectionsUpdated: ComponentProps<typeof ProblemSection>['onSectionsUpdated'] = useCallback(
    (sections) => {
      setData((prevState) => ({ ...prevState, sections }));
    },
    [],
  );

  let defaultCenter: { lat: number; lng: number };
  let defaultZoom: number;
  if (data.coordinates?.latitude && data.coordinates?.longitude) {
    defaultCenter = {
      lat: data.coordinates.latitude,
      lng: data.coordinates.longitude,
    };
    defaultZoom = 15;
  } else if (sector.parking?.latitude && sector.parking?.longitude) {
    defaultCenter = {
      lat: sector.parking.latitude,
      lng: sector.parking.longitude,
    };
    defaultZoom = 15;
  } else {
    defaultCenter = meta.defaultCenter;
    defaultZoom = meta.defaultZoom;
  }

  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> = [];
  if (data.coordinates) {
    markers.push({
      coordinates: data.coordinates,
    });
  }
  if (showSectorMarkers && sector.problems?.length) {
    markers.push(
      ...sector.problems
        .filter((p) => p.id !== problemId)
        .filter(isPlottableProblem)
        .map((p) => ({
          coordinates: p.coordinates,
          label: p.name ?? '',
        })),
    );
  }
  const sectorRocks =
    sector.problems
      ?.filter((p) => p.rock)
      ?.map((p) => p.rock)
      ?.filter((value, index, self) => self.indexOf(value) === index)
      ?.sort() ?? [];

  return (
    <>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>
      <Message
        size='tiny'
        content={
          <>
            <Icon name='info' />
            Contact <a href='mailto:jostein.oygarden@gmail.com'>Jostein Øygarden</a> if you want to
            move {meta.isBouldering ? 'problem' : 'route'} to an other sector.
          </>
        }
      />
      <Form>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Field
              label='Name'
              control={Input}
              placeholder='Enter name'
              value={data.name}
              onChange={onNameChanged}
              error={data.name ? false : 'Name required'}
            />
            <VisibilitySelectorField
              label='Visibility'
              selection
              value={{
                lockedAdmin: !!data.lockedAdmin,
                lockedSuperadmin: !!data.lockedSuperadmin,
              }}
              onChange={onLockedChanged}
            />
            <Form.Field
              label='Number'
              control={Input}
              placeholder='Enter number'
              value={data.nr}
              onChange={onNrChanged}
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
          <Form.Group widths='equal'>
            <Form.Field
              label='Grade'
              control={Dropdown}
              selection
              value={data.originalGrade}
              onChange={onOriginalGradeChanged}
              options={meta.grades.map((g, i) => ({
                key: i,
                value: g.grade,
                text: g.grade,
              }))}
              error={data.originalGrade ? false : 'grade required'}
            />
            <Form.Field>
              <label>FA User(s)</label>
              <UsersSelector
                placeholder='Select user(s)'
                users={data.fa ?? []}
                onUsersUpdated={onUsersUpdated}
              />
            </Form.Field>
            <Form.Field>
              <label>FA Date</label>
              <DatePicker
                placeholderText='Click to select a date'
                dateFormat='dd-MM-yyyy'
                isClearable
                showMonthDropdown
                showYearDropdown
                dropdownMode='select'
                selected={data.faDate ? convertFromStringToDate(data.faDate) : undefined}
                onChange={(date: Date | null) => onFaDateChanged(date ?? undefined)}
              />
            </Form.Field>
            {meta.isBouldering ? (
              <Form.Field
                label='Rock (this field is optional, use to group boulders by rock in sector)'
                control={RockSelector}
                placeholder='Add rock'
                rock={data.rock}
                onRockUpdated={onRockChanged}
                rocks={sectorRocks}
                identity={null}
              />
            ) : (
              <Form.Field />
            )}
          </Form.Group>
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
          <Form.Field
            label={
              <label htmlFor='description'>
                Trivia (supports&nbsp;
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
            placeholder='Enter trivia'
            style={{ minHeight: 100 }}
            value={data.trivia}
            onChange={onTriviaChanged}
          />
          <Form.Field
            label='Broken'
            control={Input}
            placeholder='Enter reason if problem is broken'
            value={data.broken}
            onChange={onBrokenChanged}
          />
          {meta.isIce && (
            <>
              <Form.Field
                label='Starting altitude'
                control={Input}
                placeholder='Enter starting altitude'
                value={data.startingAltitude}
                onChange={onStartingAltitudeChanged}
              />
              <Form.Field
                label='Aspect'
                control={Input}
                placeholder='Enter aspect'
                value={data.aspect}
                onChange={onAspectChanged}
              />
              <Form.Field
                label='Route length'
                control={Input}
                placeholder='Enter route length'
                value={data.routeLength}
                onChange={onRouteLengthChanged}
              />
              <Form.Field
                label='Descent'
                control={Input}
                placeholder='Enter descent'
                value={data.descent}
                onChange={onDescentChanged}
              />
            </>
          )}
        </Segment>

        <ExternalLinks
          externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
          onExternalLinksUpdated={onExternalLinksUpdated}
        />

        <Segment>
          <Form.Field>
            <label>Upload image(s) or embed video(s)</label>
            <br />
            <ImageUpload
              onMediaChanged={onNewMediaChanged}
              isMultiPitch={!!(data.sections && data.sections.length > 1)}
            />
          </Form.Field>
        </Segment>

        {meta.isClimbing && (
          <Segment>
            <Form.Field
              label='Type'
              control={Dropdown}
              selection
              value={data.t?.id}
              onChange={onTypeIdChanged}
              options={meta.types.map((t, i) => {
                const text = t.type + (t.subType ? ' - ' + t.subType : '');
                return { key: i, value: t.id, text: text };
              })}
              error={data.t?.id ? false : 'Type required'}
            />
            <Form.Field>
              <label>First AID ascent?</label>
              <Button.Group size='tiny'>
                <Button
                  onClick={() =>
                    setData((prevState) => ({
                      ...prevState,
                      faAid: {
                        problemId: data.id,
                        date: '',
                        description: '',
                      },
                    }))
                  }
                  positive={!!data.faAid}
                >
                  Yes
                </Button>
                <Button.Or />
                <Button
                  onClick={() => setData((prevState) => ({ ...prevState, faAid: undefined }))}
                  positive={!data.faAid}
                >
                  No
                </Button>
              </Button.Group>
              {data.faAid && (
                <Container>
                  <DatePicker
                    placeholderText='Click to select a date'
                    dateFormat='dd-MM-yyyy'
                    isClearable
                    withPortal
                    portalId='root-portal'
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode='select'
                    selected={
                      data.faAid.date ? convertFromStringToDate(data.faAid.date) : undefined
                    }
                    onChange={(date: Date | null) => onFaAidDateChanged(date)}
                  />
                  <TextArea
                    placeholder='Enter description'
                    style={{ minHeight: 75 }}
                    value={data.faAid.description}
                    onChange={onFaAidDescriptionChanged}
                  />
                  <UsersSelector
                    placeholder='Select user(s)'
                    users={data.faAid.users ?? []}
                    onUsersUpdated={onFaAidUsersUpdated}
                  />
                </Container>
              )}
            </Form.Field>
            <Form.Field>
              <label>Pitches</label>
              <ProblemSection
                sections={data.sections ?? []}
                onSectionsUpdated={onSectionsUpdated}
              />
            </Form.Field>
          </Segment>
        )}

        <Segment>
          <Form.Field>
            <label>Click to mark problem on map</label>
            <Leaflet
              autoZoom={true}
              markers={markers}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={onMapClick}
              height={'300px'}
              showSatelliteImage={true}
              clusterMarkers={false}
            />
          </Form.Field>
          <Form.Group widths='equal'>
            <Form.Field>
              <label>Latitude</label>
              <Input
                placeholder='Latitude'
                value={data.coordinates?.latitude || ''}
                onChange={onLatChanged}
              />
            </Form.Field>
            <Form.Field>
              <label>Longitude</label>
              <Input
                placeholder='Longitude'
                value={data.coordinates?.longitude || ''}
                onChange={onLngChanged}
              />
            </Form.Field>
            <Form.Field>
              <label>Include all markers in sector</label>
              <Checkbox
                toggle
                checked={showSectorMarkers}
                onChange={(_, { checked }) => setShowSectorMarkers(!!checked)}
              />
            </Form.Field>
          </Form.Group>
        </Segment>

        <Button.Group>
          <Button
            negative
            onClick={() => {
              if (problemId) {
                navigate(`/problem/${problemId}`);
              } else {
                navigate(`/sector/${sectorId}`);
              }
            }}
          >
            Cancel
          </Button>
          <Button.Or />
          <Button
            positive
            loading={saving}
            onClick={(event) =>
              save(event, data).then((dest) => {
                if (dest === false) {
                  return;
                }
                navigate(dest);
              })
            }
            disabled={!data.name || (meta.types.length > 1 && !data.t?.id)}
          >
            Save
          </Button>
          {!problemId && (
            <>
              <Button.Or />
              <Button
                positive
                loading={saving}
                onClick={(event) =>
                  save(event, data).then((dest) => {
                    if (dest === false) {
                      return;
                    }
                    navigate(0);
                  })
                }
                disabled={!data.name || (meta.types.length > 1 && !data.t?.id)}
              >
                Save, and add new
              </Button>
            </>
          )}
        </Button.Group>
      </Form>
    </>
  );
};

export default ProblemEditLoader;
