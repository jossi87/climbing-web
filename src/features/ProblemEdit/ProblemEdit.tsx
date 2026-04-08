import { useState, useCallback, type ChangeEvent, type ComponentProps, type FormEvent, type UIEvent } from 'react';
import { UsersSelector } from '../../shared/ui/UserSelector';
import RockSelector from '../../shared/components/RockSelector/RockSelector';
import ProblemSection from '../../shared/components/ProblemSection/ProblemSection';
import MediaUpload from '../../shared/components/MediaUpload/MediaUpload';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { useMeta } from '../../shared/components/Meta/context';
import {
  convertFromDateToString,
  convertFromStringToDate,
  postProblem,
  spaPathFromRedirectResponse,
  useAccessToken,
  useSector,
  useProblem,
} from '../../api';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { VisibilitySelectorField } from '../../shared/ui/VisibilitySelector';
import { useQueryClient } from '@tanstack/react-query';
import type { components } from '../../@types/buldreinfo/swagger';
import { captureException, captureMessage } from '@sentry/react';
import ExternalLink from '../../shared/ui/ExternalLinks';
import { Calendar, Save, ChevronDown, AlertCircle, AlertTriangle, Edit, Loader2, MapPinOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, FormSwitch, MarkdownFieldLabel, SectionHeader } from '../../shared/ui';

type Problem = components['schemas']['Problem'];

const useIds = (): { sectorId: number; problemId: number } => {
  const { sectorId, problemId } = useParams();
  if (!sectorId) throw new Error('Missing sectorId param');
  if (!problemId) throw new Error('Missing problemId param');
  return { sectorId: +sectorId, problemId: +problemId };
};

