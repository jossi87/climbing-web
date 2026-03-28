import { type ComponentProps, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import Top from '../../shared/components/Top/Top';
import Activity from '../../shared/components/Activity/Activity';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import Media from '../../shared/components/Media/Media';
import Todo from '../../shared/components/Todo/Todo';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Stars, LockSymbol } from '../../shared/ui/Indicators';
import { SunOnWall } from '../../shared/components/Widgets/ClimbingWidgets';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { useMeta } from '../../shared/components/Meta/context';
import { getMediaFileUrl, useArea } from '../../api';
import { Markdown } from '../../shared/components/Markdown/Markdown';
import ProblemList from '../../shared/components/ProblemList';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, SectionHeader } from '../../shared/ui';
import {
  ChevronRight,
  Plus,
  Edit,
  AlertTriangle,
  Image as ImageIcon,
  Map as MapIcon,
  BarChart2,
  Trophy,
  Bookmark,
  MapPin,
  Brush,
  Film,
  CheckCircle2,
  LayoutGrid,
  LayoutDashboard,
  List,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { tabBarButtonClassName, tabBarButtonClassNameInline, tabBarIconClassName } from '../../design/tabBar';

type Props = {
  sectorName: string;
  problem: NonNullable<NonNullable<components['schemas']['Area']['sectors']>[number]['problems']>[number];
};

const SectorListItem = ({ sectorName, problem }: Props) => {
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
        'rounded-md px-0 py-2 transition-colors sm:px-0.5',
        problem.ticked && 'bg-green-500/[0.04]',
        problem.todo && !problem.ticked && 'bg-blue-500/[0.04]',
      )}
    >
      <p
        className={cn(
          designContract.typography.body,
          'min-w-0 leading-snug text-pretty [overflow-wrap:anywhere] text-slate-300 sm:leading-relaxed',
        )}
      >
        {problem.danger && <AlertTriangle size={13} className='mr-1 inline-block shrink-0 text-red-500' />}
        <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
          #{problem.nr}
        </span>{' '}
        <Link
          to={`/problem/${problem.id}`}
          className={cn(designContract.typography.listLink, designContract.typography.listEmphasis)}
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
        <span className={designContract.typography.meta}>{sectorName}</span>
        <LockSymbol lockedAdmin={!!problem.lockedAdmin} lockedSuperadmin={!!problem.lockedSuperadmin} />
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
        {(faTypeAscents || problem.rock || problem.comment) && (
          <>
            <span className='text-slate-600'> · </span>
            <span className={cn(designContract.typography.meta, 'text-slate-500')}>
              {faTypeAscents ? <span className='text-slate-400'>{faTypeAscents}</span> : null}
              {faTypeAscents && (problem.rock || problem.comment) ? <span className='text-slate-600'> · </span> : null}
              {problem.rock ? (
                <span className='font-medium text-slate-400 not-italic'>Rock: {problem.rock}.</span>
              ) : null}
              {problem.rock && problem.comment ? <span className='text-slate-600'> · </span> : null}
              {problem.comment ? <span className='text-slate-500 italic'>{problem.comment}</span> : null}
            </span>
          </>
        )}
      </p>
    </div>
  );
};

type AreaSectorType = NonNullable<components['schemas']['Area']['sectors']>[number];
type SectorWithParking = AreaSectorType &
  (Pick<AreaSectorType, 'parking'> & {
    parking: Required<Pick<NonNullable<AreaSectorType['parking']>, 'latitude' | 'longitude'>>;
  });

const isSectorWithParking = (s: AreaSectorType): s is SectorWithParking => {
  return !!(s.parking && s.parking.latitude && s.parking.longitude);
};

/** Rough line estimate for plain text / markdown (no DOM measurement). */
const commentLikelyExceedsLines = (comment: string, maxLines: number, charsPerLine = 76): boolean => {
  const lines = comment.trim().split(/\r?\n/);
  let total = 0;
  for (const line of lines) {
    total += Math.max(1, Math.ceil(line.length / charsPerLine));
  }
  return total > maxLines;
};

