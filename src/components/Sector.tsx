import { type ComponentProps, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProblemList from './common/problem-list';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import { SlopeProfile } from './common/SlopeProfile';
import Top from './common/top/top';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { getDistanceWithUnit } from './common/leaflet/geo-utils';
import Media from './common/media/media';
import Todo from './common/todo/todo';
import GetCenterFromDegrees from '../utils/map-utils';
import {
  Stars,
  LockSymbol,
  Loading,
  ConditionLabels,
  ExternalLinkLabels,
  NoDogsAllowed,
} from './common/widgets/widgets';
import { useMeta } from './common/meta/context';
import { useSector } from '../api';
import type { Slope } from '../@types/buldreinfo';
import type { components } from '../@types/buldreinfo/swagger';
import { DownloadButton } from './common/DownloadButton';
import type { MarkerDef } from './common/leaflet/markers';
import { Markdown } from './Markdown/Markdown';
import ExpandableText from './ExpandableText/ExpandableText';
import {
  AlertTriangle,
  ChevronRight,
  Edit,
  Plus,
  MapPin,
  Brush,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  Bookmark,
  Map as MapIcon,
  BarChart2,
  Trophy,
  Clock,
} from 'lucide-react';
import { cn } from '../lib/utils';

type Props = {
  problem: NonNullable<components['schemas']['Sector']['problems']>[number];
};

export const SectorListItem = ({ problem }: Props) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? (problem.t?.subType ?? '') +
      ((problem.numPitches ?? 0) > 1 ? ', ' + problem.numPitches + ' pitches' : '')
    : null;
  const ascents = problem.numTicks
    ? problem.numTicks + (problem.numTicks === 1 ? ' ascent' : ' ascents')
    : null;

  let faTypeAscents = problem.fa || '';
  if (problem.faDate) {
    faTypeAscents += ' ' + problem.faDate.substring(0, 4);
  }
  if (type && ascents) {
    faTypeAscents =
      (faTypeAscents !== '' ? faTypeAscents + ' (' : '(') + type + ', ' + ascents + ')';
  } else if (type) {
    faTypeAscents = (faTypeAscents !== '' ? faTypeAscents + ' (' : '(') + type + ')';
  } else if (ascents) {
    faTypeAscents = (faTypeAscents !== '' ? faTypeAscents + ' (' : '(') + ascents + ')';
  }
  faTypeAscents = faTypeAscents.trim();

  return (
    <div
      className={cn(
        'flex flex-col xl:flex-row xl:items-start gap-x-4 gap-y-2 p-3 rounded-xl transition-colors border',
        problem.ticked
          ? 'bg-green-500/5 border-green-500/20'
          : problem.todo
            ? 'bg-blue-500/5 border-blue-500/20'
            : 'bg-surface-card border-surface-border hover:border-brand/50 hover:bg-surface-nav/30',
      )}
    >
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          {problem.danger && <AlertTriangle size={14} className='text-red-500 shrink-0' />}
          <span className='text-[11px] font-mono text-slate-500 min-w-6 shrink-0'>
            #{problem.nr}
          </span>
          <Link
            to={`/problem/${problem.id}`}
            className={cn(
              'text-[15px] font-bold transition-colors',
              problem.broken
                ? 'line-through text-slate-500 font-medium'
                : 'text-white hover:text-brand',
            )}
          >
            {problem.name}
          </Link>
          <span className='text-[12px] font-mono text-slate-400 normal-case'>
            [{problem.grade}]
          </span>
          {problem.stars ? (
            <div className='scale-75 origin-left flex items-center shrink-0'>
              <Stars numStars={problem.stars} includeStarOutlines={false} />
            </div>
          ) : null}
          <LockSymbol
            lockedAdmin={!!problem.lockedAdmin}
            lockedSuperadmin={!!problem.lockedSuperadmin}
          />
          {problem.broken && (
            <span className='text-[9px] font-bold text-red-500 uppercase px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/20'>
              {problem.broken}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2 text-slate-400 shrink-0 flex-wrap'>
          {problem.coordinates && (
            <span title='Coordinates'>
              <MapPin size={12} />
            </span>
          )}
          {problem.hasTopo && (
            <span title='Topo'>
              <Brush size={12} />
            </span>
          )}
          {problem.hasImages && (
            <span title='Images'>
              <ImageIcon size={12} />
            </span>
          )}
          {problem.hasMovies && (
            <span title='Movies'>
              <Film size={12} />
            </span>
          )}
          {problem.ticked && (
            <span title='Ticked'>
              <CheckCircle2 size={12} className='text-green-500' />
            </span>
          )}
          {problem.todo && (
            <span title='To-Do'>
              <Bookmark size={12} className='text-blue-500' />
            </span>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-0.5 xl:text-right shrink-0 xl:max-w-[40%]'>
        {faTypeAscents && (
          <span className='text-[11px] text-slate-400 font-medium'>{faTypeAscents}</span>
        )}
        {(problem.rock || problem.comment) && (
          <span className='text-[11px] text-slate-500 italic leading-relaxed'>
            {problem.rock && (
              <span className='mr-1 text-slate-400 font-medium'>Rock: {problem.rock}.</span>
            )}
            {problem.comment}
          </span>
        )}
      </div>
    </div>
  );
};

type ProblemType = NonNullable<
  NonNullable<ReturnType<typeof useSector>['data']>['problems']
>[number];

const Sector = () => {
  const { sectorId } = useParams();
  if (!sectorId) {
    throw new Error('Missing sectorId URL param');
  }
  const meta = useMeta();
  const { data, error, isLoading, redirectUi } = useSector(+sectorId);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  if (redirectUi) return redirectUi;

  if (error) {
    return (
      <div className='max-w-2xl mx-auto mt-12 p-8 bg-surface-card border border-surface-border rounded-2xl text-center space-y-4'>
        <AlertTriangle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='text-2xl font-black text-white'>404 Error</h2>
        <p className='text-slate-400'>{String(error)}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return <Loading />;
  }

  const orderableMedia: ComponentProps<typeof Media>['orderableMedia'] = [];
  const carouselMedia: ComponentProps<typeof Media>['carouselMedia'] = [];
  if (data.media?.length) {
    carouselMedia.push(...data.media);
    if (data.media.length > 1) orderableMedia.push(...data.media);
  }
  if (data.triviaMedia?.length) {
    carouselMedia.push(...data.triviaMedia);
    if (data.triviaMedia.length > 1) orderableMedia.push(...data.triviaMedia);
  }

  const isBouldering = meta.isBouldering;
  const markers: NonNullable<ComponentProps<typeof Leaflet>['markers']> =
    data.problems
      ?.filter(
        (
          p,
        ): p is NonNullable<ProblemType> &
          Required<NonNullable<Pick<ProblemType, 'coordinates'>>> =>
          !!(p.coordinates && p.coordinates.latitude && p.coordinates.longitude),
      )
      ?.map((p) => {
        return {
          coordinates: p.coordinates,
          label: p.nr + ' - ' + p.name + ' [' + p.grade + ']',
          url: '/problem/' + p.id,
          rock: p.rock,
        } satisfies MarkerDef;
      }) ?? [];

  const addPolygon = meta.isClimbing || markers.length === 0;
  if (data.parking) {
    markers.push({ coordinates: data.parking, isParking: true });
  }

  const tabs = [];
  if (data.media && data.media.length > 0) {
    tabs.push({ id: 'media', label: 'Media', icon: ImageIcon });
  }
  if (markers.length > 0 || (data.outline ?? []).length) {
    tabs.push({ id: 'map', label: 'Map', icon: MapIcon });
  }
  if ((data.problems ?? []).length > 0) {
    tabs.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
    tabs.push({ id: 'top', label: 'Top', icon: Trophy });
    tabs.push({ id: 'activity', label: 'Activity', icon: Clock });
    tabs.push({ id: 'todo', label: 'To-Do', icon: Bookmark });
  }

  if (activeTab === null && tabs.length > 0) {
    setActiveTab(tabs[0].id);
  }

  const uniqueTypes = Array.from(
    new Set((data.problems ?? []).map((p) => p.t?.subType).filter((p): p is string => !!p)),
  );
  if ((data.problems ?? []).filter((p) => p.broken)?.length) uniqueTypes.push('Broken');
  if ((data.problems ?? []).filter((p) => p.gradeNumber === 0)?.length)
    uniqueTypes.push('Projects');
  uniqueTypes.sort();

  const [conditionLat, conditionLng] = (() => {
    const validatedOutline = data?.outline?.filter(
      (
        c,
      ): c is Required<
        Pick<NonNullable<(typeof data)['outline']>[number], 'latitude' | 'longitude'>
      > => !!c.latitude && !!c.longitude,
    );
    if (validatedOutline?.length) {
      const center = GetCenterFromDegrees(validatedOutline.map((c) => [c.latitude, c.longitude]));
      if (center) return [+center[0], +center[1]];
    }
    if (data.parking && data.parking.latitude && data.parking.longitude) {
      return [+data.parking.latitude, +data.parking.longitude];
    }
    return [0, 0];
  })();

  const defaultCenter =
    data.parking && data.parking.latitude && data.parking.longitude
      ? { lat: data.parking.latitude, lng: data.parking.longitude }
      : meta.defaultCenter;
  const defaultZoom = data.parking ? 15 : meta.defaultZoom;
  let outlines: ComponentProps<typeof Leaflet>['outlines'] = undefined;
  const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];

  if ((data.outline ?? []).length && addPolygon) {
    outlines = [{ url: '/sector/' + data.id, label: data.name ?? '', outline: data.outline ?? [] }];
  }
  if ((data.approach?.coordinates ?? []).length) {
    slopes.push({
      backgroundColor: 'lime',
      slope: data.approach as Slope,
      label: getDistanceWithUnit(data.approach as Slope) ?? undefined,
    });
  }
  if ((data.descent?.coordinates ?? []).length) {
    slopes.push({
      backgroundColor: 'purple',
      slope: data.descent as Slope,
      label: getDistanceWithUnit(data.descent as Slope) ?? undefined,
    });
  }
  const uniqueRocks = Array.from(
    new Set(
      data.problems
        ?.filter((p) => p.rock)
        ?.map((p) => p.rock)
        ?.filter((p): p is string => !!p) ?? [],
    ),
  ).sort();

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-8 text-left'>
      <title>{`${data.name} (${data.areaName}) | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase'>
          <Link to='/areas' className='hover:text-white transition-colors'>
            Areas
          </Link>
          <ChevronRight size={12} className='opacity-20' />
          <Link to={`/area/${data.areaId}`} className='hover:text-white transition-colors'>
            {data.areaName}
          </Link>
          <LockSymbol
            lockedAdmin={!!data.areaLockedAdmin}
            lockedSuperadmin={!!data.areaLockedSuperadmin}
          />
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <span>{data.name}</span>
            <LockSymbol
              lockedAdmin={!!data.lockedAdmin}
              lockedSuperadmin={!!data.lockedSuperadmin}
            />
          </div>
        </nav>

        {meta.isAdmin && (
          <div className='flex items-center gap-2'>
            <Link
              to={`/problem/edit/${data.id}/0`}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-colors text-[10px] font-black uppercase tracking-wider'
            >
              <Plus size={14} /> Add
            </Link>
            <Link
              to={`/sector/edit/${data.areaId}/${data.id}`}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-nav border border-surface-border text-slate-300 hover:text-white hover:bg-surface-hover transition-colors text-[10px] font-black uppercase tracking-wider'
            >
              <Edit size={14} /> Edit
            </Link>
          </div>
        )}
      </div>

      {(data.areaAccessClosed || data.accessClosed) && (
        <div className='flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl'>
          <AlertTriangle className='text-red-500 shrink-0 mt-0.5' />
          <div>
            <h3 className='text-red-500 font-bold text-lg mb-1'>
              {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed!'}
            </h3>
            <p className='text-red-400 text-sm'>
              {(data.areaAccessClosed || '') + (data.accessClosed || '')}
            </p>
          </div>
        </div>
      )}

      {tabs.length > 0 && (
        <div className='space-y-4'>
          <div className='flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-surface-border'>
            {tabs.map((t) => {
              const IconComponent = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-brand text-white shadow-md shadow-brand/20'
                      : 'text-slate-400 hover:text-white hover:bg-surface-nav',
                  )}
                >
                  <IconComponent size={16} /> {t.label}
                </button>
              );
            })}
          </div>

          <div className='bg-surface-card border border-surface-border rounded-xl overflow-hidden min-h-75'>
            {activeTab === 'media' && (
              <div className='p-4'>
                <Media
                  pitches={null}
                  media={data.media ?? []}
                  orderableMedia={orderableMedia}
                  carouselMedia={carouselMedia}
                  optProblemId={null}
                  showLocation={false}
                />
              </div>
            )}
            {activeTab === 'map' && (
              <Leaflet
                key={'sector=' + data.id}
                autoZoom={true}
                height='50vh'
                markers={markers}
                outlines={outlines}
                slopes={slopes}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                onMouseClick={undefined}
                onMouseMove={undefined}
                showSatelliteImage={isBouldering}
                clusterMarkers={true}
                rocks={uniqueRocks}
                flyToId={null}
              />
            )}
            {activeTab === 'distribution' && (
              <div className='p-6'>
                <ChartGradeDistribution idSector={data.id ?? 0} />
              </div>
            )}
            {activeTab === 'top' && (
              <div className='p-4'>
                <Top idArea={0} idSector={data.id ?? 0} />
              </div>
            )}
            {activeTab === 'activity' && (
              <div className='p-4'>
                <Activity idArea={0} idSector={data.id ?? 0} />
              </div>
            )}
            {activeTab === 'todo' && (
              <div className='p-4'>
                <Todo idArea={0} idSector={data.id ?? 0} />
              </div>
            )}
          </div>
        </div>
      )}

      {(data.areaAccessInfo || data.accessInfo || data.areaNoDogsAllowed) && (
        <div className='bg-orange-500/10 border border-orange-500/20 rounded-xl p-5'>
          <h5 className='flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500 mb-3'>
            <AlertTriangle size={14} /> Restrictions
          </h5>
          <div className='space-y-3 text-sm text-orange-400 ml-6'>
            {data.areaNoDogsAllowed && <NoDogsAllowed />}
            {data.areaAccessInfo && <p>{data.areaAccessInfo}</p>}
            {data.accessInfo && <p>{data.accessInfo}</p>}
          </div>
        </div>
      )}

      <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm'>
        <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6 border-b border-surface-border/50'>
          <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
            Sector
          </div>
          <div className='space-y-3'>
            <div className='flex flex-wrap gap-2'>
              {uniqueTypes.map((subType) => {
                const header = subType ? subType : 'Boulders';
                const problemsOfType =
                  data.problems?.filter(
                    (p) =>
                      (subType === 'Projects' && p.gradeNumber === 0) ||
                      (subType === 'Broken' && p.broken) ||
                      (p.t?.subType === subType && p.gradeNumber !== 0),
                  ) ?? [];
                const numTicked = problemsOfType.filter((p) => p.ticked).length;
                const txt =
                  numTicked === 0
                    ? problemsOfType.length
                    : `${problemsOfType.length} (${numTicked} ticked)`;
                return (
                  <div
                    key={header}
                    className='inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-nav border border-surface-border text-xs text-slate-300'
                  >
                    <span className='font-medium text-white'>{header}:</span> <span>{txt}</span>
                  </div>
                );
              })}
              <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-nav border border-surface-border text-xs text-slate-300'>
                <span className='font-medium text-white'>Page views:</span>{' '}
                <span>{data.pageViews}</span>
              </div>
            </div>
            {data.comment && (
              <div className='text-sm text-slate-400 mt-2'>
                <Markdown content={data.comment} />
              </div>
            )}
          </div>
        </div>

        {((data.sectors ?? []).length > 1 || data.areaComment) && (
          <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6 border-b border-surface-border/50'>
            <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
              Area
            </div>
            <div className='space-y-4'>
              {(data.sectors ?? []).length > 1 && (
                <div className='flex flex-wrap gap-1.5'>
                  {(data.sectors ?? []).map((s) => (
                    <Link
                      key={s.id}
                      to={`/sector/${s.id}`}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border',
                        data.id === s.id
                          ? 'bg-brand/10 border-brand/30 text-brand'
                          : 'bg-surface-nav border-surface-border text-slate-400 hover:text-white',
                      )}
                    >
                      <LockSymbol
                        lockedAdmin={!!s.lockedAdmin}
                        lockedSuperadmin={!!s.lockedSuperadmin}
                      />
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
              {data.areaComment && (
                <div className='text-sm text-slate-400'>
                  <ExpandableText text={data.areaComment} maxLength={75} />
                </div>
              )}
            </div>
          </div>
        )}

        {(data.approach?.coordinates ?? []).length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6 border-b border-surface-border/50'>
            <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
              Approach
            </div>
            <div>
              <SlopeProfile
                areaName={data.areaName ?? ''}
                sectorName={data.name ?? ''}
                slope={data.approach as Slope}
              />
            </div>
          </div>
        )}

        {(data.descent?.coordinates ?? []).length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6 border-b border-surface-border/50'>
            <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
              Descent
            </div>
            <div>
              <SlopeProfile
                areaName={data.areaName ?? ''}
                sectorName={data.name ?? ''}
                slope={data.descent as Slope}
              />
            </div>
          </div>
        )}

        {(data.triviaMedia ?? []).length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6 border-b border-surface-border/50'>
            <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
              Trivia
            </div>
            <div>
              <Media
                pitches={null}
                media={data.triviaMedia ?? []}
                orderableMedia={orderableMedia}
                carouselMedia={carouselMedia}
                optProblemId={null}
                showLocation={false}
              />
            </div>
          </div>
        )}

        {conditionLat > 0 &&
          conditionLng > 0 &&
          (data.wallDirectionCalculated || data.wallDirectionManual) && (
            <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6 border-b border-surface-border/50'>
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
                Conditions
              </div>
              <div>
                <ConditionLabels
                  lat={conditionLat}
                  lng={conditionLng}
                  label={data.name ?? ''}
                  wallDirectionCalculated={data.wallDirectionCalculated}
                  wallDirectionManual={data.wallDirectionManual}
                  sunFromHour={data.sunFromHour ?? data.areaSunFromHour ?? 0}
                  sunToHour={data.sunToHour ?? data.areaSunToHour ?? 0}
                />
              </div>
            </div>
          )}

        <div className='grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-5 px-6'>
          <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 md:pt-1'>
            Misc
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <DownloadButton href={`/sectors/pdf?id=${data.id}`}>sector.pdf</DownloadButton>
            <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>area.pdf</DownloadButton>
            {data.parking && (
              <a
                href={`http://googleusercontent.com/maps.google.com/maps?q=${data.parking.latitude},${data.parking.longitude}`}
                rel='noreferrer noopener'
                target='_blank'
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-nav hover:bg-surface-hover border border-surface-border text-xs text-slate-300 hover:text-white transition-colors'
              >
                <MapIcon size={14} /> Parking
              </a>
            )}
            {meta.isClimbing && (data.outline ?? []).length > 0 && (
              <a
                href={`http://googleusercontent.com/maps.google.com/maps?q=${(data.outline ?? [])[0]?.latitude},${(data.outline ?? [])[0]?.longitude}`}
                rel='noreferrer noopener'
                target='_blank'
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-nav hover:bg-surface-hover border border-surface-border text-xs text-slate-300 hover:text-white transition-colors'
              >
                <MapIcon size={14} /> Sector
              </a>
            )}
            <ExternalLinkLabels externalLinks={data.externalLinks} />
          </div>
        </div>
      </div>

      <div className='pt-4'>
        <ProblemList
          storageKey={`sector/${sectorId}`}
          mode='sector'
          defaultOrder={data.orderByGrade ? 'grade-desc' : 'number'}
          rows={
            data.problems?.map((p) => {
              return {
                element: <SectorListItem key={p.id} problem={p} />,
                name: p.name ?? '',
                nr: p.nr ?? 0,
                gradeNumber: p.gradeNumber ?? 0,
                stars: p.stars ?? 0,
                numTicks: p.numTicks ?? 0,
                ticked: p.ticked ?? false,
                rock: p.rock ?? '',
                subType: p.t?.subType ?? '',
                num: 0,
                fa: !!p.fa,
                faDate: p.faDate ?? null,
                areaName: '',
                sectorName: '',
              } satisfies ComponentProps<typeof ProblemList>['rows'][number];
            }) ?? []
          }
        />
      </div>
    </div>
  );
};

export default Sector;
