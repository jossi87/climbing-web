import { type ComponentProps, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProblemList from '../../shared/components/ProblemList';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import { SlopeProfile } from '../../shared/components/SlopeProfile';
import Top from '../../shared/components/Top/Top';
import Activity from '../../shared/components/Activity/Activity';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import Media from '../../shared/components/Media/Media';
import Todo from '../../shared/components/Todo/Todo';
import GetCenterFromDegrees from '../../utils/map-utils';
import {
  Stars,
  LockSymbol,
  Loading,
  ConditionLabels,
  ExternalLinkLabels,
  NoDogsAllowed,
} from '../../shared/components/Widgets/Widgets';
import { useMeta } from '../../shared/components/Meta/context';
import { useSector } from '../../api';
import type { Slope } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import type { MarkerDef } from '../../shared/components/Leaflet/markers';
import { Markdown } from '../../shared/components/Markdown/Markdown';
import ExpandableText from '../../shared/components/ExpandableText/ExpandableText';
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
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  problem: NonNullable<components['schemas']['Sector']['problems']>[number];
};

export const SectorListItem = ({ problem }: Props) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? (problem.t?.subType ?? '') + ((problem.numPitches ?? 0) > 1 ? ', ' + problem.numPitches + ' pitches' : '')
    : null;
  const ascents = problem.numTicks ? problem.numTicks + (problem.numTicks === 1 ? ' ascent' : ' ascents') : null;

  let faTypeAscents = problem.fa || '';
  if (problem.faDate) {
    faTypeAscents += ' ' + problem.faDate.substring(0, 4);
  }
  if (type && ascents) {
    faTypeAscents = (faTypeAscents !== '' ? faTypeAscents + ' (' : '(') + type + ', ' + ascents + ')';
  } else if (type) {
    faTypeAscents = (faTypeAscents !== '' ? faTypeAscents + ' (' : '(') + type + ')';
  } else if (ascents) {
    faTypeAscents = (faTypeAscents !== '' ? faTypeAscents + ' (' : '(') + ascents + ')';
  }
  faTypeAscents = faTypeAscents.trim();

  return (
    <div
      className={cn(
        'flex flex-col gap-x-4 gap-y-2 rounded-xl border p-3 transition-colors xl:flex-row xl:items-start',
        problem.ticked
          ? 'border-green-500/20 bg-green-500/5'
          : problem.todo
            ? 'border-blue-500/20 bg-blue-500/5'
            : 'bg-surface-card border-surface-border hover:border-brand/50 hover:bg-surface-nav/30',
      )}
    >
      <div className='flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex flex-wrap items-center gap-2'>
          {problem.danger && <AlertTriangle size={14} className='shrink-0 text-red-500' />}
          <span className='min-w-6 shrink-0 font-mono text-[11px] text-slate-500'>#{problem.nr}</span>
          <Link
            to={`/problem/${problem.id}`}
            className={cn(
              'text-[15px] font-bold transition-colors',
              problem.broken ? 'font-medium line-through opacity-70' : 'type-h2 hover:text-brand',
            )}
          >
            {problem.name}
          </Link>
          <span className='font-mono text-[12px] text-slate-400 normal-case'>[{problem.grade}]</span>
          {problem.stars ? (
            <div className='flex shrink-0 origin-left scale-75 items-center'>
              <Stars numStars={problem.stars} includeStarOutlines={false} />
            </div>
          ) : null}
          <LockSymbol lockedAdmin={!!problem.lockedAdmin} lockedSuperadmin={!!problem.lockedSuperadmin} />
          {problem.broken && (
            <span className='rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500 uppercase'>
              {problem.broken}
            </span>
          )}
        </div>

        <div className='flex shrink-0 flex-wrap items-center gap-2 text-slate-400'>
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

      <div className='flex shrink-0 flex-col gap-0.5 xl:max-w-[40%] xl:text-right'>
        {faTypeAscents && <span className='text-[11px] font-medium text-slate-400'>{faTypeAscents}</span>}
        {(problem.rock || problem.comment) && (
          <span className='text-[11px] leading-relaxed text-slate-500 italic'>
            {problem.rock && <span className='mr-1 font-medium text-slate-400'>Rock: {problem.rock}.</span>}
            {problem.comment}
          </span>
        )}
      </div>
    </div>
  );
};

