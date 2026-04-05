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
import { tickCrag, tickProblemLink } from '../Profile/profileRowTypography';
import { ActivityFeedMetaRow } from './ActivityFeedMetaRow';
import { LazyMedia } from './components/LazyMedia';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivitySchema = components['schemas']['Activity'];

/** `frontpage` — match home layout: phone-fluid below `md`; tablet+ uses `md:` density (no `sm` step). */
type ActivityLayoutDensity = 'default' | 'frontpage';

const ActivitySkeleton = ({ density = 'default' }: { density?: ActivityLayoutDensity }) => (
  <div
    className={cn(
      'border-surface-border/40 bg-surface-raised min-h-[3.25rem] animate-pulse border-b px-4 py-2.5 last:border-b-0 last:border-transparent',
      density === 'frontpage' ? 'md:min-h-[4rem] md:px-5 md:py-3' : 'sm:min-h-[3.25rem] sm:px-4 sm:py-2.5',
    )}
  >
    <div className={cn('flex items-start', density === 'frontpage' ? 'gap-2.5 md:gap-3' : 'gap-2.5 sm:gap-3')}>
      <div
        className={cn(
          'bg-surface-hover rounded-full',
          density === 'frontpage' ? 'h-10 w-10 md:h-10 md:w-10' : 'h-8 w-8',
        )}
      />
      <div className='min-w-0 flex-1 space-y-2 pt-0.5'>
        <div
          className={cn('bg-surface-hover rounded', density === 'frontpage' ? 'h-3.5 w-[85%] md:w-2/3' : 'h-3 w-2/3')}
        />
        <div className='bg-surface-hover h-2.5 w-1/3 rounded' />
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
              <span className={cn(designContract.typography.uiCompact, 'min-w-0 truncate text-slate-100')}>
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
                          ? cn(designContract.surfaces.controlActive, 'font-semibold')
                          : 'hover:bg-surface-raised text-slate-400 hover:text-slate-200',
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
        <div className='border-surface-border bg-surface-card divide-surface-border/45 divide-y overflow-hidden rounded-xl border'>
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
        <Card
          flush
          className={cn(
            'divide-surface-border/45 divide-y',
            layoutDensity === 'frontpage' && 'sm:divide-surface-border/55',
          )}
        >
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
const activityChipBase = cn(
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 leading-none transition-[background-color,color,transform,border-color] duration-200 active:scale-95 sm:h-8 sm:gap-2 sm:px-4',
  designContract.typography.uiCompact,
);
const activityChipIdle =
  'border-white/10 bg-surface-raised text-slate-400 hover:border-brand/45 hover:bg-surface-raised-hover hover:text-slate-200';
const activityChipActive = cn(
  designContract.surfaces.controlActive,
  'border-transparent shadow-sm transition-[background-color,border-color] hover:border-brand/50',
);

/** Slightly larger + relaxed than profile todo/ascent rows so the feed reads cleanly on phones. */
const activityRowRootClass =
  'm-0 text-[12px] font-normal leading-[1.45] tracking-normal sm:text-[13px] sm:leading-snug';

/** Home feed: one step up in size for scanning; still compact vs body text. */
const activityRowFrontpageClass =
  'm-0 text-[13px] font-normal leading-snug tracking-normal md:text-[14px] md:leading-snug';

/** Verbs, subtype, relative time — muted vs names/route, still readable on dark feed bg. */
const activityMetaClass = 'font-normal text-slate-300 antialiased';

/** Match `actionClass` (“commented on”, “in”, …); italic differentiates quote/caption from verbs. */
const activityCommentBlock = cn(
  'text-pretty break-words antialiased italic',
  'text-[11px] leading-snug text-slate-300 sm:text-[12px] sm:leading-snug',
);
/** Home: same mute as frontpage `actionClass` (slate-400). */
const activityCommentFrontpage = cn(
  'text-pretty break-words antialiased italic',
  'text-[12px] leading-snug text-slate-400 md:text-[13px]',
);

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

  const isFrontpage = layoutDensity === 'frontpage';
  const statusIconGlyph = 'shrink-0 text-white';
  const statusIconSize = isFrontpage ? 9 : 8;
  const statusIcon = (() => {
    if (a.users) return <Plus size={statusIconSize} className={statusIconGlyph} strokeWidth={2} />;
    if (a.message) return <MessageSquare size={statusIconSize} className={statusIconGlyph} strokeWidth={2} />;
    if (a.media && !a.name) return <Camera size={statusIconSize} className={statusIconGlyph} strokeWidth={2} />;
    return <Check size={statusIconSize} className={statusIconGlyph} strokeWidth={2} />;
  })();

  const pad = isFrontpage ? 'px-4 py-2.5 md:px-5 md:py-3' : 'px-3 py-2 sm:px-4 sm:py-2.5';
  const gap = isFrontpage ? 'gap-2.5 md:gap-3' : 'gap-2.5 sm:gap-3';

  const rowTypography = isFrontpage ? activityRowFrontpageClass : activityRowRootClass;
  const actionClass = cn(activityMetaClass, isFrontpage && 'text-slate-400');
  const commentClass = isFrontpage ? activityCommentFrontpage : activityCommentBlock;
  const cragLeadClass = cn(tickCrag, 'font-medium');
  const userLinkClass = cn(tickProblemLink, isFrontpage && 'font-semibold text-slate-50');
  const problemLinkTone = isFrontpage ? 'soft' : 'default';
  const faNameHoverClass = isFrontpage ? 'group-hover/user:text-slate-200' : 'group-hover/user:text-slate-100';

  const hasStars = a.stars !== undefined && a.stars !== -1;
  const hasComment = !!a.message;
  const hasDescription = !hasComment && !!a.description;
  const hasText = hasComment || hasDescription;
  const hasFaUsers = !!(a.users && a.users.length > 0);
  /** FA authors are inlined in `ActivityFeedMetaRow` for new route/boulder rows. */
  const faAuthorsInHeadline = !!(a.users && a.users.length > 0 && !a.repeat);
  /** Line 2: stars + comment. Optional line: FA authors (only when not already in headline). */
  const hasStarsCommentLine = hasStars || hasText;
  const hasSecondaryBlock = hasStarsCommentLine || (hasFaUsers && !faAuthorsInHeadline);
  const gapAfterHeadline = isFrontpage ? 'mt-1.5' : 'mt-1';
  const faLineGap = isFrontpage ? 'mt-1 md:mt-1.5' : 'mt-0.5 sm:mt-1';
  const gapAfterBlock = hasSecondaryBlock
    ? isFrontpage
      ? 'mt-2 md:mt-2.5'
      : 'mt-1.5 sm:mt-2'
    : isFrontpage
      ? 'mt-1.5'
      : 'mt-1 sm:mt-1.5';
  const commentCellClass = cn(commentClass, hasText && 'w-fit max-w-full min-w-0');

  return (
    <div
      className={cn(
        'group transition-[background-color] duration-150',
        'bg-surface-raised hover:bg-surface-raised-hover',
        pad,
      )}
    >
      <div className={cn('flex items-start', gap)}>
        <div className='shrink-0 pt-0.5'>
          <AvatarGroup items={avatarItems} size={isFrontpage ? 'small' : 'tiny'} statusIcon={statusIcon} max={2} />
        </div>

        <div className='min-w-0 flex-1'>
          <ActivityFeedMetaRow
            a={a}
            activityRowRootClass={rowTypography}
            actionClass={actionClass}
            cragLeadClass={cragLeadClass}
            isBouldering={isBouldering}
            problemLinkTone={problemLinkTone}
            userLinkClass={userLinkClass}
            layoutDensity={layoutDensity}
          />

          {hasStarsCommentLine ? (
            <div
              className={cn(
                'flex w-full min-w-0 flex-wrap items-baseline justify-start gap-x-2 gap-y-1',
                gapAfterHeadline,
              )}
            >
              {hasStars ? (
                <span className='inline-flex shrink-0 items-center leading-none'>
                  <Stars numStars={a.stars!} includeStarOutlines={true} size={isFrontpage ? 12 : 11} />
                </span>
              ) : null}
              {hasComment ? (
                <div className={commentCellClass}>
                  <Linkify>{a.message}</Linkify>
                </div>
              ) : hasDescription ? (
                <div className={commentCellClass}>{a.description}</div>
              ) : null}
            </div>
          ) : null}

          {hasFaUsers && !faAuthorsInHeadline ? (
            <div className={cn('w-full min-w-0', hasStarsCommentLine ? faLineGap : gapAfterHeadline)}>
              <span
                className={cn(
                  rowTypography,
                  'inline-flex max-w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2',
                )}
              >
                {a.users!.map((u) => (
                  <Link
                    key={u.id}
                    to={`/user/${u.id}`}
                    className={cn(
                      actionClass,
                      'group/user hover:text-brand inline-flex max-w-full min-w-0 items-center gap-1 leading-snug transition-colors',
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
              </span>
            </div>
          ) : null}

          {a.media && (
            <div className={gapAfterBlock}>
              <LazyMedia media={a.media} problemId={a.problemId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
