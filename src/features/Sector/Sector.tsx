import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProblemList, { useProblemListCompact } from '../../shared/components/ProblemList';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import { SlopeProfile } from '../../shared/components/SlopeProfile';
import { SLOPE_APPROACH_COLOR, SLOPE_DESCENT_COLOR } from '../../shared/slopePolylineColors';
import Top from '../../shared/components/Top/Top';
import Activity from '../../shared/components/Activity/Activity';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import Media from '../../shared/components/Media/Media';
import Todo from '../../shared/components/Todo/Todo';
import GetCenterFromDegrees from '../../utils/map-utils';
import { googleMapsSearchUrl } from '../../utils/googleMaps';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Stars, LockSymbol } from '../../shared/ui/Indicators';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { Badge } from '../../shared/components/Widgets/ClimbingWidgets';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { useSector } from '../../api';
import type { Slope } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import { TradGearMarker } from '../../shared/ui/TradGearMarker';
import { climbingRouteUsesPassiveGear, formatRouteTypeLabel } from '../../utils/routeTradGear';
import {
  tabBarButtonClassName,
  tabBarIconClassName,
  tabBarStripContainerClassName,
  TAB_BAR_ICON_SIZE,
} from '../../design/tabBar';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Film,
  Image as ImageIcon,
  MapPin,
  Spline,
  LayoutDashboard,
  Bookmark,
  Map as MapIcon,
  BarChart2,
  Trophy,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { twInk } from '../../design/twInk';
