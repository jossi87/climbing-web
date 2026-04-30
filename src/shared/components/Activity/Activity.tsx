import { useState, useRef, useEffect, type ElementType } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Linkify from 'linkify-react';
import {
  History as ActivityIcon,
  Filter,
  ChevronDown,
  Plus,
  Check,
  MessageSquare,
  Camera,
  Loader2,
} from 'lucide-react';
import { useMeta } from '../Meta/context';
import { useActivity } from '../../../api';
import { Avatar, AvatarGroup, Card, SectionHeader } from '../../ui';
import { Stars } from '../../ui/Indicators';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { twInk } from '../../../design/twInk';
import {
  activityFilterChipBase,
  activityFilterChipOff,
  activityFilterChipOn,
} from '../../../design/activityFilterChips';
import { activityFrontpageToolbarClassName, activityToolbarDividerClassName } from './activityFrontpageToolbar';
import { ActivityFeedMetaRow } from './ActivityFeedMetaRow';
import { ActivitySkeleton } from './ActivitySkeleton';
import { LazyMedia } from './components/LazyMedia';
import { ACTIVITY_SHOW_PARAM, parseActivityShowParam } from './activityShowPreset';
import type { components } from '../../../@types/buldreinfo/swagger';

type ActivitySchema = components['schemas']['Activity'];

/**
 * Latest-activity list + toolbar. `embedded={true}` drops the outer `Card flush` wrapper entirely so the feed renders
 * **inline** inside a parent panel (e.g. Area / Sector tab card) — no nested cards, no margin/border between the tab
 * strip and the feed. Used by the Area / Sector "Activity" tabs to keep the tab content flush with the tab strip,
 * matching the other tabs (map / distribution / top / todo).
 */
