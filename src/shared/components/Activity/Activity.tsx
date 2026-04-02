import { useState, useRef, useEffect, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import { Filter, ChevronDown, Plus, Check, MessageSquare, Camera } from 'lucide-react';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useMeta } from '../Meta/context';
import { useActivity } from '../../../api';
import { Avatar, AvatarGroup, Card, SectionLabel } from '../../ui';
import { Stars } from '../../ui/Indicators';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickCrag,
  tickFlags,
  tickProblemLink,
} from '../Profile/profileRowTypography';
import { ProblemLink } from './components/ProblemLink';
import { LazyMedia } from './components/LazyMedia';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivitySchema = components['schemas']['Activity'];

/** `frontpage` — match home layout: phone-fluid below `md`; tablet+ uses `md:` density (no `sm` step). */
type ActivityLayoutDensity = 'default' | 'frontpage';

const ActivitySkeleton = ({ density = 'default' }: { density?: ActivityLayoutDensity }) => (
  <div
    className={cn(
      'min-h-14 animate-pulse border-b border-slate-800/50 px-3 py-2.5 last:border-b-0 last:border-transparent',
      density === 'frontpage' ? 'md:min-h-[3.5rem] md:px-4 md:py-3' : 'sm:min-h-[3.25rem] sm:px-4 sm:py-2.5',
    )}
  >
    <div className={cn('flex items-start', density === 'frontpage' ? 'gap-2.5 md:gap-3' : 'gap-2.5 sm:gap-3')}>
      <div className='bg-surface-nav h-8 w-8 rounded-full' />
      <div className='flex-1 space-y-1.5'>
        <div className='bg-surface-nav h-3 w-2/3 rounded' />
        <div className='bg-surface-nav h-2 w-1/3 rounded' />
      </div>
    </div>
  </div>
);

