import { useState, useOptimistic, useTransition, type ComponentProps } from 'react';
import { Link, useParams } from 'react-router-dom';
import Leaflet from '../common/leaflet/leaflet';
import { getDistanceWithUnit } from '../common/leaflet/geo-utils';
import GetCenterFromDegrees from '../../utils/map-utils';
import Media from '../common/media/media';
import {
  Loading,
  LockSymbol,
  ConditionLabels,
  ExternalLinkLabels,
  NoDogsAllowed,
} from '../common/widgets/widgets';
import { useMeta } from '../common/meta/context';
import { useProblem } from '../../api';
import type { components } from '../../@types/buldreinfo/swagger';
import type { Slope } from '../../@types/buldreinfo';
import { ClickableAvatar } from '../ui/Avatar';
import TickModal from '../common/tick-modal/tick-modal';
import CommentModal from '../common/comment-modal/comment-modal';
import { SlopeProfile } from '../common/SlopeProfile';
import Linkify from 'linkify-react';
import { ProblemsOnRock } from './ProblemsOnRock';
import { ProblemTicks } from './ProblemTicks';
import { ProblemComments } from './ProblemComments';
import { DownloadButton } from '../common/DownloadButton';
import { Markdown } from '../Markdown/Markdown';
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

  const [optimisticTodo, setOptimisticTodo] = useOptimistic(
    data?.todo,
    (_, newTodo: boolean) => newTodo,
  );

  const [showTickModal, setShowTickModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState<
    components['schemas']['ProblemComment'] | null
  >(null);

  if (redirectUi) return redirectUi;

  if (error) {
    return (
      <div className='p-6 bg-surface-card border border-surface-border rounded-md text-left'>
        <div className='flex items-center gap-4'>
          <div className='p-3 rounded-xl bg-red-500/10 text-red-500 shadow-inner'>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className='text-slate-200 font-bold'>404</h3>
            <p className='text-slate-500 text-sm'>
              Cannot find the specified problem or insufficient permissions.
            </p>
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
        data.sectorOutline
          .filter((c) => !!(c.latitude && c.longitude))
          .map((c) => [c.latitude!, c.longitude!]),
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
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`${data.name} [${data.grade}] (${data.areaName} / ${data.sectorName}) | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      {showTickModal && (
        <TickModal
          idTick={userTick?.id ?? -1}
          idProblem={data.id!}
          date={userTick?.date}
          comment={userTick?.comment ?? ''}
          grade={
            userTick?.noPersonalGrade
              ? 'No personal grade'
              : (userTick?.suggestedGrade ?? data.grade ?? '')
          }
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

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex flex-wrap items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
          <Link to='/areas' className='uppercase hover:text-white transition-colors'>
            Areas
          </Link>
          <ChevronRight size={12} className='opacity-20' />
          <Link
            to={`/area/${data.areaId}`}
            className='uppercase hover:text-white transition-colors'
          >
            {data.areaName}
          </Link>
          <LockSymbol
            lockedAdmin={!!data.areaLockedAdmin}
            lockedSuperadmin={!!data.areaLockedSuperadmin}
          />
          <ChevronRight size={12} className='opacity-20' />
          <Link
            to={`/sector/${data.sectorId}`}
            className='uppercase hover:text-white transition-colors'
          >
            {data.sectorName}
          </Link>
          <LockSymbol
            lockedAdmin={!!data.sectorLockedAdmin}
            lockedSuperadmin={!!data.sectorLockedSuperadmin}
          />
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <span className='text-slate-500 font-medium'>#{data.nr}</span>
            <span className='uppercase'>{data.name}</span>
            <span className='text-slate-400 font-mono normal-case'>[{data.grade}]</span>
            <LockSymbol
              lockedAdmin={!!data.lockedAdmin}
              lockedSuperadmin={!!data.lockedSuperadmin}
            />
          </div>
        </nav>

        <div className='flex items-center gap-1'>
          {meta.isAuthenticated && (
            <div className='flex bg-surface-nav rounded-lg border border-surface-border p-1'>
              {!isTicked && (
                <button
                  onClick={handleToggleTodo}
                  disabled={isPending}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    optimisticTodo ? 'text-brand bg-brand/10' : 'text-slate-400 hover:text-white',
                  )}
                >
                  <Bookmark size={18} fill={optimisticTodo ? 'currentColor' : 'none'} />
                </button>
              )}
              <button
                onClick={() => setShowTickModal(true)}
                className={cn(
                  'p-2 rounded-md transition-all',
                  isTicked ? 'text-green-500 bg-green-500/10' : 'text-slate-400 hover:text-white',
                )}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setShowCommentModal({ id: -1, danger: false, resolved: false })}
                className='p-2 text-slate-400 hover:text-white transition-all'
              >
                <MessageSquare size={18} />
              </button>
              {meta.isAdmin && (
                <button
                  onClick={() => setShowHiddenMedia(!showHiddenMedia)}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    showHiddenMedia
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-slate-400 hover:text-white',
                  )}
                >
                  <Eye size={18} />
                </button>
              )}
              <Link
                to={
                  meta.isAdmin
                    ? `/problem/edit/${data.sectorId}/${data.id}`
                    : `/problem/edit/media/${data.id}`
                }
                className='p-2 text-slate-400 hover:text-white transition-all'
              >
                {meta.isAdmin ? <Edit size={18} /> : <Plus size={18} />}
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        {data.broken && (
          <div className='flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm'>
            <AlertTriangle className='shrink-0 mt-0.5' size={18} />
            <div>
              <p className='font-black uppercase tracking-tight text-[10px] mb-1'>
                {meta.isBouldering ? 'Problem' : 'Route'} broken
              </p>
              <p>{data.broken}</p>
            </div>
          </div>
        )}
        {(data.areaAccessClosed || data.sectorAccessClosed) && (
          <div className='flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm'>
            <AlertTriangle className='shrink-0 mt-0.5' size={18} />
            <div>
              <p className='font-black uppercase tracking-tight text-[10px] mb-1'>
                {data.areaAccessClosed ? 'Area' : 'Sector'} closed!
              </p>
              <p>{(data.areaAccessClosed || '') + (data.sectorAccessClosed || '')}</p>
            </div>
          </div>
        )}
      </div>

      <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm'>
        <div className='flex border-b border-surface-border bg-surface-nav/30'>
          <button
            onClick={() => setActiveTab('media')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2',
              activeTab === 'media'
                ? 'border-brand text-white bg-brand/5'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            <Eye size={14} /> Media
          </button>
          {markers.length > 0 && (
            <button
              onClick={() => setActiveTab('map')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2',
                activeTab === 'map'
                  ? 'border-brand text-white bg-brand/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300',
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
            <div className='h-[40vh] w-full rounded-xl overflow-hidden'>
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
        <div className='bg-orange-500/5 border border-orange-500/20 rounded-xl p-5'>
          <div className='flex items-center gap-2 text-orange-500 mb-3'>
            <AlertTriangle size={18} />
            <h4 className='text-[10px] font-black uppercase tracking-[0.2em]'>Restrictions</h4>
          </div>
          <div className='text-sm text-slate-300 space-y-2 ml-7 leading-relaxed'>
            {data.areaNoDogsAllowed && <NoDogsAllowed />}
            <Linkify>
              {data.areaAccessInfo && <p>{data.areaAccessInfo}</p>}
              {data.sectorAccessInfo && <p>{data.sectorAccessInfo}</p>}
            </Linkify>
          </div>
        </div>
      )}

      <div className='bg-surface-card border border-surface-border rounded-2xl p-6 space-y-8'>
        <div className='grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-x-8 gap-y-6'>
          {(data.neighbourPrev || data.neighbourNext) && (
            <>
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
                Neighbours
              </div>
              <div className='flex flex-wrap gap-2'>
                {[data.neighbourPrev, data.neighbourNext].filter(Boolean).map((n) => (
                  <Link
                    key={n!.id}
                    to={`/problem/${n!.id}`}
                    className='px-3 py-1.5 rounded-lg bg-surface-nav border border-surface-border text-xs font-bold text-slate-300 hover:border-brand/50 transition-all'
                  >
                    <span className='text-slate-500 mr-1'>#{n!.nr}</span> {n!.name}{' '}
                    <span className='text-slate-500 font-normal ml-1'>{n!.grade}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
            {data.faAid ? 'First Free Ascent' : 'First Ascent'}
          </div>
          <div className='space-y-4'>
            <div className='flex flex-wrap gap-2'>
              <span className='px-2 py-1 rounded bg-surface-nav border border-surface-border text-[11px] font-bold text-slate-300'>
                Grade: {data.originalGrade}
              </span>
              {meta.isClimbing && data.t?.subType && (
                <span className='inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[11px] font-bold text-slate-300'>
                  <Tag size={12} /> {data.t.subType}
                </span>
              )}
              {(data.faDateHr || data.faAid?.dateHr) && (
                <span className='inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[11px] font-bold text-slate-300'>
                  <Calendar size={12} /> {data.faDateHr || data.faAid?.dateHr}
                </span>
              )}
              {(data.fa || data.faAid?.users)?.map((u) => (
                <Link
                  key={u.id}
                  to={`/user/${u.id}`}
                  className='inline-flex items-center gap-2 px-2 py-1 rounded bg-surface-nav border border-surface-border text-[11px] font-bold text-slate-300 hover:border-brand transition-all'
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
            <div className='text-[15px] text-slate-300 leading-relaxed w-full'>
              <Linkify>
                <Markdown content={data.comment || data.faAid?.description || ''} />
              </Linkify>
            </div>
            {meta.isIce && (
              <div className='text-[11px] font-bold text-slate-500 bg-surface-nav/30 p-3 rounded-lg flex flex-wrap gap-4 uppercase tracking-tighter border border-surface-border/50'>
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
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
                Trivia
              </div>
              <div className='space-y-4'>
                {data.trivia && (
                  <div className='text-sm text-slate-400 italic bg-surface-nav/20 p-4 rounded-xl border border-surface-border/50'>
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
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
                Rock «{data.rock}»
              </div>
              <div>
                <ProblemsOnRock sectorId={data.sectorId!} problemId={+problemId} rock={data.rock} />
              </div>
            </>
          )}

          {data.sections && (
            <>
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
                Pitches
              </div>
              <div className='space-y-4'>
                {data.sections.map((s) => (
                  <div key={s.nr} className='flex gap-4'>
                    <div className='w-6 h-6 rounded bg-surface-nav border border-surface-border flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0'>
                      {s.nr}
                    </div>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1.5 px-2 py-1 rounded bg-surface-nav border border-surface-border min-w-fit whitespace-nowrap'>
                          <span className='text-[11px] font-black text-white'>{s.grade}</span>
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
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
                Terrain
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 w-full'>
                {hasApproach && (
                  <div className='flex flex-col gap-2 min-w-0'>
                    <div className='text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]'>
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
                  <div className='flex flex-col gap-2 min-w-0'>
                    <div className='text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]'>
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

          <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
            Conditions
          </div>
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

          <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
            Misc
          </div>
          <div className='flex flex-wrap gap-2 items-center'>
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
                className='px-2 py-1 rounded-md bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-400 hover:text-white transition-all'
              >
                <MapIcon size={12} className='inline mr-1' /> Parking
              </a>
            )}
            {data.coordinates && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${data.coordinates.latitude},${data.coordinates.longitude}`}
                target='_blank'
                rel='noreferrer'
                className='px-2 py-1 rounded-md bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-400 hover:text-white transition-all'
              >
                <MapIcon size={12} className='inline mr-1' />{' '}
                {meta.isBouldering ? 'Boulder' : 'Route'}
              </a>
            )}
            <span className='px-2 py-1 rounded-md bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1'>
              <Activity size={12} /> {data.pageViews}
            </span>
            <ExternalLinkLabels externalLinks={data.externalLinks} />
          </div>

          {optimisticTodo && data.todos && (
            <>
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1'>
                To-do
              </div>
              <div className='flex flex-wrap gap-2'>
                {data.todos.map((u) => (
                  <Link
                    key={u.idUser}
                    to={`/user/${u.idUser}`}
                    className='inline-flex items-center gap-2 px-2 py-1 rounded-md bg-surface-nav border border-surface-border text-[10px] font-bold text-slate-400 hover:border-brand transition-all'
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
        className={cn(
          'grid grid-cols-1 gap-12 pt-8',
          hasTicks && hasComments ? 'lg:grid-cols-2' : 'lg:grid-cols-1',
        )}
      >
        {hasTicks && (
          <div className='space-y-6'>
            <div className='flex items-center gap-3 px-1 border-b border-surface-border pb-4'>
              <Check size={20} className='text-brand' />
              <h3 className='text-xs font-black uppercase tracking-[0.2em] text-white'>
                Latest Ticks
              </h3>
            </div>
            <ProblemTicks ticks={data.ticks || []} />
          </div>
        )}
        {hasComments && (
          <div className='space-y-6'>
            <div className='flex items-center gap-3 px-1 border-b border-surface-border pb-4'>
              <MessageSquare size={20} className='text-brand' />
              <h3 className='text-xs font-black uppercase tracking-[0.2em] text-white'>Comments</h3>
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