import {
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
import { compactFaPeopleNames, compactFaYear, normalizeFaPeopleSeparators } from '../../utils/firstAscentDisplay';
import {
  problemListRowRootClass,
  tickCommentSmall,
  tickListRowQuietMeta,
  tickProblemLinkWithStatus,
  tickWhenGrade,
} from '../../shared/components/Profile/profileRowTypography';

type SectorProblemRow = NonNullable<components['schemas']['Sector']['problems']>[number];

type SectorListItemProps = { problem: SectorProblemRow };

const lockInlineClass = 'ml-0.5 inline-block align-middle';

export const SectorListItem = ({ problem }: SectorListItemProps) => {
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
  const faNamesCompact = compactFaPeopleNames((problem.fa ?? '').trim());
  const faYear = problem.faDate && problem.faDate.length >= 4 ? problem.faDate.slice(0, 4) : '';
  const faYearCompact = compactFaYear(problem.faDate);
  const faLine = compact ? `${faNamesCompact}${faYearCompact}` : [faNames, faYear].filter(Boolean).join(' ');

  const tickCount = problem.numTicks ?? 0;
  const commentTrimmed = (problem.comment ?? '').trim();

  const pitchLine =
    isClimbing && (problem.numPitches ?? 1) > 1 ? (
      <span className={cn(tickListRowQuietMeta, 'align-baseline whitespace-nowrap')}>{problem.numPitches} pitches</span>
    ) : null;
  const rockLine = problem.rock ? <span className='not-italic'>Rock: {problem.rock}</span> : null;
  const faEl = faLine ? <span>{faLine}</span> : null;
  const commentEl = commentTrimmed ? <span className={tickCommentSmall}>{commentTrimmed}</span> : null;

  const metaTailBlock = compact ? (
    faEl ? (
      <span className={problemListRowMetaTailClass}>{faEl}</span>
    ) : null
  ) : rockLine || faEl || commentEl ? (
    <span className={problemListRowMetaTailClass}>
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

  const hasLock = !!(problem.lockedAdmin || problem.lockedSuperadmin);
  const hasBroken = !!problem.broken;
  const lockBrokenBlock =
    hasLock || hasBroken ? (
      <>
        {hasLock ? (
          <span className={cn(lockInlineClass, 'opacity-[0.68]')}>
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

  /** `|` between grade and trad + stars/topo/media cluster (only when a grade is shown). */
  const showPipeAfterGradeBeforeMediaCluster = !!problem.grade && (!!passiveGearAfterGrade || !!ratingIconsBlock);

  /** Pipe after stars/media when pitches and/or community ticks follow (pitches are listed before ticks). */
  const showPipeAfterRatingIcons = hasRatingVisuals && (!!pitchLine || tickCount > 0);
  const showPipeBeforePitchNoIcons = !!pitchLine && !ratingIconsBlock && (!!problem.grade || !!passiveGearAfterGrade);
  const showPipeBetweenPitchAndTicks = !!pitchLine && tickCount > 0;

  const ticksMetaBlock =
    tickCount > 0 ? (
      <span className={problemListRowTicksMetaClass}>{tickCount === 1 ? '1 tick' : `${tickCount} ticks`}</span>
    ) : null;

  const hasContentBeforeMetaTail =
    !!problem.grade ||
    !!passiveGearAfterGrade ||
    !!ratingIconsBlock ||
    !!pitchLine ||
    !!ticksMetaBlock ||
    !!lockBrokenBlock;
  const showPipeBeforeMetaTail = !!metaTailBlock && hasContentBeforeMetaTail;

  const detailsTitle = useMemo(() => {
    const parts: string[] = [];
    const faNames = normalizeFaPeopleSeparators((problem.fa ?? '').trim());
    const faYear = problem.faDate && problem.faDate.length >= 4 ? problem.faDate.slice(0, 4) : '';
    const faLine = [faNames, faYear].filter(Boolean).join(' ');
    if (faLine) parts.push(faLine);
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

        <div className='min-w-0 leading-snug' title={detailsTitle || undefined}>
          {/*
            Inline flow (not flex-wrap): continuation lines align with the route name under column 2.
            flex-1 meta tails made wrapped text line up under the icons/ticks instead.
          */}
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

type ProblemType = NonNullable<NonNullable<ReturnType<typeof useSector>['data']>['problems']>[number];

function sumSectorProblemTicks(problems: components['schemas']['SectorProblem'][] | undefined): number {
  return (problems ?? []).reduce((s, p) => s + (p.numTicks ?? 0), 0);
}

/** Present on API payloads; optional until sector spec in generated swagger includes it. */
type SectorTodoTabPayload = components['schemas']['Sector'] & {
  typeNumTickedTodo?: components['schemas']['TypeNumTickedTodo'][];
};

/** Keep Todo tab unless `typeNumTickedTodo` has rows and every aggregate todo count is zero. */
function shouldShowSectorTodoTabFromPayload(sector: SectorTodoTabPayload): boolean {
  const rows = sector.typeNumTickedTodo;
  if (rows == null || rows.length === 0) return true;
  return rows.reduce((s, x) => s + (x.todo ?? 0), 0) > 0;
}

const Sector = () => {
  const { sectorId } = useParams();
  if (!sectorId) {
    throw new Error('Missing sectorId URL param');
  }
  const meta = useMeta();
  const { data, error, isLoading, redirectUi } = useSector(+sectorId);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [sectorPickerOpen, setSectorPickerOpen] = useState(false);
  const sectorPickerRef = useRef<HTMLDivElement>(null);
  const sectorPickerActiveItemRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!sectorPickerOpen) return;
    const id = requestAnimationFrame(() => {
      sectorPickerActiveItemRef.current?.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [sectorPickerOpen]);

  useEffect(() => {
    if (!sectorPickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (sectorPickerRef.current && !sectorPickerRef.current.contains(e.target as Node)) {
        setSectorPickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSectorPickerOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [sectorPickerOpen]);

  const markers = useMemo((): NonNullable<ComponentProps<typeof Leaflet>['markers']> => {
    if (!data) return [];
    const list: NonNullable<ComponentProps<typeof Leaflet>['markers']> =
      data.problems
        ?.filter(
          (p): p is NonNullable<ProblemType> & Required<NonNullable<Pick<ProblemType, 'coordinates'>>> =>
            !!(p.coordinates && p.coordinates.latitude && p.coordinates.longitude),
        )
        ?.map((p) => ({
          coordinates: p.coordinates,
          label: `${p.nr} · ${p.name} · ${p.grade}`,
          url: '/problem/' + p.id,
          rock: p.rock,
        })) ?? [];
    if (data.parking) {
      list.push({ coordinates: data.parking, isParking: true });
    }
    return list;
  }, [data]);

  const tabs = useMemo(() => {
    if (!data) return [] as { id: string; label: string; icon: LucideIcon }[];
    const t: { id: string; label: string; icon: LucideIcon }[] = [];
    t.push({ id: 'overview', label: 'Overview', icon: LayoutDashboard });
    const addPolygon = meta.isClimbing || markers.length === 0;
    const hasOutlineOnMap = (data.outline ?? []).length > 0 && addPolygon;
    const hasApproachOrDescent =
      (data.approach?.coordinates ?? []).length > 0 || (data.descent?.coordinates ?? []).length > 0;
    if (markers.length > 0 || hasOutlineOnMap || hasApproachOrDescent) {
      t.push({ id: 'map', label: 'Map', icon: MapIcon });
    }
    if ((data.problems ?? []).length > 0) {
      t.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
      if (sumSectorProblemTicks(data.problems) > 0) {
        t.push({ id: 'top', label: 'Top', icon: Trophy });
      }
      if (shouldShowSectorTodoTabFromPayload(data)) {
        t.push({ id: 'todo', label: 'Todo', icon: Bookmark });
      }
      t.push({ id: 'activity', label: 'Activity', icon: Clock });
    }
    return t;
  }, [data, markers, meta.isClimbing]);

  const normalizedActiveTab = activeTab === 'media' ? 'overview' : activeTab;
  const effectiveTab =
    tabs.length === 0
      ? null
      : normalizedActiveTab !== null && tabs.some((x) => x.id === normalizedActiveTab)
        ? normalizedActiveTab
        : tabs[0].id;

  if (redirectUi) return redirectUi;

  if (error) {
    return (
      <div className='bg-surface-card border-surface-border mx-auto mt-12 max-w-2xl space-y-4 rounded-2xl border p-8 text-center'>
        <AlertTriangle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='type-h1'>404 Error</h2>
        <p className='text-slate-400'>{String(error)}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return <Loading />;
  }

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

  const isBouldering = meta.isBouldering;
  const addPolygon = meta.isClimbing || markers.length === 0;

  const uniqueTypes = Array.from(
    new Set((data.problems ?? []).map((p) => p.t?.subType).filter((p): p is string => !!p)),
  );
  if ((data.problems ?? []).filter((p) => p.broken)?.length) uniqueTypes.push('Broken');
  if ((data.problems ?? []).filter((p) => p.gradeNumber === 0)?.length) uniqueTypes.push('Projects');
  uniqueTypes.sort();

  const [conditionLat, conditionLng] = (() => {
    const validatedOutline = data?.outline?.filter(
      (c): c is Required<Pick<NonNullable<(typeof data)['outline']>[number], 'latitude' | 'longitude'>> =>
        !!c.latitude && !!c.longitude,
    );
    if (validatedOutline?.length) {
      const center = GetCenterFromDegrees(validatedOutline.map((c) => [c.latitude, c.longitude]));
      if (center) return [+center[0], +center[1]];
    }
    if (data.parking && data.parking.latitude && data.parking.longitude) {
      return [+data.parking.latitude, +data.parking.longitude];
    }
    return [0, 0];
  })();

  const defaultCenter =
    data.parking && data.parking.latitude && data.parking.longitude
      ? { lat: data.parking.latitude, lng: data.parking.longitude }
      : meta.defaultCenter;
  const defaultZoom = data.parking ? 15 : meta.defaultZoom;
  let outlines: ComponentProps<typeof Leaflet>['outlines'] = undefined;
  const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];

  if ((data.outline ?? []).length && addPolygon) {
    outlines = [{ url: '/sector/' + data.id, label: data.name ?? '', outline: data.outline ?? [] }];
  }
  if ((data.approach?.coordinates ?? []).length) {
    slopes.push({
      backgroundColor: SLOPE_APPROACH_COLOR,
      slope: data.approach as Slope,
      label: getDistanceWithUnit(data.approach as Slope) ?? undefined,
    });
  }
  if ((data.descent?.coordinates ?? []).length) {
    slopes.push({
      backgroundColor: SLOPE_DESCENT_COLOR,
      slope: data.descent as Slope,
      label: getDistanceWithUnit(data.descent as Slope) ?? undefined,
    });
  }
  const mapProfileHasApproach = (data.approach?.coordinates ?? []).length > 0;
  const mapProfileHasDescent = (data.descent?.coordinates ?? []).length > 0;
  const uniqueRocks = Array.from(
    new Set(
      data.problems
        ?.filter((p) => p.rock)
        ?.map((p) => p.rock)
        ?.filter((p): p is string => !!p) ?? [],
    ),
  ).sort();

  const sectorTypeSummaries = uniqueTypes
    .map((subType) => {
      const header = subType ? subType : 'Boulders';
      const problemsOfType =
        data.problems?.filter(
          (p) =>
            (subType === 'Projects' && p.gradeNumber === 0) ||
            (subType === 'Broken' && p.broken) ||
            (p.t?.subType === subType && p.gradeNumber !== 0),
        ) ?? [];
      const numTicked = problemsOfType.filter((p) => p.ticked).length;
      return { key: header, header, count: problemsOfType.length, numTicked };
    })
    .filter((s) => s.count > 0);

  const sectorProblemListRows: ComponentProps<typeof ProblemList>['rows'] =
    data.problems?.map((p) => ({
      element: <SectorListItem key={p.id} problem={p} />,
      name: p.name ?? '',
      nr: p.nr ?? 0,
      gradeNumber: p.gradeNumber ?? 0,
      stars: p.stars ?? 0,
      numTicks: p.numTicks ?? 0,
      ticked: p.ticked ?? false,
      rock: p.rock ?? '',
      subType: p.t?.subType ?? '',
      broken: !!p.broken,
      num: 0,
      fa: !!p.fa,
      faDate: p.faDate ?? null,
      areaName: '',
      sectorName: '',
    })) ?? [];

  const sectorAccessRestrictions =
    data.areaAccessClosed || data.accessClosed || data.areaAccessInfo || data.accessInfo || data.areaNoDogsAllowed ? (
      <div className={cn('min-w-0 space-y-2', designContract.typography.body)}>
        {(data.areaAccessClosed || data.accessClosed) && (
          <p className='text-access-danger text-pretty'>
            {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed: '}
            {(data.areaAccessClosed || '') + (data.accessClosed || '')}
          </p>
        )}
        {(data.areaNoDogsAllowed || data.areaAccessInfo || data.accessInfo) && (
          <div className='text-access-caution space-y-1.5'>
            {data.areaNoDogsAllowed && <NoDogsAllowed />}
            {data.areaAccessInfo && <p className='text-pretty'>{data.areaAccessInfo}</p>}
            {data.accessInfo && <p className='text-pretty'>{data.accessInfo}</p>}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className='w-full min-w-0 space-y-4 sm:space-y-6'>
      <title>{`${data.name} (${data.areaName}) | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className='mb-3 min-w-0 space-y-2 pt-1 sm:mb-4 sm:space-y-2 sm:pt-1 lg:pt-0'>
        <PageCardBreadcrumbRow
          className='mb-0'
          breadcrumb={
            <>
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
                <ChevronRight size={12} className='shrink-0 translate-y-px opacity-30' aria-hidden />
                <Link to={`/area/${data.areaId}`} className={designContract.typography.breadcrumbLink}>
                  {data.areaName}
                </Link>
                <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
                <ChevronRight size={12} className='shrink-0 translate-y-px opacity-30' aria-hidden />
              </nav>
            </>
          }
          actions={
            meta.isAdmin ? (
              <>
                <Link
                  to={`/problem/edit/${data.id}/0`}
                  title='Add problem'
                  aria-label='Add problem'
                  data-ph-action='add'
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    designContract.controls.pageHeaderIconButtonAdd,
                  )}
                >
                  <Plus className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
                </Link>
                <Link
                  to={`/sector/edit/${data.areaId}/${data.id}`}
                  title='Edit sector'
                  aria-label='Edit sector'
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
        {(data.sectors ?? []).length > 1 ? (
          <h1 className='relative m-0 inline-flex max-w-full min-w-0' ref={sectorPickerRef}>
            <button
              type='button'
              aria-expanded={sectorPickerOpen}
              aria-haspopup='listbox'
              aria-label={`Sector: ${data.name}. Open list of sectors in this area.`}
              onClick={() => setSectorPickerOpen((o) => !o)}
              className={cn(
                'group inline-flex max-w-full min-w-0 items-baseline gap-1 rounded-md border-0 bg-transparent py-0.5 text-left text-[15px] leading-snug font-semibold tracking-tight text-slate-50 transition-[color,background-color,box-shadow] sm:text-[16px]',
                'light:text-slate-950 light:hover:text-slate-950 hover:text-slate-100',
                'hover:bg-surface-raised-hover/70',
                'light:hover:bg-slate-300/85 light:hover:shadow-sm light:hover:ring-1 light:hover:ring-slate-500/25',
                'focus-visible:ring-brand-border/70 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none',
                sectorPickerOpen &&
                  'bg-surface-raised-hover/70 light:bg-slate-300/85 light:shadow-sm light:ring-1 light:ring-slate-500/20',
              )}
            >
              <span className='min-w-0 text-pretty break-words'>{data.name}</span>
              <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
              <ChevronDown
                size={11}
                strokeWidth={2.25}
                className={cn(
                  'shrink-0 text-slate-500 transition-transform group-hover:text-slate-300',
                  'light:text-slate-600',
                  twInk.lightGroupHoverSlate900,
                  sectorPickerOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            {sectorPickerOpen && (
              <ul
                className='border-surface-border bg-surface-card ring-surface-border/50 absolute top-[calc(100%+0.35rem)] left-0 z-[100] max-h-64 w-max max-w-[min(18rem,calc(100dvw-2rem))] min-w-0 overflow-auto rounded-2xl border py-1 shadow-2xl ring-1'
                role='listbox'
              >
                {(data.sectors ?? []).map((s) => {
                  const current = data.id === s.id;
                  return (
                    <li
                      key={s.id}
                      ref={current ? sectorPickerActiveItemRef : undefined}
                      role='option'
                      aria-selected={current}
                    >
                      <Link
                        to={`/sector/${s.id}`}
                        className={cn(
                          'flex min-w-0 items-center gap-2 px-3 py-2 text-sm transition-colors',
                          current
                            ? 'bg-surface-raised-hover light:text-slate-950 font-medium text-slate-100'
                            : cn(
                                'hover:bg-surface-raised-hover text-slate-400 hover:text-slate-200',
                                twInk.lightHoverSlate900,
                              ),
                        )}
                        onClick={() => setSectorPickerOpen(false)}
                      >
                        <LockSymbol lockedAdmin={!!s.lockedAdmin} lockedSuperadmin={!!s.lockedSuperadmin} />
                        <span className='min-w-0 truncate'>{s.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </h1>
        ) : (
          <h1 className='light:text-slate-950 m-0 inline-flex max-w-full min-w-0 items-baseline gap-1.5 text-[15px] leading-snug font-semibold tracking-tight text-slate-50 sm:text-[16px]'>
            <span className='min-w-0 text-pretty break-words'>{data.name}</span>
            <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
          </h1>
        )}
      </div>

      <Card flush className='min-w-0 border-0 shadow-sm'>
        {tabs.length > 1 && (
          <>
            <div
              className={tabBarStripContainerClassName('equal')}
              style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
              role='tablist'
              aria-label='Sector sections'
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
                    onClick={() => setActiveTab(t.id)}
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
                    {sectorAccessRestrictions}
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
                        lat={conditionLat > 0 ? conditionLat : undefined}
                        lng={conditionLng > 0 ? conditionLng : undefined}
                        label={data.name ?? ''}
                        wallDirectionCalculated={data.wallDirectionCalculated}
                        wallDirectionManual={data.wallDirectionManual}
                        sunFromHour={data.sunFromHour ?? data.areaSunFromHour ?? 0}
                        sunToHour={data.sunToHour ?? data.areaSunToHour ?? 0}
                        pageViews={data.pageViews}
                      />
                      <DownloadButton href={`/sectors/pdf?id=${data.id}`}>sector.pdf</DownloadButton>
                      <DownloadButton href={`/areas/pdf?id=${data.areaId}`}>area.pdf</DownloadButton>
                      {data.parking && (
                        <a
                          href={googleMapsSearchUrl(data.parking.latitude, data.parking.longitude)}
                          rel='noreferrer noopener'
                          target='_blank'
                          title='Open parking in Google Maps'
                        >
                          <Badge icon={MapIcon} className={designContract.surfaces.badgeLinkHover}>
                            Parking
                          </Badge>
                        </a>
                      )}
                      {meta.isClimbing && (data.outline ?? []).length > 0 && (
                        <a
                          href={googleMapsSearchUrl(
                            (data.outline ?? [])[0]?.latitude,
                            (data.outline ?? [])[0]?.longitude,
                          )}
                          rel='noreferrer noopener'
                          target='_blank'
                          title='Sector location in Google Maps'
                        >
                          <Badge icon={MapIcon} className={designContract.surfaces.badgeLinkHover}>
                            Sector
                          </Badge>
                        </a>
                      )}
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
                  <div className='relative z-0 -mx-px h-[35vh] min-h-[220px] w-[calc(100%+2px)] overflow-hidden sm:mx-0 sm:h-[50vh] sm:w-full'>
                    <Leaflet
                      key={'sector=' + data.id}
                      autoZoom={true}
                      height='100%'
                      markers={markers}
                      outlines={outlines}
                      slopes={slopes}
                      defaultCenter={defaultCenter}
                      defaultZoom={defaultZoom}
                      onMouseClick={undefined}
                      onMouseMove={undefined}
                      showSatelliteImage={isBouldering}
                      clusterMarkers={true}
                      rocks={uniqueRocks}
                      flyToId={null}
                    />
                  </div>
                )}
                {effectiveTab === 'distribution' && (
                  <div className='p-4 sm:p-5'>
                    <ChartGradeDistribution idSector={data.id ?? 0} embedded />
                  </div>
                )}
                {effectiveTab === 'top' && (
                  <div className='p-4 sm:p-5'>
                    <Top idArea={0} idSector={data.id ?? 0} />
                  </div>
                )}
                {effectiveTab === 'todo' && (
                  <div className='p-4 sm:p-5'>
                    <Todo idArea={0} idSector={data.id ?? 0} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>

      {effectiveTab === 'map' && (mapProfileHasApproach || mapProfileHasDescent) && (
        <div className={cn('mt-4 min-w-0 sm:mt-5', 'max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] sm:mx-0 sm:w-full')}>
          <div className='grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4'>
            {mapProfileHasApproach && (
              <div className='w-full min-w-0'>
                <SlopeProfile
                  compact
                  variant='approach'
                  className='w-full min-w-0'
                  title='Approach'
                  areaName={data.areaName ?? ''}
                  sectorName={data.name ?? ''}
                  slope={data.approach as Slope}
                />
              </div>
            )}
            {mapProfileHasDescent && (
              <div className='w-full min-w-0'>
                <SlopeProfile
                  compact
                  variant='descent'
                  className='w-full min-w-0'
                  title='Descent'
                  areaName={data.areaName ?? ''}
                  sectorName={data.name ?? ''}
                  slope={data.descent as Slope}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {effectiveTab === 'overview' && (data.problems?.length ?? 0) > 0 && (
        <div className='min-w-0'>
          <ProblemList
            detachToolbar
            wrapDetachedContent={(inner) => (
              <Card flush className='min-w-0 border-0 shadow-sm'>
                <div className='p-4 sm:p-5'>{inner}</div>
              </Card>
            )}
            storageKey={`sector/${sectorId}`}
            mode='sector'
            defaultOrder={data.orderByGrade ? 'grade-desc' : 'number'}
            rows={sectorProblemListRows}
            enableViewModeToggle
            contentBeforeList={
              sectorTypeSummaries.length > 1 ? (
                <div
                  className='min-w-0'
                  role='status'
                  aria-label={sectorTypeSummaries
                    .map((s) =>
                      s.numTicked > 0
                        ? `${s.header}: ${s.count} routes, ${s.numTicked} ticked`
                        : `${s.header}: ${s.count} routes`,
                    )
                    .join('. ')}
                >
                  <div className='flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[13px] leading-snug sm:gap-x-6 sm:text-sm'>
                    {sectorTypeSummaries.map((s, i) => (
                      <div
                        key={s.key}
                        className={cn(
                          'inline-flex max-w-full min-w-0 items-center gap-x-2 sm:whitespace-nowrap',
                          i > 0 && 'border-surface-border border-l pl-3 sm:pl-4',
                        )}
                        title={
                          s.numTicked > 0
                            ? `${s.header}: ${s.count} routes, ${s.numTicked} ticked`
                            : `${s.header}: ${s.count} routes`
                        }
                      >
                        <span className='font-semibold text-slate-200'>{s.header}:</span>
                        <span className='text-slate-300 tabular-nums'>{s.count}</span>
                        {s.numTicked > 0 ? (
                          <span className='inline-flex items-center gap-0.5 tabular-nums'>
                            <Check
                              size={12}
                              strokeWidth={2.5}
                              className={cn('shrink-0', designContract.ascentStatus.ticked)}
                              aria-hidden
                            />
                            <span className={cn('font-medium', designContract.ascentStatus.ticked)}>{s.numTicked}</span>
                            <span className='sr-only'> ticked</span>
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            }
          />
        </div>
      )}

      {effectiveTab === 'activity' && (
        <div className='mt-4 min-w-0'>
          <Activity idArea={0} idSector={data.id ?? 0} />
        </div>
      )}
    </div>
  );
};

export default Sector;
