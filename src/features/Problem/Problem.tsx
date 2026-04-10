import { useState, useOptimistic, useTransition, type ComponentProps, type ElementType } from 'react';
import { Link, useParams } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import GetCenterFromDegrees from '../../utils/map-utils';
import { googleMapsSearchUrl } from '../../utils/googleMaps';
import Media from '../../shared/components/Media/Media';
import { Loading } from '../../shared/ui/StatusWidgets';
import { LockSymbol } from '../../shared/ui/Indicators';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { Badge } from '../../shared/components/Widgets/ClimbingWidgets';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { useProblem } from '../../api';
import type { components } from '../../@types/buldreinfo/swagger';
import type { Slope } from '../../@types/buldreinfo';
import TickModal from '../../shared/components/TickModal/TickModal';
import CommentModal from '../../shared/components/CommentModal/CommentModal';
import { SlopeProfile } from '../../shared/components/SlopeProfile';
import { SLOPE_APPROACH_COLOR, SLOPE_DESCENT_COLOR } from '../../shared/slopePolylineColors';
import Linkify from 'linkify-react';
import { ProblemsOnRock } from './ProblemsOnRock';
import { ProblemTicks } from './ProblemTicks';
import { ProblemComments } from './ProblemComments';
import { ProblemAscentOverview } from './ProblemAscentOverview';
import { ProblemNeighboursRow } from './ProblemNeighboursRow';
import { ProblemBoulderRockOrNeighboursRow } from './ProblemBoulderRockOrNeighboursRow';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import {
  tabBarButtonClassName,
  tabBarIconClassName,
  tabBarStripContainerClassName,
  TAB_BAR_ICON_SIZE,
} from '../../design/tabBar';
import {
  Bookmark,
  Check,
  MessageSquare,
  Eye,
  LayoutDashboard,
  Edit,
  Plus,
  Map as MapIcon,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

/** Shared header for ticks / comments: icon + title + count as quiet typography (no badge chrome). */
function ProblemSocialCardHeader({
  title,
  count,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  count: number;
  icon: ElementType;
  iconClassName: string;
}) {
  return (
    <div className='border-surface-border/50 flex items-center gap-2.5 border-b px-3 py-2.5 sm:px-4 md:py-2'>
      <Icon size={15} strokeWidth={2.25} className={cn('shrink-0', iconClassName)} aria-hidden />
      <div className='flex min-w-0 items-baseline gap-2'>
        <span className='text-sm font-semibold tracking-tight text-slate-100'>{title}</span>
        <span
          className='text-sm font-medium text-slate-400 tabular-nums'
          aria-label={`${count} ${title.toLowerCase()}`}
        >
          {count}
        </span>
      </div>
    </div>
  );
}

type MediaItem = components['schemas']['Media'];
type ProblemComment = components['schemas']['ProblemComment'];

/** Latest HSE-relevant comment wins: only comments with danger or resolved (safe); plain comments ignored. */
function hseShowsDangerFromComments(comments: ProblemComment[] | undefined): boolean {
  const marked = (comments ?? []).filter((c) => c.danger === true || c.resolved === true);
  if (marked.length === 0) return false;
  const byNewest = [...marked].sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : NaN;
    const db = b.date ? Date.parse(b.date) : NaN;
    if (Number.isFinite(da) && Number.isFinite(db) && da !== db) return db - da;
    return (b.id ?? 0) - (a.id ?? 0);
  });
  return byNewest[0]?.danger === true;
}

const useIds = () => {
  const { problemId } = useParams();
  if (!problemId) throw new Error('Missing problemId param');
  return { problemId: +problemId };
};

