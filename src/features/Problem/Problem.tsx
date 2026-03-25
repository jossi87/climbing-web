import { useState, useOptimistic, useTransition, type ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import GetCenterFromDegrees from '../../utils/map-utils';
import Media from '../../shared/components/Media/Media';
import {
  Loading,
  LockSymbol,
  ConditionLabels,
  ExternalLinkLabels,
  NoDogsAllowed,
} from '../../shared/components/Widgets/Widgets';
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
import { Markdown } from '../../shared/components/Markdown/Markdown';
import {
  Bookmark,
  Check,
  MessageSquare,
  Eye,
  Edit,
  Plus,
  Map as MapIcon,
  Calendar,
  ChevronRight,
  AlertTriangle,
  Tag,
  Activity,
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
  const [activeTab, setActiveTab] = useState<'media' | 'map'>('media');
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
      label: `${data.name} [${data.grade}]`,
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

  return (
    <div className={designContract.layout.pageShell}>
      <title>{`${data.name} [${data.grade}] (${data.areaName} / ${data.sectorName}) | ${meta?.title}`}</title>
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

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <Link to='/areas' className='uppercase transition-colors'>
            Areas
          </Link>
          <ChevronRight size={12} className='opacity-20' />
          <Link to={`/area/${data.areaId}`} className='uppercase transition-colors'>
            {data.areaName}
          </Link>
          <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
          <ChevronRight size={12} className='opacity-20' />
          <Link to={`/sector/${data.sectorId}`} className='uppercase transition-colors'>
            {data.sectorName}
          </Link>
          <LockSymbol lockedAdmin={!!data.sectorLockedAdmin} lockedSuperadmin={!!data.sectorLockedSuperadmin} />
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <span className='font-medium text-slate-500'>#{data.nr}</span>
            <span className='uppercase'>{data.name}</span>
            <span className='font-mono text-slate-400 normal-case'>[{data.grade}]</span>
            <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
          </div>
        </nav>

        <div className='flex items-center gap-1'>
          {meta.isAuthenticated && (
            <div className='bg-surface-nav border-surface-border flex rounded-lg border p-1'>
              {!isTicked && (
                <button
                  onClick={handleToggleTodo}
                  disabled={isPending}
                  className={cn(
                    'rounded-md p-2 transition-all',
                    optimisticTodo ? 'text-brand bg-brand/10' : 'opacity-70 hover:opacity-100',
                  )}
                >
                  <Bookmark size={18} fill={optimisticTodo ? 'currentColor' : 'none'} />
                </button>
              )}
              <button
                onClick={() => setShowTickModal(true)}
                className={cn(
                  'rounded-md p-2 transition-all',
                  isTicked ? 'bg-green-500/10 text-green-500' : 'opacity-70 hover:opacity-100',
                )}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setShowCommentModal({ id: -1, danger: false, resolved: false })}
                className='p-2 opacity-70 transition-all hover:opacity-100'
              >
                <MessageSquare size={18} />
              </button>
              {meta.isAdmin && (
                <button
                  onClick={() => setShowHiddenMedia(!showHiddenMedia)}
                  className={cn(
                    'rounded-md p-2 transition-all',
                    showHiddenMedia ? 'bg-blue-400/10 text-blue-400' : 'opacity-70 hover:opacity-100',
                  )}
                >
                  <Eye size={18} />
                </button>
              )}
              <Link
                to={meta.isAdmin ? `/problem/edit/${data.sectorId}/${data.id}` : `/problem/edit/media/${data.id}`}
                className='p-2 opacity-70 transition-all hover:opacity-100'
              >
                {meta.isAdmin ? <Edit size={18} /> : <Plus size={18} />}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        {data.broken && (
          <div className='flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500'>
            <AlertTriangle className='mt-0.5 shrink-0' size={18} />
            <div>
              <p className='mb-1 text-[10px] font-black tracking-tight uppercase'>
                {meta.isBouldering ? 'Problem' : 'Route'} broken
              </p>
              <p>{data.broken}</p>
            </div>
          </div>
        )}
        {(data.areaAccessClosed || data.sectorAccessClosed) && (
          <div className='flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500'>
            <AlertTriangle className='mt-0.5 shrink-0' size={18} />
            <div>
              <p className='mb-1 text-[10px] font-black tracking-tight uppercase'>
                {data.areaAccessClosed ? 'Area' : 'Sector'} closed!
              </p>
              <p>{(data.areaAccessClosed || '') + (data.sectorAccessClosed || '')}</p>
            </div>
          </div>
        )}
      </div>

      <div className={cn(designContract.surfaces.card, 'overflow-hidden')}>
        <div className='border-surface-border bg-surface-nav/30 flex border-b'>
          <button
            onClick={() => setActiveTab('media')}
            className={cn(
              designContract.controls.tabButton,
              activeTab === 'media' ? 'border-brand bg-brand/5' : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            <Eye size={14} /> Media
          </button>
          {markers.length > 0 && (
            <button
              onClick={() => setActiveTab('map')}
              className={cn(
                designContract.controls.tabButton,
                activeTab === 'map' ? 'border-brand bg-brand/5' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <MapIcon size={14} /> Map
            </button>
          )}
        </div>
        <div className='p-1'>
          {activeTab === 'media' ? (
            <Media
              pitches={data.sections}
              media={data.media || []}
              orderableMedia={orderableMedia}
              carouselMedia={carouselMedia}
              optProblemId={data.id ?? 0}
              showLocation={false}
            />
          ) : (
            <div className='h-[40vh] w-full overflow-hidden rounded-xl'>
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
      </div>

      {(data.areaAccessInfo || data.sectorAccessInfo || data.areaNoDogsAllowed) && (
        <div className='rounded-xl border border-orange-500/20 bg-orange-500/5 p-5'>
          <div className='mb-3 flex items-center gap-2 text-orange-500'>
            <AlertTriangle size={18} />
            <h4 className='type-label text-orange-500'>Restrictions</h4>
          </div>
          <div className='ml-7 space-y-2 text-sm leading-relaxed text-slate-300'>
            {data.areaNoDogsAllowed && <NoDogsAllowed />}
            <Linkify>
              {data.areaAccessInfo && <p>{data.areaAccessInfo}</p>}
              {data.sectorAccessInfo && <p>{data.sectorAccessInfo}</p>}
            </Linkify>
          </div>
        </div>
      )}

      <div className={cn(designContract.surfaces.card, 'space-y-8 p-6')}>
        <div className='grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[180px_1fr]'>
          {(data.neighbourPrev || data.neighbourNext) && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>Neighbours</div>
              <div className='flex flex-wrap gap-2'>
                {[data.neighbourPrev, data.neighbourNext].filter(Boolean).map((n) => (
                  <Link
                    key={n!.id}
                    to={`/problem/${n!.id}`}
                    className='bg-surface-nav border-surface-border hover:border-brand/50 type-small rounded-lg border px-3 py-1.5 opacity-85 transition-all hover:opacity-100'
                  >
                    <span className='mr-1 text-slate-500'>#{n!.nr}</span> {n!.name}{' '}
                    <span className='ml-1 font-normal text-slate-500'>{n!.grade}</span>
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
              <span className='bg-surface-nav border-surface-border rounded border px-2 py-1 text-[11px] font-bold text-slate-300'>
                Grade: {data.originalGrade}
              </span>
              {meta.isClimbing && data.t?.subType && (
                <span className='bg-surface-nav border-surface-border inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-bold text-slate-300'>
                  <Tag size={12} /> {data.t.subType}
                </span>
              )}
              {(data.faDateHr || data.faAid?.dateHr) && (
                <span className='bg-surface-nav border-surface-border inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-bold text-slate-300'>
                  <Calendar size={12} /> {data.faDateHr || data.faAid?.dateHr}
                </span>
              )}
              {(data.fa || data.faAid?.users)?.map((u) => (
                <Link
                  key={u.id}
                  to={`/user/${u.id}`}
                  className='bg-surface-nav border-surface-border hover:border-brand inline-flex items-center gap-2 rounded border px-2 py-1 text-[11px] font-bold text-slate-300 transition-all'
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
            <div className='w-full text-[15px] leading-relaxed text-slate-300'>
              <Linkify>
                <Markdown content={data.comment || data.faAid?.description || ''} />
              </Linkify>
            </div>
            {meta.isIce && (
              <div className='bg-surface-nav/30 border-surface-border/50 flex flex-wrap gap-4 rounded-lg border p-3 text-[11px] font-bold tracking-tighter text-slate-500 uppercase'>
                <span>
                  <b>Alt:</b> {data.startingAltitude}
                </span>
                <span>
                  <b>Aspect:</b> {data.aspect}
                </span>
                <span>
                  <b>Len:</b> {data.routeLength}
                </span>
                <span>
                  <b>Descent:</b> {data.descent}
                </span>
              </div>
            )}
          </div>

          {(data.trivia || data.triviaMedia?.length) && (
            <>
              <div className={cn('pt-1', designContract.typography.label)}>Trivia</div>
              <div className='space-y-4'>
                {data.trivia && (
                  <div className='bg-surface-nav/20 border-surface-border/50 rounded-xl border p-4 text-sm text-slate-400 italic'>
                    <Linkify>
                      <Markdown content={data.trivia} />
                    </Linkify>
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
                      <div className='flex items-center gap-2'>
                        <div className='bg-surface-nav border-surface-border flex min-w-fit items-center gap-1.5 rounded border px-2 py-1 whitespace-nowrap'>
                          <span className='type-label'>{s.grade}</span>
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
              <div className={cn('pt-1', designContract.typography.label)}>Terrain</div>
              <div className='grid w-full grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2'>
                {hasApproach && (
                  <div className='flex min-w-0 flex-col gap-2'>
                    <div className='text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase'>
                      Approach Profile
                    </div>
                    <SlopeProfile
                      areaName={data.areaName!}
                      sectorName={data.sectorName!}
                      slope={data.sectorApproach as Slope}
                    />
                  </div>
                )}
                {hasDescent && (
                  <div className='flex min-w-0 flex-col gap-2'>
                    <div className='text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase'>
                      Descent Profile
                    </div>
                    <SlopeProfile
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
          <div>
            {conditionLat > 0 && (
              <ConditionLabels
                lat={conditionLat}
                lng={conditionLng}
                label={data.name ?? ''}
                wallDirectionCalculated={data.sectorWallDirectionCalculated}
                wallDirectionManual={data.sectorWallDirectionManual}
                sunFromHour={data.sectorSunFromHour ?? data.areaSunFromHour ?? 0}
                sunToHour={data.sectorSunToHour ?? data.areaSunToHour ?? 0}
              />
            )}
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
                className='bg-surface-nav border-surface-border type-label rounded-md border px-2 py-1 opacity-75 transition-all hover:opacity-100'
              >
                <MapIcon size={12} className='mr-1 inline' /> Parking
              </a>
            )}
            {data.coordinates && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${data.coordinates.latitude},${data.coordinates.longitude}`}
                target='_blank'
                rel='noreferrer'
                className='bg-surface-nav border-surface-border type-label rounded-md border px-2 py-1 opacity-75 transition-all hover:opacity-100'
              >
                <MapIcon size={12} className='mr-1 inline' /> {meta.isBouldering ? 'Boulder' : 'Route'}
              </a>
            )}
            <span className='bg-surface-nav border-surface-border flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold text-slate-500 uppercase'>
              <Activity size={12} /> {data.pageViews}
            </span>
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
                    className='bg-surface-nav border-surface-border hover:border-brand inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[10px] font-bold text-slate-400 transition-all'
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
      </div>

      <div
        className={cn('grid grid-cols-1 gap-12 pt-8', hasTicks && hasComments ? 'lg:grid-cols-2' : 'lg:grid-cols-1')}
      >
        {hasTicks && (
          <div className='space-y-6'>
            <div className='border-surface-border flex items-center gap-3 border-b px-1 pb-4'>
              <Check size={20} className='text-brand' />
              <h3 className='type-label'>Latest Ticks</h3>
            </div>
            <ProblemTicks ticks={data.ticks || []} />
          </div>
        )}
        {hasComments && (
          <div className='space-y-6'>
            <div className='border-surface-border flex items-center gap-3 border-b px-1 pb-4'>
              <MessageSquare size={20} className='text-brand' />
              <h3 className='type-label'>Comments</h3>
            </div>
            <ProblemComments
              onShowCommentModal={setShowCommentModal}
              problemId={+problemId}
              showHiddenMedia={showHiddenMedia}
              orderableMedia={orderableMedia}
              carouselMedia={carouselMedia}
            />
          </div>
        )}
      </div>
    </div>
  );
};