type AreaDescriptionProps = { comment: string };

const AreaDescription = ({ comment }: AreaDescriptionProps) => {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = commentLikelyExceedsLines(comment, 6);

  return (
    <div className='space-y-2'>
      <div
        className={cn(
          'text-[13px] leading-relaxed text-slate-300 sm:text-sm',
          !expanded && needsToggle && 'max-h-[8.75rem] overflow-hidden',
        )}
      >
        <Markdown content={comment} />
      </div>
      {needsToggle && (
        <button
          type='button'
          onClick={() => setExpanded((x) => !x)}
          className='text-[12px] font-medium text-slate-400 transition-colors hover:text-slate-200 sm:text-[13px]'
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

const Area = () => {
  const meta = useMeta();
  const { areaId } = useParams();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeSectorTab, setActiveSectorTab] = useState<string>('sectors');

  if (areaId === undefined) {
    throw new Error('Missing areaId parameter');
  }

  const { data, error, redirectUi } = useArea(+areaId);

  const markers = useMemo(() => {
    if (!data?.sectors) return [];

    type SectorParkingMarker = Pick<SectorWithParking['parking'], 'latitude' | 'longitude'> & {
      sectors: Pick<NonNullable<SectorWithParking>, 'id' | 'name'>[];
    };

    const uniqueSectors = data.sectors.filter(isSectorWithParking).reduce(
      (acc, { parking, name, id }) => {
        const key = `${parking.latitude},${parking.longitude}`;
        const existing = acc[key];
        return {
          ...acc,
          [key]: {
            latitude: parking.latitude,
            longitude: parking.longitude,
            sectors: [...(existing?.sectors ?? []), { name, id }],
          },
        };
      },
      {} as Record<string, SectorParkingMarker>,
    );

    return Object.values(uniqueSectors).map((info) => ({
      coordinates: { latitude: info.latitude, longitude: info.longitude },
      isParking: true,
    }));
  }, [data?.sectors]);

  const { outlines, slopes } = useMemo(() => {
    const nextOutlines: NonNullable<ComponentProps<typeof Leaflet>['outlines']> = [];
    const nextSlopes: NonNullable<ComponentProps<typeof Leaflet>['slopes']> = [];
    if (!data?.sectors) return { outlines: nextOutlines, slopes: nextSlopes };

    const showSlopeLengthOnOutline = (data.sectors.filter((s) => s.approach && s.outline).length ?? 0) > 1;

    for (const s of data.sectors) {
      let distance: string | null = null;
      const approach = s.approach;
      if (approach?.coordinates?.length) {
        distance = getDistanceWithUnit(approach);
        const label = (!s.outline || !showSlopeLengthOnOutline) && distance ? distance : '';
        nextSlopes.push({ backgroundColor: 'lime', slope: approach, label: label ?? '' });
      }
      if (s.descent?.coordinates?.length) {
        distance = getDistanceWithUnit(s.descent);
        const label = (!s.outline || !showSlopeLengthOnOutline) && distance ? distance : '';
        nextSlopes.push({ backgroundColor: 'purple', slope: s.descent, label: label ?? '' });
      }
      if (s.outline?.length) {
        const label = (s.name ?? '') + (showSlopeLengthOnOutline && distance ? ' (' + distance + ')' : '');
        nextOutlines.push({ url: '/sector/' + s.id, label, outline: s.outline });
      }
    }
    return { outlines: nextOutlines, slopes: nextSlopes };
  }, [data]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string; icon: typeof LayoutDashboard }[] = [];
    if (!data) return t;
    t.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
    if (markers.length || outlines.length || data.coordinates) t.push({ id: 'map', label: 'Map', icon: MapIcon });
    if (data.sectors?.length) {
      t.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
      t.push({ id: 'top', label: 'Top', icon: Trophy });
      t.push({ id: 'todo', label: 'Todo', icon: Bookmark });
      t.push({ id: 'activity', label: 'Activity', icon: Clock });
    }
    return t;
  }, [data, markers.length, outlines.length]);

  const normalizedActiveTab = activeTab === 'image' ? 'overview' : activeTab;
  const effectiveTab =
    tabs.length === 0
      ? null
      : normalizedActiveTab !== null && tabs.some((x) => x.id === normalizedActiveTab)
        ? normalizedActiveTab
        : tabs[0].id;

  const problemRows = useMemo(() => {
    if (!data?.sectors) return [];
    return (data.sectors ?? [])
      .flatMap((sector) => {
        const name = sector.name ?? '';
        const problems = sector.problems ?? [];
        return problems.map((p) => ({
          element: <SectorListItem key={p.id} sectorName={name} problem={p} />,
          name: p.name ?? '',
          areaName: data.name ?? '',
          sectorName: name,
          nr: p.nr ?? 0,
          gradeNumber: p.gradeNumber ?? 0,
          stars: p.stars ?? 0,
          numTicks: p.numTicks ?? 0,
          ticked: p.ticked ?? false,
          rock: p.rock ?? '',
          subType: p.t?.subType ?? '',
          num: p.nr ?? 0,
          fa: !!p.fa,
          faDate: p.faDate ?? null,
        }));
      })
      .sort((a, b) => b.gradeNumber - a.gradeNumber);
  }, [data]);

  if (redirectUi) return redirectUi;

  if (error) {
    return (
      <div className='bg-surface-card border-surface-border mx-auto mt-12 max-w-2xl space-y-4 rounded-2xl border p-8 text-center'>
        <AlertTriangle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='type-h1'>404 Error</h2>
        <p className='text-slate-400'>
          Cannot find the specified area because it does not exist or you do not have sufficient permissions.
        </p>
      </div>
    );
  }

  if (!data) return <Loading />;

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

  const things = meta.isBouldering ? 'problems' : 'routes';
  const areaSubheader = [
    `${data.sectors?.length ?? 0} sectors`,
    `${problemRows.length} ${things}`,
    data.pageViews != null && String(data.pageViews).length > 0 ? `${data.pageViews} views` : null,
    data.forDevelopers ? 'Under development' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className='w-full min-w-0'>
      <title>{`${data.name} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='relative p-4 sm:p-5'>
          {meta.isAdmin && (
            <div className='absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 sm:top-5 sm:right-5'>
              <Link
                to={`/area/edit/${data.id}`}
                title='Edit area'
                aria-label='Edit area'
                className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/45 bg-amber-400/18 text-amber-100 transition-colors hover:bg-amber-400/28'
              >
                <Edit size={12} />
              </Link>
              <Link
                to={`/sector/edit/${data.id}/0`}
                title='Add sector'
                aria-label='Add sector'
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
            <span className='flex items-center gap-1.5 text-slate-400'>
              {data.name}
              <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
            </span>
          </nav>

          <SectionHeader
            title={data.name ?? 'Area'}
            icon={MapPin}
            subheader={areaSubheader}
            detail={
              data.accessClosed || data.noDogsAllowed || data.accessInfo ? (
                <>
                  {data.accessClosed && <p className='text-pretty text-red-300/90'>{data.accessClosed}</p>}
                  {(data.noDogsAllowed || data.accessInfo) && (
                    <div className='space-y-1.5 text-orange-300/90'>
                      {data.noDogsAllowed && <p className='text-pretty'>No dogs allowed (landowner request).</p>}
                      {data.accessInfo && <p className='text-pretty'>{data.accessInfo}</p>}
                    </div>
                  )}
                </>
              ) : undefined
            }
          />
        </div>

        {tabs.length > 0 && (
          <>
            <div className='border-surface-border border-t'>
              <div
                className={designContract.controls.tabBarRow}
                style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
                role='tablist'
                aria-label='Area sections'
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
                      {data.coordinates && data.coordinates.latitude && data.coordinates.longitude && (
                        <ConditionLabels
                          lat={data.coordinates.latitude}
                          lng={data.coordinates.longitude}
                          label={data.name ?? ''}
                          wallDirectionCalculated={undefined}
                          wallDirectionManual={undefined}
                          sunFromHour={data.sunFromHour ?? 0}
                          sunToHour={data.sunToHour ?? 0}
                        />
                      )}
                      <DownloadButton href={`/areas/pdf?id=${data.id}`}>PDF</DownloadButton>
                      <ExternalLinkLabels externalLinks={data.externalLinks} />
                    </div>

                    {(data.comment ?? '').trim().length > 0 && (
                      <AreaDescription key={data.id} comment={data.comment ?? ''} />
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
                  <div className='relative z-0 -mx-px h-[35vh] min-h-[220px] w-[calc(100%+2px)] overflow-hidden sm:mx-0 sm:h-[40vh] sm:w-full'>
                    <Leaflet
                      key={'area=' + data.id}
                      autoZoom={true}
                      height='100%'
                      markers={markers}
                      outlines={outlines}
                      slopes={slopes}
                      defaultCenter={
                        data.coordinates?.latitude && data.coordinates?.longitude
                          ? { lat: data.coordinates.latitude, lng: data.coordinates.longitude }
                          : meta.defaultCenter
                      }
                      defaultZoom={data.coordinates ? 14 : meta.defaultZoom}
                      showSatelliteImage={false}
                      clusterMarkers={false}
                      flyToId={null}
                    />
                  </div>
                )}
                {effectiveTab === 'distribution' && (
                  <div className='p-4 sm:p-5'>
                    <ChartGradeDistribution idArea={data.id ?? 0} embedded />
                  </div>
                )}
                {effectiveTab === 'top' && (
                  <div className='p-4 sm:p-5'>
                    <Top idArea={data.id ?? 0} idSector={0} />
                  </div>
                )}
                {effectiveTab === 'todo' && (
                  <div className='p-4 sm:p-5'>
                    <Todo idArea={data.id ?? 0} idSector={0} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      {effectiveTab === 'overview' && (data.sectors?.length ?? 0) > 0 && (
        <div className='mt-6 min-w-0 space-y-4'>
          <div
            role='tablist'
            aria-label='Choose sector grid or full problem list'
            className={cn(designContract.controls.tabBarRow, 'gap-x-6 gap-y-1 sm:gap-x-10')}
          >
            <button
              type='button'
              role='tab'
              aria-selected={activeSectorTab === 'sectors'}
              onClick={() => setActiveSectorTab('sectors')}
              className={cn(tabBarButtonClassNameInline(activeSectorTab === 'sectors'), 'flex-row gap-2')}
            >
              <LayoutGrid
                size={14}
                strokeWidth={activeSectorTab === 'sectors' ? 2.3 : 2}
                className={tabBarIconClassName(activeSectorTab === 'sectors')}
              />
              <span className='whitespace-nowrap'>
                Sectors <span className='font-normal text-slate-500'>({data.sectors?.length ?? 0})</span>
              </span>
            </button>
            <button
              type='button'
              role='tab'
              aria-selected={activeSectorTab === 'problems'}
              onClick={() => setActiveSectorTab('problems')}
              className={cn(tabBarButtonClassNameInline(activeSectorTab === 'problems'), 'flex-row gap-2')}
            >
              <List
                size={14}
                strokeWidth={activeSectorTab === 'problems' ? 2.3 : 2}
                className={tabBarIconClassName(activeSectorTab === 'problems')}
              />
              <span className='whitespace-nowrap'>
                {meta.isBouldering ? 'Problems' : 'Routes'}{' '}
                <span className='font-normal text-slate-500'>({problemRows.length})</span>
              </span>
            </button>
          </div>
          <div className='min-w-0'>
            {activeSectorTab === 'sectors' ? (
              <div className='grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5'>
                {data.sectors?.map((sector) => (
                  <Card
                    key={sector.id}
                    flush
                    className='h-full max-w-full min-w-0 overflow-hidden rounded-xl border border-white/10 shadow-lg ring-1 ring-white/10 max-sm:!mx-0 max-sm:!w-full sm:border sm:shadow-xl sm:ring-0'
                  >
                    <Link
                      to={`/sector/${sector.id}`}
                      className='group relative block min-h-[12rem] overflow-hidden rounded-xl sm:min-h-[14rem] md:min-h-[15rem]'
                    >
                      <img
                        className='absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                        src={
                          sector.randomMediaId
                            ? getMediaFileUrl(sector.randomMediaId, sector.randomMediaVersionStamp ?? 0, false, {
                                minDimension: 400,
                              })
                            : '/png/image.png'
                        }
                        alt=''
                      />
                      <div className='absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/20' />
                      <div className='absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                      <div className='relative flex min-h-[12rem] flex-col justify-end p-2.5 sm:min-h-[14rem] sm:p-3 md:min-h-[15rem] md:p-4'>
                        <div className='flex items-start justify-between gap-2'>
                          <h4 className='type-h2 line-clamp-2 min-w-0 flex-1 text-[0.95rem] leading-tight drop-shadow-md sm:text-[1.1rem] md:text-[1.25rem]'>
                            {sector.name}
                          </h4>
                          <span className='shrink-0 drop-shadow'>
                            <LockSymbol
                              lockedAdmin={!!sector.lockedAdmin}
                              lockedSuperadmin={!!sector.lockedSuperadmin}
                            />
                          </span>
                        </div>
                        <div className='type-micro mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-normal text-slate-500 sm:mt-2 [&_span]:font-normal [&_span]:text-slate-400'>
                          <SunOnWall
                            variant='inline'
                            className='text-slate-500 [&_span]:text-slate-400 [&_span]:tabular-nums'
                            sunFromHour={sector.sunFromHour ?? 0}
                            sunToHour={sector.sunToHour ?? 0}
                          />
                        </div>
                        {sector.typeNumTickedTodo && sector.typeNumTickedTodo.length > 0 && (
                          <div className='mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2'>
                            {sector.typeNumTickedTodo.map((x) => {
                              const tickTodo = [x.ticked && `${x.ticked} ticked`, x.todo && `${x.todo} todo`]
                                .filter(Boolean)
                                .join(', ');
                              return (
                                <div
                                  key={x.type}
                                  title={[x.type, `${x.num}`, tickTodo].filter(Boolean).join(' · ')}
                                  className='inline-flex max-w-[min(100%,11rem)] min-w-0 items-center gap-x-0.5 rounded-full border border-white/15 bg-white/[0.08] px-1.5 py-px text-[7px] leading-tight text-slate-200 shadow-sm backdrop-blur-md sm:text-[8px]'
                                >
                                  <span className='min-w-0 truncate font-medium text-slate-300'>{x.type}</span>
                                  <span className='shrink-0 font-semibold text-slate-50 tabular-nums'>{x.num}</span>
                                  {tickTodo ? (
                                    <span className='min-w-0 truncate text-slate-400'>· {tickTodo}</span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {sector.accessClosed && (
                          <p className='type-micro mt-1 font-semibold text-red-300/95 drop-shadow'>
                            {sector.accessClosed}
                          </p>
                        )}
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card
                flush
                className='border-surface-border/35 bg-surface-card/90 min-w-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-white/5 sm:border'
              >
                <div className='p-3 sm:p-4'>
                  <ProblemList
                    storageKey={`area/${areaId}`}
                    mode='sector'
                    defaultOrder='grade-desc'
                    rows={problemRows}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {effectiveTab === 'activity' && (
        <div className='mt-4 min-w-0'>
          <Activity idArea={data.id ?? 0} idSector={0} />
        </div>
      )}
    </div>
  );
};

export default Area;