export const Problem = () => {
  const { problemId } = useIds();
  const [showHiddenMedia, setShowHiddenMedia] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'map'>('overview');
  const meta = useMeta();
  const { data, error, toggleTodo, redirectUi } = useProblem(+problemId, showHiddenMedia);
  const [isPending, startTransition] = useTransition();

  const [optimisticTodo, setOptimisticTodo] = useOptimistic(data?.todo, (_, newTodo: boolean) => newTodo);

  const [showTickModal, setShowTickModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState<components['schemas']['ProblemComment'] | null>(null);

  if (redirectUi) return redirectUi;

  if (error) {
    return (
      <div className='bg-surface-card border-surface-border rounded-md border p-6 text-left'>
        <div className='flex items-center gap-4'>
          <div className='rounded-xl bg-red-500/10 p-3 text-red-500 shadow-inner'>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className='font-bold text-slate-200'>404</h3>
            <p className='text-sm text-slate-400'>Cannot find the specified problem or insufficient permissions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.id) return <Loading />;

  const handleToggleTodo = async () => {
    if (!data) return;
    const newTodoValue = !optimisticTodo;
    startTransition(async () => {
      setOptimisticTodo(newTodoValue);
      try {
        await toggleTodo(data.id!);
      } catch {
        // Error is handled by api layer/toast
      }
    });
  };

  const carouselMedia: MediaItem[] = [];
  const orderableMedia: MediaItem[] = [];
  const processMedia = (items?: MediaItem[]) => {
    if (!items?.length) return;
    carouselMedia.push(...items);
    if (items.length > 1) orderableMedia.push(...items);
  };
  processMedia(data.media);
  processMedia(data.triviaMedia);
  data.sections?.forEach((s) => processMedia(s.media));
  data.comments?.forEach((c) => processMedia(c.media));

  const markers: ComponentProps<typeof Leaflet>['markers'] = [];
  if (data.coordinates) {
    markers.push({
      coordinates: data.coordinates,
      label: `${data.name} · ${data.grade}`,
      url: `/problem/${data.id}`,
    });
  }
  if (data.sectorParking) markers.push({ coordinates: data.sectorParking, isParking: true });

  const [conditionLat, conditionLng] = (() => {
    if (data.coordinates?.latitude && data.coordinates?.longitude)
      return [+data.coordinates.latitude, +data.coordinates.longitude];
    if (data.sectorOutline?.length) {
      const center = GetCenterFromDegrees(
        data.sectorOutline.filter((c) => !!(c.latitude && c.longitude)).map((c) => [c.latitude!, c.longitude!]),
      );
      if (center) return [+center[0], +center[1]];
    }
    if (data.sectorParking?.latitude && data.sectorParking?.longitude)
      return [+data.sectorParking.latitude, +data.sectorParking.longitude];
    return [meta.defaultCenter.lat || 0, meta.defaultCenter.lng || 0];
  })();

  const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];
  if (data.sectorApproach?.coordinates?.length) {
    slopes.push({
      slope: data.sectorApproach as Slope,
      backgroundColor: SLOPE_APPROACH_COLOR,
      label: getDistanceWithUnit(data.sectorApproach as Slope) ?? undefined,
    });
  }
  if (data.sectorDescent?.coordinates?.length) {
    slopes.push({
      slope: data.sectorDescent as Slope,
      backgroundColor: SLOPE_DESCENT_COLOR,
      label: getDistanceWithUnit(data.sectorDescent as Slope) ?? undefined,
    });
  }

  const isTicked = data.ticks?.some((t) => t.writable);
  const userTick = data.ticks?.find((t) => t.writable);
  const hasDanger = hseShowsDangerFromComments(data.comments);

  const hasTicks = data.ticks && data.ticks.length > 0;
  const hasComments = data.comments && data.comments.length > 0;
  const hasPitches = (data.sections?.length ?? 0) > 0;
  const hasRockBlock = !!data.rock;
  /** Full “Rock” card with chip list — climbing only; boulder uses inline row in overview. */
  const hasMetaCard = hasRockBlock && meta.isClimbing;

  const hasApproach = (data.sectorApproach?.coordinates?.length ?? 0) > 1;
  const hasDescent = (data.sectorDescent?.coordinates?.length ?? 0) > 1;
  const hasSectorOutline = (data.sectorOutline?.length ?? 0) > 0;
  const showMapTab = markers.length > 0 || hasApproach || hasDescent || (hasSectorOutline && !data.coordinates);
  const showOverviewContent = !showMapTab || activeTab === 'overview';

  const overviewChipsRow = (
    <div
      className={cn(
        'flex min-w-0 flex-wrap content-start items-center gap-x-1.5 gap-y-1 leading-snug [overflow-wrap:anywhere] sm:gap-x-2 sm:gap-y-1.5',
        designContract.typography.detailBody,
      )}
    >
      <ConditionLabels
        lat={conditionLat > 0 ? conditionLat : undefined}
        lng={conditionLng > 0 ? conditionLng : undefined}
        label={data.name ?? ''}
        wallDirectionCalculated={data.sectorWallDirectionCalculated}
        wallDirectionManual={data.sectorWallDirectionManual}
        sunFromHour={data.sectorSunFromHour ?? data.areaSunFromHour ?? 0}
        sunToHour={data.sectorSunToHour ?? data.areaSunToHour ?? 0}
        pageViews={data.pageViews}
      />
      <DownloadButton href={`/problem/pdf?id=${data.id}`}>
        {meta.isBouldering ? 'boulder.pdf' : 'route.pdf'}
      </DownloadButton>
      <DownloadButton href={`/sectors/pdf?id=${data.sectorId}`}>sector.pdf</DownloadButton>
      <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>area.pdf</DownloadButton>
      {data.sectorParking && (
        <a
          href={googleMapsSearchUrl(data.sectorParking.latitude, data.sectorParking.longitude)}
          target='_blank'
          rel='noreferrer'
          title='Parking in Google Maps'
        >
          <Badge icon={MapIcon} className={designContract.surfaces.badgeLinkHover}>
            Parking
          </Badge>
        </a>
      )}
      {data.coordinates && (
        <a
          href={googleMapsSearchUrl(data.coordinates.latitude, data.coordinates.longitude)}
          target='_blank'
          rel='noreferrer'
          title={meta.isBouldering ? 'Boulder in Google Maps' : 'Route in Google Maps'}
        >
          <Badge icon={MapIcon} className={designContract.surfaces.badgeLinkHover}>
            {meta.isBouldering ? 'Boulder' : 'Route'}
          </Badge>
        </a>
      )}
      <ExternalLinkLabels externalLinks={data.externalLinks} />
    </div>
  );

  const commentText = (data.comment ?? '').trim();

  const problemAccessRestrictions =
    data.broken ||
    data.areaAccessClosed ||
    data.sectorAccessClosed ||
    data.areaNoDogsAllowed ||
    data.areaAccessInfo ||
    data.sectorAccessInfo ? (
      <div className={cn('min-w-0 space-y-2', designContract.typography.body)}>
        {data.broken && (
          <p className='text-access-danger text-pretty'>
            <span className='font-normal'>{meta.isBouldering ? 'Problem' : 'Route'} broken:</span> {data.broken}
          </p>
        )}
        {(data.areaAccessClosed || data.sectorAccessClosed) && (
          <p className='text-access-danger text-pretty'>
            {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed: '}
            {(data.areaAccessClosed || '') + (data.sectorAccessClosed || '')}
          </p>
        )}
        {(data.areaNoDogsAllowed || data.areaAccessInfo || data.sectorAccessInfo) && (
          <div className='text-access-caution space-y-1.5'>
            {data.areaNoDogsAllowed && <NoDogsAllowed />}
            <Linkify>
              {data.areaAccessInfo && <p className='text-pretty'>{data.areaAccessInfo}</p>}
              {data.sectorAccessInfo && <p className='text-pretty'>{data.sectorAccessInfo}</p>}
            </Linkify>
          </div>
        )}
      </div>
    ) : null;

  const overviewPanel = (
    <div className='space-y-3 p-4 sm:space-y-3.5 sm:p-5'>
      {problemAccessRestrictions}
      {(data.media?.length ?? 0) > 0 && (
        <Media
          pitches={data.sections}
          media={data.media || []}
          orderableMedia={orderableMedia}
          carouselMedia={carouselMedia}
          optProblemId={data.id ?? 0}
          showLocation={false}
          compactTiles
        />
      )}
      <div className='space-y-2 sm:space-y-2.5'>
        {meta.isClimbing ? (
          <ProblemNeighboursRow neighbourPrev={data.neighbourPrev} neighbourNext={data.neighbourNext} />
        ) : (
          <ProblemBoulderRockOrNeighboursRow
            sectorId={data.sectorId}
            problemId={+problemId}
            rock={data.rock}
            neighbourPrev={data.neighbourPrev}
            neighbourNext={data.neighbourNext}
          />
        )}
        <ProblemAscentOverview
          data={data}
          meta={{ isClimbing: meta.isClimbing, isIce: meta.isIce }}
          orderableMedia={orderableMedia}
          carouselMedia={carouselMedia}
        />
      </div>
      {overviewChipsRow}
      {commentText.length > 0 && (
        <ExpandableMarkdown
          key={data.id}
          content={data.comment ?? ''}
          className='pt-0.5'
          contentClassName='max-w-none'
        />
      )}
    </div>
  );

  return (
    <div className='w-full min-w-0 space-y-3 sm:space-y-5'>
      <title>{`${data.name} · ${data.grade} · ${data.areaName} / ${data.sectorName} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment || data.faAid?.description} />

      {showTickModal && (
        <TickModal
          idTick={userTick?.id ?? -1}
          idProblem={data.id!}
          date={userTick?.date}
          comment={userTick?.comment ?? ''}
          grade={userTick?.noPersonalGrade ? 'No personal grade' : (userTick?.suggestedGrade ?? data.grade ?? '')}
          gradeFa={data.originalGrade}
          gradeConsensus={data.grade}
          grades={meta.grades}
          stars={userTick != null ? (userTick.stars ?? -1) : undefined}
          repeats={userTick?.repeats}
          open={true}
          onClose={() => setShowTickModal(false)}
          enableTickRepeats={!!(meta.isIce || data.sections?.length)}
        />
      )}

      {showCommentModal && (
        <CommentModal
          comment={showCommentModal}
          onClose={() => setShowCommentModal(null)}
          showHse={meta.isClimbing}
          id={showCommentModal?.id}
          idProblem={data.id!}
        />
      )}

      <div className='mb-3 min-w-0 space-y-2 pt-1 sm:mb-4 sm:pt-1 lg:pt-0'>
        <PageCardBreadcrumbRow
          className='mb-0'
          breadcrumb={
            <nav
              className={cn(
                'flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-2 text-pretty break-words',
                designContract.typography.breadcrumb,
              )}
              aria-label='Breadcrumb'
            >
              <Link to='/areas' className={designContract.typography.breadcrumbLink}>
                Areas
              </Link>
              <ChevronRight size={12} className='shrink-0 translate-y-px opacity-30' aria-hidden />
              <Link to={`/area/${data.areaId}`} className={designContract.typography.breadcrumbLink}>
                {data.areaName}
              </Link>
              <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
              <ChevronRight size={12} className='shrink-0 translate-y-px opacity-30' aria-hidden />
              <Link to={`/sector/${data.sectorId}`} className={designContract.typography.breadcrumbLink}>
                {data.sectorName}
              </Link>
              <LockSymbol lockedAdmin={!!data.sectorLockedAdmin} lockedSuperadmin={!!data.sectorLockedSuperadmin} />
              <ChevronRight size={12} className='shrink-0 translate-y-px opacity-30' aria-hidden />
            </nav>
          }
          actions={
            meta.isAuthenticated ? (
              <>
                {!isTicked && (
                  <button
                    type='button'
                    title='Todo'
                    data-ph-action={optimisticTodo ? 'todo-on' : undefined}
                    onClick={handleToggleTodo}
                    disabled={isPending}
                    className={cn(
                      designContract.controls.pageHeaderIconButton,
                      optimisticTodo
                        ? designContract.ascentStatus.todoButtonOn
                        : 'bg-surface-raised hover:bg-surface-raised-hover border-white/12 text-slate-300 hover:border-white/18',
                    )}
                  >
                    <Bookmark
                      className={designContract.controls.pageHeaderIconGlyph}
                      fill={optimisticTodo ? 'currentColor' : 'none'}
                      strokeWidth={2.25}
                    />
                  </button>
                )}
                <button
                  type='button'
                  title={isTicked ? 'Edit tick' : 'Tick'}
                  data-ph-action={isTicked ? 'tick-on' : undefined}
                  onClick={() => setShowTickModal(true)}
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    isTicked
                      ? designContract.ascentStatus.tickButtonOn
                      : 'bg-surface-raised hover:bg-surface-raised-hover border-white/12 text-slate-300 hover:border-white/18',
                  )}
                >
                  <Check className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
                </button>
                <button
                  type='button'
                  title='Comment'
                  onClick={() => setShowCommentModal({ id: -1, danger: false, resolved: false })}
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    'bg-surface-raised hover:bg-surface-raised-hover border-white/12 text-slate-300 hover:border-white/18',
                  )}
                >
                  <MessageSquare className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.25} />
                </button>
                {(meta.isAdmin || meta.isSuperAdmin) && (
                  <button
                    type='button'
                    title={showHiddenMedia ? 'Showing hidden media' : 'Show hidden media'}
                    onClick={() => setShowHiddenMedia(!showHiddenMedia)}
                    className={cn(
                      designContract.controls.pageHeaderIconButton,
                      showHiddenMedia
                        ? 'border-brand-border bg-brand/20 text-brand hover:bg-brand/30'
                        : 'bg-surface-raised hover:bg-surface-raised-hover border-white/12 text-slate-300 hover:border-white/18',
                    )}
                  >
                    <Eye className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.25} />
                  </button>
                )}
                {(meta.isAdmin || meta.isSuperAdmin) && (
                  <Link
                    to={`/problem/edit/${data.sectorId}/${data.id}`}
                    title='Edit problem'
                    aria-label='Edit problem'
                    data-ph-action='edit'
                    className={cn(
                      designContract.controls.pageHeaderIconButton,
                      designContract.controls.pageHeaderIconButtonEdit,
                    )}
                  >
                    <Edit className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
                  </Link>
                )}
                {!meta.isAdmin && !meta.isSuperAdmin && (
                  <Link
                    to={`/problem/edit/media/${data.id}`}
                    title='Add media'
                    aria-label='Add media'
                    data-ph-action='add'
                    className={cn(
                      designContract.controls.pageHeaderIconButton,
                      designContract.controls.pageHeaderIconButtonAdd,
                    )}
                  >
                    <Plus className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
                  </Link>
                )}
              </>
            ) : null
          }
        />
        <h1 className='light:text-slate-950 m-0 inline-flex max-w-full min-w-0 items-baseline gap-1.5 text-[15px] leading-snug font-semibold tracking-tight text-slate-50 sm:text-[16px]'>
          {hasDanger ? (
            <span
              className='inline-block align-baseline'
              role='img'
              aria-label='Danger reported for this route'
              title='Danger reported for this route'
            >
              <AlertTriangle
                size={14}
                className={cn('inline-block shrink-0', designContract.ascentStatus.dangerous)}
                strokeWidth={2.25}
                aria-hidden
              />
            </span>
          ) : null}
          <span className='font-mono font-medium text-slate-300 tabular-nums'>#{data.nr}</span>
          <span
            className={cn(
              'min-w-0 text-pretty break-words',
              data.ticked
                ? designContract.ascentStatus.ticked
                : optimisticTodo
                  ? designContract.ascentStatus.todo
                  : 'light:text-slate-950 text-slate-50',
            )}
          >
            {data.name}
          </span>
          <span className='font-mono font-medium text-slate-300 tabular-nums'>{data.grade}</span>
          <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
        </h1>
      </div>

      <Card flush className='min-w-0 border-0 shadow-sm'>
        {showMapTab ? (
          <>
            <div
              className={tabBarStripContainerClassName('equal')}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
              role='tablist'
              aria-label='Problem sections'
            >
              <button
                type='button'
                role='tab'
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={tabBarButtonClassName(activeTab === 'overview')}
              >
                <LayoutDashboard
                  size={TAB_BAR_ICON_SIZE}
                  strokeWidth={activeTab === 'overview' ? 2.3 : 2}
                  className={tabBarIconClassName(activeTab === 'overview')}
                />
                <span className={designContract.controls.tabBarLabel}>Overview</span>
              </button>
              <button
                type='button'
                role='tab'
                aria-selected={activeTab === 'map'}
                onClick={() => setActiveTab('map')}
                className={tabBarButtonClassName(activeTab === 'map')}
              >
                <MapIcon
                  size={TAB_BAR_ICON_SIZE}
                  strokeWidth={activeTab === 'map' ? 2.3 : 2}
                  className={tabBarIconClassName(activeTab === 'map')}
                />
                <span className={designContract.controls.tabBarLabel}>Map</span>
              </button>
            </div>
            {activeTab === 'overview' ? (
              overviewPanel
            ) : (
              <div className='relative z-0 -mx-px h-[35vh] min-h-[220px] w-[calc(100%+2px)] overflow-hidden sm:mx-0 sm:h-[50vh] sm:w-full'>
                <Leaflet
                  key={'map-' + data.id}
                  autoZoom
                  height='100%'
                  markers={markers}
                  outlines={
                    data.sectorOutline?.length && !data.coordinates
                      ? [
                          {
                            url: '/sector/' + data.sectorId,
                            label: data.sectorName!,
                            outline: data.sectorOutline,
                          },
                        ]
                      : undefined
                  }
                  slopes={slopes}
                  defaultCenter={{ lat: conditionLat, lng: conditionLng }}
                  defaultZoom={16}
                  showSatelliteImage={meta.isBouldering}
                  clusterMarkers={false}
                  flyToId={null}
                />
              </div>
            )}
          </>
        ) : (
          overviewPanel
        )}
      </Card>

      {showMapTab && activeTab === 'map' && (hasApproach || hasDescent) && (
        <div className={cn('mt-4 min-w-0 sm:mt-5', 'max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] sm:mx-0 sm:w-full')}>
          <div className='grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4'>
            {hasApproach && (
              <div className='w-full min-w-0'>
                <SlopeProfile
                  compact
                  variant='approach'
                  className='w-full min-w-0'
                  title='Approach'
                  areaName={data.areaName ?? ''}
                  sectorName={data.sectorName ?? ''}
                  slope={data.sectorApproach as Slope}
                />
              </div>
            )}
            {hasDescent && (
              <div className='w-full min-w-0'>
                <SlopeProfile
                  compact
                  variant='descent'
                  className='w-full min-w-0'
                  title='Descent'
                  areaName={data.areaName ?? ''}
                  sectorName={data.sectorName ?? ''}
                  slope={data.sectorDescent as Slope}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {showOverviewContent && hasPitches && data.sections && (
        <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
          <div className='p-4 sm:p-5'>
            <div className='flex flex-col gap-7'>
              {data.sections.map((s) => (
                <article key={s.nr} className='min-w-0' aria-label={`Pitch ${s.nr}`}>
                  <p
                    className={cn(
                      'text-[14px] leading-snug text-pretty text-slate-300 sm:text-sm sm:leading-relaxed',
                      '[&_a]:text-slate-300 [&_a]:underline [&_a]:decoration-white/15 [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:text-slate-200',
                    )}
                  >
                    <span
                      className={cn(
                        designContract.typography.meta,
                        'font-mono font-semibold text-slate-400 tabular-nums',
                      )}
                    >
                      Pitch {s.nr}
                    </span>{' '}
                    <span className='text-slate-600' aria-hidden>
                      ·
                    </span>{' '}
                    <span className={cn(designContract.typography.grade, 'font-semibold text-slate-100')}>
                      {s.grade}
                    </span>
                    {s.description ? (
                      <>
                        {' '}
                        <span className='text-slate-600' aria-hidden>
                          ·
                        </span>{' '}
                        <span className='font-normal text-slate-300'>
                          <Linkify>{s.description}</Linkify>
                        </span>
                      </>
                    ) : null}
                  </p>
                  {s.media && s.media.length > 0 ? (
                    <div className='mt-2'>
                      <Media
                        pitches={data.sections}
                        media={s.media}
                        orderableMedia={orderableMedia}
                        carouselMedia={carouselMedia}
                        optProblemId={null}
                        showLocation={false}
                        compactTiles
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </Card>
      )}

      {showOverviewContent && (hasTicks || hasComments) ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-3',
            hasTicks && hasComments ? 'md:grid-cols-2 md:items-start md:gap-2.5' : '',
          )}
        >
          {hasTicks && (
            <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
              <ProblemSocialCardHeader
                title='Ticks'
                count={data.ticks?.length ?? 0}
                icon={Check}
                iconClassName={designContract.ascentStatus.ticked}
              />
              <div className='pt-0.5 pb-3 sm:pb-3.5 md:pb-3'>
                <ProblemTicks ticks={data.ticks || []} />
              </div>
            </Card>
          )}
          {hasComments && (
            <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
              <ProblemSocialCardHeader
                title='Comments'
                count={data.comments?.length ?? 0}
                icon={MessageSquare}
                iconClassName='text-brand'
              />
              <div className='pt-0.5 pb-3 sm:pb-3.5 md:pb-3'>
                <ProblemComments
                  onShowCommentModal={setShowCommentModal}
                  problemId={+problemId}
                  showHiddenMedia={showHiddenMedia}
                  orderableMedia={orderableMedia}
                  carouselMedia={carouselMedia}
                />
              </div>
            </Card>
          )}
        </div>
      ) : null}

      {hasMetaCard ? (
        <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm'>
          <div className='grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:p-5 lg:grid-cols-[min(11rem,30%)_1fr] lg:gap-x-8 lg:gap-y-6'>
            {hasRockBlock && (
              <>
                <div className={cn('pt-1', designContract.typography.label)}>Rock «{data.rock}»</div>
                <div>
                  <ProblemsOnRock sectorId={data.sectorId!} problemId={+problemId} rock={data.rock} />
                </div>
              </>
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
};
