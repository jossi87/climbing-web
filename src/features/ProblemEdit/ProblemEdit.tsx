import { useState, useCallback, type ComponentProps, type UIEvent } from 'react';
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
import ExternalLinks from '../../shared/ui/ExternalLinks';
import { Info, Calendar, Save, X, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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
    async (event: UIEvent, data: Problem): Promise<string | false> => {
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
        return res.destination ?? '';
      } catch (error) {
        console.warn(error);
        captureException(error);
        setSaving(false);
        return false;
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

  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> = [];
  if (data.coordinates) markers.push({ coordinates: data.coordinates });
  if (showSectorMarkers && sector.problems?.length) {
    markers.push(
      ...sector.problems
        .filter((p) => p.id !== problemId)
        .filter(isPlottableProblem)
        .map((p) => ({ coordinates: p.coordinates, label: p.name ?? '' })),
    );
  }

  const sectorRocks =
    sector.problems
      ?.map((p) => p.rock)
      .filter((v): v is string => !!v)
      .filter((v, i, s) => s.indexOf(v) === i)
      .sort() ?? [];

  return (
    <div className='max-w-container mx-auto space-y-8 px-4 py-8 pb-32 text-left'>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>

      <div className='bg-surface-card border-surface-border flex items-start gap-4 rounded-xl border p-4'>
        <Info className='text-brand mt-0.5 shrink-0' size={20} />
        <p className='text-sm text-slate-400'>
          Contact{' '}
          <a href='mailto:jostein.oygarden@gmail.com' className='text-brand font-bold hover:underline'>
            Jostein Øygarden
          </a>{' '}
          if you want to move this {meta.isBouldering ? 'problem' : 'route'} to another sector.
        </p>
      </div>

      <div className='space-y-6'>
        <div className='bg-surface-card border-surface-border space-y-6 rounded-2xl border p-6 shadow-sm'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>Name</label>
              <input
                className={cn(
                  'bg-surface-nav type-body w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none',
                  !data.name ? 'border-red-500/50' : 'border-surface-border focus:border-brand',
                )}
                value={data.name}
                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
              />
              {!data.name && <p className='ml-1 text-[10px] font-bold text-red-500'>Name required</p>}
            </div>

            <VisibilitySelectorField
              label='Visibility'
              value={{ lockedAdmin: !!data.lockedAdmin, lockedSuperadmin: !!data.lockedSuperadmin }}
              onChange={({ lockedAdmin, lockedSuperadmin }) =>
                setData((prev) => ({ ...prev, lockedAdmin, lockedSuperadmin }))
              }
            />

            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>Number</label>
              <input
                type='number'
                className='bg-surface-nav border-surface-border focus:border-brand type-body w-full rounded-lg border px-4 py-2.5 focus:outline-none'
                value={data.nr}
                onChange={(e) => setData((prev) => ({ ...prev, nr: +e.target.value }))}
              />
            </div>

            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
                Move to Trash
              </label>
              <div className='flex h-10.5 items-center'>
                <button
                  type='button'
                  disabled={!data.id || data.id <= 0}
                  onClick={() => setData((prev) => ({ ...prev, trash: !prev.trash }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent p-0.5 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-30',
                    data.trash ? 'bg-red-500' : 'bg-slate-700',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200',
                      data.trash ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>Grade</label>
              <div className='relative'>
                <select
                  className='bg-surface-nav border-surface-border focus:border-brand type-body w-full cursor-pointer appearance-none rounded-lg border px-4 py-2.5 focus:outline-none'
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

            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>FA User(s)</label>
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

            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>FA Date</label>
              <div className='relative'>
                <DatePicker
                  className='bg-surface-nav border-surface-border focus:border-brand type-body w-full rounded-lg border px-4 py-2.5 pl-10 focus:outline-none'
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
            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
                Rock (Grouping)
              </label>
              <RockSelector
                rock={data.rock ?? null}
                onRockUpdated={(rock) => setData((prev) => ({ ...prev, rock: rock ?? undefined }))}
                rocks={sectorRocks}
                placeholder='Search or select rock...'
              />
            </div>
          )}
        </div>

        <div className='bg-surface-card border-surface-border space-y-6 rounded-2xl border p-6'>
          <div className='space-y-1.5'>
            <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
              Description (supports markdown)
            </label>
            <textarea
              className='bg-surface-nav border-surface-border focus:border-brand type-body min-h-25 w-full rounded-xl border px-4 py-3 focus:outline-none'
              value={data.comment}
              onChange={(e) => setData((prev) => ({ ...prev, comment: e.target.value }))}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
              Trivia (supports markdown)
            </label>
            <textarea
              className='bg-surface-nav border-surface-border focus:border-brand type-body min-h-20 w-full rounded-xl border px-4 py-3 focus:outline-none'
              value={data.trivia}
              onChange={(e) => setData((prev) => ({ ...prev, trivia: e.target.value }))}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>Broken Reason</label>
            <input
              className='bg-surface-nav border-surface-border focus:border-brand type-body w-full rounded-lg border px-4 py-2.5 focus:outline-none'
              value={data.broken}
              placeholder='Leave empty if not broken'
              onChange={(e) => setData((prev) => ({ ...prev, broken: e.target.value }))}
            />
          </div>
        </div>

        <ExternalLinks
          externalLinks={data.externalLinks?.filter((l) => !l.inherited) || []}
          onExternalLinksUpdated={(links) => setData((p) => ({ ...p, externalLinks: links }))}
        />

        <div className='bg-surface-card border-surface-border rounded-2xl border p-6'>
          <label className='mb-3 ml-1 block text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
            Add Media
          </label>
          <MediaUpload
            onMediaChanged={(media) => setData((p) => ({ ...p, newMedia: media }))}
            isMultiPitch={!!(data.sections && data.sections.length > 1)}
          />
        </div>

        {meta.isClimbing && (
          <div className='bg-surface-card border-surface-border space-y-6 rounded-2xl border p-6'>
            <div className='space-y-1.5'>
              <label className='ml-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>Type</label>
              <div className='relative'>
                <select
                  className='bg-surface-nav border-surface-border focus:border-brand type-body w-full appearance-none rounded-lg border px-4 py-2.5 focus:outline-none'
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

            <div className='space-y-3'>
              <label className='ml-1 block text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
                First AID Ascent?
              </label>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    setData((p) => ({
                      ...p,
                      faAid: { problemId: data.id, date: '', description: '' },
                    }))
                  }
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-xs font-black uppercase transition-all',
                    data.faAid ? 'bg-brand' : 'bg-surface-nav opacity-70',
                  )}
                >
                  Yes
                </button>
                <button
                  type='button'
                  onClick={() => setData((p) => ({ ...p, faAid: undefined }))}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-xs font-black uppercase transition-all',
                    !data.faAid ? 'bg-brand' : 'bg-surface-nav opacity-70',
                  )}
                >
                  No
                </button>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='ml-1 block text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
                Pitches
              </label>
              <ProblemSection
                sections={data.sections ?? []}
                onSectionsUpdated={(sections) => setData((p) => ({ ...p, sections }))}
              />
            </div>
          </div>
        )}

        <div className='bg-surface-card border-surface-border space-y-4 rounded-2xl border p-6'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <label className='ml-1 block text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
              Click Map to Mark Location
            </label>
            <label className='group flex cursor-pointer items-center gap-3'>
              <span className='text-[10px] font-black text-slate-500 uppercase transition-colors group-hover:text-slate-300'>
                Include Sector Markers
              </span>
              <button
                type='button'
                onClick={() => setShowSectorMarkers(!showSectorMarkers)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors',
                  showSectorMarkers ? 'bg-brand' : 'bg-slate-700',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200',
                    showSectorMarkers ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </label>
          </div>

          <div className='border-surface-border h-87.5 overflow-hidden rounded-xl border'>
            <Leaflet
              autoZoom={true}
              markers={markers}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              onMouseClick={(e) =>
                setData((p) => ({
                  ...p,
                  coordinates: { latitude: e.latlng.lat, longitude: e.latlng.lng },
                }))
              }
              height='100%'
              showSatelliteImage={true}
              clusterMarkers={false}
            />
          </div>
        </div>
      </div>

      <div className='bg-surface-nav/80 border-surface-border fixed right-0 bottom-0 left-0 z-1000 border-t py-4 backdrop-blur-md'>
        <div className='max-w-container mx-auto flex items-center justify-between gap-4 px-4'>
          <button
            type='button'
            onClick={() =>
              problemId && problemId > 0 ? navigate(`/problem/${problemId}`) : navigate(`/sector/${sectorId}`)
            }
            className='border-surface-border type-label flex items-center gap-2 rounded-xl border px-6 py-2.5 opacity-85 hover:opacity-100'
          >
            <X size={18} /> Cancel
          </button>

          <div className='flex gap-2'>
            <button
              type='button'
              onClick={(e) => save(e, data).then((dest) => dest && navigate(dest))}
              disabled={!data.name || (meta.types.length > 1 && !data.t?.id) || saving}
              className={cn(
                'flex items-center gap-2 rounded-xl px-8 py-2.5 font-black tracking-widest uppercase transition-all',
                saving ? 'bg-brand/50 cursor-not-allowed' : 'bg-brand shadow-brand/20 shadow-lg',
              )}
            >
              {saving ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
              ) : (
                <Save size={18} />
              )}
              Save
            </button>

            {problemId < 0 && (
              <button
                type='button'
                onClick={(e) => save(e, data).then((dest) => dest && navigate(0))}
                disabled={!data.name || (meta.types.length > 1 && !data.t?.id) || saving}
                className={cn(
                  'type-label flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 uppercase opacity-90',
                  designContract.typography.label,
                )}
              >
                Save & Add New
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemEditLoader;
