import { type ComponentProps, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
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
import { Loading } from '../../shared/ui/StatusWidgets';
import { Stars, LockSymbol } from '../../shared/ui/Indicators';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { useSector } from '../../api';
import type { Slope } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card } from '../../shared/ui';
import { tabBarButtonClassName, tabBarIconClassName } from '../../design/tabBar';
import ExpandableText from '../../shared/components/ExpandableText/ExpandableText';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import {
  AlertTriangle,
  ChevronRight,
  Edit,
  Plus,
  MapPin,
  Brush,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  CheckCircle2,
  Bookmark,
  Map as MapIcon,
  BarChart2,
  Trophy,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type SectorProblemRow = NonNullable<components['schemas']['Sector']['problems']>[number];

type SectorListItemProps = {
  problem: SectorProblemRow;
};

export const SectorListItem = ({ problem }: SectorListItemProps) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? (problem.t?.subType ?? '') + ((problem.numPitches ?? 1) > 1 ? ', ' + problem.numPitches + ' pitches' : '')
    : null;
  const ascents = problem.numTicks && problem.numTicks === 1 ? '1 ascent' : (problem.numTicks ?? 0) + ' ascents';

  let faTypeAscents = problem.fa;
  if (problem.faDate) {
    faTypeAscents += ' ' + problem.faDate.substring(0, 4);
  }
  if (type && ascents) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ', ' + ascents + ')';
  } else if (type) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ')';
  } else if (ascents) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + ascents + ')';
  }

  const hasTrailIcons =
    !!problem.coordinates ||
    !!problem.hasTopo ||
    !!problem.hasImages ||
    !!problem.hasMovies ||
    !!problem.ticked ||
    !!problem.todo;

  return (
    <div
      className={cn(
        'border-surface-border/35 border-b py-3 transition-colors last:border-b-0 sm:px-1',
        problem.ticked && 'bg-green-500/[0.03]',
        problem.todo && !problem.ticked && 'bg-blue-500/[0.03]',
      )}
    >
      <p
        className={cn(
          designContract.typography.body,
          'min-w-0 leading-relaxed text-pretty [overflow-wrap:anywhere] text-slate-300',
        )}
      >
        {problem.danger && <AlertTriangle size={13} className='mr-1 inline-block shrink-0 text-red-500' />}
        <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
          #{problem.nr}
        </span>{' '}
        <Link
          to={`/problem/${problem.id}`}
          className={cn(
            designContract.typography.listLink,
            designContract.typography.listEmphasis,
            problem.broken ? 'line-through opacity-70' : undefined,
          )}
        >
          {problem.name}
        </Link>
        {problem.grade ? (
          <>
            {' '}
            <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
              {problem.grade}
            </span>
          </>
        ) : null}
        {problem.stars ? (
          <span className='ml-1 inline-flex origin-left scale-90 align-middle'>
            <Stars numStars={problem.stars} includeStarOutlines={false} />
          </span>
        ) : null}
        <span className='text-slate-600'> · </span>
        <LockSymbol lockedAdmin={!!problem.lockedAdmin} lockedSuperadmin={!!problem.lockedSuperadmin} />
        {problem.broken ? (
          <>
            {' '}
            <span className='rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-red-400 uppercase'>
              {problem.broken}
            </span>
          </>
        ) : null}
        {hasTrailIcons ? (
          <>
            <span className='text-slate-600'> · </span>
            <span className='inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 align-middle text-slate-500'>
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
            </span>
          </>
        ) : null}
      </p>
      {(faTypeAscents || problem.rock || problem.comment) && (
        <p className={cn(designContract.typography.meta, 'mt-1.5 text-pretty [overflow-wrap:anywhere] text-slate-500')}>
          {faTypeAscents ? <span className='text-slate-400'>{faTypeAscents}</span> : null}
          {faTypeAscents && (problem.rock || problem.comment) ? <span className='text-slate-600'> · </span> : null}
          {problem.rock && <span className='font-medium text-slate-400 not-italic'>Rock: {problem.rock}.</span>}
          {problem.rock && problem.comment ? ' ' : null}
          {problem.comment ? <span className='italic'>{problem.comment}</span> : null}
        </p>
      )}
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

  const markers = useMemo((): NonNullable<ComponentProps<typeof Leaflet>['markers']> => {
    if (!data) return [];
    const list: NonNullable<ComponentProps<typeof Leaflet>['markers']> =
      data.problems
        ?.filter(
          (p): p is NonNullable<ProblemType> & Required<NonNullable<Pick<ProblemType, 'coordinates'>>> =>
            !!(p.coordinates && p.coordinates.latitude && p.coordinates.longitude),
        )
        ?.map((p) => ({
          coordinates: p.coordinates,
          label: `${p.nr} · ${p.name} · ${p.grade}`,
          url: '/problem/' + p.id,
          rock: p.rock,
        })) ?? [];
    if (data.parking) {
      list.push({ coordinates: data.parking, isParking: true });
    }
    return list;
  }, [data]);

  const tabs = useMemo(() => {
    if (!data) return [] as { id: string; label: string; icon: LucideIcon }[];
    const t: { id: string; label: string; icon: LucideIcon }[] = [];
    t.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
    if (markers.length > 0 || (data.outline ?? []).length) {
      t.push({ id: 'map', label: 'Map', icon: MapIcon });
    }
    if ((data.problems ?? []).length > 0) {
      t.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
      t.push({ id: 'top', label: 'Top', icon: Trophy });
      t.push({ id: 'todo', label: 'Todo', icon: Bookmark });
      t.push({ id: 'activity', label: 'Activity', icon: Clock });
    }
    return t;
  }, [data, markers]);

  const normalizedActiveTab = activeTab === 'media' ? 'overview' : activeTab;
  const effectiveTab =
    tabs.length === 0
      ? null
      : normalizedActiveTab !== null && tabs.some((x) => x.id === normalizedActiveTab)
        ? normalizedActiveTab
        : tabs[0].id;

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
  const addPolygon = meta.isClimbing || markers.length === 0;

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
    <div className='w-full min-w-0 space-y-4 sm:space-y-6'>
      <title>{`${data.name} (${data.areaName}) | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='relative p-4 sm:p-5'>
          {meta.isAdmin && (
            <div className='absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 sm:top-5 sm:right-5'>
              <Link
                to={`/sector/edit/${data.areaId}/${data.id}`}
                title='Edit sector'
                aria-label='Edit sector'
                className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/45 bg-amber-400/18 text-amber-100 transition-colors hover:bg-amber-400/28'
              >
                <Edit size={12} />
              </Link>
              <Link
                to={`/problem/edit/${data.id}/0`}
                title='Add problem'
                aria-label='Add problem'
                className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-400/40 bg-green-500/20 text-green-300 transition-colors hover:bg-green-500/30 hover:text-green-200'
              >
                <Plus size={12} />
              </Link>
            </div>
          )}

          <nav className='mb-4 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 sm:text-[12px]'>
            <Link to='/areas' className='transition-colors hover:text-slate-300'>
              Areas
            </Link>
            <ChevronRight size={12} className='shrink-0 opacity-30' />
            <Link to={`/area/${data.areaId}`} className='transition-colors hover:text-slate-300'>
              {data.areaName}
            </Link>
            <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
            <ChevronRight size={12} className='shrink-0 opacity-30' />
            <span className='flex items-center gap-1.5 text-slate-400'>
              {data.name}
              <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
            </span>
          </nav>

          {data.areaAccessClosed ||
          data.accessClosed ||
          data.areaAccessInfo ||
          data.accessInfo ||
          data.areaNoDogsAllowed ? (
            <div className='mt-1 min-w-0 space-y-2 text-[12px] leading-relaxed sm:text-[13px]'>
              {(data.areaAccessClosed || data.accessClosed) && (
                <p className='text-pretty text-red-300/90'>
                  {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed: '}
                  {(data.areaAccessClosed || '') + (data.accessClosed || '')}
                </p>
              )}
              {(data.areaNoDogsAllowed || data.areaAccessInfo || data.accessInfo) && (
                <div className='space-y-1.5 text-orange-300/90'>
                  {data.areaNoDogsAllowed && <NoDogsAllowed />}
                  {data.areaAccessInfo && <p className='text-pretty'>{data.areaAccessInfo}</p>}
                  {data.accessInfo && <p className='text-pretty'>{data.accessInfo}</p>}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {tabs.length > 0 && (
          <>
            <div className='border-surface-border border-t'>
              <div
                className={designContract.controls.tabBarRow}
                style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
                role='tablist'
                aria-label='Sector sections'
              >
                {tabs.map((t) => {
                  const IconComp = t.icon;
                  const isActive = effectiveTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type='button'
                      role='tab'
                      aria-selected={isActive}
                      onClick={() => setActiveTab(t.id)}
                      className={tabBarButtonClassName(isActive)}
                    >
                      <IconComp size={12} strokeWidth={isActive ? 2.3 : 2} className={tabBarIconClassName(isActive)} />
                      <span className='block min-w-0 truncate leading-none'>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {effectiveTab !== 'activity' && (
              <div className='border-surface-border/40 border-t'>
                {effectiveTab === 'overview' && (
                  <div className='space-y-4 p-4 sm:p-5'>
                    {(data.media?.length ?? 0) > 0 && (
                      <Media
                        pitches={null}
                        media={data.media ?? []}
                        orderableMedia={orderableMedia}
                        carouselMedia={carouselMedia}
                        optProblemId={null}
                        showLocation={false}
                      />
                    )}

                    <div className='flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2'>
                      <ConditionLabels
                        lat={conditionLat > 0 ? conditionLat : undefined}
                        lng={conditionLng > 0 ? conditionLng : undefined}
                        label={data.name ?? ''}
                        wallDirectionCalculated={data.wallDirectionCalculated}
                        wallDirectionManual={data.wallDirectionManual}
                        sunFromHour={data.sunFromHour ?? data.areaSunFromHour ?? 0}
                        sunToHour={data.sunToHour ?? data.areaSunToHour ?? 0}
                        pageViews={data.pageViews}
                      />
                      <DownloadButton href={`/sectors/pdf?id=${data.id}`}>sector.pdf</DownloadButton>
                      <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>area.pdf</DownloadButton>
                      <ExternalLinkLabels externalLinks={data.externalLinks} />
                    </div>

                    {(data.comment ?? '').trim().length > 0 && (
                      <ExpandableMarkdown key={data.id} content={data.comment ?? ''} />
                    )}

                    {(data.triviaMedia?.length ?? 0) > 0 && (
                      <div className='pt-1'>
                        <Media
                          pitches={null}
                          media={data.triviaMedia ?? []}
                          orderableMedia={orderableMedia}
                          carouselMedia={carouselMedia}
                          optProblemId={null}
                          showLocation={false}
                        />
                      </div>
                    )}
                  </div>
                )}
                {effectiveTab === 'map' && (
                  <div className='relative z-0 -mx-px h-[35vh] min-h-[220px] w-[calc(100%+2px)] overflow-hidden sm:mx-0 sm:h-[50vh] sm:w-full'>
                    <Leaflet
                      key={'sector=' + data.id}
                      autoZoom={true}
                      height='100%'
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
                  </div>
                )}
                {effectiveTab === 'distribution' && (
                  <div className='p-4 sm:p-5'>
                    <ChartGradeDistribution idSector={data.id ?? 0} embedded />
                  </div>
                )}
                {effectiveTab === 'top' && (
                  <div className='p-4 sm:p-5'>
                    <Top idArea={0} idSector={data.id ?? 0} />
                  </div>
                )}
                {effectiveTab === 'todo' && (
                  <div className='p-4 sm:p-5'>
                    <Todo idArea={0} idSector={data.id ?? 0} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      <Card flush className='min-w-0 overflow-hidden border-0 sm:border'>
        <div className='grid grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[min(7rem,28%)_1fr]'>
          <div
            className={cn(
              'md:pt-0.5',
              designContract.typography.micro,
              'font-semibold tracking-wide text-slate-500 uppercase',
            )}
          >
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
                const txt = numTicked === 0 ? problemsOfType.length : `${problemsOfType.length} (${numTicked} ticked)`;
                return (
                  <div key={header} className={designContract.surfaces.inlineChip}>
                    <span className='font-medium text-slate-400'>{header}:</span> <span>{txt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {((data.sectors ?? []).length > 1 || data.areaComment) && (
          <div className='grid grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[min(7rem,28%)_1fr]'>
            <div
              className={cn(
                'md:pt-0.5',
                designContract.typography.micro,
                'font-semibold tracking-wide text-slate-500 uppercase',
              )}
            >
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
                        designContract.surfaces.inlineChipInteractive,
                        'gap-1.5 py-1 text-[11px] font-medium',
                        data.id === s.id
                          ? 'bg-surface-hover/35 border-white/22 text-slate-100'
                          : 'opacity-90 hover:opacity-100',
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
          <div className='grid grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[min(7rem,28%)_1fr]'>
            <div
              className={cn(
                'md:pt-0.5',
                designContract.typography.micro,
                'font-semibold tracking-wide text-slate-500 uppercase',
              )}
            >
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
          <div className='grid grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[min(7rem,28%)_1fr]'>
            <div
              className={cn(
                'md:pt-0.5',
                designContract.typography.micro,
                'font-semibold tracking-wide text-slate-500 uppercase',
              )}
            >
              Descent
            </div>
            <div>
              <SlopeProfile areaName={data.areaName ?? ''} sectorName={data.name ?? ''} slope={data.descent as Slope} />
            </div>
          </div>
        )}

        {((conditionLat > 0 && conditionLng > 0) || (data.pageViews != null && String(data.pageViews).length > 0)) && (
          <div className='grid grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[min(7rem,28%)_1fr]'>
            <div
              className={cn(
                'md:pt-0.5',
                designContract.typography.micro,
                'font-semibold tracking-wide text-slate-500 uppercase',
              )}
            >
              Conditions
            </div>
            <div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
              <ConditionLabels
                lat={conditionLat > 0 ? conditionLat : undefined}
                lng={conditionLng > 0 ? conditionLng : undefined}
                label={data.name ?? ''}
                wallDirectionCalculated={data.wallDirectionCalculated}
                wallDirectionManual={data.wallDirectionManual}
                sunFromHour={data.sunFromHour ?? data.areaSunFromHour ?? 0}
                sunToHour={data.sunToHour ?? data.areaSunToHour ?? 0}
                pageViews={data.pageViews}
              />
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:grid-cols-[min(7rem,28%)_1fr]'>
          <div
            className={cn(
              'md:pt-0.5',
              designContract.typography.micro,
              'font-semibold tracking-wide text-slate-500 uppercase',
            )}
          >
            Misc
          </div>
          <div className='flex flex-wrap items-center gap-1.5'>
            {data.parking && (
              <a
                href={`http://googleusercontent.com/maps.google.com/maps?q=${data.parking.latitude},${data.parking.longitude}`}
                rel='noreferrer noopener'
                target='_blank'
                title='Open parking in Google Maps'
                className={cn(
                  designContract.surfaces.inlineChipInteractive,
                  'gap-1 px-2 py-0.5 text-[11px] font-medium',
                )}
              >
                <MapIcon size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} />
                Parking
              </a>
            )}
            {meta.isClimbing && (data.outline ?? []).length > 0 && (
              <a
                href={`http://googleusercontent.com/maps.google.com/maps?q=${(data.outline ?? [])[0]?.latitude},${(data.outline ?? [])[0]?.longitude}`}
                rel='noreferrer noopener'
                target='_blank'
                title='Sector location in Google Maps'
                className={cn(
                  designContract.surfaces.inlineChipInteractive,
                  'gap-1 px-2 py-0.5 text-[11px] font-medium',
                )}
              >
                <MapIcon size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} />
                Sector
              </a>
            )}
            <ExternalLinkLabels externalLinks={data.externalLinks} />
          </div>
        </div>
      </Card>

      {effectiveTab === 'overview' && (data.problems?.length ?? 0) > 0 && (
        <Card
          flush
          className='border-surface-border/35 bg-surface-card/90 min-w-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-white/5 sm:border'
        >
          <div className='p-3 sm:p-4'>
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
        </Card>
      )}

      {effectiveTab === 'activity' && (
        <div className='mt-4 min-w-0'>
          <Activity idArea={0} idSector={data.id ?? 0} />
        </div>
      )}
    </div>
  );
};

export default Sector;
