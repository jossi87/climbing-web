import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import Top from '../../shared/components/Top/Top';
import Activity from '../../shared/components/Activity/Activity';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import { SLOPE_APPROACH_COLOR, SLOPE_DESCENT_COLOR } from '../../shared/slopePolylineColors';
import Media from '../../shared/components/Media/Media';
import Todo from '../../shared/components/Todo/Todo';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Stars, LockSymbol } from '../../shared/ui/Indicators';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { getMediaFileUrl, useArea } from '../../api';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import ProblemList, { useProblemListCompact } from '../../shared/components/ProblemList';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, NotFoundCard, PageCardBreadcrumbRow } from '../../shared/ui';
import { TradGearMarker } from '../../shared/ui/TradGearMarker';
import { climbingRouteUsesPassiveGear, formatRouteTypeLabel } from '../../utils/routeTradGear';
import { compactFaDisplayLine, normalizeFaPeopleSeparators } from '../../utils/firstAscentDisplay';
import {
  Check,
  ChevronRight,
  Plus,
  Edit,
  AlertTriangle,
  Image as ImageIcon,
  MapPin,
  Map as MapIcon,
  MapPinned,
  Spline,
  BarChart2,
  Trophy,
  Bookmark,
  Film,
  LayoutGrid,
  LayoutDashboard,
  List,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import {
  tabBarButtonClassName,
  tabBarButtonClassNameInline,
  tabBarIconClassName,
  tabBarStripContainerClassName,
  TAB_BAR_ICON_SIZE,
} from '../../design/tabBar';
import {
  problemListRowFaPlainClass,
  problemListRowMediaClusterClass,
  problemListRowMediaGlyphClass,
  problemListRowMetaTailClass,
  problemListRowPipeSepClass,
  problemListRowRatingIconsClass,
  problemListRowStarsWrapClass,
  problemListRowTicksMetaClass,
  problemListTradGearIconClass,
  problemListTradGearWrapClass,
} from '../../shared/components/Profile/problemListRowChrome';
import {
  problemListRowRootClass,
  tickCommentSmall,
  tickListRowQuietMeta,
  tickProblemLinkWithStatus,
  tickWhenGrade,
} from '../../shared/components/Profile/profileRowTypography';
import { getUserFriendlyHttpErrorMessage, isHttpError } from '../../api/httpError';

type Props = {
  sectorId: number;
  sectorName: string;
  problem: NonNullable<NonNullable<components['schemas']['Area']['sectors']>[number]['problems']>[number];
};

const areaListLockInlineClass = 'ml-0.5 inline-block align-middle';

/** Area Routes tab row — same typography/layout as the sector problem list; includes sector name for context. */
const SectorListItem = ({ sectorId, sectorName, problem }: Props) => {
  const { isClimbing, isBouldering } = useMeta();
  const compact = useProblemListCompact();

  const passiveGearAfterGrade =
    isClimbing && problem.t
      ? (() => {
          const typeLabel = formatRouteTypeLabel(problem.t.type, problem.t.subType);
          if (!typeLabel || !climbingRouteUsesPassiveGear(typeLabel)) return null;
          return (
            <TradGearMarker
              line={typeLabel}
              className={problemListTradGearWrapClass}
              iconClassName={problemListTradGearIconClass}
            />
          );
        })()
      : null;

  const faNames = normalizeFaPeopleSeparators((problem.fa ?? '').trim());
  const faYear = problem.faDate && problem.faDate.length >= 4 ? problem.faDate.slice(0, 4) : '';
  const faLine = compact
    ? compactFaDisplayLine((problem.fa ?? '').trim(), problem.faDate)
    : [faNames, faYear].filter(Boolean).join(' ');

  const tickCount = problem.numTicks ?? 0;
  const commentTrimmed = (problem.comment ?? '').trim();

  const pitchLine =
    isClimbing && (problem.numPitches ?? 1) > 1 ? (
      <span className={cn(tickListRowQuietMeta, 'align-baseline whitespace-nowrap')}>{problem.numPitches} pitches</span>
    ) : null;
  const rockLine = problem.rock ? <span className='not-italic'>Rock: {problem.rock}</span> : null;
  const faEl = faLine ? <span>{faLine}</span> : null;
  const commentEl = commentTrimmed ? <span className={tickCommentSmall}>{commentTrimmed}</span> : null;

  const hasLock = !!(problem.lockedAdmin || problem.lockedSuperadmin);
  const hasBroken = !!problem.broken;
  const lockBrokenBlock =
    hasLock || hasBroken ? (
      <>
        {hasLock ? (
          <span className={cn(areaListLockInlineClass, 'opacity-[0.68]')}>
            <LockSymbol lockedAdmin={!!problem.lockedAdmin} lockedSuperadmin={!!problem.lockedSuperadmin} />
          </span>
        ) : null}
        {hasBroken ? (
          <>
            {hasLock ? ' ' : null}
            <span className='rounded border border-red-500/25 bg-red-500/12 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-red-300 uppercase'>
              {problem.broken}
            </span>
          </>
        ) : null}
      </>
    ) : null;

  const showImages = !!problem.hasImages;
  const showMovies = !!problem.hasMovies;
  const hasTopo = !compact && !!problem.hasTopo;
  const hasCoordinates =
    !compact &&
    !!(problem.coordinates && problem.coordinates.latitude != null && problem.coordinates.longitude != null);
  const hasRouteMetaIcons = hasTopo || hasCoordinates || showImages || showMovies;
  /** Stars (incl. 0★ outline) only once the route has community ticks — avoids noise on unclimbed lines. */
  const showStarsWidget = tickCount > 0;
  const hasRatingVisuals = !!(showStarsWidget || hasRouteMetaIcons);
  const ratingIconsBlock = hasRatingVisuals ? (
    <span className={problemListRowRatingIconsClass}>
      <span className={problemListRowMediaClusterClass}>
        {showStarsWidget ? (
          <span className={problemListRowStarsWrapClass}>
            <Stars muted numStars={problem.stars ?? 0} size={12} />
          </span>
        ) : null}
        {hasTopo ? (
          <span className='inline-flex items-end' title='Topo line'>
            <Spline size={12} strokeWidth={2.5} className={problemListRowMediaGlyphClass} aria-hidden />
          </span>
        ) : null}
        {hasCoordinates ? (
          <span className='inline-flex items-end' title='Coordinates'>
            <MapPin size={12} strokeWidth={2.5} className={problemListRowMediaGlyphClass} aria-hidden />
          </span>
        ) : null}
        {showImages ? (
          <span className='inline-flex items-end' title='Images'>
            <ImageIcon size={12} strokeWidth={2.5} className={problemListRowMediaGlyphClass} aria-hidden />
          </span>
        ) : null}
        {showMovies ? (
          <span className='inline-flex items-end' title='Movies'>
            <Film size={12} strokeWidth={2.5} className={problemListRowMediaGlyphClass} aria-hidden />
          </span>
        ) : null}
      </span>
    </span>
  ) : null;

  const ticksMetaBlock =
    tickCount > 0 ? (
      <span className={problemListRowTicksMetaClass}>{tickCount === 1 ? '1 tick' : `${tickCount} ticks`}</span>
    ) : null;

  const sectorMeta = sectorName ? (
    sectorId > 0 ? (
      <Link
        to={`/sector/${sectorId}`}
        className={cn(
          problemListRowFaPlainClass,
          designContract.typography.listLinkMuted,
          'underline-offset-2 hover:underline',
        )}
      >
        {sectorName}
      </Link>
    ) : (
      <span className={problemListRowFaPlainClass}>{sectorName}</span>
    )
  ) : null;

  const metaTailBlock = compact ? (
    sectorMeta || faEl ? (
      <span className={problemListRowMetaTailClass}>
        {sectorMeta}
        {sectorMeta && faEl ? (
          <span className={problemListRowPipeSepClass} aria-hidden>
            |
          </span>
        ) : null}
        {faEl}
      </span>
    ) : null
  ) : sectorMeta || rockLine || faEl || commentEl ? (
    <span className={problemListRowMetaTailClass}>
      {sectorMeta}
      {sectorMeta && (rockLine || faEl || commentEl) ? (
        <span className={problemListRowPipeSepClass} aria-hidden>
          |
        </span>
      ) : null}
      {rockLine}
      {rockLine && (faEl || commentEl) ? (
        <span className={problemListRowPipeSepClass} aria-hidden>
          |
        </span>
      ) : null}
      {faEl}
      {faEl && commentEl ? (
        <span className={problemListRowPipeSepClass} aria-hidden>
          |
        </span>
      ) : null}
      {commentEl}
    </span>
  ) : null;

  /** `|` between grade and trad + stars/topo/media cluster (only when a grade is shown). */
  const showPipeAfterGradeBeforeMediaCluster = !!problem.grade && (!!passiveGearAfterGrade || !!ratingIconsBlock);

  /** Pipe after stars/media when pitches and/or ticks follow (pitches listed first). */
  const showPipeAfterRatingIcons = hasRatingVisuals && (!!pitchLine || tickCount > 0);
  const showPipeBeforePitchNoIcons = !!pitchLine && !ratingIconsBlock && (!!problem.grade || !!passiveGearAfterGrade);
  const showPipeBetweenPitchAndTicks = !!pitchLine && tickCount > 0;

  const hasContentBeforeMetaTail =
    !!problem.grade ||
    !!passiveGearAfterGrade ||
    !!ratingIconsBlock ||
    !!pitchLine ||
    !!ticksMetaBlock ||
    !!lockBrokenBlock;
  const showPipeBeforeMetaTail = !!metaTailBlock && hasContentBeforeMetaTail;

  const listRowTitle = useMemo(() => {
    const parts: string[] = [];
    const faNamesTitle = normalizeFaPeopleSeparators((problem.fa ?? '').trim());
    const faYearTitle = problem.faDate && problem.faDate.length >= 4 ? problem.faDate.slice(0, 4) : '';
    const faLineTitle = compact
      ? compactFaDisplayLine((problem.fa ?? '').trim(), problem.faDate)
      : [faNamesTitle, faYearTitle].filter(Boolean).join(' ');
    if (faLineTitle) parts.push(faLineTitle);
    if (isClimbing && (problem.numPitches ?? 1) > 1) {
      parts.push(`${problem.numPitches} pitches`);
    }
    const n = problem.numTicks ?? 0;
    if (n > 0) parts.push(n === 1 ? '1 tick' : `${n} ticks`);
    if (!compact && problem.rock) parts.push(`Rock: ${problem.rock}`);
    if (!compact && commentTrimmed) parts.push(commentTrimmed);
    return parts.join(' | ');
  }, [
    commentTrimmed,
    compact,
    isClimbing,
    problem.fa,
    problem.faDate,
    problem.numPitches,
    problem.numTicks,
    problem.rock,
  ]);

  return (
    <div className={cn(problemListRowRootClass, 'min-w-0 py-0.5 sm:py-1')}>
      <div className='grid min-w-0 grid-cols-[auto_1fr] items-baseline gap-x-1.5 sm:gap-x-2'>
        <div className='flex shrink-0 items-baseline justify-end gap-0.5'>
          {problem.danger ? (
            <AlertTriangle
              size={12}
              className={cn('shrink-0', designContract.ascentStatus.dangerous)}
              strokeWidth={2.25}
              aria-hidden
            />
          ) : null}
          <span
            className={cn(tickWhenGrade, 'shrink-0 leading-snug tabular-nums antialiased')}
            title={
              problem.ticked
                ? 'Ticked'
                : problem.todo
                  ? 'On to-do list'
                  : `${isBouldering ? 'Boulder' : 'Route'} number`
            }
          >
            #{problem.nr}
          </span>
        </div>

        <div className='min-w-0 leading-snug' title={listRowTitle || undefined}>
          <div className='min-w-0'>
            <Link
              to={`/problem/${problem.id}`}
              className={cn(
                tickProblemLinkWithStatus({
                  ticked: !!problem.ticked,
                  todo: !!problem.todo,
                  broken: !!problem.broken,
                }),
              )}
            >
              {problem.name}
            </Link>
            {problem.grade ? (
              <span className={cn(tickWhenGrade, 'ml-1 align-baseline whitespace-nowrap tabular-nums')}>
                {problem.grade}
              </span>
            ) : null}
            {showPipeAfterGradeBeforeMediaCluster ? (
              <span className={problemListRowPipeSepClass} aria-hidden>
                |
              </span>
            ) : null}
            {passiveGearAfterGrade ? (
              <>
                {!showPipeAfterGradeBeforeMediaCluster ? ' ' : null}
                {passiveGearAfterGrade}
              </>
            ) : null}
            {ratingIconsBlock ? (
              <>
                {!!passiveGearAfterGrade || !showPipeAfterGradeBeforeMediaCluster ? ' ' : null}
                <span className='inline-flex align-baseline'>{ratingIconsBlock}</span>
              </>
            ) : null}
            {showPipeAfterRatingIcons ? (
              <span className={problemListRowPipeSepClass} aria-hidden>
                |
              </span>
            ) : null}
            {showPipeBeforePitchNoIcons ? (
              <span className={problemListRowPipeSepClass} aria-hidden>
                |
              </span>
            ) : null}
            {pitchLine}
            {showPipeBetweenPitchAndTicks ? (
              <span className={problemListRowPipeSepClass} aria-hidden>
                |
              </span>
            ) : null}
            {ticksMetaBlock ? (
              <>
                {!pitchLine && !showPipeAfterRatingIcons ? ' ' : null}
                {ticksMetaBlock}
                {lockBrokenBlock ? (
                  <span className={problemListRowPipeSepClass} aria-hidden>
                    |
                  </span>
                ) : null}
              </>
            ) : null}
            {lockBrokenBlock ? (
              <>
                {!ticksMetaBlock ? ' ' : null}
                <span className='inline-flex align-baseline'>{lockBrokenBlock}</span>
              </>
            ) : null}
            {metaTailBlock ? (
              <>
                {showPipeBeforeMetaTail ? (
                  <span className={problemListRowPipeSepClass} aria-hidden>
                    |
                  </span>
                ) : (
                  ' '
                )}
                {metaTailBlock}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

type AreaSectorType = NonNullable<components['schemas']['Area']['sectors']>[number];
type SectorWithParking = AreaSectorType &
  (Pick<AreaSectorType, 'parking'> & {
    parking: Required<Pick<NonNullable<AreaSectorType['parking']>, 'latitude' | 'longitude'>>;
  });

const isSectorWithParking = (s: AreaSectorType): s is SectorWithParking => {
  return !!(s.parking && s.parking.latitude && s.parking.longitude);
};

/** Problems in area — prefer server count when present. */
function countAreaProblems(area: components['schemas']['Area']): number {
  const n = area.numProblems;
  if (n != null && n > 0) return n;
  return (area.sectors ?? []).reduce((acc, s) => acc + (s.problems?.length ?? 0), 0);
}

/** Sum of `numTicks` across embedded sector problems (same payload as the lists). */
function sumAreaProblemTicks(area: components['schemas']['Area']): number {
  return (area.sectors ?? []).reduce(
    (acc, s) => acc + (s.problems ?? []).reduce((m, p) => m + (p.numTicks ?? 0), 0),
    0,
  );
}

/** Keep Todo tab unless `typeNumTickedTodo` has rows and every aggregate todo count is zero. */
function shouldShowAreaTodoTabFromPayload(area: components['schemas']['Area']): boolean {
  const rows = area.typeNumTickedTodo;
  if (rows == null || rows.length === 0) return true;
  return rows.reduce((s, x) => s + (x.todo ?? 0), 0) > 0;
}

const Area = () => {
  const meta = useMeta();
  const { areaId, segment } = useParams();
  const navigate = useNavigate();
  const [activeSectorTab, setActiveSectorTab] = useState<string>('sectors');

  if (areaId === undefined) {
    throw new Error('Missing areaId parameter');
  }

  const { data, error, redirectUi } = useArea(+areaId);

  const markers = useMemo(() => {
    if (!data?.sectors) return [];

    type SectorParkingMarker = Pick<SectorWithParking['parking'], 'latitude' | 'longitude'> & {
      sectors: Pick<NonNullable<SectorWithParking>, 'id' | 'name'>[];
    };

    const uniqueSectors = data.sectors.filter(isSectorWithParking).reduce(
      (acc, { parking, name, id }) => {
        const key = `${parking.latitude},${parking.longitude}`;
        const existing = acc[key];
        return {
          ...acc,
          [key]: {
            latitude: parking.latitude,
            longitude: parking.longitude,
            sectors: [...(existing?.sectors ?? []), { name, id }],
          },
        };
      },
      {} as Record<string, SectorParkingMarker>,
    );

    return Object.values(uniqueSectors).map((info) => ({
      coordinates: { latitude: info.latitude, longitude: info.longitude },
      isParking: true,
    }));
  }, [data?.sectors]);

  const { outlines, slopes } = useMemo(() => {
    const nextOutlines: NonNullable<ComponentProps<typeof Leaflet>['outlines']> = [];
    const nextSlopes: NonNullable<ComponentProps<typeof Leaflet>['slopes']> = [];
    if (!data?.sectors) return { outlines: nextOutlines, slopes: nextSlopes };

    const showSlopeLengthOnOutline = (data.sectors.filter((s) => s.approach && s.outline).length ?? 0) > 1;

    for (const s of data.sectors) {
      let distance: string | null = null;
      const approach = s.approach;
      if (approach?.coordinates?.length) {
        distance = getDistanceWithUnit(approach);
        const label = (!s.outline || !showSlopeLengthOnOutline) && distance ? distance : '';
        nextSlopes.push({ backgroundColor: SLOPE_APPROACH_COLOR, slope: approach, label: label ?? '' });
      }
      if (s.descent?.coordinates?.length) {
        distance = getDistanceWithUnit(s.descent);
        const label = (!s.outline || !showSlopeLengthOnOutline) && distance ? distance : '';
        nextSlopes.push({ backgroundColor: SLOPE_DESCENT_COLOR, slope: s.descent, label: label ?? '' });
      }
      if (s.outline?.length) {
        const label = (s.name ?? '') + (showSlopeLengthOnOutline && distance ? ' (' + distance + ')' : '');
        nextOutlines.push({ url: '/sector/' + s.id, label, outline: s.outline });
      }
    }
    return { outlines: nextOutlines, slopes: nextSlopes };
  }, [data]);

  const tabs = useMemo(() => {
    const t: { id: string; label: string; icon: typeof LayoutDashboard }[] = [];
    if (!data) return t;
    t.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
    const hasMapContent = markers.length > 0 || outlines.length > 0 || slopes.length > 0;
    if (hasMapContent) t.push({ id: 'map', label: 'Map', icon: MapIcon });
    if (data.sectors?.length) {
      const problemCount = countAreaProblems(data);
      const tickSum = sumAreaProblemTicks(data);
      if (problemCount > 0) {
        t.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
      }
      if (problemCount > 0 && tickSum > 0) {
        t.push({ id: 'top', label: 'Top', icon: Trophy });
      }
      if (shouldShowAreaTodoTabFromPayload(data)) {
        t.push({ id: 'todo', label: 'Todo', icon: Bookmark });
      }
      t.push({ id: 'activity', label: 'Activity', icon: Clock });
    }
    return t;
  }, [data, markers.length, outlines.length, slopes.length]);

  /** Path segments: `/area/:id`, `/area/:id/overview`, `/area/:id/map`, …; numeric segment = media deep link. */
  const effectiveTab = useMemo(() => {
    if (tabs.length === 0) return null;
    if (segment && /^\d+$/.test(segment)) return tabs[0].id;
    const candidate = segment === 'image' || segment === 'media' ? 'overview' : segment;
    if (candidate && tabs.some((x) => x.id === candidate)) return candidate;
    return tabs[0].id;
  }, [tabs, segment]);

  const setAreaTab = useCallback(
    (id: string) => {
      const base = `/area/${areaId}`;
      if (id === 'overview') navigate(base, { replace: true });
      else navigate(`${base}/${id}`, { replace: true });
    },
    [areaId, navigate],
  );

  useEffect(() => {
    if (tabs.length === 0 || !segment) return;
    if (/^\d+$/.test(segment)) return;
    const candidate = segment === 'image' || segment === 'media' ? 'overview' : segment;
    if (!tabs.some((x) => x.id === candidate)) {
      navigate(`/area/${areaId}`, { replace: true });
    }
  }, [tabs, segment, areaId, navigate]);

  const problemRows = useMemo(() => {
    if (!data?.sectors) return [];
    return (data.sectors ?? [])
      .flatMap((sector) => {
        const name = sector.name ?? '';
        const problems = sector.problems ?? [];
        return problems.map((p) => ({
          element: <SectorListItem key={p.id} sectorId={sector.id ?? 0} sectorName={name} problem={p} />,
          name: p.name ?? '',
          areaName: data.name ?? '',
          sectorName: name,
          nr: p.nr ?? 0,
          gradeNumber: p.gradeNumber ?? 0,
          stars: p.stars ?? 0,
          numTicks: p.numTicks ?? 0,
          ticked: p.ticked ?? false,
          rock: p.rock ?? '',
          subType: p.t?.subType ?? '',
          broken: !!p.broken,
          num: p.nr ?? 0,
          fa: !!p.fa,
          faDate: p.faDate ?? null,
        }));
      })
      .sort((a, b) => b.gradeNumber - a.gradeNumber);
  }, [data]);

  if (redirectUi) return redirectUi;

  if (error && isHttpError(error, 404)) {
    return (
      <>
        <title>{`Not found | ${meta?.title}`}</title>
        <NotFoundCard
          className='mt-4 sm:mt-6'
          description='Cannot find the specified area because it does not exist or you do not have sufficient permissions.'
        />
      </>
    );
  }

  if (error) {
    const description = isHttpError(error)
      ? getUserFriendlyHttpErrorMessage(error)
      : 'Something went wrong while loading this area.';
    return (
      <>
        <title>{`Error | ${meta?.title}`}</title>
        <NotFoundCard className='mt-4 sm:mt-6' title='Unable To Load Area' description={description} />
      </>
    );
  }

  if (!data) return <Loading />;

  const orderableMedia: ComponentProps<typeof Media>['orderableMedia'] = [];
  const carouselMedia: ComponentProps<typeof Media>['carouselMedia'] = [];
  if (data.media?.length) {
    carouselMedia.push(...data.media);
    if (data.media.length > 1) orderableMedia.push(...data.media);
  }
  if (data.triviaMedia?.length) {
    carouselMedia.push(...data.triviaMedia);
    if (data.triviaMedia.length > 1) orderableMedia.push(...data.triviaMedia);
  }

  const areaAccessRestrictions =
    data.accessClosed || data.noDogsAllowed || data.accessInfo ? (
      <div className={cn('min-w-0 space-y-2', designContract.typography.body)}>
        {data.accessClosed && <p className='text-access-danger text-pretty'>{data.accessClosed}</p>}
        {(data.noDogsAllowed || data.accessInfo) && (
          <div className='text-access-caution space-y-1.5'>
            {data.noDogsAllowed && <NoDogsAllowed />}
            {data.accessInfo && <p className='text-pretty'>{data.accessInfo}</p>}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className='w-full min-w-0'>
      <title>{`${data.name} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className='mb-3 min-w-0 space-y-2 pt-1 sm:mb-4 sm:space-y-2 sm:pt-1 lg:pt-0'>
        <PageCardBreadcrumbRow
          className='mb-0'
          breadcrumb={
            <nav
              aria-label='Breadcrumb'
              className={cn(
                'flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-2 text-pretty break-words',
                designContract.typography.breadcrumb,
              )}
            >
              <Link to='/areas' className={designContract.typography.breadcrumbLink}>
                Areas
              </Link>
              {/*
                Same chevron as sector/problem crumbs: single segment still reads as a path (“Areas” → title below).
              */}
              <ChevronRight size={12} className='shrink-0 translate-y-px opacity-30' aria-hidden />
            </nav>
          }
          actions={
            meta.isAdmin ? (
              <>
                <Link
                  to={`/sector/edit/${data.id}/0`}
                  title='Add sector'
                  aria-label='Add sector'
                  data-ph-action='add'
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    designContract.controls.pageHeaderIconButtonAdd,
                  )}
                >
                  <Plus className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
                </Link>
                <Link
                  to={`/area/edit/${data.id}`}
                  title='Edit area'
                  aria-label='Edit area'
                  data-ph-action='edit'
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    designContract.controls.pageHeaderIconButtonEdit,
                  )}
                >
                  <Edit className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
                </Link>
              </>
            ) : null
          }
        />
        <h1 className='light:text-slate-950 m-0 inline-flex max-w-full min-w-0 items-baseline gap-1.5 text-[15px] leading-snug font-semibold tracking-tight text-slate-50 sm:text-[16px]'>
          <span className='min-w-0 text-pretty break-words'>{data.name}</span>
          <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
        </h1>
      </div>

      <Card flush className='min-w-0 border-0'>
        {tabs.length > 1 && (
          <>
            <div
              className={tabBarStripContainerClassName('equal')}
              style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
              role='tablist'
              aria-label='Area sections'
            >
              {tabs.map((t) => {
                const IconComp = t.icon;
                const isActive = effectiveTab === t.id;
                return (
                  <button
                    key={t.id}
                    type='button'
                    role='tab'
                    aria-selected={isActive}
                    onClick={() => setAreaTab(t.id)}
                    className={tabBarButtonClassName(isActive)}
                  >
                    <IconComp
                      size={TAB_BAR_ICON_SIZE}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={tabBarIconClassName(isActive)}
                    />
                    <span className={designContract.controls.tabBarLabel}>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {effectiveTab !== 'activity' && (
              <div>
                {effectiveTab === 'overview' && (
                  <div className='space-y-4 p-4 sm:p-5'>
                    {areaAccessRestrictions}
                    {(data.media?.length ?? 0) > 0 && (
                      <Media
                        pitches={null}
                        media={data.media ?? []}
                        orderableMedia={orderableMedia}
                        carouselMedia={carouselMedia}
                        optProblemId={null}
                        showLocation={false}
                        compactTiles
                      />
                    )}

                    <div className='flex w-full min-w-0 flex-wrap content-start items-center gap-x-2 gap-y-1 sm:gap-y-1.5'>
                      <ConditionLabels
                        lat={data.coordinates?.latitude}
                        lng={data.coordinates?.longitude}
                        label={data.name ?? ''}
                        wallDirectionCalculated={undefined}
                        wallDirectionManual={undefined}
                        sunFromHour={data.sunFromHour ?? 0}
                        sunToHour={data.sunToHour ?? 0}
                        pageViews={data.pageViews}
                      />
                      {data.forDevelopers && (
                        <span
                          className={cn(
                            designContract.surfaces.inlineChip,
                            'text-[11px] font-semibold tracking-wide text-amber-400/90 uppercase',
                          )}
                        >
                          Under development
                        </span>
                      )}
                      <DownloadButton href={`/areas/pdf?id=${data.id}`}>PDF</DownloadButton>
                      <ExternalLinkLabels externalLinks={data.externalLinks} />
                    </div>

                    {(data.comment ?? '').trim().length > 0 && (
                      <ExpandableMarkdown key={data.id} content={data.comment ?? ''} contentClassName='max-w-none' />
                    )}

                    {(data.triviaMedia?.length ?? 0) > 0 && (
                      <div className='pt-1'>
                        <Media
                          pitches={null}
                          media={data.triviaMedia ?? []}
                          orderableMedia={orderableMedia}
                          carouselMedia={carouselMedia}
                          optProblemId={null}
                          showLocation={false}
                          triviaTiles
                        />
                      </div>
                    )}
                  </div>
                )}
                {effectiveTab === 'map' && (
                  <div className='relative z-0 -mx-px h-[35vh] min-h-[220px] w-[calc(100%+2px)] overflow-hidden sm:mx-0 sm:h-[40vh] sm:w-full'>
                    <Leaflet
                      key={'area=' + data.id}
                      autoZoom={true}
                      height='100%'
                      markers={markers}
                      outlines={outlines}
                      slopes={slopes}
                      defaultCenter={
                        data.coordinates?.latitude && data.coordinates?.longitude
                          ? { lat: data.coordinates.latitude, lng: data.coordinates.longitude }
                          : meta.defaultCenter
                      }
                      defaultZoom={data.coordinates ? 14 : meta.defaultZoom}
                      showSatelliteImage={false}
                      clusterMarkers={false}
                      flyToId={null}
                    />
                  </div>
                )}
                {effectiveTab === 'distribution' && (
                  <div className='p-4 sm:p-5'>
                    <ChartGradeDistribution idArea={data.id ?? 0} embedded />
                  </div>
                )}
                {effectiveTab === 'top' && (
                  <div className='p-4 sm:p-5'>
                    <Top idArea={data.id ?? 0} idSector={0} />
                  </div>
                )}
                {effectiveTab === 'todo' && (
                  <div className='p-4 sm:p-5'>
                    <Todo idArea={data.id ?? 0} idSector={0} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      {effectiveTab === 'overview' && (data.sectors?.length ?? 0) > 0 && (
        <Card flush className='mt-6 min-w-0 overflow-hidden border-0 shadow-sm'>
          <div
            role='tablist'
            aria-label='Choose sector grid or full problem list'
            className={tabBarStripContainerClassName('inline')}
          >
            <button
              type='button'
              role='tab'
              aria-selected={activeSectorTab === 'sectors'}
              onClick={() => setActiveSectorTab('sectors')}
              className={cn(tabBarButtonClassNameInline(activeSectorTab === 'sectors'), 'flex-row gap-2')}
            >
              <LayoutGrid
                size={TAB_BAR_ICON_SIZE}
                strokeWidth={activeSectorTab === 'sectors' ? 2.3 : 2}
                className={tabBarIconClassName(activeSectorTab === 'sectors')}
              />
              <span className={designContract.controls.tabBarLabelInline}>
                Sectors{' '}
                <span className={cn(designContract.typography.micro, 'font-normal text-slate-500 tabular-nums')}>
                  ({data.sectors?.length ?? 0})
                </span>
              </span>
            </button>
            <button
              type='button'
              role='tab'
              aria-selected={activeSectorTab === 'problems'}
              onClick={() => setActiveSectorTab('problems')}
              className={cn(tabBarButtonClassNameInline(activeSectorTab === 'problems'), 'flex-row gap-2')}
            >
              <List
                size={TAB_BAR_ICON_SIZE}
                strokeWidth={activeSectorTab === 'problems' ? 2.3 : 2}
                className={tabBarIconClassName(activeSectorTab === 'problems')}
              />
              <span className={designContract.controls.tabBarLabelInline}>
                {meta.isBouldering ? 'Problems' : 'Routes'}{' '}
                <span className={cn(designContract.typography.micro, 'font-normal text-slate-500 tabular-nums')}>
                  ({problemRows.length})
                </span>
              </span>
            </button>
          </div>
          <div className='min-w-0'>
            {activeSectorTab === 'sectors' ? (
              <div className={cn('min-w-0 p-4 sm:p-5', designContract.layout.areaSectorCardGrid)}>
                {data.sectors?.map((sector) => {
                  const sectorHasThumb = !!sector.randomMediaId;
                  /** Thumbnails + dark placeholders: light ink remaps break `text-slate-*`; use overlay tokens or `light:` for empty tiles. */
                  const sectorCardTitleClass = cn(
                    'line-clamp-2 min-w-0 flex-1 font-medium tracking-tight text-[0.95rem] leading-tight sm:text-[1.1rem] md:text-[1.25rem]',
                    sectorHasThumb
                      ? 'photo-overlay-fg drop-shadow-md'
                      : cn('text-slate-100 drop-shadow-md light:drop-shadow-none', twInk.lightTextSlate900),
                  );
                  const sectorCardMetaClass = cn(
                    'mt-1 flex min-w-0 flex-col gap-y-0.5 text-[11px] leading-none sm:mt-1.5 sm:text-[12px]',
                    sectorHasThumb ? 'photo-overlay-fg-muted' : 'text-slate-400 light:text-slate-600',
                  );
                  /** On photo scrims, use `--color-status-*-imagery` (same as dark defaults; light body uses muted status tokens). */
                  const sectorCardTickedClass = sectorHasThumb
                    ? 'text-[color:var(--color-status-ticked-imagery)]'
                    : designContract.ascentStatus.ticked;
                  const sectorCardTodoClass = sectorHasThumb
                    ? 'text-[color:var(--color-status-todo-imagery)]'
                    : designContract.ascentStatus.todo;
                  return (
                    <div
                      key={sector.id}
                      className='bg-surface-card border-surface-border h-full max-w-full min-w-0 overflow-hidden rounded-xl border shadow-lg max-sm:!mx-0 max-sm:!w-full sm:shadow-xl'
                    >
                      <Link
                        to={`/sector/${sector.id}`}
                        className='group relative block min-h-[12rem] overflow-hidden rounded-xl sm:min-h-[14rem] md:min-h-[15rem]'
                      >
                        <div
                          className={cn(
                            'absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-800 to-slate-950',
                            'light:from-slate-200 light:via-slate-300 light:to-slate-400',
                          )}
                          aria-hidden
                        />
                        <div
                          className={cn(
                            'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(148,163,184,0.22),transparent_65%)]',
                            'light:bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(15,23,42,0.07),transparent_65%)]',
                          )}
                          aria-hidden
                        >
                          <MapPinned
                            className='light:text-slate-600/40 h-[4.5rem] w-[4.5rem] text-slate-300/55 sm:h-[5.25rem] sm:w-[5.25rem] md:h-24 md:w-24'
                            strokeWidth={1.15}
                          />
                        </div>
                        {sectorHasThumb ? (
                          <img
                            className='absolute inset-0 z-[2] h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                            src={getMediaFileUrl(sector.randomMediaId!, sector.randomMediaVersionStamp ?? 0, false, {
                              minDimension: 400,
                            })}
                            alt=''
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div
                          className={cn(
                            'absolute inset-0 z-[3]',
                            sectorHasThumb
                              ? cn(
                                  'bg-linear-to-t from-black/72 via-black/32 to-transparent',
                                  'light:from-black/52 light:via-black/18 light:to-transparent',
                                )
                              : cn(
                                  'bg-linear-to-t from-black/90 via-black/40 to-slate-800/25',
                                  'light:from-transparent light:via-transparent light:to-slate-950/10',
                                ),
                          )}
                        />
                        <div
                          className={cn(
                            'absolute inset-0 z-[3] bg-black/16 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                            'light:bg-slate-900/12',
                          )}
                        />
                        <div className='relative z-[4] flex min-h-[12rem] flex-col justify-end p-2.5 sm:min-h-[14rem] sm:p-3 md:min-h-[15rem] md:p-4'>
                          <div className='flex items-start justify-between gap-2'>
                            <h4 className={sectorCardTitleClass}>{sector.name}</h4>
                            <span className='shrink-0 drop-shadow'>
                              <LockSymbol
                                lockedAdmin={!!sector.lockedAdmin}
                                lockedSuperadmin={!!sector.lockedSuperadmin}
                              />
                            </span>
                          </div>
                          {sector.typeNumTickedTodo && sector.typeNumTickedTodo.length > 0 && (
                            <div className={sectorCardMetaClass}>
                              {sector.typeNumTickedTodo.map((x, i) => {
                                const n = x.num ?? 0;
                                const nt = x.ticked ?? 0;
                                const nd = x.todo ?? 0;
                                return (
                                  <div
                                    key={`${sector.id}-${i}-${x.type ?? ''}`}
                                    className='inline-flex min-w-0 items-center gap-x-0.5'
                                  >
                                    <span className='font-medium'>{x.type}</span>
                                    <span aria-hidden>:</span>
                                    <span className='tabular-nums'>{n}</span>
                                    {nt > 0 ? (
                                      <span className='inline-flex items-center gap-px'>
                                        <Check
                                          size={9}
                                          strokeWidth={2.5}
                                          className={cn('shrink-0', sectorCardTickedClass)}
                                          aria-hidden
                                        />
                                        <span className={cn('font-medium tabular-nums', sectorCardTickedClass)}>
                                          {nt}
                                        </span>
                                      </span>
                                    ) : null}
                                    {nd > 0 ? (
                                      <span className='inline-flex items-center gap-px'>
                                        <Bookmark
                                          size={9}
                                          strokeWidth={2.5}
                                          className={cn('shrink-0', sectorCardTodoClass)}
                                          aria-hidden
                                        />
                                        <span className={cn('font-medium tabular-nums', sectorCardTodoClass)}>
                                          {nd}
                                        </span>
                                      </span>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {sector.accessClosed && (
                            <p className='type-micro text-access-danger mt-1 font-semibold drop-shadow'>
                              {sector.accessClosed}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ProblemList
                key={`area/${areaId}`}
                detachToolbar
                wrapDetachedContent={(inner) => <div className='p-4 sm:p-5'>{inner}</div>}
                storageKey={`area/${areaId}`}
                mode='sector'
                sortPreferenceBucket='area'
                defaultOrder='grade-desc'
                rows={problemRows}
                enableViewModeToggle
              />
            )}
          </div>
        </Card>
      )}

      {effectiveTab === 'activity' && (
        <div className='mt-6 min-w-0 sm:mt-8'>
          <Activity idArea={data.id ?? 0} idSector={0} />
        </div>
      )}
    </div>
  );
};

export default Area;