const Activity = ({ idArea, idSector, embedded = false }: { idArea: number; idSector: number; embedded?: boolean }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const selectedGradeRef = useRef<HTMLButtonElement>(null);

  /**
   * Filters are **session-local** (no `localStorage`) — every fresh visit to `/activity` (or `/area`/`/sector`) starts
   * with all chips on and grade `n/a`, unless the URL carries a `?show=` preset (see {@link parseActivityShowParam}).
   *
   * The preset is read **once** via a lazy `useState` initializer so it lands before the first `useActivity` request
   * and there's no skeleton flash. The URL is cleaned up immediately afterwards by the effect below, so chip toggles
   * after arrival "win" without the param fighting back.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialPreset] = useState(() => parseActivityShowParam(searchParams.get(ACTIVITY_SHOW_PARAM)));

  const [lowerGradeId, setLowerGradeId] = useState(0);
  const [lowerGradeText, setLowerGradeText] = useState('n/a');
  const [activityTypeFa, setActivityTypeFa] = useState(initialPreset?.fa ?? true);
  const [activityTypeTicks, setActivityTypeTicks] = useState(initialPreset?.ticks ?? true);
  const [activityTypeMedia, setActivityTypeMedia] = useState(initialPreset?.media ?? true);
  const [activityTypeComments, setActivityTypeComments] = useState(initialPreset?.comments ?? true);
  const normalizedLowerGradeText = lowerGradeText === 'ALL' ? 'All' : lowerGradeText;

  /** Strip `?show=` from the URL once the preset has been read into state — keeps history clean and avoids re-applying on `searchParams` churn. */
  useEffect(() => {
    if (!searchParams.has(ACTIVITY_SHOW_PARAM)) return;
    const next = new URLSearchParams(searchParams);
    next.delete(ACTIVITY_SHOW_PARAM);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const meta = useMeta();
  const {
    data: activity,
    refetch,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

  const activityList = activity ?? [];
  const showActivityEmpty = !isPending && !isError && activityList.length === 0;
  const showActivityError = isError && activityList.length === 0;

  /**
   * **Page-level vs. embedded** — when the feed is rendered standalone at `/activity` (no scope), it gets a full
   * {@link SectionHeader} matching `/graph`, `/about`, `/webcams` (same `History` icon as the footer's `Activity`
   * `NavCard` — single design language across the app). When scoped to an Area / Sector tab
   * (`idArea > 0 || idSector > 0`), the parent page already owns the title chrome (breadcrumb + page header), so
   * the SectionHeader is suppressed and only the filter pills row renders.
   */
  const isScoped = idArea > 0 || idSector > 0;

  /**
   * **Chip row alignment** is conditional on whether the SectionHeader is present:
   *
   * - **Standalone `/activity`** (`!isScoped`) — the header sits on the left, chips on the right, anchored by the
   *   parent toolbar's `md:justify-between`. `md:ml-auto md:w-auto md:justify-end` keeps the chip cluster pinned
   *   right (the contract default).
   * - **Embedded** (`isScoped`, Area / Sector tab) — there's no SectionHeader to balance the left side, so right-
   *   aligning the chips left them stranded in the corner with empty space to their left (visible in the
   *   tab-card layout). Center the cluster across the full toolbar width instead so it reads as the deliberate
   *   focal point of the header band.
   *
   * Mobile (< md) keeps `w-full justify-center` either way — the toolbar is `flex-col` and the chips are the
   * only meaningful affordance once the SectionHeader (when present) stacks above them.
   */
  const chipsRowClassName = isScoped
    ? 'flex w-full flex-nowrap items-center justify-center gap-0.5 sm:gap-1.5'
    : designContract.layout.activityToolbarActionsFrontpage;

  /**
   * Body shared by both the standalone `Card flush` shell (page-level `/activity`) and the **inline** render path
   * used when `embedded=true` (Area / Sector tab cards, which already supply their own panel chrome). Same header
   * row + divider + feed list either way, so the visual rhythm is identical regardless of context.
   */
  const cardBody = (
    <>
      <div className={activityFrontpageToolbarClassName}>
        {!isScoped ? (
          <SectionHeader
            title='Activity'
            icon={ActivityIcon}
            /**
             * `mb-0` overrides `SectionHeader`'s default 24px bottom margin — the toolbar row supplies its own
             * `pb-3 sm:pb-4` and the divider below, so a stacked bottom margin would visibly push the chips down
             * on `md+` (where header + chips share a row, vertically centered).
             *
             * `w-full md:w-auto` lets the header span the full toolbar width on phones (where the toolbar is
             * `flex-col`, title above pills) and shrink to its content width on `md+` (where it sits on the left
             * with the pills pushed right by `md:ml-auto`).
             */
            className='mb-0 w-full md:w-auto'
          />
        ) : null}

        <div className={chipsRowClassName}>
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

      <div className={activityToolbarDividerClassName} />

      {isPending ? (
        [...Array(10)].map((_, i) => <ActivitySkeleton key={i} />)
      ) : showActivityError ? (
        <ActivityErrorState onRetry={() => void refetch()} />
      ) : showActivityEmpty ? (
        <ActivityEmptyState />
      ) : (
        activityList.map((a) => (
          <ActivityItem key={a.activityIds?.join('+') ?? `activity-${a.id}`} a={a} isBouldering={meta.isBouldering} />
        ))
      )}
      <ActivitySeeMore
        show={!isPending && !showActivityError && !!hasNextPage}
        loading={isFetchingNextPage}
        onFetchMore={() => void fetchNextPage()}
        embedded={embedded}
      />
    </>
  );

  /**
   * Inline render (no `Card flush`) when embedded — the parent (Area / Sector tab card) already supplies the panel
   * surface, so wrapping in another card produced the gap + nested-card seams the user flagged. `min-w-0` lets long
   * route names truncate inside narrow flex parents (e.g. mobile viewport).
   */
  if (embedded) {
    return <div className='min-w-0'>{cardBody}</div>;
  }
  return (
    <div className='w-full'>
      <Card flush>{cardBody}</Card>
    </div>
  );
};

/** Shown when the feed has loaded and the API returned no rows (e.g. quiet sector or tight filters). */
function ActivityEmptyState() {
  return (
    <div
      className={cn(designContract.typography.meta, 'px-4 py-10 text-center text-pretty md:px-5 md:py-12')}
      role='status'
    >
      No activity yet.
    </div>
  );
}

/** Initial load failed — avoid mislabeling as an empty feed. */
function ActivityErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className={cn(designContract.typography.meta, 'px-4 py-10 text-center text-pretty md:px-5 md:py-12')}
      role='alert'
    >
      <p className='light:text-slate-600 text-slate-400'>Couldn’t load activity.</p>
      <button
        type='button'
        onClick={onRetry}
        className={cn(
          designContract.typography.uiCompact,
          'border-surface-border/70 bg-surface-raised/55 hover:border-surface-border hover:bg-surface-raised mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border px-4 py-2 font-medium text-slate-400 transition-[background-color,border-color,color] hover:text-slate-200',
          'light:border-slate-300/90 light:bg-slate-100/75 light:text-slate-600 light:shadow-sm light:hover:border-slate-400 light:hover:bg-slate-200',
          twInk.lightHoverSlate800,
        )}
      >
        Retry
      </button>
    </div>
  );
}

type ActivitySeeMoreProps = {
  show: boolean;
  loading: boolean;
  onFetchMore: () => void;
  embedded: boolean;
};

function ActivitySeeMore({ show, loading, onFetchMore, embedded }: ActivitySeeMoreProps) {
  if (!show) return null;
  return (
    <div className={cn('flex justify-center px-4 pt-1 pb-3 md:px-5 md:pt-2 md:pb-4', embedded && 'rounded-b-xl')}>
      <button
        type='button'
        onClick={onFetchMore}
        disabled={loading}
        aria-busy={loading}
        className={cn(
          designContract.typography.uiCompact,
          'border-surface-border/70 bg-surface-raised/55 hover:border-surface-border hover:bg-surface-raised inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium text-slate-300 transition-[background-color,border-color,color] hover:text-slate-200',
          'light:border-slate-300/90 light:bg-slate-100/75 light:text-slate-600 light:shadow-sm light:hover:border-slate-400 light:hover:bg-slate-200',
          twInk.lightHoverSlate800,
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {loading ? <Loader2 size={14} className='animate-spin' strokeWidth={2.25} aria-hidden /> : null}
        See more
      </button>
    </div>
  );
}

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

const activityCommentClass = cn(
  designContract.typography.listBody,
  'break-words text-slate-300 antialiased light:text-slate-800',
);

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
      ? a.activityThumbnails!.map((t) => ({
          name: t.name,
          mediaIdentity: t.identity,
          userId: t.userId,
        }))
      : (a.users ?? []).length > 0
        ? a.users!.map((u) => ({
            name: u.name,
            mediaIdentity: u.mediaIdentity,
            userId: u.id,
          }))
        : [{ name: a.name, mediaIdentity: undefined, userId: a.id }];

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
  const hasStarsLine = hasStars;
  const hasTextLine = hasText;
  const hasSecondaryBlock = hasStarsLine || hasTextLine || (hasFaUsers && !faAuthorsInHeadline);
  const gapAfterHeadline = 'mt-1';
  const faLineGap = 'mt-1 md:mt-1';
  const gapAfterBlock = hasSecondaryBlock ? 'mt-2 md:mt-2' : 'mt-1.5';
  const commentCellClass = cn(activityCommentClass, hasText && 'w-full min-w-0');

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

          {hasStarsLine ? (
            <div className={cn('flex w-full min-w-0 items-baseline justify-start', gapAfterHeadline)}>
              <span className='inline-flex shrink-0 items-center leading-none'>
                <Stars numStars={a.stars!} size={12} />
              </span>
            </div>
          ) : null}

          {hasTextLine ? (
            <div className={cn('w-full min-w-0', hasStarsLine ? 'mt-1' : gapAfterHeadline)}>
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
            <div className={cn('w-full min-w-0', hasStarsLine || hasTextLine ? faLineGap : gapAfterHeadline)}>
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
                      mediaIdentity={u.mediaIdentity}
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