type ProblemType = NonNullable<NonNullable<ReturnType<typeof useSector>['data']>['problems']>[number];

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
      <div className='bg-surface-card border-surface-border mx-auto mt-12 max-w-2xl space-y-4 rounded-2xl border p-8 text-center'>
        <AlertTriangle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='type-h1'>404 Error</h2>
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
        (p): p is NonNullable<ProblemType> & Required<NonNullable<Pick<ProblemType, 'coordinates'>>> =>
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
  if ((data.problems ?? []).filter((p) => p.gradeNumber === 0)?.length) uniqueTypes.push('Projects');
  uniqueTypes.sort();

  const [conditionLat, conditionLng] = (() => {
    const validatedOutline = data?.outline?.filter(
      (c): c is Required<Pick<NonNullable<(typeof data)['outline']>[number], 'latitude' | 'longitude'>> =>
        !!c.latitude && !!c.longitude,
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
    <div className='max-w-container mx-auto space-y-8 px-4 py-6 text-left'>
      <title>{`${data.name} (${data.areaName}) | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <Link to='/areas' className='transition-colors'>
            Areas
          </Link>
          <ChevronRight size={12} className='opacity-20' />
          <Link to={`/area/${data.areaId}`} className='transition-colors'>
            {data.areaName}
          </Link>
          <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <span>{data.name}</span>
            <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
          </div>
        </nav>

        {meta.isAdmin && (
          <div className='flex items-center gap-2'>
            <Link
              to={`/problem/edit/${data.id}/0`}
              className='type-label flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-green-500 transition-colors hover:bg-green-500/20'
            >
              <Plus size={14} /> Add
            </Link>
            <Link
              to={`/sector/edit/${data.areaId}/${data.id}`}
              className='bg-surface-nav border-surface-border hover:bg-surface-hover type-label flex items-center gap-1.5 rounded-lg border px-3 py-1.5 opacity-85 transition-colors hover:opacity-100'
            >
              <Edit size={14} /> Edit
            </Link>
          </div>
        )}
      </div>

      {(data.areaAccessClosed || data.accessClosed) && (
        <div className='flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4'>
          <AlertTriangle className='mt-0.5 shrink-0 text-red-500' />
          <div>
            <h3 className='mb-1 text-lg font-bold text-red-500'>
              {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed!'}
            </h3>
            <p className='text-sm text-red-400'>{(data.areaAccessClosed || '') + (data.accessClosed || '')}</p>
          </div>
        </div>
      )}

      {tabs.length > 0 && (
        <div className='space-y-4'>
          <div className='scrollbar-hide border-surface-border flex gap-2 overflow-x-auto border-b pb-2'>
            {tabs.map((t) => {
              const IconComponent = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-all',
                    isActive
                      ? 'bg-brand shadow-brand/20 shadow-md'
                      : 'hover:bg-surface-nav opacity-70 hover:opacity-100',
                  )}
                >
                  <IconComponent size={16} /> {t.label}
                </button>
              );
            })}
          </div>

          <div className='bg-surface-card border-surface-border min-h-75 overflow-hidden rounded-xl border'>
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
        <div className='rounded-xl border border-orange-500/20 bg-orange-500/10 p-5'>
          <h5 className='type-label mb-3 flex items-center gap-2 text-orange-500'>
            <AlertTriangle size={14} /> Restrictions
          </h5>
          <div className='ml-6 space-y-3 text-sm text-orange-400'>
            {data.areaNoDogsAllowed && <NoDogsAllowed />}
            {data.areaAccessInfo && <p>{data.areaAccessInfo}</p>}
            {data.accessInfo && <p>{data.accessInfo}</p>}
          </div>
        </div>
      )}

      <div className='bg-surface-card border-surface-border overflow-hidden rounded-2xl border shadow-sm'>
        <div className='border-surface-border/50 grid grid-cols-1 gap-4 border-b px-6 py-5 md:grid-cols-[140px_1fr]'>
          <div className={cn('md:pt-1', designContract.typography.label)}>Sector</div>
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
                const txt = numTicked === 0 ? problemsOfType.length : `${problemsOfType.length} (${numTicked} ticked)`;
                return (
                  <div
                    key={header}
                    className='bg-surface-nav border-surface-border inline-flex items-center gap-2 rounded border px-2.5 py-1 text-xs text-slate-300'
                  >
                    <span className='font-medium'>{header}:</span> <span>{txt}</span>
                  </div>
                );
              })}
              <div className='bg-surface-nav border-surface-border inline-flex items-center gap-2 rounded border px-2.5 py-1 text-xs text-slate-300'>
                <span className='font-medium'>Page views:</span> <span>{data.pageViews}</span>
              </div>
            </div>
            {data.comment && (
              <div className='mt-2 text-sm text-slate-400'>
                <Markdown content={data.comment} />
              </div>
            )}
          </div>
        </div>

        {((data.sectors ?? []).length > 1 || data.areaComment) && (
          <div className='border-surface-border/50 grid grid-cols-1 gap-4 border-b px-6 py-5 md:grid-cols-[140px_1fr]'>
            <div className={cn('md:pt-1', designContract.typography.label)}>Area</div>
            <div className='space-y-4'>
              {(data.sectors ?? []).length > 1 && (
                <div className='flex flex-wrap gap-1.5'>
                  {(data.sectors ?? []).map((s) => (
                    <Link
                      key={s.id}
                      to={`/sector/${s.id}`}
                      className={cn(
                        'type-label flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-all',
                        data.id === s.id
                          ? 'bg-brand/10 border-brand/30 text-brand'
                          : 'bg-surface-nav border-surface-border opacity-70 hover:opacity-100',
                      )}
                    >
                      <LockSymbol lockedAdmin={!!s.lockedAdmin} lockedSuperadmin={!!s.lockedSuperadmin} />
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
          <div className='border-surface-border/50 grid grid-cols-1 gap-4 border-b px-6 py-5 md:grid-cols-[140px_1fr]'>
            <div className={cn('md:pt-1', designContract.typography.label)}>Approach</div>
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
          <div className='border-surface-border/50 grid grid-cols-1 gap-4 border-b px-6 py-5 md:grid-cols-[140px_1fr]'>
            <div className={cn('md:pt-1', designContract.typography.label)}>Descent</div>
            <div>
              <SlopeProfile areaName={data.areaName ?? ''} sectorName={data.name ?? ''} slope={data.descent as Slope} />
            </div>
          </div>
        )}

        {(data.triviaMedia ?? []).length > 0 && (
          <div className='border-surface-border/50 grid grid-cols-1 gap-4 border-b px-6 py-5 md:grid-cols-[140px_1fr]'>
            <div className={cn('md:pt-1', designContract.typography.label)}>Trivia</div>
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

        {conditionLat > 0 && conditionLng > 0 && (data.wallDirectionCalculated || data.wallDirectionManual) && (
          <div className='border-surface-border/50 grid grid-cols-1 gap-4 border-b px-6 py-5 md:grid-cols-[140px_1fr]'>
            <div className={cn('md:pt-1', designContract.typography.label)}>Conditions</div>
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

        <div className='grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-[140px_1fr]'>
          <div className={cn('md:pt-1', designContract.typography.label)}>Misc</div>
          <div className='flex flex-wrap items-center gap-2'>
            <DownloadButton href={`/sectors/pdf?id=${data.id}`}>sector.pdf</DownloadButton>
            <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>area.pdf</DownloadButton>
            {data.parking && (
              <a
                href={`http://googleusercontent.com/maps.google.com/maps?q=${data.parking.latitude},${data.parking.longitude}`}
                rel='noreferrer noopener'
                target='_blank'
                className='bg-surface-nav hover:bg-surface-hover border-surface-border type-small flex items-center gap-1.5 rounded-lg border px-3 py-1.5 opacity-85 transition-colors hover:opacity-100'
              >
                <MapIcon size={14} /> Parking
              </a>
            )}
            {meta.isClimbing && (data.outline ?? []).length > 0 && (
              <a
                href={`http://googleusercontent.com/maps.google.com/maps?q=${(data.outline ?? [])[0]?.latitude},${(data.outline ?? [])[0]?.longitude}`}
                rel='noreferrer noopener'
                target='_blank'
                className='bg-surface-nav hover:bg-surface-hover border-surface-border type-small flex items-center gap-1.5 rounded-lg border px-3 py-1.5 opacity-85 transition-colors hover:opacity-100'
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
