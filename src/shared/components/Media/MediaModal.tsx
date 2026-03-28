import { useState, useEffect, type MouseEvent, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import {
  X,
  Info,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Paintbrush,
  ArrowLeft,
  ArrowRight,
  Move,
  Download,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Play,
  Check,
  Bookmark,
  HelpCircle,
  MapPin,
  Calendar,
  User as UserIcon,
  Maximize2,
} from 'lucide-react';

import { useLocalStorage } from '../../../utils/use-local-storage';
import { downloadFileWithProgress, getMediaFileUrl, getMediaFileUrlSrcSet, useAccessToken } from '../../../api';
import SvgViewer from '../SvgViewer';
import VideoPlayer from './VideoPlayer';
import { Descent, Rappel } from '../../../utils/svg-utils';
import { useMeta } from '../Meta';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';

type Props = {
  isSaving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRotate: (deg: number) => void;
  onMoveImageLeft: () => void;
  onMoveImageRight: () => void;
  onMoveImageToArea: () => void;
  onMoveImageToSector: () => void;
  onMoveImageToProblem: () => void;
  onSetMediaAsAvatar: () => void;
  m: components['schemas']['Media'];
  pitch: number;
  pitches: components['schemas']['ProblemSection'][];
  orderableMedia: components['schemas']['Media'][];
  carouselIndex: number;
  carouselSize: number;
  showLocation: boolean;
  gotoPrev: () => void;
  gotoNext: () => void;
  playVideo: () => void;
  autoPlayVideo: boolean;
  optProblemId: number | null;
};

const MediaModal = ({
  isSaving,
  onClose,
  onEdit,
  onDelete,
  onRotate,
  onMoveImageLeft,
  onMoveImageRight,
  onMoveImageToArea,
  onMoveImageToSector,
  onMoveImageToProblem,
  onSetMediaAsAvatar,
  m,
  pitch,
  pitches,
  orderableMedia,
  carouselIndex,
  carouselSize,
  showLocation,
  gotoPrev,
  gotoNext,
  playVideo,
  autoPlayVideo,
  optProblemId,
}: Props) => {
  const { isAuthenticated, isAdmin, isBouldering } = useMeta();
  const accessToken = useAccessToken();
  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useLocalStorage('showSidebar', true);
  const [showInfo, setShowInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [problemIdHovered, setProblemIdHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const wasSwiping = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetSwipe = useCallback(() => {
    setOffsetX(0);
    setIsSwiping(false);
    setTimeout(() => {
      wasSwiping.current = false;
    }, 100);
  }, []);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      const scale = window.visualViewport?.scale ?? 1;
      if (carouselSize <= 1 || !isMobile || scale > 1.05) return;
      setIsSwiping(true);
      wasSwiping.current = true;
      setOffsetX(e.deltaX);
    },
    onSwipedLeft: () => {
      if (carouselSize > 1 && isMobile && isSwiping) gotoNext();
      resetSwipe();
    },
    onSwipedRight: () => {
      if (carouselSize > 1 && isMobile && isSwiping) gotoPrev();
      resetSwipe();
    },
    onTouchEndOrOnMouseUp: () => resetSwipe(),
    delta: 50,
  });

  const svgs = (m.svgs ?? m.mediaSvgs ?? []) as components['schemas']['Svg'][];

  const canShowSidebar =
    svgs
      .filter((svg) => typeof svg.problemId === 'number')
      .map((v) => v.problemId)
      .filter((value, index, self) => self.indexOf(value) === index).length > 1;

  const isImage = m?.idType === 1;

  const handleDimmerClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !wasSwiping.current && offsetX === 0) {
      onClose();
    }
  };

  /** Letterboxed area around media: clicks hit this layer, not the full-screen root. */
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (wasSwiping.current || offsetX !== 0) return;
    onClose();
  };

  if (isSaving) {
    return (
      <div className='fixed inset-0 z-250 flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] items-center justify-center bg-black/90 backdrop-blur-xl'>
        <div className='text-center'>
          <RefreshCw className='text-brand mx-auto mb-4 animate-spin' size={48} />
          <p className='type-label'>Saving Changes...</p>
        </div>
      </div>
    );
  }

  const activePitch = (!!pitch && (pitches ?? []).find((p) => p.nr === pitch)) || null;

  const canSetMediaAsAvatar = isAuthenticated && isImage;
  const canEdit = isAdmin && isImage;
  const canDelete = isAdmin;
  const canRotate =
    (isAdmin || m.uploadedByMe) && isImage && (m.svgs ?? []).length === 0 && (m.mediaSvgs ?? []).length === 0;
  const canDrawTopo = isAdmin && isImage && !!optProblemId;
  const canDrawMedia = isAdmin && isImage && !isBouldering;
  const canOrder = isAdmin && isImage && (orderableMedia ?? []).some((om) => om.id === (m.id ?? 0));
  const canMove = isAdmin && isImage;

  return (
    <div
      className='fixed inset-0 z-150 flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-black select-none'
      onClick={handleDimmerClick}
    >
      {canShowSidebar && showSidebar && (
        <div className='bg-surface-dark border-surface-border animate-in slide-in-from-left z-160 flex h-full w-80 flex-col border-r shadow-2xl duration-300'>
          <div className='border-surface-border bg-surface-nav/20 flex items-center justify-between border-b p-5'>
            <h3 className='type-label'>Problems in View</h3>
            <button
              type='button'
              onClick={() => setShowSidebar(false)}
              className='opacity-70 transition-colors hover:opacity-100'
            >
              <X size={18} />
            </button>
          </div>
          <div className='custom-scrollbar divide-surface-border/30 flex-1 divide-y overflow-y-auto text-left'>
            {svgs
              .filter((svg) => (svg.pitch ?? 0) === 0 || (svg.pitch ?? 0) === 1)
              .sort((a, b) => (a.nr ?? 0) - (b.nr ?? 0) || (a.problemName ?? '').localeCompare(b.problemName ?? ''))
              .map((svg) => (
                <Link
                  key={`${svg.problemId}-${svg.pitch}`}
                  to={`/problem/${svg.problemId}/${m.id}`}
                  onMouseEnter={() => setProblemIdHovered(svg.problemId ?? null)}
                  onMouseLeave={() => setProblemIdHovered(null)}
                  className={cn(
                    'flex items-center justify-between p-4 text-xs font-bold transition-all',
                    problemIdHovered === svg.problemId || optProblemId === svg.problemId
                      ? 'bg-brand/10 text-brand shadow-[inset_3px_0_0_0_#f97316]'
                      : 'hover:bg-surface-nav text-slate-400 hover:text-slate-200',
                  )}
                >
                  <span>
                    {svg.pitch === 0 ? `#${svg.nr} ${svg.problemName} [${svg.problemGrade}]` : svg.problemName}
                  </span>
                  <div className='flex shrink-0 gap-2'>
                    {svg.ticked && <Check size={14} className='text-green-500' />}
                    {svg.todo && <Bookmark size={14} className='text-blue-400' />}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      <div
        className='relative flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden'
        {...handlers}
      >
        <div className='absolute top-4 right-4 z-170 flex gap-2'>
          <div className='flex rounded-xl border border-white/10 bg-black/60 p-1 shadow-2xl backdrop-blur-md'>
            {m.url && (
              <button
                type='button'
                onClick={() => window.open(m.url ?? '', '_blank')}
                className='rounded-lg p-2.5 opacity-70 transition-all hover:bg-white/10 hover:opacity-100'
              >
                <ExternalLink size={18} />
              </button>
            )}

            {canShowSidebar && (
              <button
                type='button'
                onClick={() => setShowSidebar(!showSidebar)}
                className={cn(
                  'rounded-lg p-2.5 transition-all',
                  showSidebar ? 'bg-brand type-body' : 'opacity-70 hover:opacity-100',
                )}
              >
                <ListIcon size={18} />
              </button>
            )}

            <button
              type='button'
              onClick={() => setShowInfo(true)}
              className='rounded-lg p-2.5 opacity-70 hover:bg-white/10 hover:opacity-100'
            >
              <Info size={18} />
            </button>

            {!isBouldering && svgs.length > 0 && (
              <button
                type='button'
                onClick={() => setShowHelp(true)}
                className='rounded-lg p-2.5 opacity-70 hover:bg-white/10 hover:opacity-100'
              >
                <HelpCircle size={18} />
              </button>
            )}

            <div className='relative'>
              <button
                type='button'
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  'rounded-lg p-2.5 transition-all',
                  showMenu ? 'type-body bg-white/20' : 'opacity-70 hover:opacity-100',
                )}
              >
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <div className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 absolute top-full right-0 z-180 mt-3 w-64 rounded-2xl border py-2 shadow-2xl duration-200'>
                  <div className='type-label border-surface-border/50 mb-1 border-b px-4 py-2'>Actions</div>
                  {canDrawTopo && (
                    <button
                      type='button'
                      onClick={() => navigate(`/problem/svg-edit/${optProblemId}/${pitch || 0}/${m.id}`)}
                      className='type-small hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                    >
                      <Paintbrush size={14} className='text-brand' /> Draw topo line
                    </button>
                  )}
                  {canDrawMedia && (
                    <button
                      type='button'
                      onClick={() => navigate(`/media/svg-edit/${m.id}`)}
                      className='type-small hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                    >
                      <Paintbrush size={14} className='text-brand' /> Draw on image
                    </button>
                  )}
                  {canOrder && (
                    <button
                      type='button'
                      onClick={onMoveImageLeft}
                      className='type-small hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                    >
                      <ArrowLeft size={14} /> Move image left
                    </button>
                  )}
                  {canOrder && (
                    <button
                      type='button'
                      onClick={onMoveImageRight}
                      className='type-small hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                    >
                      <ArrowRight size={14} /> Move image right
                    </button>
                  )}
                  {canMove && (m.enableMoveToIdArea ?? 0) > 0 && (
                    <button
                      type='button'
                      onClick={onMoveImageToArea}
                      className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <Move size={14} /> Move image to area
                    </button>
                  )}
                  {canMove && (m.enableMoveToIdSector ?? 0) > 0 && (
                    <button
                      type='button'
                      onClick={onMoveImageToSector}
                      className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <Move size={14} /> Move image to sector
                    </button>
                  )}
                  {canMove && (m.enableMoveToIdProblem ?? 0) > 0 && (
                    <button
                      type='button'
                      onClick={onMoveImageToProblem}
                      className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <Move size={14} /> Move image to {isBouldering ? 'problem' : 'route'}
                    </button>
                  )}
                  {canSetMediaAsAvatar && (
                    <button
                      type='button'
                      onClick={onSetMediaAsAvatar}
                      className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <UserIcon size={14} /> Set as avatar
                    </button>
                  )}

                  <div className='bg-surface-border/50 my-2 h-px' />

                  {!m.embedUrl && (
                    <button
                      type='button'
                      onClick={() =>
                        downloadFileWithProgress(
                          accessToken,
                          getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, m.idType !== 1, { original: true }),
                        )
                      }
                      className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <Download size={14} /> Download Original
                    </button>
                  )}
                  {canRotate && (
                    <>
                      <button
                        type='button'
                        onClick={() => onRotate(90)}
                        className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                      >
                        <RotateCw size={14} /> Rotate 90° CW
                      </button>
                      <button
                        type='button'
                        onClick={() => onRotate(270)}
                        className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                      >
                        <RotateCcw size={14} /> Rotate 90° CCW
                      </button>
                      <button
                        type='button'
                        onClick={() => onRotate(180)}
                        className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                      >
                        <RefreshCw size={14} /> Rotate 180°
                      </button>
                    </>
                  )}
                  {canEdit && (
                    <button
                      type='button'
                      onClick={onEdit}
                      className='hover:bg-surface-nav flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <Edit size={14} /> Edit Information
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type='button'
                      onClick={onDelete}
                      className='flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10'
                    >
                      <Trash2 size={14} /> Delete {isImage ? 'Image' : 'Video'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='type-body rounded-xl border border-white/10 bg-black/60 p-3 shadow-2xl backdrop-blur-md transition-all hover:bg-red-500'
          >
            <X size={20} />
          </button>
        </div>

        <div
          className='flex h-full w-full items-center justify-center transition-transform duration-300 ease-out'
          style={{ transform: `translateX(${offsetX}px)` }}
          onClick={handleBackdropClick}
        >
          {isImage ? (
            svgs.length > 0 ? (
              <div className='h-full w-full' onClick={(e) => e.stopPropagation()}>
                <SvgViewer
                  m={m}
                  pitch={pitch}
                  thumb={false}
                  close={onClose}
                  optProblemId={optProblemId}
                  showText={canShowSidebar && !showSidebar}
                  problemIdHovered={problemIdHovered}
                  setProblemIdHovered={setProblemIdHovered}
                  className='h-full w-full object-contain'
                />
              </div>
            ) : (
              <img
                className='max-h-screen max-w-full cursor-pointer touch-pinch-zoom object-contain select-none'
                src={getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, false, {
                  targetWidth: Math.min(1920, m.width ?? 1920),
                })}
                srcSet={getMediaFileUrlSrcSet(m.id ?? 0, m.versionStamp ?? 0, m.width ?? 0)}
                alt=''
                onClick={(e) => {
                  e.stopPropagation();
                  if (!wasSwiping.current && offsetX === 0) onClose();
                }}
              />
            )
          ) : m.embedUrl ? (
            <iframe
              src={m.embedUrl}
              className='aspect-video h-full w-full max-w-5xl rounded-2xl shadow-2xl'
              allowFullScreen
              title='Video Content'
            />
          ) : autoPlayVideo ? (
            <VideoPlayer media={m} className='h-full max-h-screen w-full' />
          ) : (
            <div
              className='group relative cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                playVideo();
              }}
            >
              <img
                className='max-h-screen max-w-full object-contain opacity-50 transition-opacity group-hover:opacity-70'
                src={getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, false, { targetWidth: 1080 })}
                alt=''
              />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='relative flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/5 shadow-[0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-[4px] transition-transform duration-300 group-hover:scale-110'>
                  <Play
                    size={44}
                    fill='currentColor'
                    className='ml-1'
                    style={{ color: '#e2e8f0', stroke: '#0f172a', strokeWidth: 1.4 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {carouselSize > 1 && !isMobile && (
          <>
            <button
              type='button'
              onClick={gotoPrev}
              className='type-body absolute top-1/2 left-8 -translate-y-1/2 p-4 opacity-20 transition-all hover:scale-110 hover:opacity-100 active:scale-95'
            >
              <ChevronLeft size={80} strokeWidth={1} />
            </button>
            <button
              type='button'
              onClick={gotoNext}
              className='type-body absolute top-1/2 right-8 -translate-y-1/2 p-4 opacity-20 transition-all hover:scale-110 hover:opacity-100 active:scale-95'
            >
              <ChevronRight size={80} strokeWidth={1} />
            </button>
          </>
        )}

        <div className='pointer-events-none absolute right-8 bottom-8 left-8 z-170 flex items-end justify-between'>
          <div className='max-w-xl space-y-3'>
            {showLocation && m.mediaMetadata?.location && (
              <div className='type-label pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md'>
                <MapPin size={12} className='text-brand' /> {m.mediaMetadata.location}
              </div>
            )}
            {m.mediaMetadata?.description && (
              <div className='type-body pointer-events-auto rounded-2xl border border-white/5 bg-black/40 p-4 leading-relaxed font-medium opacity-90 shadow-2xl backdrop-blur-md'>
                {m.mediaMetadata.description}
              </div>
            )}
          </div>
          <div className='type-label flex gap-4 rounded-xl border border-white/10 bg-black/60 px-4 py-2 shadow-2xl backdrop-blur-md'>
            {activePitch && (
              <span className='text-brand'>
                {activePitch.grade} | {activePitch.description}
              </span>
            )}
            {(m.pitch ?? 0) > 0 && <span>Pitch {m.pitch}</span>}
            {carouselSize > 1 && (
              <span className='opacity-70'>
                {carouselIndex} / {carouselSize}
              </span>
            )}
          </div>
        </div>
      </div>

      {showInfo && (
        <div
          className='animate-in fade-in fixed inset-0 z-300 flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] items-center justify-center bg-black/90 p-6 backdrop-blur-xl duration-300'
          onClick={() => setShowInfo(false)}
        >
          <div
            className='bg-surface-card border-surface-border w-full max-w-2xl space-y-8 rounded-3xl border p-8 shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='border-surface-border flex items-center justify-between border-b pb-6'>
              <div className='flex items-center gap-3'>
                <div className='bg-brand/10 text-brand rounded-2xl p-3'>
                  <Info size={24} />
                </div>
                <h3 className='type-h2'>Information</h3>
              </div>
              <button
                type='button'
                onClick={() => setShowInfo(false)}
                className='hover:bg-surface-nav rounded-xl p-2 transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='grid grid-cols-1 gap-8 text-left md:grid-cols-2'>
              <div className='space-y-6'>
                <div>
                  <p className='type-label mb-2 flex items-center gap-2'>
                    <MapPin size={12} /> Location
                  </p>
                  <p className='type-body font-semibold'>{m.mediaMetadata?.location || 'Unknown'}</p>
                </div>
                <div>
                  <p className='type-label mb-2 flex items-center gap-2'>
                    <Calendar size={12} /> Dates
                  </p>
                  <div className='type-body space-y-1 font-semibold'>
                    {m.mediaMetadata?.dateCreated && <p className='text-xs'>Uploaded: {m.mediaMetadata.dateCreated}</p>}
                    {m.mediaMetadata?.dateTaken && <p className='text-xs'>Taken: {m.mediaMetadata.dateTaken}</p>}
                  </div>
                </div>
              </div>
              <div className='space-y-6'>
                <div>
                  <p className='type-label mb-2 flex items-center gap-2'>
                    <UserIcon size={12} /> People
                  </p>
                  <div className='type-body space-y-1 font-semibold'>
                    <p className='text-xs'>
                      {m.idType === 1 ? 'Photographer' : 'Video by'}: {m.mediaMetadata?.capturer || 'Unknown'}
                    </p>
                    {m.mediaMetadata?.tagged && (
                      <p className='text-xs italic'>
                        In {m.idType === 1 ? 'photo' : 'video'}: {m.mediaMetadata.tagged}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className='type-label mb-2 flex items-center gap-2'>
                    <Maximize2 size={12} /> Technical
                  </p>
                  <p className='type-body text-xs font-semibold'>
                    {m.width} x {m.height} pixels
                  </p>
                </div>
              </div>
            </div>
            {m.mediaMetadata?.description && (
              <div className='text-left'>
                <p className='type-label mb-2'>Description</p>
                <i className='type-body text-sm leading-relaxed opacity-80'>{m.mediaMetadata.description}</i>
              </div>
            )}
          </div>
        </div>
      )}

      {showHelp && (
        <div
          className='animate-in fade-in fixed inset-0 z-300 flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] items-center justify-center bg-black/90 p-6 backdrop-blur-xl duration-300'
          onClick={() => setShowHelp(false)}
        >
          <div
            className='bg-surface-card border-surface-border custom-scrollbar max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border p-8 text-left shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='border-surface-border mb-8 flex items-center justify-between border-b pb-6'>
              <h3 className='type-h2'>Topo Legend</h3>
              <button
                type='button'
                onClick={() => setShowHelp(false)}
                className='hover:bg-surface-nav rounded-xl p-2 transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
              <div className='space-y-8'>
                <div>
                  <h4 className='text-brand mb-4 text-[10px] font-black tracking-widest uppercase'>Line Shapes</h4>
                  <ul className='space-y-4'>
                    <li className='flex items-center gap-4'>
                      <div className='h-0.5 w-12 border-t-2 border-dashed border-white' />{' '}
                      <div className='text-sm'>
                        <p className='type-body font-semibold'>Dotted Line</p>
                        <p className='text-xs text-slate-500'>Bolted sport route</p>
                      </div>
                    </li>
                    <li className='flex items-center gap-4'>
                      <div className='h-0.5 w-12 bg-white' />{' '}
                      <div className='text-sm'>
                        <p className='type-body font-semibold'>Unbroken Line</p>
                        <p className='text-xs text-slate-500'>Traditionally protected route</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='text-brand mb-4 text-[10px] font-black tracking-widest uppercase'>
                    Line Colors (Difficulty)
                  </h4>
                  <ul className='grid grid-cols-2 gap-4'>
                    <li className='flex items-center gap-3'>
                      <div className='h-4 w-4 rounded bg-white shadow-lg' />
                      <span className='text-xs font-bold text-slate-300'>White (Project)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='h-4 w-4 rounded bg-green-500 shadow-lg' />
                      <span className='text-xs font-bold text-slate-300'>Green (Grade 3-5)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='h-4 w-4 rounded bg-blue-500 shadow-lg' />
                      <span className='text-xs font-bold text-slate-300'>Blue (Grade 6)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='h-4 w-4 rounded bg-yellow-400 shadow-lg' />
                      <span className='text-xs font-bold text-slate-300'>Yellow (Grade 7)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='h-4 w-4 rounded bg-red-500 shadow-lg' />
                      <span className='text-xs font-bold text-slate-300'>Red (Grade 8)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='h-4 w-4 rounded bg-fuchsia-500 shadow-lg' />
                      <span className='text-xs font-bold text-slate-300'>Magenta (Grade 9-10)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='space-y-8'>
                <div>
                  <h4 className='text-brand mb-4 text-[10px] font-black tracking-widest uppercase'>Number Colors</h4>
                  <ul className='space-y-3'>
                    <li className='flex items-center gap-3'>
                      <div className='flex h-4 w-4 items-center justify-center rounded border border-green-500 text-[8px] font-black text-green-500'>
                        1
                      </div>
                      <span className='text-xs font-bold text-slate-300'>Green: Ticked</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='flex h-4 w-4 items-center justify-center rounded border border-blue-500 text-[8px] font-black text-blue-500'>
                        1
                      </div>
                      <span className='text-xs font-bold text-slate-300'>Blue: In Todo-list</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='flex h-4 w-4 items-center justify-center rounded border border-red-500 text-[8px] font-black text-red-500'>
                        1
                      </div>
                      <span className='text-xs font-bold text-slate-300'>Red: Dangerous</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='type-body border-surface-border flex h-4 w-4 items-center justify-center rounded border text-[8px] font-black'>
                        1
                      </div>
                      <span className='type-small text-xs font-semibold opacity-80'>White: Default color</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='text-brand mb-4 text-[10px] font-black tracking-widest uppercase'>Other Symbols</h4>
                  <ul className='space-y-6'>
                    <li className='flex items-center gap-4'>
                      <svg width='60' height='20' className='bg-surface-nav rounded'>
                        <Descent scale={0.6} path={'M 0 10 C 30 10 30 10 60 10'} whiteNotBlack={true} thumb={false} />
                      </svg>
                      <span className='text-xs font-bold text-slate-300'>Descent Line</span>
                    </li>
                    <li className='flex items-center gap-4'>
                      <div className='bg-surface-nav flex h-6 w-6 items-center justify-center rounded'>
                        <Rappel
                          x={12}
                          y={12}
                          bolted={true}
                          scale={0.6}
                          thumb={false}
                          backgroundColor='black'
                          color='white'
                        />
                      </div>
                      <span className='text-xs font-bold text-slate-300'>Bolted Anchor</span>
                    </li>
                    <li className='flex items-center gap-4'>
                      <div className='bg-surface-nav flex h-6 w-6 items-center justify-center rounded'>
                        <Rappel
                          x={12}
                          y={12}
                          bolted={false}
                          scale={0.6}
                          thumb={false}
                          backgroundColor='black'
                          color='white'
                        />
                      </div>
                      <span className='text-xs font-bold text-slate-300'>Traditional Anchor</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaModal;
