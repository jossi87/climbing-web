import { useState, useRef, useEffect, useCallback, useMemo, type ElementType } from 'react';
import { useTranslation } from 'react-i18next';
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
  RotateCcw,
} from 'lucide-react';
import { useGradeSystems, useGradeSystemsByIds, useMeta } from '../Meta/context';
import { useActivity } from '../../../api';
import { Avatar, AvatarGroup, Card, SectionHeader } from '../../ui';
import { Stars } from '../../ui/Indicators';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { twInk } from '../../../design/twInk';
import {
  activityFilterChipBase,
  activityFilterChipChanged,
  activityFilterChipChangedInk,
  activityFilterChipChangedText,
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
 * One entry of a per-system “Lowest grade” menu. The server-side filter compares the grade's real `weight` and only
 * applies it to problems of the same grade system, so one system's threshold never hides another system's problems.
 */
type GradeOption = { key: string; systemId: number; weight: number; grade: string };

/** Sentinel for “no grade filter”. */
const ALL_GRADE_OPTION: GradeOption = { key: 'all', systemId: 0, weight: 0, grade: '' };

/** Button/empty-state label: for combined grades like `8 (7b+)` the parenthesised part is the readable one. */
const shortGradeLabel = (grade: string) => (grade.includes('(') ? grade.split('(')[1].replace(')', '') : grade);

/**
 * Latest-activity list + toolbar. `embedded={true}` drops the outer `Card flush` wrapper entirely so the feed renders
 * **inline** inside a parent panel (e.g. Area / Sector tab card) — no nested cards, no margin/border between the tab
 * strip and the feed. Used by the Area / Sector "Activity" tabs to keep the tab content flush with the tab strip,
 * matching the other tabs (map / distribution / top / todo).
 *
 * Grade filtering works **per grade system**: pass the surrounding area's / sector's `gradeSystemId` to get a single
 * filter, or leave it out (region feed) to get one independent filter per grade system active in the region.
 */
const Activity = ({
  idArea,
  idSector,
  gradeSystemId,
  embedded = false,
}: {
  idArea: number;
  idSector: number;
  /** Grade system of the surrounding area / sector; scoped feeds only contain problems of that system. */
  gradeSystemId?: number;
  embedded?: boolean;
}) => {
  const { t } = useTranslation();
  const [openGradeSystemId, setOpenGradeSystemId] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const selectedGradeRef = useRef<HTMLButtonElement>(null);

  /**
   * Filters are persisted in the URL `?show=` param so they survive page refreshes.
   *
   * On mount the preset is read **once** via a lazy `useState` initializer so it lands before the first
   * `useActivity` request and there's no skeleton flash. After that, every filter toggle updates the URL
   * via `syncFilterUrl` so the current selection is always bookmarkable / refresh-safe.
   *
   * When all four filters are on (the default), the `?show=` param is removed from the URL to keep it clean.
   * When scoped to an Area / Sector tab (`isScoped`), the URL is never touched — the parent page owns the URL.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialPreset] = useState(() => parseActivityShowParam(searchParams.get(ACTIVITY_SHOW_PARAM)));

  /**
   * Selected minimum grade per grade system. Thresholds are independent: a Saxon threshold only hides low Saxon
   * grades and leaves Uiaa-graded problems alone (and vice versa), so a mixed feed keeps all systems readable.
   */
  const [lowerGrades, setLowerGrades] = useState<Record<number, GradeOption>>({});
  const [activityTypeFa, setActivityTypeFa] = useState(initialPreset?.fa ?? true);
  const [activityTypeTicks, setActivityTypeTicks] = useState(initialPreset?.ticks ?? true);
  const [activityTypeMedia, setActivityTypeMedia] = useState(initialPreset?.media ?? true);
  const [activityTypeComments, setActivityTypeComments] = useState(initialPreset?.comments ?? true);

  /**
   * **Page-level vs. embedded** — when the feed is rendered standalone at `/activity` (no scope), it gets a full
   * {@link SectionHeader} matching `/graph`, `/about`, `/webcams` (same `History` icon as the footer's `Activity`
   * `NavCard` — single design language across the app). When scoped to an Area / Sector tab
   * (`idArea > 0 || idSector > 0`), the parent page already owns the title chrome (breadcrumb + page header), so
   * the SectionHeader is suppressed and only the filter pills row renders.
   */
  const isScoped = idArea > 0 || idSector > 0;

  /**
   * Sync the current filter state to the URL `?show=` param so it survives page refreshes.
   * Only applies to the standalone `/activity` page (not scoped/embedded).
   */
  const syncFilterUrl = useCallback(() => {
    if (isScoped) return;

    const activeFilters: string[] = [];
    if (activityTypeFa) activeFilters.push('fa');
    if (activityTypeTicks) activeFilters.push('ticks');
    if (activityTypeMedia) activeFilters.push('media');
    if (activityTypeComments) activeFilters.push('comments');

    const next = new URLSearchParams(searchParams);

    if (activeFilters.length === 0 || activeFilters.length === 4) {
      // All on or all off — remove the param to keep the URL clean (all-on is the default)
      next.delete(ACTIVITY_SHOW_PARAM);
    } else {
      next.set(ACTIVITY_SHOW_PARAM, activeFilters.join(','));
    }

    setSearchParams(next, { replace: true });
  }, [
    isScoped,
    activityTypeFa,
    activityTypeTicks,
    activityTypeMedia,
    activityTypeComments,
    searchParams,
    setSearchParams,
  ]);

  /** Sync URL whenever filter state changes (skip the initial mount — the preset already handled it). */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    syncFilterUrl();
  }, [syncFilterUrl]);

  const meta = useMeta();
  const regionGradeSystems = useGradeSystems();

  /**
   * Scoped feed (Area / Sector tab): only the surrounding area's grade system is relevant. Region feed: every grade
   * system active in the region gets its own, independent filter.
   */
  const scopedGradeSystemIds = useMemo(
    () => (gradeSystemId && gradeSystemId > 0 ? [gradeSystemId] : undefined),
    [gradeSystemId],
  );
  const scopedGradeSystems = useGradeSystemsByIds(scopedGradeSystemIds);
  const gradeSystems = scopedGradeSystemIds ? scopedGradeSystems : regionGradeSystems;

  /** One menu per system: every grade of that system, hardest first, with “All” pinned on top. */
  const gradeMenus = useMemo(
    () =>
      gradeSystems.map((system) => {
        const seen = new Set<string>();
        const options: GradeOption[] = [];
        for (const grade of system.grades) {
          if (!grade.grade) continue;
          const key = `${system.id}:${grade.grade}`;
          if (seen.has(key)) continue;
          seen.add(key);
          options.push({ key, systemId: system.id, weight: grade.weight ?? 0, grade: grade.grade });
        }
        options.sort((a, b) => b.weight - a.weight || a.grade.localeCompare(b.grade));
        return { system, options: [ALL_GRADE_OPTION, ...options] };
      }),
    [gradeSystems],
  );

  /** Several filters in one toolbar need the system name on the chip so the thresholds stay unambiguous. */
  const multiSystem = gradeSystems.length > 1;

  /** Only systems with an active threshold are sent; "All grades" means the system is omitted entirely. */
  const gradeFilters = useMemo(
    () =>
      gradeSystems.flatMap((system) => {
        const selected = lowerGrades[system.id];
        return selected && selected.weight > 0 ? [{ gradeSystemId: system.id, minWeight: selected.weight }] : [];
      }),
    [gradeSystems, lowerGrades],
  );

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
    gradeFilters,
    fa: activityTypeFa,
    comments: activityTypeComments,
    ticks: activityTypeTicks,
    media: activityTypeMedia,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setOpenGradeSystemId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (openGradeSystemId === null || !selectedGradeRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      selectedGradeRef.current?.scrollIntoView({ block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openGradeSystemId, lowerGrades]);

  /** Select (or clear, for “All grades”) the threshold of one grade system, leaving the other systems untouched. */
  const handleGradeSelect = (systemId: number, option: GradeOption) => {
    setLowerGrades((prev) => {
      const next = { ...prev };
      if (option.weight > 0) {
        next[systemId] = option;
      } else {
        delete next[systemId];
      }
      return next;
    });
    setOpenGradeSystemId(null);
    setTimeout(refetch, 10);
  };

  const handleFilterToggle = (type: string) => {
    if (type === 'fa') setActivityTypeFa(!activityTypeFa);
    if (type === 'ticks') setActivityTypeTicks(!activityTypeTicks);
    if (type === 'media') setActivityTypeMedia(!activityTypeMedia);
    if (type === 'comments') setActivityTypeComments(!activityTypeComments);
    setTimeout(refetch, 10);
  };

  /**
   * Any filter that differs from the feed's default (all four activity types on, no grade thresholds). Drives the
   * brand-tinted **Reset** chip — the same “changed chips + one-click reset” language the ProblemList toolbar uses.
   */
  const hasGradeFilter = Object.keys(lowerGrades).length > 0;
  const allTypesEnabled = activityTypeFa && activityTypeTicks && activityTypeMedia && activityTypeComments;
  const hasFilterChanges = !allTypesEnabled || hasGradeFilter;

  /**
   * Back to the untouched feed: every activity type on, every grade system's threshold cleared. The `?show=` param is
   * rewritten by the `syncFilterUrl` effect (all four on ⇒ it is dropped completely), so a reset is reload-safe too.
   */
  const handleResetFilters = () => {
    setLowerGrades({});
    setActivityTypeFa(true);
    setActivityTypeTicks(true);
    setActivityTypeMedia(true);
    setActivityTypeComments(true);
    setOpenGradeSystemId(null);
    setTimeout(refetch, 10);
  };

  const activityList = activity ?? [];
  const showActivityEmpty = !isPending && !isError && activityList.length === 0;
  const showActivityError = isError && activityList.length === 0;

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
   *
   * Since every grade system gets its own chip, the row must **wrap** instead of squeezing: a region with two systems
   * plus the four type chips no longer fits on one phone line.
   */
  const chipsRowClassName = isScoped
    ? 'flex w-full flex-wrap items-center justify-center gap-x-0.5 gap-y-1.5 sm:gap-x-1.5 sm:gap-y-2'
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
            title={t('activity.title')}
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
          {gradeMenus.length > 0 ? (
            <div
              className='flex max-w-full min-w-0 flex-wrap items-center justify-center gap-x-0.5 gap-y-1.5 sm:gap-x-1.5 sm:gap-y-2'
              ref={filterRef}
            >
              {gradeMenus.map(({ system, options }) => {
                const selected = lowerGrades[system.id];
                const selectedKey = selected?.key ?? ALL_GRADE_OPTION.key;
                const isOpen = openGradeSystemId === system.id;
                const selectionLabel = selected ? shortGradeLabel(selected.grade) : t('activity.allGrades');
                /** A threshold on this system is a changed filter ⇒ brand tint, like ProblemList's changed chips. */
                const chipChanged = !!selected;
                /** With several systems on screen the chip must name its system, otherwise “8a” is ambiguous. */
                const chipLabel = multiSystem
                  ? `${system.name} ${selected ? selectionLabel : ''}`.trim()
                  : selectionLabel;
                return (
                  <div className='relative shrink-0' key={system.id}>
                    <button
                      onClick={() => setOpenGradeSystemId(isOpen ? null : system.id)}
                      className={cn(
                        activityFilterChipBase,
                        chipChanged ? activityFilterChipChanged : activityFilterChipOn,
                        'min-w-0 max-sm:max-w-[min(100%,8.5rem)]',
                      )}
                      aria-expanded={isOpen}
                      aria-haspopup='menu'
                      type='button'
                    >
                      <Filter
                        size={12}
                        className={cn('shrink-0', chipChanged ? activityFilterChipChangedInk : 'text-slate-300')}
                        strokeWidth={2}
                      />
                      <span
                        className={cn(
                          designContract.typography.uiCompact,
                          'min-w-0 truncate',
                          chipChanged ? activityFilterChipChangedText : 'text-slate-300',
                        )}
                      >
                        {chipLabel}
                      </span>
                      <ChevronDown
                        size={10}
                        className={cn('shrink-0 text-slate-300 transition-transform', isOpen && 'rotate-180')}
                        strokeWidth={2}
                      />
                    </button>

                    {isOpen && (
                      <div className='bg-surface-card border-surface-border absolute top-full left-0 z-[100] mt-1.5 max-h-[min(18rem,70vh)] w-[min(17.5rem,calc(100vw-1.25rem))] overflow-y-auto rounded-xl border py-1.5 shadow-2xl md:right-0 md:left-auto md:w-56'>
                        <div className='border-surface-border/40 px-3 py-2'>
                          <span className={cn(designContract.typography.label, 'text-slate-400')}>
                            {t('activity.lowestGrade')}
                            {multiSystem ? <span className='text-slate-500'> · {system.name}</span> : null}
                          </span>
                        </div>
                        <div className='border-surface-border/35 mb-1 border-t' />
                        {options.map((option) => (
                          <button
                            ref={option.key === selectedKey ? selectedGradeRef : null}
                            key={option.key}
                            type='button'
                            className={cn(
                              designContract.typography.menuItem,
                              'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors',
                              option.key === selectedKey
                                ? cn(designContract.surfaces.controlActive, 'font-semibold')
                                : 'hover:bg-surface-raised text-slate-400 hover:text-slate-300',
                            )}
                            onClick={() => handleGradeSelect(system.id, option)}
                          >
                            <span className='min-w-0 truncate'>
                              {option.systemId === 0 ? t('activity.allGrades') : option.grade}
                            </span>
                            {option.key === selectedKey && <Check size={14} className='shrink-0' />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          <FilterButton
            active={activityTypeFa}
            onClick={() => handleFilterToggle('fa')}
            icon={Plus}
            label={t('activity.chipFa')}
          />
          <FilterButton
            active={activityTypeTicks}
            onClick={() => handleFilterToggle('ticks')}
            icon={Check}
            label={t('activity.chipTicks')}
          />
          <FilterButton
            active={activityTypeMedia}
            onClick={() => handleFilterToggle('media')}
            icon={Camera}
            label={t('activity.chipMedia')}
          />
          <FilterButton
            active={activityTypeComments}
            onClick={() => handleFilterToggle('comments')}
            icon={MessageSquare}
            label={t('activity.chipComments')}
            labelNarrow={t('activity.chipCommentsShort')}
          />

          {/**
           * **Reset** — appears only once something deviates from the default feed, in the same brand tint that marks
           * the changed chips (ProblemList's toolbar behaves identically, so “tinted chip ⇒ there is a reset” holds
           * across both surfaces). Sits last so it never shifts the chips the user is aiming for mid-row.
           */}
          {hasFilterChanges && (
            <button
              type='button'
              aria-label={t('activity.resetFilters')}
              title={t('activity.resetFilters')}
              onClick={handleResetFilters}
              className={cn(
                activityFilterChipBase,
                activityFilterChipChanged,
                'justify-center transition-[background-color,border-color,color,box-shadow]',
              )}
            >
              <RotateCcw size={12} className={cn('shrink-0', activityFilterChipChangedInk)} strokeWidth={2} />
              <span
                className={cn(designContract.typography.uiCompact, 'whitespace-nowrap', activityFilterChipChangedText)}
              >
                {t('activity.reset')}
              </span>
            </button>
          )}
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
  const { t } = useTranslation();
  return (
    <div
      className={cn(designContract.typography.meta, 'px-4 py-10 text-center text-pretty md:px-5 md:py-12')}
      role='status'
    >
      {t('activity.empty')}
    </div>
  );
}

/** Initial load failed — avoid mislabeling as an empty feed. */
function ActivityErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(designContract.typography.meta, 'px-4 py-10 text-center text-pretty md:px-5 md:py-12')}
      role='alert'
    >
      <p className='light:text-slate-600 text-slate-400'>{t('activity.error')}</p>
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
        {t('common.tryAgain')}
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
  const { t } = useTranslation();
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
        {t('common.seeMore')}
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
