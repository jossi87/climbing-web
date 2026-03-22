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
import {
  downloadFileWithProgress,
  getMediaFileUrl,
  getMediaFileUrlSrcSet,
  useAccessToken,
} from '../../../api';
import SvgViewer from '../../SvgViewer';
import VideoPlayer from './video-player';
import { Descent, Rappel } from '../../../utils/svg-utils';
import { useMeta } from '../meta';
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

  if (isSaving) {
    return (
      <div className='fixed inset-0 z-250 bg-black/90 flex items-center justify-center backdrop-blur-xl'>
        <div className='text-center'>
          <RefreshCw className='text-brand animate-spin mx-auto mb-4' size={48} />
          <p className='text-white font-bold uppercase tracking-widest text-xs'>
            Saving Changes...
          </p>
        </div>
      </div>
    );
  }

  const activePitch = (!!pitch && (pitches ?? []).find((p) => p.nr === pitch)) || null;

  const canSetMediaAsAvatar = isAuthenticated && isImage;
  const canEdit = isAdmin && isImage;
  const canDelete = isAdmin;
  const canRotate =
    (isAdmin || m.uploadedByMe) &&
    isImage &&
    (m.svgs ?? []).length === 0 &&
    (m.mediaSvgs ?? []).length === 0;
  const canDrawTopo = isAdmin && isImage && !!optProblemId;
  const canDrawMedia = isAdmin && isImage && !isBouldering;
  const canOrder = isAdmin && isImage && (orderableMedia ?? []).some((om) => om.id === (m.id ?? 0));
  const canMove = isAdmin && isImage;

  return (
    <div
      className='fixed inset-0 z-150 bg-black select-none overflow-hidden flex'
      onClick={handleDimmerClick}
    >
      {canShowSidebar && showSidebar && (
        <div className='w-80 h-full bg-surface-dark border-r border-surface-border flex flex-col z-160 animate-in slide-in-from-left duration-300 shadow-2xl'>
          <div className='p-5 border-b border-surface-border flex items-center justify-between bg-surface-nav/20'>
            <h3 className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-500'>
              Problems in View
            </h3>
            <button
              type='button'
              onClick={() => setShowSidebar(false)}
              className='text-slate-500 hover:text-white transition-colors'
            >
              <X size={18} />
            </button>
          </div>
          <div className='flex-1 overflow-y-auto custom-scrollbar divide-y divide-surface-border/30 text-left'>
            {svgs
              .filter((svg) => (svg.pitch ?? 0) === 0 || (svg.pitch ?? 0) === 1)
              .sort(
                (a, b) =>
                  (a.nr ?? 0) - (b.nr ?? 0) ||
                  (a.problemName ?? '').localeCompare(b.problemName ?? ''),
              )
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
                      : 'text-slate-400 hover:bg-surface-nav hover:text-slate-200',
                  )}
                >
                  <span>
                    {svg.pitch === 0
                      ? `#${svg.nr} ${svg.problemName} [${svg.problemGrade}]`
                      : svg.problemName}
                  </span>
                  <div className='flex gap-2 shrink-0'>
                    {svg.ticked && <Check size={14} className='text-green-500' />}
                    {svg.todo && <Bookmark size={14} className='text-blue-400' />}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      <div
        className='flex-1 relative h-full w-full flex items-center justify-center overflow-hidden'
        {...handlers}
      >
        <div className='absolute top-4 right-4 flex gap-2 z-170'>
          <div className='flex bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-2xl'>
            {m.url && (
              <button
                type='button'
                onClick={() => window.open(m.url ?? '', '_blank')}
                className='p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all'
              >
                <ExternalLink size={18} />
              </button>
            )}

            {canShowSidebar && (
              <button
                type='button'
                onClick={() => setShowSidebar(!showSidebar)}
                className={cn(
                  'p-2.5 rounded-lg transition-all',
                  showSidebar ? 'bg-brand text-white' : 'text-white/70 hover:text-white',
                )}
              >
                <ListIcon size={18} />
              </button>
            )}

            <button
              type='button'
              onClick={() => setShowInfo(true)}
              className='p-2.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10'
            >
              <Info size={18} />
            </button>

            {!isBouldering && svgs.length > 0 && (
              <button
                type='button'
                onClick={() => setShowHelp(true)}
                className='p-2.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10'
              >
                <HelpCircle size={18} />
              </button>
            )}

            <div className='relative'>
              <button
                type='button'
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  'p-2.5 rounded-lg transition-all',
                  showMenu ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white',
                )}
              >
                <MoreVertical size={18} />
              </button>
              {showMenu && (
                <div className='absolute top-full right-0 mt-3 w-64 bg-surface-card border border-surface-border rounded-2xl shadow-2xl py-2 z-180 animate-in fade-in zoom-in-95 duration-200'>
                  <div className='px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-surface-border/50 mb-1'>
                    Actions
                  </div>
                  {canDrawTopo && (
                    <button
                      type='button'
                      onClick={() =>
                        navigate(`/problem/svg-edit/${optProblemId}/${pitch || 0}/${m.id}`)
                      }
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Paintbrush size={14} className='text-brand' /> Draw topo line
                    </button>
                  )}
                  {canDrawMedia && (
                    <button
                      type='button'
                      onClick={() => navigate(`/media/svg-edit/${m.id}`)}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Paintbrush size={14} className='text-brand' /> Draw on image
                    </button>
                  )}
                  {canOrder && (
                    <button
                      type='button'
                      onClick={onMoveImageLeft}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <ArrowLeft size={14} /> Move image left
                    </button>
                  )}
                  {canOrder && (
                    <button
                      type='button'
                      onClick={onMoveImageRight}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <ArrowRight size={14} /> Move image right
                    </button>
                  )}
                  {canMove && (m.enableMoveToIdArea ?? 0) > 0 && (
                    <button
                      type='button'
                      onClick={onMoveImageToArea}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Move size={14} /> Move image to area
                    </button>
                  )}
                  {canMove && (m.enableMoveToIdSector ?? 0) > 0 && (
                    <button
                      type='button'
                      onClick={onMoveImageToSector}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Move size={14} /> Move image to sector
                    </button>
                  )}
                  {canMove && (m.enableMoveToIdProblem ?? 0) > 0 && (
                    <button
                      type='button'
                      onClick={onMoveImageToProblem}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Move size={14} /> Move image to {isBouldering ? 'problem' : 'route'}
                    </button>
                  )}
                  {canSetMediaAsAvatar && (
                    <button
                      type='button'
                      onClick={onSetMediaAsAvatar}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <UserIcon size={14} /> Set as avatar
                    </button>
                  )}

                  <div className='h-px bg-surface-border/50 my-2' />

                  {!m.embedUrl && (
                    <button
                      type='button'
                      onClick={() =>
                        downloadFileWithProgress(
                          accessToken,
                          getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, m.idType !== 1, {
                            original: true,
                          }),
                        )
                      }
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Download size={14} /> Download Original
                    </button>
                  )}
                  {canRotate && (
                    <>
                      <button
                        type='button'
                        onClick={() => onRotate(90)}
                        className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                      >
                        <RotateCw size={14} /> Rotate 90° CW
                      </button>
                      <button
                        type='button'
                        onClick={() => onRotate(270)}
                        className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                      >
                        <RotateCcw size={14} /> Rotate 90° CCW
                      </button>
                      <button
                        type='button'
                        onClick={() => onRotate(180)}
                        className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                      >
                        <RefreshCw size={14} /> Rotate 180°
                      </button>
                    </>
                  )}
                  {canEdit && (
                    <button
                      type='button'
                      onClick={onEdit}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-surface-nav transition-colors'
                    >
                      <Edit size={14} /> Edit Information
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type='button'
                      onClick={onDelete}
                      className='w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors'
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
            className='p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-red-500 transition-all shadow-2xl'
          >
            <X size={20} />
          </button>
        </div>

        <div
          className='w-full h-full flex items-center justify-center transition-transform duration-300 ease-out'
          style={{ transform: `translateX(${offsetX}px)` }}
        >
          {isImage ? (
            svgs.length > 0 ? (
              <div className='w-full h-full' onClick={(e) => e.stopPropagation()}>
                <SvgViewer
                  m={m}
                  pitch={pitch}
                  thumb={false}
                  close={onClose}
                  optProblemId={optProblemId}
                  showText={canShowSidebar && !showSidebar}
                  problemIdHovered={problemIdHovered}
                  setProblemIdHovered={setProblemIdHovered}
                  className='w-full h-full object-contain'
                />
              </div>
            ) : (
              <img
                className='max-h-screen max-w-full object-contain select-none cursor-pointer touch-pinch-zoom'
                src={getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, false, {
                  targetWidth: Math.min(1920, m.width ?? 1920),
                })}
                srcSet={getMediaFileUrlSrcSet(m.id ?? 0, m.versionStamp ?? 0, m.width ?? 0)}
                alt=''
                onClick={(e) => {
                  e.stopPropagation();
                  if (!wasSwiping.current && offsetX === 0) {
                    onClose();
                  }
                }}
              />
            )
          ) : m.embedUrl ? (
            <iframe
              src={m.embedUrl}
              className='w-full h-full max-w-5xl aspect-video rounded-2xl shadow-2xl'
              allowFullScreen
              title='Video Content'
            />
          ) : autoPlayVideo ? (
            <VideoPlayer media={m} className='w-full h-full max-h-screen' />
          ) : (
            <div
              className='relative group cursor-pointer'
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
                <div className='w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300'>
                  <Play size={48} fill='currentColor' className='ml-1' />
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
              className='absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white hover:scale-110 transition-all active:scale-95'
            >
              <ChevronLeft size={80} strokeWidth={1} />
            </button>
            <button
              type='button'
              onClick={gotoNext}
              className='absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white hover:scale-110 transition-all active:scale-95'
            >
              <ChevronRight size={80} strokeWidth={1} />
            </button>
          </>
        )}

        <div className='absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-170'>
          <div className='space-y-3 max-w-xl'>
            {showLocation && m.mediaMetadata?.location && (
              <div className='px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-black text-white uppercase tracking-widest inline-flex items-center gap-2 pointer-events-auto'>
                <MapPin size={12} className='text-brand' /> {m.mediaMetadata.location}
              </div>
            )}
            {m.mediaMetadata?.description && (
              <div className='p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 text-sm text-white/90 font-medium shadow-2xl leading-relaxed pointer-events-auto'>
                {m.mediaMetadata.description}
              </div>
            )}
          </div>
          <div className='px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-black text-white tracking-[0.2em] flex gap-4 shadow-2xl'>
            {activePitch && (
              <span className='text-brand'>
                {activePitch.grade} | {activePitch.description}
              </span>
            )}
            {(m.pitch ?? 0) > 0 && <span>Pitch {m.pitch}</span>}
            {carouselSize > 1 && (
              <span className='text-slate-400'>
                {carouselIndex} / {carouselSize}
              </span>
            )}
          </div>
        </div>
      </div>

      {showInfo && (
        <div
          className='fixed inset-0 z-300 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300'
          onClick={() => setShowInfo(false)}
        >
          <div
            className='bg-surface-card border border-surface-border rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-8'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center border-b border-surface-border pb-6'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-brand/10 rounded-2xl text-brand'>
                  <Info size={24} />
                </div>
                <h3 className='text-2xl font-black text-white uppercase tracking-tighter'>
                  Information
                </h3>
              </div>
              <button
                type='button'
                onClick={() => setShowInfo(false)}
                className='p-2 hover:bg-surface-nav rounded-xl transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 text-left'>
              <div className='space-y-6'>
                <div>
                  <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                    <MapPin size={12} /> Location
                  </p>
                  <p className='text-white font-bold'>{m.mediaMetadata?.location || 'Unknown'}</p>
                </div>
                <div>
                  <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                    <Calendar size={12} /> Dates
                  </p>
                  <div className='space-y-1 text-white font-bold'>
                    {m.mediaMetadata?.dateCreated && (
                      <p className='text-xs'>Uploaded: {m.mediaMetadata.dateCreated}</p>
                    )}
                    {m.mediaMetadata?.dateTaken && (
                      <p className='text-xs'>Taken: {m.mediaMetadata.dateTaken}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className='space-y-6'>
                <div>
                  <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                    <UserIcon size={12} /> People
                  </p>
                  <div className='space-y-1 text-white font-bold'>
                    <p className='text-xs'>
                      {m.idType === 1 ? 'Photographer' : 'Video by'}:{' '}
                      {m.mediaMetadata?.capturer || 'Unknown'}
                    </p>
                    {m.mediaMetadata?.tagged && (
                      <p className='text-xs italic'>
                        In {m.idType === 1 ? 'photo' : 'video'}: {m.mediaMetadata.tagged}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                    <Maximize2 size={12} /> Technical
                  </p>
                  <p className='text-white font-bold text-xs'>
                    {m.width} x {m.height} pixels
                  </p>
                </div>
              </div>
            </div>
            {m.mediaMetadata?.description && (
              <div className='text-left'>
                <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2'>
                  Description
                </p>
                <i className='text-slate-300 text-sm leading-relaxed'>
                  {m.mediaMetadata.description}
                </i>
              </div>
            )}
          </div>
        </div>
      )}

      {showHelp && (
        <div
          className='fixed inset-0 z-300 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300'
          onClick={() => setShowHelp(false)}
        >
          <div
            className='bg-surface-card border border-surface-border rounded-3xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar text-left'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center border-b border-surface-border pb-6 mb-8'>
              <h3 className='text-2xl font-black text-white uppercase tracking-tighter'>
                Topo Legend
              </h3>
              <button
                type='button'
                onClick={() => setShowHelp(false)}
                className='p-2 hover:bg-surface-nav rounded-xl transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
              <div className='space-y-8'>
                <div>
                  <h4 className='text-[10px] font-black text-brand uppercase tracking-widest mb-4'>
                    Line Shapes
                  </h4>
                  <ul className='space-y-4'>
                    <li className='flex gap-4 items-center'>
                      <div className='w-12 h-0.5 border-t-2 border-dashed border-white' />{' '}
                      <div className='text-sm'>
                        <p className='text-white font-bold'>Dotted Line</p>
                        <p className='text-slate-500 text-xs'>Bolted sport route</p>
                      </div>
                    </li>
                    <li className='flex gap-4 items-center'>
                      <div className='w-12 h-0.5 bg-white' />{' '}
                      <div className='text-sm'>
                        <p className='text-white font-bold'>Unbroken Line</p>
                        <p className='text-slate-500 text-xs'>Traditionally protected route</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='text-[10px] font-black text-brand uppercase tracking-widest mb-4'>
                    Line Colors (Difficulty)
                  </h4>
                  <ul className='grid grid-cols-2 gap-4'>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded bg-white shadow-lg' />
                      <span className='text-xs text-slate-300 font-bold'>White (Project)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded bg-green-500 shadow-lg' />
                      <span className='text-xs text-slate-300 font-bold'>Green (Grade 3-5)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded bg-blue-500 shadow-lg' />
                      <span className='text-xs text-slate-300 font-bold'>Blue (Grade 6)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded bg-yellow-400 shadow-lg' />
                      <span className='text-xs text-slate-300 font-bold'>Yellow (Grade 7)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded bg-red-500 shadow-lg' />
                      <span className='text-xs text-slate-300 font-bold'>Red (Grade 8)</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded bg-fuchsia-500 shadow-lg' />
                      <span className='text-xs text-slate-300 font-bold'>Magenta (Grade 9-10)</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='space-y-8'>
                <div>
                  <h4 className='text-[10px] font-black text-brand uppercase tracking-widest mb-4'>
                    Number Colors
                  </h4>
                  <ul className='space-y-3'>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded border border-green-500 text-green-500 flex items-center justify-center text-[8px] font-black'>
                        1
                      </div>
                      <span className='text-xs text-slate-300 font-bold'>Green: Ticked</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded border border-blue-500 text-blue-500 flex items-center justify-center text-[8px] font-black'>
                        1
                      </div>
                      <span className='text-xs text-slate-300 font-bold'>Blue: In Todo-list</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded border border-red-500 text-red-500 flex items-center justify-center text-[8px] font-black'>
                        1
                      </div>
                      <span className='text-xs text-slate-300 font-bold'>Red: Dangerous</span>
                    </li>
                    <li className='flex items-center gap-3'>
                      <div className='w-4 h-4 rounded border border-white text-white flex items-center justify-center text-[8px] font-black'>
                        1
                      </div>
                      <span className='text-xs text-slate-300 font-bold'>White: Default color</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='text-[10px] font-black text-brand uppercase tracking-widest mb-4'>
                    Other Symbols
                  </h4>
                  <ul className='space-y-6'>
                    <li className='flex items-center gap-4'>
                      <svg width='60' height='20' className='bg-surface-nav rounded'>
                        <Descent
                          scale={0.6}
                          path={'M 0 10 C 30 10 30 10 60 10'}
                          whiteNotBlack={true}
                          thumb={false}
                        />
                      </svg>
                      <span className='text-xs text-slate-300 font-bold'>Descent Line</span>
                    </li>
                    <li className='flex items-center gap-4'>
                      <div className='w-6 h-6 bg-surface-nav rounded flex items-center justify-center'>
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
                      <span className='text-xs text-slate-300 font-bold'>Bolted Anchor</span>
                    </li>
                    <li className='flex items-center gap-4'>
                      <div className='w-6 h-6 bg-surface-nav rounded flex items-center justify-center'>
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
                      <span className='text-xs text-slate-300 font-bold'>Traditional Anchor</span>
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