const Activity = ({
  idArea,
  idSector,
  embedded = false,
  layoutDensity = 'default',
}: {
  idArea: number;
  idSector: number;
  embedded?: boolean;
  layoutDensity?: ActivityLayoutDensity;
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const selectedGradeRef = useRef<HTMLButtonElement>(null);

  const [lowerGradeId, setLowerGradeId] = useLocalStorage('lower_grade_id', 0);
  const [lowerGradeText, setLowerGradeText] = useLocalStorage('lower_grade_text', 'n/a');
  const [activityTypeTicks, setActivityTypeTicks] = useLocalStorage('activity_type_ticks', true);
  const [activityTypeFa, setActivityTypeFa] = useLocalStorage('activity_type_fa', true);
  const [activityTypeComments, setActivityTypeComments] = useLocalStorage('activity_type_comments', true);
  const [activityTypeMedia, setActivityTypeMedia] = useLocalStorage('activity_type_media', true);
  const normalizedLowerGradeText = lowerGradeText === 'ALL' ? 'All' : lowerGradeText;

  const meta = useMeta();
  const {
    data: activity,
    refetch,
    isPending,
  } = useActivity({
    idArea,
    idSector,
    lowerGrade: lowerGradeId,
    fa: activityTypeFa,
    comments: activityTypeComments,
    ticks: activityTypeTicks,
    media: activityTypeMedia,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isFilterOpen || !selectedGradeRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      selectedGradeRef.current?.scrollIntoView({ block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isFilterOpen, lowerGradeId]);

  const handleFilterToggle = (type: string) => {
    if (type === 'fa') setActivityTypeFa(!activityTypeFa);
    if (type === 'ticks') setActivityTypeTicks(!activityTypeTicks);
    if (type === 'media') setActivityTypeMedia(!activityTypeMedia);
    if (type === 'comments') setActivityTypeComments(!activityTypeComments);
    setTimeout(refetch, 10);
  };

  const toolbarClass =
    layoutDensity === 'frontpage'
      ? cn(designContract.layout.activityToolbarFrontpage, 'mb-3 md:mb-5')
      : cn(designContract.layout.toolbar, 'mb-3 sm:mb-5');

  return (
    <div className='w-full'>
      <div className={toolbarClass}>
        <SectionLabel className={cn('hidden text-slate-500', layoutDensity === 'frontpage' ? 'md:block' : 'sm:block')}>
          Latest activity
        </SectionLabel>

        <div
          className={
            layoutDensity === 'frontpage'
              ? designContract.layout.activityToolbarActionsFrontpage
              : designContract.layout.toolbarActions
          }
        >
          <div className='relative shrink-0' ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(activityChipBase, activityChipActive, 'min-w-0 max-sm:max-w-[min(100%,8.5rem)]')}
              aria-expanded={isFilterOpen}
              type='button'
            >
              <Filter size={12} className='shrink-0 text-slate-100' strokeWidth={2} />
              <span
                className={cn(
                  designContract.typography.uiCompact,
                  'min-w-0 truncate text-slate-100 max-sm:text-[10px]',
                )}
              >
                {normalizedLowerGradeText === 'n/a' ? 'All' : normalizedLowerGradeText}
              </span>
              <ChevronDown
                size={10}
                className={cn('shrink-0 text-slate-200 transition-transform', isFilterOpen && 'rotate-180')}
                strokeWidth={2}
              />
            </button>

            {isFilterOpen && (
              <div
                className={cn(
                  'bg-surface-card border-surface-border absolute top-full left-0 z-50 mt-1.5 max-h-[min(18rem,70vh)] w-[min(17.5rem,calc(100vw-1.25rem))] overflow-y-auto rounded-xl border py-1.5 shadow-2xl',
                  layoutDensity === 'frontpage' ? 'md:right-0 md:left-auto md:w-56' : 'sm:right-0 sm:left-auto sm:w-56',
                )}
              >
                <div className='border-surface-border/40 px-3 py-2'>
                  <span className={cn(designContract.typography.label, 'text-slate-500')}>Lowest grade</span>
                </div>
                <div className='border-surface-border/35 mb-1 border-t' />
                {meta.grades
                  .slice()
                  .sort((a, b) => {
                    if (a.id === 0) return -1;
                    if (b.id === 0) return 1;
                    return b.id - a.id;
                  })
                  .map((g) => (
                    <button
                      ref={g.id === lowerGradeId ? selectedGradeRef : null}
                      key={g.id}
                      type='button'
                      className={cn(
                        designContract.typography.menuItem,
                        'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors',
                        g.id === lowerGradeId
                          ? 'bg-white/[0.1] font-semibold text-slate-100'
                          : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
                      )}
                      onClick={() => {
                        setLowerGradeId(g.id);
                        setLowerGradeText(
                          g.id === 0
                            ? 'All'
                            : g.grade?.includes('(')
                              ? g.grade.split('(')[1].replace(')', '')
                              : (g.grade ?? ''),
                        );
                        setIsFilterOpen(false);
                        setTimeout(refetch, 10);
                      }}
                    >
                      {g.id === 0 ? 'All' : g.grade} {g.id === lowerGradeId && <Check size={14} />}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <FilterButton active={activityTypeFa} onClick={() => handleFilterToggle('fa')} icon={Plus} label='FA' />
          <FilterButton
            active={activityTypeTicks}
            onClick={() => handleFilterToggle('ticks')}
            icon={Check}
            label='Ticks'
          />
          <FilterButton
            active={activityTypeMedia}
            onClick={() => handleFilterToggle('media')}
            icon={Camera}
            label='Media'
          />
          <FilterButton
            active={activityTypeComments}
            onClick={() => handleFilterToggle('comments')}
            icon={MessageSquare}
            label='Com'
          />
        </div>
      </div>

      {embedded ? (
        <div className='border-surface-border/45 bg-surface-nav/20 divide-y divide-slate-800/50 overflow-hidden rounded-xl border'>
          {isPending
            ? [...Array(10)].map((_, i) => <ActivitySkeleton key={i} density={layoutDensity} />)
            : activity?.map((a) => (
                <ActivityItem
                  key={a.activityIds?.join('+') ?? `activity-${a.id}`}
                  a={a}
                  isBouldering={meta.isBouldering}
                  layoutDensity={layoutDensity}
                />
              ))}
        </div>
      ) : (
        <Card flush className='divide-y divide-slate-800/50'>
          {isPending
            ? [...Array(10)].map((_, i) => <ActivitySkeleton key={i} density={layoutDensity} />)
            : activity?.map((a) => (
                <ActivityItem
                  key={a.activityIds?.join('+') ?? `activity-${a.id}`}
                  a={a}
                  isBouldering={meta.isBouldering}
                  layoutDensity={layoutDensity}
                />
              ))}
        </Card>
      )}
    </div>
  );
};

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: ElementType;
  label: string;
};

/** Roomier pills on `sm+`; keep phones compact so one row still fits. */
const activityChipBase =
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-semibold leading-none transition-[color,transform,border-color] duration-200 active:scale-95 sm:h-8 sm:gap-2 sm:px-4 sm:text-[11px]';
const activityChipIdle =
  'border-white/10 bg-surface-nav/50 text-slate-400 hover:border-brand/45 hover:bg-surface-nav hover:text-slate-200';
const activityChipActive = 'border-transparent bg-white/[0.12] text-slate-100 shadow-sm hover:border-brand/50';

/** Brighter than {@link tickFlags} for verbs (ticked, on, in, …) so they read with primary copy. */
const activityActionClass = 'font-normal text-slate-200 antialiased';

const activityCommentBlock = cn(
  tickCommentSmall,
  'mt-1 leading-relaxed text-pretty break-words text-slate-50 not-italic',
);
/** Home: story line distinct from who/what/where. */
const activityCommentFrontpage =
  'mt-1.5 text-pretty break-words text-[10px] leading-relaxed italic text-slate-400 antialiased sm:text-[11px]';

const FilterButton = ({ active, onClick, icon: Icon, label }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(activityChipBase, active ? activityChipActive : activityChipIdle)}
    aria-pressed={active}
    type='button'
  >
    <Icon size={12} strokeWidth={2} className={cn('shrink-0', active ? 'text-slate-100' : 'text-slate-500')} />
    <span className={cn(designContract.typography.uiCompact, active ? 'text-slate-100' : 'text-slate-400')}>
      {label}
    </span>
  </button>
);

type ActivityItemProps = {
  a: ActivitySchema;
  isBouldering: boolean;
  layoutDensity?: ActivityLayoutDensity;
};

const ActivityItem = ({ a, isBouldering, layoutDensity = 'default' }: ActivityItemProps) => {
  const avatarItems =
    (a.activityThumbnails ?? []).length > 0
      ? a.activityThumbnails!.map((m) => ({ mediaId: m.id, mediaVersionStamp: m.versionStamp }))
      : (a.users ?? []).length > 0
        ? a.users!.map((u) => ({
            name: u.name,
            mediaId: u.mediaId,
            mediaVersionStamp: u.mediaVersionStamp,
          }))
        : [{ name: a.name, mediaId: undefined, mediaVersionStamp: undefined }];

  const statusIconGlyph = 'shrink-0 text-white';
  const statusIcon = (() => {
    if (a.users) return <Plus size={8} className={statusIconGlyph} strokeWidth={2} />;
    if (a.message) return <MessageSquare size={8} className={statusIconGlyph} strokeWidth={2} />;
    if (a.media && !a.name) return <Camera size={8} className={statusIconGlyph} strokeWidth={2} />;
    return <Check size={8} className={statusIconGlyph} strokeWidth={2} />;
  })();

  const [numImg, numMov] = (a.media ?? []).reduce(
    (acc: number[], item) => (item.movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]]),
    [0, 0],
  );

  const pad = layoutDensity === 'frontpage' ? 'px-3 py-2.5 md:px-4 md:py-3' : 'px-3 py-2 sm:px-4 sm:py-2.5';
  const gap = layoutDensity === 'frontpage' ? 'gap-2.5 md:gap-3' : 'gap-2.5 sm:gap-3';
  const mediaMt = layoutDensity === 'frontpage' ? 'mt-1.5 md:mt-2' : 'mt-1.5 sm:mt-2';
  const faRowMt = layoutDensity === 'frontpage' ? 'mt-1.5 md:mt-2' : 'mt-1.5 sm:mt-2';

  const isFrontpage = layoutDensity === 'frontpage';
  /** Slightly duller than the default feed so the home hero feels less stark white-on-dark. */
  const actionClass = cn(activityActionClass, isFrontpage && 'text-slate-300');
  const commentClass = isFrontpage ? activityCommentFrontpage : activityCommentBlock;
  const cragLeadClass = cn(tickCrag, 'font-medium', isFrontpage && 'text-slate-300');
  const userLinkClass = cn(tickProblemLink, isFrontpage && 'font-semibold text-slate-100');
  const problemLinkTone = isFrontpage ? 'soft' : 'default';
  const timeHoverClass = isFrontpage ? 'group-hover:text-slate-400' : 'group-hover:text-slate-300';
  /** Secondary to area/route line; home feed uses softer crags so time must step down again. */
  const timeClass = cn(
    tickFlags,
    'ml-1.5 inline-block tabular-nums transition-colors select-none',
    isFrontpage ? 'text-slate-500' : 'text-slate-400',
    timeHoverClass,
  );
  const faNameHoverClass = isFrontpage ? 'group-hover/user:text-slate-200' : 'group-hover/user:text-slate-100';

  return (
    <div className={cn('group transition-colors hover:bg-white/1.5', pad)}>
      <div className={cn('flex items-start', gap)}>
        <div className='shrink-0 pt-0.5'>
          <AvatarGroup items={avatarItems} size='tiny' statusIcon={statusIcon} max={2} />
        </div>

        <div className='min-w-0 flex-1'>
          <div className={cn(profileRowRootClass, 'min-w-0 text-pretty [overflow-wrap:anywhere]')}>
            {a.users && a.users.length > 0 && !a.repeat ? (
              <>
                <span className={cragLeadClass}>New {isBouldering ? 'boulder' : 'route'}</span>{' '}
                <span className={actionClass}>in</span>{' '}
                <ProblemLink a={a} flagsClassName={actionClass} tone={problemLinkTone} />
              </>
            ) : a.message ? (
              <>
                <Link to={`/user/${a.id}`} className={userLinkClass}>
                  {a.name}
                </Link>{' '}
                <span className={actionClass}>commented on</span>{' '}
                <ProblemLink a={a} flagsClassName={actionClass} tone={problemLinkTone} />
              </>
            ) : (
              <>
                {a.name ? (
                  <>
                    <Link to={`/user/${a.id}`} className={userLinkClass}>
                      {a.name}
                    </Link>{' '}
                    <span className={actionClass}>{a.repeat ? 'repeated' : 'ticked'}</span>{' '}
                  </>
                ) : numImg > 0 || numMov > 0 ? (
                  <>
                    <span className={cragLeadClass}>
                      {numImg > 0 && `${numImg} ${numImg === 1 ? 'image' : 'images'}`}
                      {numImg > 0 && numMov > 0 && ' & '}
                      {numMov > 0 && `${numMov} ${numMov === 1 ? 'video' : 'videos'}`}
                    </span>{' '}
                    <span className={actionClass}>on</span>{' '}
                  </>
                ) : null}
                <ProblemLink a={a} flagsClassName={actionClass} tone={problemLinkTone} />
              </>
            )}
            <span className={timeClass}>{a.timeAgo}</span>
          </div>

          {a.message ? (
            <div className={commentClass}>
              <Linkify>{a.message}</Linkify>
            </div>
          ) : a.description ? (
            <div className={cn(commentClass, 'mt-1.5')}>{a.description}</div>
          ) : null}

          {a.stars !== undefined && a.stars !== -1 && (
            <div className='mt-1.5 self-start'>
              <Stars numStars={a.stars} includeStarOutlines={true} size={12} />
            </div>
          )}

          {a.media && (
            <div className={mediaMt}>
              <LazyMedia media={a.media} problemId={a.problemId} />
            </div>
          )}

          {a.users && a.users.length > 0 && (
            <div className={cn(profileRowRootClass, 'flex flex-wrap gap-x-2 gap-y-1', faRowMt)}>
              {a.users.map((u) => (
                <Link
                  key={u.id}
                  to={`/user/${u.id}`}
                  className={cn(
                    actionClass,
                    'group/user hover:text-brand inline-flex max-w-full min-w-0 items-center gap-1.5 leading-snug transition-colors',
                  )}
                >
                  <Avatar
                    name={u.name}
                    mediaId={u.mediaId}
                    mediaVersionStamp={u.mediaVersionStamp}
                    size='micro'
                    className='group-hover/user:ring-brand/55 ring-surface-dark shrink-0 ring-2 transition-all'
                  />
                  <span className={cn('min-w-0', faNameHoverClass)}>{u.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
