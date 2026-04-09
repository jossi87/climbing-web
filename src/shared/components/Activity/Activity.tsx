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
  activityFilterChipBase,
  activityFilterChipOff,
  activityFilterChipOn,
} from '../../../design/activityFilterChips';
import { ActivityFeedMetaRow } from './ActivityFeedMetaRow';
import { LazyMedia } from './components/LazyMedia';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivitySchema = components['schemas']['Activity'];

/** Mirrors {@link ActivityFeedMetaRow}: story flex-1 + time on the far right; optional second row like stars/comment. */
const ActivitySkeleton = () => (
  <div className='min-h-[3.5rem] animate-pulse bg-transparent px-4 py-3 md:min-h-[4rem] md:px-5 md:py-2.5'>
    <div className='flex items-start gap-3 md:gap-3'>
      {/* Match {@link Avatar} size `small` (40px) at all breakpoints */}
      <div className='skeleton-bar h-10 w-10 shrink-0 rounded-full pt-0.5' />
      <div className='min-w-0 flex-1 space-y-1.5 pt-0.5'>
        <div className='flex w-full min-w-0 flex-row items-start justify-between gap-3 sm:gap-4 md:gap-6'>
          <div className='min-w-0 flex-1 space-y-1.5'>
            <div className='skeleton-bar h-3 max-w-[min(100%,22rem)] rounded md:h-3.5' />
            <div className='skeleton-bar-muted h-3 w-[58%] rounded md:h-3.5' />
          </div>
          <div
            className='skeleton-bar-muted h-2.5 w-[2.75rem] shrink-0 self-start rounded pt-0.5 md:h-3 md:w-[3.25rem]'
            aria-hidden
          />
        </div>
        <div className='skeleton-bar-muted h-2.5 max-w-[12rem] rounded' aria-hidden />
      </div>
    </div>
  </div>
);

/**
 * Latest-activity list + toolbar. `embedded` swaps {@link Card} for `.app-card-surface` (borderless shell); no caller
 * uses it yet — kept for frontpage / inset layouts.
 */
