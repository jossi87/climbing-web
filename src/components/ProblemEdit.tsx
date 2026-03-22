import { useState, useCallback, type ComponentProps, type UIEvent } from 'react';
import { UsersSelector } from './common/user-selector/user-selector';
import RockSelector from './common/rock-selector/rock-selector';
import ProblemSection from './common/problem-section/problem-section';
import MediaUpload from './common/media-upload/media-upload';
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
import type { components } from '../@types/buldreinfo/swagger';
import { captureException, captureMessage } from '@sentry/react';
import ExternalLinks from './common/external-links/external-links';
import { Info, Calendar, Save, X, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

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
      <div className='max-w-2xl mx-auto mt-12 p-8 bg-surface-card border border-surface-border rounded-2xl text-center space-y-4'>
        <AlertCircle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='text-2xl font-black text-white'>404</h2>
        <p className='text-slate-400 font-medium'>
          Cannot find the specified problem because it does not exist or you do not have sufficient
          permissions.
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
    <div className='max-w-container mx-auto px-4 py-8 space-y-8 pb-32 text-left'>
      <title>{`Edit ${data.name} | ${meta?.title}`}</title>

      <div className='flex items-start gap-4 p-4 bg-surface-card border border-surface-border rounded-xl'>
        <Info className='text-brand shrink-0 mt-0.5' size={20} />
        <p className='text-sm text-slate-400'>
          Contact{' '}
          <a
            href='mailto:jostein.oygarden@gmail.com'
            className='text-brand hover:underline font-bold'
          >
            Jostein Øygarden
          </a>{' '}
          if you want to move this {meta.isBouldering ? 'problem' : 'route'} to another sector.
        </p>
      </div>

      <div className='space-y-6'>
        <div className='bg-surface-card border border-surface-border rounded-2xl p-6 space-y-6 shadow-sm'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                Name
              </label>
              <input
                className={cn(
                  'w-full bg-surface-nav border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors',
                  !data.name ? 'border-red-500/50' : 'border-surface-border focus:border-brand',
                )}
                value={data.name}
                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
              />
              {!data.name && (
                <p className='text-[10px] text-red-500 font-bold ml-1'>Name required</p>
              )}
            </div>

            <VisibilitySelectorField
              label='Visibility'
              value={{ lockedAdmin: !!data.lockedAdmin, lockedSuperadmin: !!data.lockedSuperadmin }}
              onChange={({ lockedAdmin, lockedSuperadmin }) =>
                setData((prev) => ({ ...prev, lockedAdmin, lockedSuperadmin }))
              }
            />

            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                Number
              </label>
              <input
                type='number'
                className='w-full bg-surface-nav border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand'
                value={data.nr}
                onChange={(e) => setData((prev) => ({ ...prev, nr: +e.target.value }))}
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                Move to Trash
              </label>
              <div className='flex items-center h-10.5'>
                <button
                  type='button'
                  disabled={!data.id || data.id <= 0}
                  onClick={() => setData((prev) => ({ ...prev, trash: !prev.trash }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-30 p-0.5',
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

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                Grade
              </label>
              <div className='relative'>
                <select
                  className='w-full appearance-none bg-surface-nav border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand cursor-pointer'
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
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                FA User(s)
              </label>
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
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                FA Date
              </label>
              <div className='relative'>
                <DatePicker
                  className='w-full bg-surface-nav border border-surface-border rounded-lg px-4 py-2.5 pl-10 text-white focus:outline-none focus:border-brand'
                  dateFormat='dd-MM-yyyy'
                  selected={data.faDate ? convertFromStringToDate(data.faDate) : undefined}
                  onChange={(date: Date | null) => onFaDateChanged(date ?? undefined)}
                />
                <Calendar
                  size={16}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                />
              </div>
            </div>
          </div>

          {meta.isBouldering && (
            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
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

        <div className='bg-surface-card border border-surface-border rounded-2xl p-6 space-y-6'>
          <div className='space-y-1.5'>
            <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
              Description (supports markdown)
            </label>
            <textarea
              className='w-full bg-surface-nav border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand min-h-25'
              value={data.comment}
              onChange={(e) => setData((prev) => ({ ...prev, comment: e.target.value }))}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
              Trivia (supports markdown)
            </label>
            <textarea
              className='w-full bg-surface-nav border border-surface-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand min-h-20'
              value={data.trivia}
              onChange={(e) => setData((prev) => ({ ...prev, trivia: e.target.value }))}
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
              Broken Reason
            </label>
            <input
              className='w-full bg-surface-nav border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand'
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

        <div className='bg-surface-card border border-surface-border rounded-2xl p-6'>
          <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-3'>
            Add Media
          </label>
          <MediaUpload
            onMediaChanged={(media) => setData((p) => ({ ...p, newMedia: media }))}
            isMultiPitch={!!(data.sections && data.sections.length > 1)}
          />
        </div>

        {meta.isClimbing && (
          <div className='bg-surface-card border border-surface-border rounded-2xl p-6 space-y-6'>
            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1'>
                Type
              </label>
              <div className='relative'>
                <select
                  className='w-full appearance-none bg-surface-nav border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand'
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
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
                />
              </div>
            </div>

            <div className='space-y-3'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 block'>
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
                    'px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all',
                    data.faAid ? 'bg-brand text-white' : 'bg-surface-nav text-slate-500',
                  )}
                >
                  Yes
                </button>
                <button
                  type='button'
                  onClick={() => setData((p) => ({ ...p, faAid: undefined }))}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all',
                    !data.faAid ? 'bg-brand text-white' : 'bg-surface-nav text-slate-500',
                  )}
                >
                  No
                </button>
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 block'>
                Pitches
              </label>
              <ProblemSection
                sections={data.sections ?? []}
                onSectionsUpdated={(sections) => setData((p) => ({ ...p, sections }))}
              />
            </div>
          </div>
        )}

        <div className='bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <label className='text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 block'>
              Click Map to Mark Location
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <span className='text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-300 transition-colors'>
                Include Sector Markers
              </span>
              <button
                type='button'
                onClick={() => setShowSectorMarkers(!showSectorMarkers)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors p-0.5',
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

          <div className='rounded-xl overflow-hidden border border-surface-border h-87.5'>
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

      <div className='fixed bottom-0 left-0 right-0 bg-surface-nav/80 backdrop-blur-md border-t border-surface-border py-4 z-1000'>
        <div className='max-w-container mx-auto px-4 flex items-center justify-between gap-4'>
          <button
            type='button'
            onClick={() =>
              problemId && problemId > 0
                ? navigate(`/problem/${problemId}`)
                : navigate(`/sector/${sectorId}`)
            }
            className='flex items-center gap-2 px-6 py-2.5 rounded-xl border border-surface-border text-slate-300 hover:text-white font-bold'
          >
            <X size={18} /> Cancel
          </button>

          <div className='flex gap-2'>
            <button
              type='button'
              onClick={(e) => save(e, data).then((dest) => dest && navigate(dest))}
              disabled={!data.name || (meta.types.length > 1 && !data.t?.id) || saving}
              className={cn(
                'flex items-center gap-2 px-8 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all',
                saving
                  ? 'bg-brand/50 cursor-not-allowed'
                  : 'bg-brand text-white shadow-lg shadow-brand/20',
              )}
            >
              {saving ? (
                <div className='animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full' />
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
                className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-black uppercase tracking-widest'
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