export const ProblemEditLoader = () => {
  const { sectorId, problemId } = useIds();
  const { data: sector } = useSector(sectorId);
  const { data: problem, status: problemStatus, error } = useProblem(problemId, true);

  if (error) {
    return (
      <div className='bg-surface-card border-surface-border mx-auto mt-12 max-w-2xl space-y-4 rounded-2xl border p-8 text-center'>
        <AlertCircle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='type-h1'>404</h2>
        <p className='font-medium text-slate-400'>
          Cannot find the specified problem because it does not exist or you do not have sufficient permissions.
        </p>
      </div>
    );
  }

  if (!sector) return <Loading />;
  if (problemStatus === 'pending' && problemId < 0) return <Loading />;

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

  const onFaDateChanged = useCallback((newFaDate: Date | undefined) => {
    if (!newFaDate) {
      setData((prev) => ({ ...prev, faDate: undefined }));
      return;
    }
    const year = newFaDate.getFullYear();
    const isValid = !isNaN(newFaDate.getTime()) && year > 1000;
    if (isValid) {
      const dateString = convertFromDateToString(newFaDate);
      setData((prevState) => {
        if (prevState.faDate === dateString) return prevState;
        return { ...prevState, faDate: dateString };
      });
    }
  }, []);

  const save = useCallback(
    async (event: UIEvent | FormEvent, data: Problem): Promise<string | false> => {
      event.preventDefault();
      const trash = !!data.trash;
      if (trash) {
        if (!confirm('Are you sure you want to move this problem/route to trash?')) {
          captureMessage('Decided to not delete problem', {
            extra: { problemId, sectorId },
          });
          return false;
        }
      }
      setSaving(true);

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
        const path = spaPathFromRedirectResponse(res);
        if (path === null) {
          return false;
        }
        void client.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey;
            if (!Array.isArray(key) || key.length < 2) return false;
            const tag = key[0];
            const params = key[1] as { id?: number } | undefined;
            if (tag === '/sectors' && params?.id === sectorId) return true;
            if (tag === '/problem' && problemId > 0 && params?.id === problemId) return true;
            return false;
          },
        });
        return path ?? (problemId > 0 ? `/problem/${problemId}` : `/sector/${sectorId}`);
      } catch (error) {
        console.warn(error);
        captureException(error);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [accessToken, client, meta.types, problemId, sectorId],
  );

  let defaultCenter: { lat: number; lng: number };
  let defaultZoom: number;
  if (data.coordinates?.latitude && data.coordinates?.longitude) {
    defaultCenter = { lat: data.coordinates.latitude, lng: data.coordinates.longitude };
    defaultZoom = 15;
  } else if (sector.parking?.latitude && sector.parking?.longitude) {
    defaultCenter = { lat: sector.parking.latitude, lng: sector.parking.longitude };
    defaultZoom = 15;
  } else {
    defaultCenter = meta.defaultCenter;
    defaultZoom = meta.defaultZoom;
  }

  /** Siblings first (blue label pins), then this problem last so the red “current” pin stacks on top at identical coords. */
  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> = [];
  if (showSectorMarkers && sector.problems?.length) {
    markers.push(
      ...sector.problems
        .filter((p) => p.id !== problemId)
        .filter(isPlottableProblem)
        .map((p) => ({ coordinates: p.coordinates, label: p.name ?? '' })),
    );
  }
  if (data.coordinates) markers.push({ coordinates: data.coordinates });

  const sectorRocks =
    sector.problems
      ?.map((p) => p.rock)
      .filter((v): v is string => !!v)
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort() ?? [];

  const parseCoordInput = (raw: string): number | undefined => {
    const t = raw.trim();
    if (t === '') return undefined;
    const n = parseFloat(t.replace(',', '.'));
    return Number.isNaN(n) ? undefined : n;
  };

  const setCoordField = (field: 'latitude' | 'longitude') => (e: ChangeEvent<HTMLInputElement>) => {
    setData((prev) => {
      const v = parseCoordInput(e.target.value);
      const lat = field === 'latitude' ? v : prev.coordinates?.latitude;
      const lng = field === 'longitude' ? v : prev.coordinates?.longitude;
      if (lat == null && lng == null) {
        return { ...prev, coordinates: undefined };
      }
      return {
        ...prev,
        coordinates: { ...prev.coordinates, latitude: lat, longitude: lng },
      };
    });
  };

  const hasProblemCoords =
    data.coordinates != null && (data.coordinates.latitude != null || data.coordinates.longitude != null);

  const inputClasses =
    'problem-edit-field w-full bg-surface-nav border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white transition-colors focus:border-brand-border focus:outline-none focus:ring-0 focus-visible:ring-0';
  const labelClasses = 'ml-1 mb-1 block text-[12px] font-medium text-slate-400 sm:text-[13px]';

  return (
    <div className='w-full min-w-0 pb-20 text-left'>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>

      <Card flush className='min-w-0 border-0'>
        <div className='p-4 sm:p-5'>
          <SectionHeader
            title={meta.isBouldering ? 'Edit problem' : 'Edit route'}
            icon={Edit}
            description={
              <>
                Contact{' '}
                <a href='mailto:jostein.oygarden@gmail.com' className='hover:text-brand font-semibold text-slate-200'>
                  Jostein Øygarden
                </a>{' '}
                if you want to move this {meta.isBouldering ? 'problem' : 'route'} to another sector.
              </>
            }
          />
          <form
            className='mt-3 space-y-3'
            onSubmit={(e) => {
              e.preventDefault();
              void save(e, data).then((dest) => dest && navigate(dest));
            }}
          >
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-2'>
                  <label className={labelClasses}>Name</label>
                  <input
                    className={cn(inputClasses, !data.name ? 'border-red-500/50' : '')}
                    value={data.name}
                    onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  {!data.name && <p className='ml-1 text-[11px] font-bold text-red-500'>Name required</p>}
                </div>

                <VisibilitySelectorField
                  label='Visibility'
                  value={{ lockedAdmin: !!data.lockedAdmin, lockedSuperadmin: !!data.lockedSuperadmin }}
                  onChange={({ lockedAdmin, lockedSuperadmin }) =>
                    setData((prev) => ({ ...prev, lockedAdmin, lockedSuperadmin }))
                  }
                />

                <div className='space-y-2'>
                  <label className={labelClasses}>Number</label>
                  <input
                    type='number'
                    className={inputClasses}
                    value={data.nr}
                    onChange={(e) => setData((prev) => ({ ...prev, nr: +e.target.value }))}
                  />
                </div>

                <div className='space-y-2'>
                  <label className={labelClasses}>Move to trash</label>
                  <FormSwitch
                    checked={!!data.trash}
                    onChange={() => setData((prev) => ({ ...prev, trash: !prev.trash }))}
                    disabled={!data.id || data.id <= 0}
                    variant='danger'
                    aria-label='Move to trash'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <div className='space-y-2'>
                  <label className={labelClasses}>Grade</label>
                  <div className='relative'>
                    <select
                      className={cn(inputClasses, 'cursor-pointer appearance-none pr-9')}
                      value={data.originalGrade}
                      onChange={(e) => setData((prev) => ({ ...prev, originalGrade: e.target.value }))}
                    >
                      {meta.grades.map((g, i) => (
                        <option key={i} value={g.grade}>
                          {g.grade}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className={labelClasses}>FA user(s)</label>
                  <UsersSelector
                    placeholder='Select FA user(s)'
                    users={data.fa ?? []}
                    onUsersUpdated={(users) =>
                      setData((prev) => ({
                        ...prev,
                        fa: users.map((u) => ({
                          id: typeof u.value === 'string' ? -1 : u.value,
                          name: u.label,
                        })),
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <label className={labelClasses}>FA date</label>
                  <div className='relative'>
                    <DatePicker
                      wrapperClassName='w-full'
                      className={cn(inputClasses, 'pr-3 pl-10')}
                      dateFormat='dd-MM-yyyy'
                      selected={data.faDate ? convertFromStringToDate(data.faDate) : undefined}
                      onChange={(date: Date | null) => onFaDateChanged(date ?? undefined)}
                    />
                    <Calendar
                      size={16}
                      className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                </div>
              </div>

              {meta.isBouldering && (
                <div className='space-y-2'>
                  <label className={labelClasses}>Rock (grouping)</label>
                  <RockSelector
                    rock={data.rock ?? null}
                    onRockUpdated={(rock) => setData((prev) => ({ ...prev, rock: rock ?? undefined }))}
                    rocks={sectorRocks}
                    placeholder='Search or select rock...'
                  />
                </div>
              )}

              <div className='space-y-2'>
                <MarkdownFieldLabel className={labelClasses}>Description</MarkdownFieldLabel>
                <textarea
                  className={cn(inputClasses, 'min-h-30 resize-none')}
                  value={data.comment}
                  onChange={(e) => setData((prev) => ({ ...prev, comment: e.target.value }))}
                />
              </div>

              <div className='space-y-2'>
                <MarkdownFieldLabel className={labelClasses}>Trivia</MarkdownFieldLabel>
                <textarea
                  className={cn(inputClasses, 'min-h-20 resize-none')}
                  value={data.trivia}
                  onChange={(e) => setData((prev) => ({ ...prev, trivia: e.target.value }))}
                />
              </div>

              <div className='relative'>
                <input
                  className={cn(inputClasses, 'border-red-500/25 pl-10 focus:border-red-400/45')}
                  value={data.broken}
                  placeholder='Leave empty if not broken'
                  onChange={(e) => setData((prev) => ({ ...prev, broken: e.target.value }))}
                />
                <AlertTriangle
                  className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-red-400/90'
                  size={14}
                />
                <span className='bg-surface-card absolute -top-2 left-10 px-1 text-[11px] font-black tracking-tighter text-red-300/90 uppercase'>
                  {meta.isBouldering ? 'Problem broken' : 'Route broken'}
                </span>
              </div>
            </div>

            <ExternalLink
              externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
              onExternalLinksUpdated={(links) => setData((p) => ({ ...p, externalLinks: links }))}
              hideLabel
              mobileFlat
            />

            <div className='space-y-4'>
              <label className={labelClasses}>Add media</label>
              <MediaUpload
                onMediaChanged={(media) => setData((p) => ({ ...p, newMedia: media }))}
                isMultiPitch={!!(data.sections && data.sections.length > 1)}
              />
            </div>

            {meta.isClimbing && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className={labelClasses}>Type</label>
                  <div className='relative'>
                    <select
                      className={cn(inputClasses, 'cursor-pointer appearance-none pr-9')}
                      value={data.t?.id}
                      onChange={(e) => setData((p) => ({ ...p, t: { ...p.t, id: +e.target.value } }))}
                    >
                      {meta.types.map((t, i) => (
                        <option key={i} value={t.id}>
                          {t.type + (t.subType ? ' - ' + t.subType : '')}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className={labelClasses}>First AID ascent?</label>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() =>
                        setData((p) => ({
                          ...p,
                          faAid: {
                            ...(p.id != null && p.id > 0 ? { problemId: p.id } : {}),
                            date: '',
                            description: '',
                            users: [],
                          },
                        }))
                      }
                      className={cn(
                        designContract.typography.uiCompact,
                        'rounded-lg px-4 py-1.5 uppercase transition-all',
                        data.faAid
                          ? designContract.surfaces.segmentActiveBrandBorder
                          : designContract.surfaces.segmentIdleRaised,
                      )}
                    >
                      Yes
                    </button>
                    <button
                      type='button'
                      onClick={() => setData((p) => ({ ...p, faAid: undefined }))}
                      className={cn(
                        designContract.typography.uiCompact,
                        'rounded-lg px-4 py-1.5 uppercase transition-all',
                        !data.faAid
                          ? designContract.surfaces.segmentActiveBrandBorder
                          : designContract.surfaces.segmentIdleRaised,
                      )}
                    >
                      No
                    </button>
                  </div>
                </div>

                {data.faAid && (
                  <div className='border-surface-border mt-4 space-y-4 border-t pt-4'>
                    <p className='type-micro text-slate-500'>
                      First AID ascent is separate from the free first ascent above. Add who, when, and optional notes —
                      the problem page only shows this block when at least one of these is set.
                    </p>
                    <div className='space-y-2'>
                      <label className={labelClasses}>First AID — climbers</label>
                      <UsersSelector
                        placeholder='Search climbers…'
                        users={data.faAid.users ?? []}
                        onUsersUpdated={(users) =>
                          setData((prev) =>
                            prev.faAid
                              ? {
                                  ...prev,
                                  faAid: {
                                    ...prev.faAid,
                                    users: users.map((u) => ({
                                      id: typeof u.value === 'string' ? -1 : u.value,
                                      name: u.label,
                                    })),
                                  },
                                }
                              : prev,
                          )
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className={labelClasses}>First AID — date</label>
                      <div className='relative'>
                        <DatePicker
                          wrapperClassName='w-full'
                          className={cn(inputClasses, 'pr-3 pl-10')}
                          dateFormat='dd-MM-yyyy'
                          selected={
                            data.faAid.date ? (convertFromStringToDate(data.faAid.date) ?? undefined) : undefined
                          }
                          onChange={(date: Date | null) => {
                            setData((prev) => {
                              if (!prev.faAid) return prev;
                              const dateString = date ? (convertFromDateToString(date) ?? '') : '';
                              return { ...prev, faAid: { ...prev.faAid, date: dateString } };
                            });
                          }}
                        />
                        <Calendar
                          size={16}
                          className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <MarkdownFieldLabel className={labelClasses}>First AID — notes</MarkdownFieldLabel>
                      <textarea
                        className={cn(inputClasses, 'min-h-20 resize-none')}
                        value={data.faAid.description ?? ''}
                        placeholder='Gear, style, or other context for the first aid ascent…'
                        onChange={(e) =>
                          setData((prev) =>
                            prev.faAid ? { ...prev, faAid: { ...prev.faAid, description: e.target.value } } : prev,
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                <div className='space-y-2'>
                  <label className={labelClasses}>Pitches</label>
                  <ProblemSection
                    sections={data.sections ?? []}
                    onSectionsUpdated={(sections) => setData((p) => ({ ...p, sections }))}
                  />
                </div>
              </div>
            )}

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className={labelClasses}>
                  {meta.isBouldering ? 'Mark problem on map' : 'Mark route on map'}
                </label>
                <div className='border-surface-border bg-surface-raised overflow-hidden rounded-lg border'>
                  <div className='border-surface-border relative overflow-hidden border-b'>
                    <Leaflet
                      autoZoom={true}
                      markers={markers}
                      defaultCenter={defaultCenter}
                      defaultZoom={defaultZoom}
                      onMouseClick={(e) =>
                        setData((p) => ({
                          ...p,
                          coordinates: {
                            ...p.coordinates,
                            latitude: e.latlng.lat,
                            longitude: e.latlng.lng,
                          },
                        }))
                      }
                      height='300px'
                      showSatelliteImage={true}
                      clusterMarkers={false}
                    />
                  </div>
                  <div className='border-surface-border bg-surface-card flex flex-nowrap items-center justify-between gap-2 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5'>
                    <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5'>
                      <FormSwitch
                        checked={showSectorMarkers}
                        onChange={() => setShowSectorMarkers(!showSectorMarkers)}
                        variant='brand'
                        aria-label='Include sibling problems and routes on the map'
                      />
                      <span className='min-w-0 text-[12px] font-medium whitespace-nowrap text-slate-300 sm:text-[13px]'>
                        Include siblings
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => setData((p) => ({ ...p, coordinates: undefined }))}
                      disabled={!hasProblemCoords}
                      title={hasProblemCoords ? 'Remove this problem’s coordinates from the map' : undefined}
                      className={cn(
                        designContract.typography.uiCompact,
                        'inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-orange-500/45 px-2 py-1 font-semibold tracking-wide text-orange-400 transition-colors',
                        'dark:hover:bg-surface-hover hover:border-orange-400/75 dark:hover:text-orange-300',
                        'light:border-orange-600/40 light:text-orange-700',
                        'light:hover:bg-orange-500/14 light:hover:border-orange-600/60 light:hover:text-orange-950',
                        'disabled:cursor-not-allowed disabled:opacity-40 sm:border-0 sm:px-2 sm:py-1',
                      )}
                    >
                      <MapPinOff size={13} strokeWidth={2} aria-hidden />
                      Remove position
                    </button>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <label className={labelClasses}>Latitude</label>
                  <input
                    className={inputClasses}
                    inputMode='decimal'
                    placeholder='e.g. 59.123'
                    value={data.coordinates?.latitude != null ? String(data.coordinates.latitude) : ''}
                    onChange={setCoordField('latitude')}
                  />
                </div>
                <div className='space-y-1'>
                  <label className={labelClasses}>Longitude</label>
                  <input
                    className={inputClasses}
                    inputMode='decimal'
                    placeholder='e.g. 10.456'
                    value={data.coordinates?.longitude != null ? String(data.coordinates.longitude) : ''}
                    onChange={setCoordField('longitude')}
                  />
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={() =>
                  problemId && problemId > 0 ? navigate(`/problem/${problemId}`) : navigate(`/sector/${sectorId}`)
                }
                className='form-footer-cancel'
              >
                Cancel
              </button>
              {problemId < 0 && (
                <button
                  type='button'
                  onClick={(e) => save(e, data).then((dest) => dest && navigate(0))}
                  disabled={!data.name || (meta.types.length > 1 && !data.t?.id) || saving}
                  className='form-footer-secondary disabled:opacity-50'
                >
                  Save &amp; add new
                </button>
              )}
              <button
                type='submit'
                disabled={!data.name || (meta.types.length > 1 && !data.t?.id) || saving}
                className='type-label flex items-center gap-2 rounded-lg bg-emerald-400 px-8 py-2.5 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-300 disabled:opacity-50'
              >
                {saving ? <Loader2 className='animate-spin' size={16} /> : <Save size={16} />}
                {meta.isBouldering ? 'Save problem' : 'Save route'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ProblemEditLoader;