const Activity = ({ idArea, idSector, embedded = false }: { idArea: number; idSector: number; embedded?: boolean }) => {
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

  /** Extra space before the card on phones so filters and first row don’t feel glued together. */
  const toolbarClass = cn(designContract.layout.activityToolbarFrontpage, 'mb-6 max-md:mb-7 md:mb-6');

  return (
    <div className='w-full'>
      <div className={toolbarClass}>
        <SectionLabel className='hidden text-slate-400 md:block'>Latest activity</SectionLabel>

        <div className={designContract.layout.activityToolbarActionsFrontpage}>
          <div className='relative shrink-0' ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(activityFilterChipBase, activityFilterChipOn, 'min-w-0 max-sm:max-w-[min(100%,8.5rem)]')}
              aria-expanded={isFilterOpen}
              type='button'
            >
              <Filter size={12} className='shrink-0 text-slate-300' strokeWidth={2} />
              <span className={cn(designContract.typography.uiCompact, 'min-w-0 truncate text-slate-300')}>
                {normalizedLowerGradeText === 'n/a' ? 'All' : normalizedLowerGradeText}
              </span>
              <ChevronDown
                size={10}
                className={cn('shrink-0 text-slate-300 transition-transform', isFilterOpen && 'rotate-180')}
                strokeWidth={2}
              />
            </button>

            {isFilterOpen && (
              <div className='bg-surface-card border-surface-border absolute top-full left-0 z-[100] mt-1.5 max-h-[min(18rem,70vh)] w-[min(17.5rem,calc(100vw-1.25rem))] overflow-y-auto rounded-xl border py-1.5 shadow-2xl md:right-0 md:left-auto md:w-56'>
                <div className='border-surface-border/40 px-3 py-2'>
                  <span className={cn(designContract.typography.label, 'text-slate-400')}>Lowest grade</span>
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
                          : 'hover:bg-surface-raised text-slate-400 hover:text-slate-300',
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
            label='Comments'
            labelNarrow='Com'
          />
        </div>
      </div>

      {embedded ? (
        <div className='app-card-surface'>
          {isPending
            ? [...Array(10)].map((_, i) => <ActivitySkeleton key={i} />)
            : activity?.map((a) => (
                <ActivityItem
                  key={a.activityIds?.join('+') ?? `activity-${a.id}`}
                  a={a}
                  isBouldering={meta.isBouldering}
                />
              ))}
        </div>
      ) : (
        <Card flush>
          {isPending
            ? [...Array(10)].map((_, i) => <ActivitySkeleton key={i} />)
            : activity?.map((a) => (
                <ActivityItem
                  key={a.activityIds?.join('+') ?? `activity-${a.id}`}
                  a={a}
                  isBouldering={meta.isBouldering}
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
  /** Visible label on `sm+`; use with {@link labelNarrow} when the chip row is tight on phones. */
  label: string;
  labelNarrow?: string;
};

/** Single rhythm + {@link designContract.typography.feed} body tone (calm on dark `surface-card`). */
const activityRowClass = cn(designContract.typography.listBody, designContract.typography.feed.sentence);

const activityCommentClass = cn(designContract.typography.listBody, 'break-words italic text-slate-400 antialiased');

const FilterButton = ({ active, onClick, icon: Icon, label, labelNarrow }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(activityFilterChipBase, active ? activityFilterChipOn : activityFilterChipOff)}
    aria-pressed={active}
    {...(labelNarrow ? { 'aria-label': label } : {})}
    type='button'
  >
    <Icon
      size={12}
      strokeWidth={2}
      className={cn('shrink-0', active ? 'light:text-slate-950 text-slate-100' : 'light:text-slate-600 text-slate-500')}
      aria-hidden
    />
    <span
      aria-hidden={!!labelNarrow}
      className={cn(
        designContract.typography.uiCompact,
        active ? 'light:text-slate-950 text-slate-100' : 'light:text-slate-600 text-slate-500',
      )}
    >
      {labelNarrow ? (
        <>
          <span className='sm:hidden'>{labelNarrow}</span>
          <span className='hidden sm:inline'>{label}</span>
        </>
      ) : (
        label
      )}
    </span>
  </button>
);

type ActivityItemProps = {
  a: ActivitySchema;
  isBouldering: boolean;
};

const ActivityItem = ({ a, isBouldering }: ActivityItemProps) => {
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

  const statusIconGlyph = 'shrink-0 text-slate-300';
  const statusIconSize = 10;
  const statusIcon = (() => {
    if (a.users) return <Plus size={statusIconSize} className={statusIconGlyph} strokeWidth={2.25} />;
    if (a.message) return <MessageSquare size={statusIconSize} className={statusIconGlyph} strokeWidth={2.25} />;
    if (a.media && !a.name) return <Camera size={statusIconSize} className={statusIconGlyph} strokeWidth={2.25} />;
    return <Check size={statusIconSize} className={statusIconGlyph} strokeWidth={2.25} />;
  })();

  /** Tight vertical rhythm so headline, stars/comment, and media read as one story; still clear between rows. */
  const pad = 'px-4 py-3 md:px-5 md:py-2.5';
  const gap = 'gap-3 md:gap-3';

  const actionClass = designContract.typography.feed.action;
  const cragLeadClass = designContract.typography.feed.lead;
  const userLinkClass = designContract.typography.feed.emphasis;
  const problemLinkTone = 'soft' as const;

  const hasStars = a.stars !== undefined && a.stars !== -1;
  const hasComment = !!a.message;
  const hasDescription = !hasComment && !!a.description;
  const hasText = hasComment || hasDescription;
  const hasFaUsers = !!(a.users && a.users.length > 0);
  const faAuthorsInHeadline = !!(a.users && a.users.length > 0 && !a.repeat);
  const hasStarsCommentLine = hasStars || hasText;
  const hasSecondaryBlock = hasStarsCommentLine || (hasFaUsers && !faAuthorsInHeadline);
  const gapAfterHeadline = 'mt-1';
  const faLineGap = 'mt-1 md:mt-1';
  const gapAfterBlock = hasSecondaryBlock ? 'mt-2 md:mt-2' : 'mt-1.5';
  const commentCellClass = cn(activityCommentClass, hasText && 'w-fit max-w-full min-w-0');

  return (
    <div className={cn('group', designContract.surfaces.panelRow, pad)}>
      <div className={cn('flex items-start', gap)}>
        <div className='shrink-0 pt-0.5'>
          <AvatarGroup items={avatarItems} size='small' statusIcon={statusIcon} max={2} />
        </div>

        <div className='min-w-0 flex-1'>
          <ActivityFeedMetaRow
            a={a}
            activityRowRootClass={activityRowClass}
            actionClass={actionClass}
            cragLeadClass={cragLeadClass}
            isBouldering={isBouldering}
            problemLinkTone={problemLinkTone}
            userLinkClass={userLinkClass}
          />

          {hasStarsCommentLine ? (
            <div
              className={cn(
                'flex w-full min-w-0 flex-wrap items-baseline justify-start gap-x-2 gap-y-0.5',
                gapAfterHeadline,
              )}
            >
              {hasStars ? (
                <span className='inline-flex shrink-0 items-center leading-none'>
                  <Stars numStars={a.stars!} size={12} />
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
                  activityRowClass,
                  'inline-flex max-w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2',
                )}
              >
                {a.users!.map((u) => (
                  <Link
                    key={u.id}
                    to={`/user/${u.id}`}
                    className={cn(
                      userLinkClass,
                      'group/user inline-flex max-w-full min-w-0 items-center gap-1 leading-snug',
                    )}
                  >
                    <Avatar
                      name={u.name}
                      mediaId={u.mediaId}
                      mediaVersionStamp={u.mediaVersionStamp}
                      size='micro'
                      className='ring-surface-card group-hover/user:ring-brand-border shrink-0 ring-2 transition-all'
                    />
                    <span className='min-w-0'>{u.name}</span>
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
