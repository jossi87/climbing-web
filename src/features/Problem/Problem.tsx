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
import { ClickableAvatar } from '../../shared/ui/Avatar/Avatar';
import TickModal from '../../shared/components/TickModal/TickModal';
import CommentModal from '../../shared/components/CommentModal/CommentModal';
import { SlopeProfile } from '../../shared/components/SlopeProfile';
import Linkify from 'linkify-react';
import { ProblemsOnRock } from './ProblemsOnRock';
import { ProblemTicks } from './ProblemTicks';
import { ProblemComments } from './ProblemComments';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card } from '../../shared/ui';
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
  Calendar,
  ChevronRight,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type MediaItem = components['schemas']['Media'];

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

  const hasTicks = data.ticks && data.ticks.length > 0;
  const hasComments = data.comments && data.comments.length > 0;

  const hasApproach = (data.sectorApproach?.coordinates?.length ?? 0) > 1;
  const hasDescent = (data.sectorDescent?.coordinates?.length ?? 0) > 1;

  const mainDescription = (data.comment || data.faAid?.description || '').trim();

  return (
    <div className='w-full min-w-0 space-y-4 sm:space-y-6'>
      <title>{`${data.name} · ${data.grade} · ${data.areaName} / ${data.sectorName} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

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

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='relative p-4 sm:p-5'>
          {meta.isAuthenticated && (
            <div className='absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 sm:top-5 sm:right-5'>
              {!isTicked && (
                <button
                  type='button'
                  title='To-do'
                  onClick={handleToggleTodo}
                  disabled={isPending}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
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
                  'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
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
                className='inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-slate-300 transition-colors hover:border-white/18 hover:bg-white/[0.1]'
              >
                <MessageSquare size={12} strokeWidth={2.25} />
              </button>
              {meta.isAdmin && (
                <button
                  type='button'
                  title={showHiddenMedia ? 'Showing hidden media' : 'Show hidden media'}
                  onClick={() => setShowHiddenMedia(!showHiddenMedia)}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
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
                  'inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                  meta.isAdmin
                    ? 'border-amber-300/45 bg-amber-400/18 text-amber-100 hover:bg-amber-400/28'
                    : 'border-green-400/40 bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200',
                )}
              >
                {meta.isAdmin ? <Edit size={12} /> : <Plus size={12} />}
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
            <Link to={`/sector/${data.sectorId}`} className='transition-colors hover:text-slate-300'>
              {data.sectorName}
            </Link>
            <LockSymbol lockedAdmin={!!data.sectorLockedAdmin} lockedSuperadmin={!!data.sectorLockedSuperadmin} />
            <ChevronRight size={12} className='shrink-0 opacity-30' />
            <span className='flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-slate-400'>
              <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
                #{data.nr}
              </span>
              <span className='text-slate-600'>·</span>
              <span className='font-medium text-slate-300'>{data.name}</span>
              <span className='text-slate-600'>·</span>
              <span className={designContract.typography.grade}>{data.grade}</span>
              <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
            </span>
          </nav>

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
      </Card>

      <Card flush className='min-w-0 overflow-hidden border-0 sm:border'>
        {markers.length > 0 ? (
          <>
            <div className='border-surface-border border-t'>
              <div
                className={designContract.controls.tabBarRow}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
                role='tablist'
                aria-label='Overview or map'
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
            </div>
            <div className='border-surface-border/40 border-t p-1 sm:p-2'>
              {activeTab === 'overview' ? (
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
                  {mainDescription.length > 0 && (
                    <ExpandableMarkdown key={data.id} content={data.comment || data.faAid?.description || ''} />
                  )}
                </div>
              ) : (
                <div className='relative z-0 h-[40vh] min-h-[220px] w-full overflow-hidden rounded-lg'>
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
                    showSatelliteImage
                    clusterMarkers={false}
                    flyToId={null}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
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
            {mainDescription.length > 0 && (
              <ExpandableMarkdown key={data.id} content={data.comment || data.faAid?.description || ''} />
            )}
          </div>
        )}
      </Card>

      <Card flush className='min-w-0 overflow-hidden border-0 sm:border'>
        <div className='grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:p-5 lg:grid-cols-[min(11rem,30%)_1fr] lg:gap-x-8 lg:gap-y-6'>
          {(data.neighbourPrev || data.neighbourNext) && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>Neighbours</div>
              <div className='flex flex-wrap gap-2'>
                {[data.neighbourPrev, data.neighbourNext].filter(Boolean).map((n) => (
                  <Link
                    key={n!.id}
                    to={`/problem/${n!.id}`}
                    className={cn(designContract.surfaces.inlineChipInteractive, 'opacity-90 hover:opacity-100')}
                  >
                    <span className={cn(designContract.typography.meta, 'font-mono text-slate-500 tabular-nums')}>
                      #{n!.nr}
                    </span>
                    <span className={cn(designContract.typography.listLink, designContract.typography.listEmphasis)}>
                      {n!.name}
                    </span>
                    <span className={designContract.typography.grade}>{n!.grade}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className={cn('pt-1', designContract.typography.label)}>
            {data.faAid ? 'First Free Ascent' : 'First Ascent'}
          </div>
          <div className='space-y-4'>
            <div className='flex flex-wrap gap-2'>
              <span className={designContract.surfaces.inlineChip}>
                <span className='font-medium text-slate-400'>Grade:</span>{' '}
                <span className={cn(designContract.typography.grade, 'text-slate-200')}>{data.originalGrade}</span>
              </span>
              {meta.isClimbing && data.t?.subType && (
                <span className={cn(designContract.surfaces.inlineChip, 'gap-1.5')}>
                  <Tag size={12} className='shrink-0 text-slate-500' />
                  <span className='font-medium'>{data.t.subType}</span>
                </span>
              )}
              {(data.faDateHr || data.faAid?.dateHr) && (
                <span className={cn(designContract.surfaces.inlineChip, 'gap-1.5')}>
                  <Calendar size={12} className='shrink-0 text-slate-500' />
                  <span>{data.faDateHr || data.faAid?.dateHr}</span>
                </span>
              )}
              {(data.fa || data.faAid?.users)?.map((u) => (
                <Link
                  key={u.id}
                  to={`/user/${u.id}`}
                  className={cn(designContract.surfaces.inlineChipInteractive, 'gap-2 font-semibold')}
                >
                  <ClickableAvatar
                    name={u.name}
                    mediaId={u.mediaId}
                    mediaVersionStamp={u.mediaVersionStamp}
                    size='mini'
                  />{' '}
                  {u.name}
                </Link>
              ))}
            </div>
            {meta.isIce && (
              <div className='flex flex-wrap gap-2'>
                <span className={designContract.surfaces.inlineChip}>
                  <span className='font-medium text-slate-400'>Alt:</span> {data.startingAltitude}
                </span>
                <span className={designContract.surfaces.inlineChip}>
                  <span className='font-medium text-slate-400'>Aspect:</span> {data.aspect}
                </span>
                <span className={designContract.surfaces.inlineChip}>
                  <span className='font-medium text-slate-400'>Len:</span> {data.routeLength}
                </span>
                <span className={designContract.surfaces.inlineChip}>
                  <span className='font-medium text-slate-400'>Descent:</span> {data.descent}
                </span>
              </div>
            )}
          </div>

          {(data.trivia || data.triviaMedia?.length) && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>Trivia</div>
              <div className='space-y-4'>
                {data.trivia && (
                  <div className='bg-surface-nav/20 border-surface-border/50 rounded-xl border p-4 text-slate-400 italic'>
                    <ExpandableMarkdown content={data.trivia} className='italic' />
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

          {data.rock && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>Rock «{data.rock}»</div>
              <div>
                <ProblemsOnRock sectorId={data.sectorId!} problemId={+problemId} rock={data.rock} />
              </div>
            </>
          )}

          {data.sections && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>Pitches</div>
              <div className='space-y-4'>
                {data.sections.map((s) => (
                  <div key={s.nr} className='flex gap-4'>
                    <div className='bg-surface-nav border-surface-border flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-black text-slate-500'>
                      {s.nr}
                    </div>
                    <div className='flex-1 space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <div className={cn(designContract.surfaces.inlineChip, 'min-w-0 shrink-0 whitespace-nowrap')}>
                          <span className={cn(designContract.typography.grade, 'text-slate-200')}>{s.grade}</span>
                        </div>
                        <div className='text-sm text-slate-300'>
                          <Linkify>{s.description}</Linkify>
                        </div>
                      </div>
                      {s.media && (
                        <Media
                          pitches={data.sections}
                          media={s.media}
                          orderableMedia={orderableMedia}
                          carouselMedia={carouselMedia}
                          optProblemId={null}
                          showLocation={false}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {(hasApproach || hasDescent) && (
            <>
              <div className={cn('md:pt-0.5', designContract.typography.label)}>Terrain</div>
              <div className='grid w-full grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 md:gap-y-4'>
                {hasApproach && (
                  <div className='flex min-w-0 flex-col gap-1'>
                    <div
                      className={cn(
                        designContract.typography.meta,
                        'text-[10px] font-semibold tracking-wide text-slate-500 uppercase',
                      )}
                    >
                      Approach
                    </div>
                    <SlopeProfile
                      compact
                      areaName={data.areaName!}
                      sectorName={data.sectorName!}
                      slope={data.sectorApproach as Slope}
                    />
                  </div>
                )}
                {hasDescent && (
                  <div className='flex min-w-0 flex-col gap-1'>
                    <div
                      className={cn(
                        designContract.typography.meta,
                        'text-[10px] font-semibold tracking-wide text-slate-500 uppercase',
                      )}
                    >
                      Descent
                    </div>
                    <SlopeProfile
                      compact
                      areaName={data.areaName!}
                      sectorName={data.sectorName!}
                      slope={data.sectorDescent as Slope}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className={cn('pt-1', designContract.typography.label)}>Conditions</div>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
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
          </div>

          <div className={cn('pt-1', designContract.typography.label)}>Misc</div>
          <div className='flex flex-wrap items-center gap-2'>
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
                className={cn(
                  designContract.surfaces.inlineChipInteractive,
                  'gap-1 px-2 py-0.5 text-[11px] font-medium',
                )}
              >
                <MapIcon size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} /> Parking
              </a>
            )}
            {data.coordinates && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${data.coordinates.latitude},${data.coordinates.longitude}`}
                target='_blank'
                rel='noreferrer'
                title={meta.isBouldering ? 'Boulder in Google Maps' : 'Route in Google Maps'}
                className={cn(
                  designContract.surfaces.inlineChipInteractive,
                  'gap-1 px-2 py-0.5 text-[11px] font-medium',
                )}
              >
                <MapIcon size={11} className='shrink-0 text-slate-500' strokeWidth={2.25} />{' '}
                {meta.isBouldering ? 'Boulder' : 'Route'}
              </a>
            )}
            <ExternalLinkLabels externalLinks={data.externalLinks} />
          </div>

          {optimisticTodo && data.todos && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>To-do</div>
              <div className='flex flex-wrap gap-2'>
                {data.todos.map((u) => (
                  <Link
                    key={u.idUser}
                    to={`/user/${u.idUser}`}
                    className={cn(
                      designContract.surfaces.inlineChipInteractive,
                      'text-[10px] font-semibold text-slate-400',
                    )}
                  >
                    <ClickableAvatar
                      name={u.name}
                      mediaId={u.mediaId}
                      mediaVersionStamp={u.mediaVersionStamp}
                      size='mini'
                    />{' '}
                    {u.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <div
        className={cn('grid grid-cols-1 gap-6', hasTicks && hasComments ? 'lg:grid-cols-2 lg:gap-6' : 'lg:grid-cols-1')}
      >
        {hasTicks && (
          <Card flush className='min-w-0 overflow-hidden border-0 sm:border'>
            <div className='border-surface-border/40 flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5'>
              <div className='flex items-center gap-2'>
                <Check size={12} className='text-slate-500' strokeWidth={2.25} />
                <span className='type-label'>Ticks</span>
              </div>
              <span className={cn(designContract.typography.meta, 'text-slate-500 tabular-nums')}>
                {data.ticks?.length ?? 0}
              </span>
            </div>
            <div className='px-4 pt-3 pb-4 sm:px-5'>
              <ProblemTicks ticks={data.ticks || []} />
            </div>
          </Card>
        )}
        {hasComments && (
          <Card flush className='min-w-0 overflow-hidden border-0 sm:border'>
            <div className='border-surface-border/40 flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5'>
              <div className='flex items-center gap-2'>
                <MessageSquare size={12} className='text-slate-500' strokeWidth={2.25} />
                <span className='type-label'>Comments</span>
              </div>
              <span className={cn(designContract.typography.meta, 'text-slate-500 tabular-nums')}>
                {data.comments?.length ?? 0}
              </span>
            </div>
            <div className='px-4 pt-3 pb-4 sm:px-5'>
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
    </div>
  );
};
