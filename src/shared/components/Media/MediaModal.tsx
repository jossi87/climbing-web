import { useState, useEffect, useMemo, type MouseEvent, useRef, useCallback, Fragment, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import {
  X,
  Info,
  HelpCircle,
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
import { designContract } from '../../../design/contract';
import { cn } from '../../../lib/utils';

/** Route index color (matches topo SVG number semantics; typography-only, no boxes). */
function svgListNrColor(svg: components['schemas']['Svg']) {
  if (svg.ticked) return designContract.ascentStatus.ticked;
  if (svg.todo) return designContract.ascentStatus.todo;
  if (svg.dangerous) return designContract.ascentStatus.dangerous;
  return 'text-slate-500';
}

/**
 * Higher ≈ harder. One French-style token: leading number, optional +/- after number, letter, +.
 * Used when scanning full strings so `10-` in `10- (8c+)` wins over `6+` (string sort alone fails).
 */
function scoreFrenchGradeToken(n: number, signAfterNum: string, letter: string, plusAfterLetter: boolean): number {
  const sign = signAfterNum === '+' ? 15 : signAfterNum === '-' ? -15 : 0;
  const L = letter.toLowerCase();
  const letterStep = L ? (L.charCodeAt(0) - 96) * 3 : 0;
  const tail = plusAfterLetter ? 1 : 0;
  return n * 1000 + sign + letterStep + tail;
}

/** Single-string parse (start, parenthetical, first digits). */
function gradeLabelSortKey(label: string | undefined): number {
  const t = (label ?? '').trim();
  if (!t || t === '.') return -1;

  const head = t.match(/^(\d+)(?:\s*([+-]))?([a-z]?)(\+?)(?=[\s(.]|$)/i);
  if (head) {
    return scoreFrenchGradeToken(parseInt(head[1], 10), head[2] ?? '', (head[3] ?? '').toLowerCase(), !!head[4]);
  }

  const paren = t.match(/\(\s*(\d+)([a-z]?)(\+?)\s*\)/i);
  if (paren) {
    return scoreFrenchGradeToken(parseInt(paren[1], 10), '', (paren[2] ?? '').toLowerCase(), !!paren[3]);
  }

  const any = t.match(/(\d+)/);
  return any ? parseInt(any[1], 10) * 1000 : 0;
}

/** Max difficulty mentioned anywhere in `text` (grade field, problem name, “6+ / 10-”, etc.). */
function gradeLabelSortKeyMaxInText(text: string | undefined): number {
  const t = (text ?? '').trim();
  if (!t || t === '.') return -1;

  let best = gradeLabelSortKey(t);
  // Mid-string tokens: boundary then French block (avoid greedy 3-digit years: cap 2 digits at boundary)
  const re = /(?:^|[\s(/[,])(\d{1,2})(?:\s*([+-]))?([a-z]?)(\+?)(?=[\s).,\]/]|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    const n = parseInt(m[1], 10);
    const hasTail = !!(m[2] || m[3] || m[4]);
    if (n > 17 && !hasTail) continue;
    best = Math.max(best, scoreFrenchGradeToken(n, m[2] ?? '', (m[3] ?? '').toLowerCase(), !!m[4]));
  }
  return best;
}

function combinedSvgDifficulty(s: components['schemas']['Svg']): number {
  const g = (s.problemGrade ?? '').trim();
  const n = (s.problemName ?? '').trim();
  const kg = g && g !== '.' ? gradeLabelSortKeyMaxInText(g) : -1;
  const kn = n ? gradeLabelSortKeyMaxInText(n) : -1;
  const key = Math.max(kg, kn);
  return key * 100 + (s.problemGradeGroup ?? -1);
}

function gradeTieBreakText(s: components['schemas']['Svg']): number {
  return gradeLabelSortKeyMaxInText([s.problemGrade, s.problemName].filter(Boolean).join(' '));
}

/** When the winning line has no API `problemGrade`, show text from the hardest sibling line that has one. */
function sidebarDisplayGrade(rep: components['schemas']['Svg'], group: components['schemas']['Svg'][]) {
  const r = rep.problemGrade?.trim();
  if (r && r !== '.') return r;
  const ordered = [...group].sort((a, b) => combinedSvgDifficulty(b) - combinedSvgDifficulty(a));
  for (const s of ordered) {
    const g = s.problemGrade?.trim();
    if (g && g !== '.') return g;
  }
  return rep.problemGrade;
}

/** One topo line per problem: max difficulty across all lines (any pitch); smarter tie-break than localeCompare. */
function pickRepresentativeSvgLine(group: components['schemas']['Svg'][]) {
  if (group.length === 0) throw new Error('pickRepresentativeSvgLine: empty group');
  let best = group[0];
  let bestScore = combinedSvgDifficulty(best);
  for (let i = 1; i < group.length; i++) {
    const s = group[i];
    const sc = combinedSvgDifficulty(s);
    if (sc > bestScore) {
      best = s;
      bestScore = sc;
    } else if (sc === bestScore) {
      const ra = (s.problemGrade ?? '').trim();
      const rb = (best.problemGrade ?? '').trim();
      const aOk = !!(ra && ra !== '.');
      const bOk = !!(rb && rb !== '.');
      if (aOk && !bOk) best = s;
      else if (!(!aOk && bOk) && gradeTieBreakText(s) > gradeTieBreakText(best)) best = s;
    }
  }
  return best;
}

/**
 * Multiple SVG polylines may reference the same problem — show one row with the hardest grade,
 * merged tick/todo/dangerous flags, sorted A–Z by name.
 */
function sidebarSvgsMerged(svgs: components['schemas']['Svg'][]) {
  const filtered = svgs.filter((svg) => typeof svg.problemId === 'number');
  const byProblem = new Map<number, components['schemas']['Svg'][]>();
  for (const s of filtered) {
    const id = s.problemId as number;
    const arr = byProblem.get(id);
    if (arr) arr.push(s);
    else byProblem.set(id, [s]);
  }

  const merged: components['schemas']['Svg'][] = [];
  for (const group of byProblem.values()) {
    const rep = pickRepresentativeSvgLine(group);
    const displayGrade = sidebarDisplayGrade(rep, group);
    const anyTicked = group.some((s) => s.ticked);
    const anyTodo = group.some((s) => s.todo);
    const anyDanger = group.some((s) => s.dangerous);
    merged.push({
      ...rep,
      problemGrade: displayGrade ?? rep.problemGrade,
      ticked: anyTicked,
      todo: !anyTicked && anyTodo,
      dangerous: !anyTicked && !anyTodo && anyDanger,
    });
  }

  merged.sort((a, b) => {
    const na = a.nr ?? Number.POSITIVE_INFINITY;
    const nb = b.nr ?? Number.POSITIVE_INFINITY;
    if (na !== nb) return na - nb;
    return (a.problemName ?? '').localeCompare(b.problemName ?? '', undefined, { sensitivity: 'base' });
  });
  return merged;
}

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
  const [visualViewportScale, setVisualViewportScale] = useState(() => window.visualViewport?.scale ?? 1);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const wasSwiping = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /** While pinch-zoomed, detach carousel swipe handlers so pan/zoom gestures stay native. */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setVisualViewportScale(vv.scale);
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
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
      if (carouselSize <= 1 || !isMobile || visualViewportScale > 1.05) return;
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

  const svgs = useMemo(() => (m.svgs ?? m.mediaSvgs ?? []) as components['schemas']['Svg'][], [m.svgs, m.mediaSvgs]);

  const canShowSidebar =
    svgs
      .filter((svg) => typeof svg.problemId === 'number')
      .map((v) => v.problemId)
      .filter((value, index, self) => self.indexOf(value) === index).length > 1;

  const sidebarSvgs = useMemo(() => sidebarSvgsMerged(svgs), [svgs]);

  const activeSidebarIndex = useMemo(() => {
    if (optProblemId == null) return -1;
    return sidebarSvgs.findIndex((s) => s.problemId === optProblemId);
  }, [sidebarSvgs, optProblemId]);

  const activeSidebarRowRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!canShowSidebar || !showSidebar || activeSidebarIndex < 0) return;
    const id = requestAnimationFrame(() => {
      activeSidebarRowRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    return () => cancelAnimationFrame(id);
  }, [canShowSidebar, showSidebar, activeSidebarIndex, m.id]);

  const isImage = m?.idType === 1;
  const isVideoFile = m?.idType === 2 && !m.embedUrl;

  /**
   * When "Problems in View" is open, backdrop / empty-SVG clicks should dismiss the sidebar first.
   * {@link SvgViewer} calls `close` on SVG background clicks — that path must use this too (not raw `onClose`).
   */
  const closeSidebarOrModal = useCallback(() => {
    if (canShowSidebar && showSidebar) {
      setShowSidebar(false);
      return;
    }
    onClose();
  }, [canShowSidebar, showSidebar, onClose, setShowSidebar]);

  const handleDimmerClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget || wasSwiping.current || offsetX !== 0) return;
    closeSidebarOrModal();
  };

  /** Letterboxed area around media: clicks hit this layer, not the full-screen root. */
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (wasSwiping.current || offsetX !== 0) return;
    closeSidebarOrModal();
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

  const attachCarouselSwipeHandlers = isMobile && carouselSize > 1 && visualViewportScale <= 1.05;

  return (
    <div
      className='fixed inset-0 z-150 flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-black select-none'
      onClick={handleDimmerClick}
    >
      {canShowSidebar && showSidebar && (
        <div className='bg-surface-dark border-surface-border animate-in slide-in-from-left z-160 flex h-full w-80 flex-col border-r shadow-2xl duration-300'>
          <div className='border-surface-border bg-surface-raised flex items-center justify-between border-b px-3 py-2 sm:px-3.5'>
            <h3 className='type-label'>Problems in View</h3>
            <button
              type='button'
              onClick={() => setShowSidebar(false)}
              className='opacity-70 transition-colors hover:opacity-100'
            >
              <X size={18} />
            </button>
          </div>
          <div className='custom-scrollbar divide-surface-border/30 flex-1 divide-y overflow-x-hidden overflow-y-auto text-left'>
            {sidebarSvgs.map((svg, rowIndex) => {
              const isRowActive = problemIdHovered === svg.problemId || optProblemId === svg.problemId;
              const nrDisplay = svg.nr != null ? svg.nr : '—';
              const statusHint = svg.ticked
                ? 'Ticked'
                : svg.todo
                  ? 'In todo list'
                  : svg.dangerous
                    ? 'Flagged as dangerous'
                    : undefined;
              const rawGrade = svg.problemGrade?.trim();
              const grade = rawGrade && rawGrade !== '.' ? rawGrade : null;
              return (
                <Link
                  key={svg.problemId}
                  ref={activeSidebarIndex === rowIndex ? activeSidebarRowRef : undefined}
                  to={`/problem/${svg.problemId}/${m.id}`}
                  onMouseEnter={() => setProblemIdHovered(svg.problemId ?? null)}
                  onMouseLeave={() => setProblemIdHovered(null)}
                  title={statusHint}
                  aria-label={[svg.problemName, grade ?? undefined, statusHint].filter(Boolean).join('. ') || undefined}
                  className={cn(
                    'group block scroll-mt-1 border-l-2 border-transparent px-2 py-1.5 transition-colors sm:px-2.5',
                    isRowActive ? 'bg-surface-raised-hover border-brand/50' : 'hover:bg-surface-raised-hover',
                  )}
                >
                  <div
                    className={cn(
                      designContract.typography.menuItem,
                      'flex min-w-0 items-baseline gap-x-2 leading-snug',
                    )}
                  >
                    <span className={cn('min-w-[1.25rem] shrink-0 tabular-nums', svgListNrColor(svg))}>
                      {nrDisplay}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate font-medium',
                        isRowActive ? 'text-slate-50' : 'text-slate-200 group-hover:text-slate-100',
                      )}
                    >
                      {svg.problemName}
                    </span>
                    {grade != null ? (
                      <span className={cn(designContract.typography.grade, 'shrink-0')}>{grade}</span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div
        className='relative flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden'
        {...(attachCarouselSwipeHandlers ? handlers : {})}
      >
        <div className='absolute top-3 right-3 z-170 flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-end gap-1.5 sm:top-4 sm:right-4 sm:gap-2'>
          {m.url && (
            <button
              type='button'
              onClick={() => window.open(m.url ?? '', '_blank')}
              title='Open original'
              className='ring-surface-border/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-slate-200 shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all hover:bg-slate-800 hover:text-slate-100 active:scale-95 sm:h-11 sm:w-11'
            >
              <ExternalLink size={17} strokeWidth={2} />
            </button>
          )}

          {canShowSidebar && (
            <button
              type='button'
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? 'Hide problem list' : 'Show problem list'}
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all active:scale-95 sm:h-11 sm:w-11',
                showSidebar
                  ? 'type-on-accent bg-brand ring-1 ring-black/20 hover:brightness-110'
                  : 'ring-surface-border/50 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-slate-100',
              )}
            >
              <ListIcon size={17} strokeWidth={2} />
            </button>
          )}

          <button
            type='button'
            onClick={() => setShowInfo(true)}
            title='Information'
            aria-label='Information'
            className='ring-surface-border/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-slate-200 shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all hover:bg-slate-800 hover:text-slate-100 active:scale-95 sm:h-11 sm:w-11'
          >
            <Info size={17} strokeWidth={2} />
          </button>

          {!isBouldering && svgs.length > 0 && (
            <button
              type='button'
              onClick={() => setShowHelp(true)}
              title='Topo legend'
              aria-label='Topo legend'
              className='ring-surface-border/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-slate-200 shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all hover:bg-slate-800 hover:text-slate-100 active:scale-95 sm:h-11 sm:w-11'
            >
              <HelpCircle size={17} strokeWidth={2} />
            </button>
          )}

          <div className='relative inline-flex shrink-0'>
            <button
              type='button'
              onClick={() => setShowMenu(!showMenu)}
              title='More actions'
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all active:scale-95 sm:h-11 sm:w-11',
                showMenu
                  ? 'bg-surface-hover ring-surface-border/50 text-slate-100'
                  : 'ring-surface-border/50 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-slate-100',
              )}
            >
              <MoreVertical size={17} strokeWidth={2} />
            </button>
            {showMenu && (
              <div className='bg-surface-card border-surface-border animate-in fade-in zoom-in-95 absolute top-full right-0 z-180 mt-2 w-64 rounded-2xl border py-2 shadow-2xl duration-200'>
                <div className='type-label border-surface-border/50 mb-1 border-b px-4 py-2'>Actions</div>
                {canDrawTopo && (
                  <button
                    type='button'
                    onClick={() => navigate(`/problem/svg-edit/${optProblemId}/${pitch || 0}/${m.id}`)}
                    className='type-small hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                  >
                    <Paintbrush size={14} className='text-brand' /> Draw topo line
                  </button>
                )}
                {canDrawMedia && (
                  <button
                    type='button'
                    onClick={() => navigate(`/media/svg-edit/${m.id}`)}
                    className='type-small hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                  >
                    <Paintbrush size={14} className='text-brand' /> Draw on image
                  </button>
                )}
                {canOrder && (
                  <button
                    type='button'
                    onClick={onMoveImageLeft}
                    className='type-small hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                  >
                    <ArrowLeft size={14} /> Move image left
                  </button>
                )}
                {canOrder && (
                  <button
                    type='button'
                    onClick={onMoveImageRight}
                    className='type-small hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 opacity-85 transition-colors hover:opacity-100'
                  >
                    <ArrowRight size={14} /> Move image right
                  </button>
                )}
                {canMove && (m.enableMoveToIdArea ?? 0) > 0 && (
                  <button
                    type='button'
                    onClick={onMoveImageToArea}
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                  >
                    <Move size={14} /> Move image to area
                  </button>
                )}
                {canMove && (m.enableMoveToIdSector ?? 0) > 0 && (
                  <button
                    type='button'
                    onClick={onMoveImageToSector}
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                  >
                    <Move size={14} /> Move image to sector
                  </button>
                )}
                {canMove && (m.enableMoveToIdProblem ?? 0) > 0 && (
                  <button
                    type='button'
                    onClick={onMoveImageToProblem}
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                  >
                    <Move size={14} /> Move image to {isBouldering ? 'problem' : 'route'}
                  </button>
                )}
                {canSetMediaAsAvatar && (
                  <button
                    type='button'
                    onClick={onSetMediaAsAvatar}
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
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
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                  >
                    <Download size={14} /> Download Original
                  </button>
                )}
                {canRotate && (
                  <>
                    <button
                      type='button'
                      onClick={() => onRotate(90)}
                      className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <RotateCw size={14} /> Rotate 90° CW
                    </button>
                    <button
                      type='button'
                      onClick={() => onRotate(270)}
                      className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <RotateCcw size={14} /> Rotate 90° CCW
                    </button>
                    <button
                      type='button'
                      onClick={() => onRotate(180)}
                      className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
                    >
                      <RefreshCw size={14} /> Rotate 180°
                    </button>
                  </>
                )}
                {canEdit && (
                  <button
                    type='button'
                    onClick={onEdit}
                    className='hover:bg-surface-raised-hover flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors'
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

          <button
            type='button'
            onClick={onClose}
            title='Close'
            aria-label='Close'
            className='ring-surface-border/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-slate-200 shadow-[0_4px_28px_rgba(0,0,0,0.55)] ring-1 transition-all hover:bg-red-700 hover:text-slate-100 active:scale-95 sm:h-11 sm:w-11'
          >
            <X size={19} strokeWidth={2} />
          </button>
        </div>

        <div
          className='flex h-full w-full items-center justify-center transition-transform duration-300 ease-out'
          style={{ transform: `translateX(${offsetX}px)` }}
          onClick={handleBackdropClick}
        >
          {isImage ? (
            svgs.length > 0 ? (
              <div className='touch-pan-pinch h-full w-full' onClick={(e) => e.stopPropagation()}>
                <SvgViewer
                  m={m}
                  pitch={pitch}
                  thumb={false}
                  close={closeSidebarOrModal}
                  optProblemId={optProblemId}
                  showText={canShowSidebar && !showSidebar}
                  problemIdHovered={problemIdHovered}
                  setProblemIdHovered={setProblemIdHovered}
                  className='h-full w-full object-contain'
                />
              </div>
            ) : (
              <img
                className='touch-pan-pinch max-h-screen max-w-full cursor-pointer object-contain select-none'
                src={getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, false, {
                  targetWidth: Math.min(1920, m.width ?? 1920),
                })}
                srcSet={getMediaFileUrlSrcSet(m.id ?? 0, m.versionStamp ?? 0, m.width ?? 0)}
                alt=''
                onClick={(e) => {
                  e.stopPropagation();
                  if (!wasSwiping.current && offsetX === 0) closeSidebarOrModal();
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
                src={getMediaFileUrl(m.id ?? 0, m.versionStamp ?? 0, isVideoFile, { targetWidth: 1080 })}
                alt=''
              />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='bg-surface-card border-surface-border relative flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_10px_28px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:scale-110'>
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

        <div className='pointer-events-none absolute right-4 bottom-4 left-4 z-170 flex items-end justify-between gap-3 sm:right-8 sm:bottom-8 sm:left-8'>
          <div className='max-w-xl shrink-0 space-y-2.5'>
            {showLocation && m.mediaMetadata?.location && (
              <div className='type-label ring-surface-border/40 pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.45)] ring-1'>
                <MapPin size={12} className='text-brand' /> {m.mediaMetadata.location}
              </div>
            )}
            {m.mediaMetadata?.description && (
              <div className='type-body ring-surface-border/35 pointer-events-auto max-w-xl rounded-2xl bg-slate-900 p-3.5 leading-relaxed font-medium text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 sm:p-4'>
                {m.mediaMetadata.description}
              </div>
            )}
          </div>
          <div className='pointer-events-auto ms-2 min-w-0 flex-1 self-end text-end sm:ms-4'>
            {(() => {
              const chunks: { key: string; node: ReactNode }[] = [];
              const desc = activePitch?.description?.trim();
              if (desc) chunks.push({ key: 'desc', node: <span className='text-slate-200'>{desc}</span> });
              if (activePitch?.grade)
                chunks.push({
                  key: 'grade',
                  node: <span className='text-brand normal-case'>{activePitch.grade}</span>,
                });
              if ((m.pitch ?? 0) > 0)
                chunks.push({ key: 'pitch', node: <span className='text-slate-200'>Pitch {m.pitch}</span> });
              if (carouselSize > 1)
                chunks.push({
                  key: 'idx',
                  node: (
                    <span className='text-slate-300 tabular-nums'>
                      {carouselIndex} / {carouselSize}
                    </span>
                  ),
                });
              if (chunks.length === 0) return null;
              return (
                <div className='ring-surface-border/40 ms-auto inline-block max-w-full rounded-2xl bg-slate-900 px-3 py-1.5 text-right text-[11px] leading-snug font-semibold tracking-normal text-pretty text-slate-100 normal-case shadow-[0_4px_24px_rgba(0,0,0,0.45)] ring-1 sm:text-[12px]'>
                  {chunks.map(({ key, node }, i) => (
                    <Fragment key={key}>
                      {i > 0 ? ' ' : null}
                      {node}
                    </Fragment>
                  ))}
                </div>
              );
            })()}
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
                <div className='border-surface-border bg-surface-raised ring-surface-border/40 rounded-2xl border p-3 text-slate-100 shadow-sm ring-1'>
                  <Info size={24} strokeWidth={2} />
                </div>
                <h3 className='type-h2'>Information</h3>
              </div>
              <button
                type='button'
                onClick={() => setShowInfo(false)}
                aria-label='Close'
                className='hover:bg-surface-raised-hover rounded-xl p-2 transition-colors'
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
            <div className='mb-6 flex justify-end'>
              <button
                type='button'
                onClick={() => setShowHelp(false)}
                aria-label='Close'
                className='hover:bg-surface-raised-hover -mr-1 rounded-xl p-2 transition-colors'
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
                      <div className='flex h-4 w-4 items-center justify-center rounded border border-slate-200/90 text-[8px] font-black text-slate-200'>
                        1
                      </div>
                      <span className='text-xs font-bold text-slate-300'>White: Default color</span>
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
                      <svg
                        width={40}
                        height={40}
                        viewBox='0 0 40 40'
                        className='bg-surface-nav shrink-0 overflow-visible rounded-md'
                        aria-hidden
                      >
                        <Rappel
                          x={20}
                          y={17}
                          bolted={true}
                          scale={0.72}
                          thumb={false}
                          backgroundColor='#334155'
                          color='#f8fafc'
                        />
                      </svg>
                      <span className='text-xs font-bold text-slate-300'>Bolted Anchor</span>
                    </li>
                    <li className='flex items-center gap-4'>
                      <svg
                        width={40}
                        height={40}
                        viewBox='0 0 40 40'
                        className='bg-surface-nav shrink-0 overflow-visible rounded-md'
                        aria-hidden
                      >
                        <Rappel
                          x={20}
                          y={17}
                          bolted={false}
                          scale={0.72}
                          thumb={false}
                          backgroundColor='#334155'
                          color='#f8fafc'
                        />
                      </svg>
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
