import { useState, useOptimistic, useTransition, type ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import GetCenterFromDegrees from '../../utils/map-utils';
import Media from '../../shared/components/Media/Media';
import { Loading } from '../../shared/ui/StatusWidgets';
import { LockSymbol } from '../../shared/ui/Indicators';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { useProblem } from '../../api';
import type { components } from '../../@types/buldreinfo/swagger';
import type { Slope } from '../../@types/buldreinfo';
import TickModal from '../../shared/components/TickModal/TickModal';
import CommentModal from '../../shared/components/CommentModal/CommentModal';
import { SlopeProfile } from '../../shared/components/SlopeProfile';
import Linkify from 'linkify-react';
import { ProblemsOnRock } from './ProblemsOnRock';
import { ProblemTicks } from './ProblemTicks';
import { ProblemComments } from './ProblemComments';
import { ProblemAscentOverview } from './ProblemAscentOverview';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import { tabBarButtonClassName, tabBarIconClassName } from '../../design/tabBar';
import {
  Bookmark,
  Check,
  MessageSquare,
  Eye,
  LayoutDashboard,
  Edit,
  Plus,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

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
            <p className='text-sm text-slate-500'>Cannot find the specified problem or insufficient permissions.</p>
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
      backgroundColor: 'lime',
      label: getDistanceWithUnit(data.sectorApproach as Slope) ?? undefined,
    });
  }
  if (data.sectorDescent?.coordinates?.length) {
    slopes.push({
      slope: data.sectorDescent as Slope,
      backgroundColor: 'purple',
      label: getDistanceWithUnit(data.sectorDescent as Slope) ?? undefined,
    });
  }

  const isTicked = data.ticks?.some((t) => t.writable);
  const userTick = data.ticks?.find((t) => t.writable);
  const hasDanger = hseShowsDangerFromComments(data.comments);

  const hasTicks = data.ticks && data.ticks.length > 0;
  const hasComments = data.comments && data.comments.length > 0;
  const hasPitches = (data.sections?.length ?? 0) > 0;
  const hasTriviaBlock = !!(data.trivia || data.triviaMedia?.length);
  const hasRockBlock = !!data.rock;
  const hasMetaCard = hasTriviaBlock || hasRockBlock;

  const hasApproach = (data.sectorApproach?.coordinates?.length ?? 0) > 1;
  const hasDescent = (data.sectorDescent?.coordinates?.length ?? 0) > 1;
  const hasSectorOutline = (data.sectorOutline?.length ?? 0) > 0;
  const showMapTab = markers.length > 0 || hasApproach || hasDescent || (hasSectorOutline && !data.coordinates);
  const showOverviewContent = !showMapTab || activeTab === 'overview';

  const overviewChipsRow = (
    <div className='flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11px] leading-snug [overflow-wrap:anywhere] sm:gap-x-2 sm:gap-y-2 sm:text-[12px]'>
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
          href={`https://www.google.com/maps/search/?api=1&query=${data.sectorParking.latitude},${data.sectorParking.longitude}`}
          target='_blank'
          rel='noreferrer'
          title='Parking in Google Maps'
          className={designContract.surfaces.metaChipInteractive}
        >
          <MapIcon size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} />
          Parking
        </a>
      )}
      {data.coordinates && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${data.coordinates.latitude},${data.coordinates.longitude}`}
          target='_blank'
          rel='noreferrer'
          title={meta.isBouldering ? 'Boulder in Google Maps' : 'Route in Google Maps'}
          className={designContract.surfaces.metaChipInteractive}
        >
          <MapIcon size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} />{' '}
          {meta.isBouldering ? 'Boulder' : 'Route'}
        </a>
      )}
      <ExternalLinkLabels externalLinks={data.externalLinks} />
    </div>
  );

  const commentText = (data.comment ?? '').trim();
  const overviewPanel = (
    <div className='space-y-4 p-4 sm:p-5'>
      {(data.media?.length ?? 0) > 0 && (
        <Media
          pitches={data.sections}
          media={data.media || []}
          orderableMedia={orderableMedia}
          carouselMedia={carouselMedia}
          optProblemId={data.id ?? 0}
          showLocation={false}
        />
      )}
      <ProblemAscentOverview
        data={data}
        meta={{ isClimbing: meta.isClimbing, isIce: meta.isIce }}
        showTodoUsers={optimisticTodo}
      />
      {commentText.length > 0 && (
        <ExpandableMarkdown key={data.id} content={data.comment ?? ''} contentClassName='max-w-none' />
      )}
      {overviewChipsRow}
    </div>
  );

  return (
    <div className='w-full min-w-0 space-y-4 sm:space-y-6'>
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
          stars={userTick?.stars ?? 0}
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

      <Card flush className='min-w-0 border-0 shadow-sm sm:border'>
        <div className='relative p-4 sm:p-5'>
          <PageCardBreadcrumbRow
            breadcrumb={
              <nav className='block min-w-0 text-[11px] leading-relaxed text-pretty break-words text-slate-500 sm:text-[12px] [&>*+*]:ml-1.5'>
                <Link
                  to='/areas'
                  className='inline align-middle tracking-tight text-slate-600 transition-colors hover:text-slate-400'
                >
                  Areas
                </Link>
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <Link
                  to={`/area/${data.areaId}`}
                  className='inline min-w-0 align-middle tracking-tight text-slate-600 transition-colors hover:text-slate-400'
                >
                  {data.areaName}
                </Link>
                <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <Link
                  to={`/sector/${data.sectorId}`}
                  className='inline min-w-0 align-middle tracking-tight text-slate-600 transition-colors hover:text-slate-400'
                >
                  {data.sectorName}
                </Link>
                <LockSymbol lockedAdmin={!!data.sectorLockedAdmin} lockedSuperadmin={!!data.sectorLockedSuperadmin} />
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                {data.neighbourPrev && (
                  <Link
                    to={`/problem/${data.neighbourPrev.id}`}
                    title={`Previous: #${data.neighbourPrev.nr ?? ''} ${data.neighbourPrev.name ?? ''} · ${data.neighbourPrev.grade ?? ''}`}
                    aria-label={`Previous problem: number ${data.neighbourPrev.nr}, ${data.neighbourPrev.name}, grade ${data.neighbourPrev.grade}`}
                    className={cn(
                      'group inline-flex max-w-full min-w-0 items-center gap-x-1 align-middle tracking-tight transition-colors sm:gap-x-1.5',
                      'text-slate-600 hover:text-slate-400',
                    )}
                  >
                    <ChevronLeft size={14} strokeWidth={2} className='shrink-0 opacity-50 group-hover:opacity-80' />
                    <span
                      className={cn(
                        designContract.typography.meta,
                        'shrink-0 font-mono text-slate-600 tabular-nums group-hover:text-slate-500',
                      )}
                    >
                      #{data.neighbourPrev.nr}
                    </span>
                    <span className='max-w-[10rem] min-w-0 truncate font-medium text-slate-500 sm:max-w-[14rem]'>
                      {data.neighbourPrev.name}
                    </span>
                    <span
                      className={cn(
                        designContract.typography.grade,
                        'shrink-0 text-slate-600 group-hover:text-slate-500',
                      )}
                    >
                      {data.neighbourPrev.grade}
                    </span>
                  </Link>
                )}
                <span className='inline-flex max-w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 align-middle'>
                  {hasDanger ? (
                    <span
                      className='inline-flex'
                      role='img'
                      aria-label='Danger reported for this route'
                      title='Danger reported for this route'
                    >
                      <AlertTriangle
                        size={14}
                        className='inline-block shrink-0 text-red-400'
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      designContract.typography.meta,
                      'font-mono tabular-nums',
                      isTicked ? 'text-emerald-400' : optimisticTodo ? 'text-blue-300' : 'text-slate-300',
                    )}
                  >
                    #{data.nr}
                  </span>
                  <span className='min-w-0 font-semibold tracking-tight text-slate-50'>{data.name}</span>
                  <span className={cn(designContract.typography.grade, 'shrink-0 font-medium text-slate-200')}>
                    {data.grade}
                  </span>
                  <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
                </span>
                {data.neighbourNext && (
                  <Link
                    to={`/problem/${data.neighbourNext.id}`}
                    title={`Next: #${data.neighbourNext.nr ?? ''} ${data.neighbourNext.name ?? ''} · ${data.neighbourNext.grade ?? ''}`}
                    aria-label={`Next problem: number ${data.neighbourNext.nr}, ${data.neighbourNext.name}, grade ${data.neighbourNext.grade}`}
                    className={cn(
                      'group inline-flex max-w-full min-w-0 items-center gap-x-1 align-middle tracking-tight transition-colors sm:gap-x-1.5',
                      'text-slate-600 hover:text-slate-400',
                    )}
                  >
                    <span
                      className={cn(
                        designContract.typography.meta,
                        'shrink-0 font-mono text-slate-600 tabular-nums group-hover:text-slate-500',
                      )}
                    >
                      #{data.neighbourNext.nr}
                    </span>
                    <span className='max-w-[10rem] min-w-0 truncate font-medium text-slate-500 sm:max-w-[14rem]'>
                      {data.neighbourNext.name}
                    </span>
                    <span
                      className={cn(
                        designContract.typography.grade,
                        'shrink-0 text-slate-600 group-hover:text-slate-500',
                      )}
                    >
                      {data.neighbourNext.grade}
                    </span>
                    <ChevronRight size={14} strokeWidth={2} className='shrink-0 opacity-50 group-hover:opacity-80' />
                  </Link>
                )}
              </nav>
            }
            actions={
              meta.isAuthenticated ? (
                <>
                  {!isTicked && (
                    <button
                      type='button'
                      title='Todo'
                      onClick={handleToggleTodo}
                      disabled={isPending}
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8',
                        optimisticTodo
                          ? 'border-blue-400/50 bg-blue-500/22 text-blue-200 hover:bg-blue-500/32'
                          : 'border-white/12 bg-white/[0.06] text-slate-300 hover:border-white/18 hover:bg-white/[0.1]',
                      )}
                    >
                      <Bookmark size={12} fill={optimisticTodo ? 'currentColor' : 'none'} strokeWidth={2.25} />
                    </button>
                  )}
                  <button
                    type='button'
                    title={isTicked ? 'Edit tick' : 'Tick'}
                    onClick={() => setShowTickModal(true)}
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8',
                      isTicked
                        ? 'border-green-400/45 bg-green-500/20 text-green-300 hover:bg-green-500/28'
                        : 'border-white/12 bg-white/[0.06] text-slate-300 hover:border-white/18 hover:bg-white/[0.1]',
                    )}
                  >
                    <Check size={12} strokeWidth={2.5} />
                  </button>
                  <button
                    type='button'
                    title='Comment'
                    onClick={() => setShowCommentModal({ id: -1, danger: false, resolved: false })}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-slate-300 transition-colors hover:border-white/18 hover:bg-white/[0.1] sm:h-8 sm:w-8'
                  >
                    <MessageSquare size={12} strokeWidth={2.25} />
                  </button>
                  {meta.isAdmin && (
                    <button
                      type='button'
                      title={showHiddenMedia ? 'Showing hidden media' : 'Show hidden media'}
                      onClick={() => setShowHiddenMedia(!showHiddenMedia)}
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8',
                        showHiddenMedia
                          ? 'border-sky-400/45 bg-sky-500/20 text-sky-200 hover:bg-sky-500/28'
                          : 'border-white/12 bg-white/[0.06] text-slate-300 hover:border-white/18 hover:bg-white/[0.1]',
                      )}
                    >
                      <Eye size={12} strokeWidth={2.25} />
                    </button>
                  )}
                  <Link
                    to={meta.isAdmin ? `/problem/edit/${data.sectorId}/${data.id}` : `/problem/edit/media/${data.id}`}
                    title={meta.isAdmin ? 'Edit problem' : 'Add media'}
                    aria-label={meta.isAdmin ? 'Edit problem' : 'Add media'}
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8',
                      meta.isAdmin
                        ? 'border-amber-300/45 bg-amber-400/18 text-amber-100 hover:bg-amber-400/28'
                        : 'border-green-400/40 bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200',
                    )}
                  >
                    {meta.isAdmin ? <Edit size={12} /> : <Plus size={12} />}
                  </Link>
                </>
              ) : null
            }
          />

          {data.broken ||
          data.areaAccessClosed ||
          data.sectorAccessClosed ||
          data.areaNoDogsAllowed ||
          data.areaAccessInfo ||
          data.sectorAccessInfo ? (
            <div className='mt-1 min-w-0 space-y-2 text-[12px] leading-relaxed sm:text-[13px]'>
              {data.broken && (
                <p className='text-pretty text-red-300/90'>
                  <span className='font-medium'>{meta.isBouldering ? 'Problem' : 'Route'} broken:</span> {data.broken}
                </p>
              )}
              {(data.areaAccessClosed || data.sectorAccessClosed) && (
                <p className='text-pretty text-red-300/90'>
                  {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed: '}
                  {(data.areaAccessClosed || '') + (data.sectorAccessClosed || '')}
                </p>
              )}
              {(data.areaNoDogsAllowed || data.areaAccessInfo || data.sectorAccessInfo) && (
                <div className='space-y-1.5 text-orange-300/90'>
                  {data.areaNoDogsAllowed && <NoDogsAllowed />}
                  <Linkify>
                    {data.areaAccessInfo && <p className='text-pretty'>{data.areaAccessInfo}</p>}
                    {data.sectorAccessInfo && <p className='text-pretty'>{data.sectorAccessInfo}</p>}
                  </Linkify>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {showMapTab ? (
          <>
            <div
              className={designContract.controls.tabBarRow}
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
                  size={12}
                  strokeWidth={activeTab === 'overview' ? 2.3 : 2}
                  className={tabBarIconClassName(activeTab === 'overview')}
                />
                <span className='block min-w-0 truncate leading-none'>Overview</span>
              </button>
              <button
                type='button'
                role='tab'
                aria-selected={activeTab === 'map'}
                onClick={() => setActiveTab('map')}
                className={tabBarButtonClassName(activeTab === 'map')}
              >
                <MapIcon
                  size={12}
                  strokeWidth={activeTab === 'map' ? 2.3 : 2}
                  className={tabBarIconClassName(activeTab === 'map')}
                />
                <span className='block min-w-0 truncate leading-none'>Map</span>
              </button>
            </div>
            {activeTab === 'overview' ? (
              overviewPanel
            ) : (
              <>
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
                {(hasApproach || hasDescent) && (
                  <div
                    className={cn(
                      'border-surface-border/40 border-t px-3 py-3 sm:px-4 sm:py-4',
                      hasApproach && hasDescent ? 'grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5' : 'space-y-0',
                    )}
                  >
                    {hasApproach && (
                      <div className='min-w-0'>
                        <div
                          className={cn(
                            designContract.typography.meta,
                            'mb-1.5 font-semibold tracking-wide text-slate-500',
                          )}
                        >
                          Approach
                        </div>
                        <SlopeProfile
                          compact
                          className='min-w-0'
                          areaName={data.areaName ?? ''}
                          sectorName={data.sectorName ?? ''}
                          slope={data.sectorApproach as Slope}
                        />
                      </div>
                    )}
                    {hasDescent && (
                      <div className='min-w-0'>
                        <div
                          className={cn(
                            designContract.typography.meta,
                            'mb-1.5 font-semibold tracking-wide text-slate-500',
                          )}
                        >
                          Descent
                        </div>
                        <SlopeProfile
                          compact
                          className='min-w-0'
                          areaName={data.areaName ?? ''}
                          sectorName={data.sectorName ?? ''}
                          slope={data.sectorDescent as Slope}
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          overviewPanel
        )}
      </Card>

      {showOverviewContent && hasPitches && data.sections && (
        <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm sm:border'>
          <div className='p-4 sm:p-5'>
            <div className='flex flex-col gap-6'>
              {data.sections.map((s) => (
                <article key={s.nr} className='min-w-0 space-y-2.5' aria-label={`Pitch ${s.nr}`}>
                  <div className='leading-snug text-pretty text-slate-300'>
                    <span
                      className={cn(
                        designContract.typography.meta,
                        'font-mono font-semibold text-slate-400 tabular-nums',
                      )}
                    >
                      Pitch {s.nr}
                    </span>
                    <span className='text-slate-600'> · </span>
                    <span className={cn(designContract.typography.grade, 'font-semibold text-slate-100')}>
                      {s.grade}
                    </span>
                    {s.description ? (
                      <>
                        <span className='text-slate-600'> · </span>
                        <div
                          className={cn(
                            designContract.typography.meta,
                            'inline-block max-w-full align-baseline text-slate-400 [&_a]:text-slate-300 [&_a]:underline [&_a]:decoration-white/15 [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:text-slate-200',
                          )}
                        >
                          <Linkify>{s.description}</Linkify>
                        </div>
                      </>
                    ) : null}
                  </div>
                  {s.media && s.media.length > 0 && (
                    <Media
                      pitches={data.sections}
                      media={s.media}
                      orderableMedia={orderableMedia}
                      carouselMedia={carouselMedia}
                      optProblemId={null}
                      showLocation={false}
                    />
                  )}
                </article>
              ))}
            </div>
          </div>
        </Card>
      )}

      {showOverviewContent && (hasTicks || hasComments) ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            hasTicks && hasComments ? 'md:grid-cols-2 md:items-start md:gap-5 lg:gap-6' : '',
          )}
        >
          {hasTicks && (
            <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm sm:border'>
              <div className='border-surface-border/40 flex flex-wrap items-center gap-x-2 gap-y-1 border-b px-4 py-2.5 sm:px-5'>
                <Check size={12} className='shrink-0 text-slate-500' strokeWidth={2.25} />
                <span className='type-label'>Ticks</span>
                <span className={cn(designContract.typography.meta, 'text-slate-500 tabular-nums')}>
                  {data.ticks?.length ?? 0}
                </span>
              </div>
              <div className='pb-4 sm:pb-5'>
                <ProblemTicks ticks={data.ticks || []} />
              </div>
            </Card>
          )}
          {hasComments && (
            <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm sm:border'>
              <div className='border-surface-border/40 flex flex-wrap items-center gap-x-2 gap-y-1 border-b px-4 py-2.5 sm:px-5'>
                <MessageSquare size={12} className='shrink-0 text-slate-500' strokeWidth={2.25} />
                <span className='type-label'>Comments</span>
                <span className={cn(designContract.typography.meta, 'text-slate-500 tabular-nums')}>
                  {data.comments?.length ?? 0}
                </span>
              </div>
              <div className='pb-4 sm:pb-5'>
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
        <Card flush className='min-w-0 overflow-hidden border-0 shadow-sm sm:border'>
          <div className='grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:p-5 lg:grid-cols-[min(11rem,30%)_1fr] lg:gap-x-8 lg:gap-y-6'>
            {hasTriviaBlock && (
              <>
                <div className={cn('pt-1', designContract.typography.label)}>Trivia</div>
                <div className='space-y-4'>
                  {data.trivia && (
                    <div className='bg-surface-nav/20 border-surface-border/50 rounded-xl border p-4 text-slate-400'>
                      <ExpandableMarkdown content={data.trivia} contentClassName='italic' />
                    </div>
                  )}
                  {data.triviaMedia && (
                    <Media
                      pitches={data.sections}
                      media={data.triviaMedia}
                      orderableMedia={orderableMedia}
                      carouselMedia={carouselMedia}
                      optProblemId={null}
                      showLocation={false}
                    />
                  )}
                </div>
              </>
            )}

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
