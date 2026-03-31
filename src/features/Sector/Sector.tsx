import { Fragment, type ComponentProps, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProblemList from '../../shared/components/ProblemList';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import { SlopeProfile } from '../../shared/components/SlopeProfile';
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
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { useSector } from '../../api';
import type { Slope } from '../../@types/buldreinfo';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import {
  tabBarButtonClassName,
  tabBarIconClassName,
  tabBarStripContainerClassName,
  TAB_BAR_ICON_SIZE,
} from '../../design/tabBar';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  MapPin,
  Spline,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  Bookmark,
  Map as MapIcon,
  BarChart2,
  Trophy,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { ProfileRowTextSep, profileRowMiddleDotClass } from '../../shared/components/Profile/ProfileRowTextSep';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from '../../shared/components/Profile/profileRowTypography';

type SectorProblemRow = NonNullable<components['schemas']['Sector']['problems']>[number];

type SectorListItemProps = {
  problem: SectorProblemRow;
};

const lockInlineClass = 'ml-0.5 inline-block align-middle';

export const SectorListItem = ({ problem }: SectorListItemProps) => {
  const { isClimbing, isBouldering } = useMeta();

  /** FA · route type · pitch count · ascent count — middle-dot separators (no parentheses). */
  const faMetaBlock = (() => {
    const segments: { key: string; node: ReactNode }[] = [];
    const faText = (problem.fa ?? '').trim();
    const faYear = problem.faDate ? problem.faDate.substring(0, 4) : '';
    const faLine = [faText, faYear].filter(Boolean).join(' ');
    if (faLine) {
      segments.push({ key: 'fa', node: faLine });
    }
    if (isClimbing && problem.t?.subType) {
      segments.push({ key: 'subtype', node: problem.t.subType });
      if ((problem.numPitches ?? 1) > 1) {
        segments.push({
          key: 'pitches',
          node: (
            <>
              <span className='tabular-nums'>{problem.numPitches}</span> pitches
            </>
          ),
        });
      }
    }
    const n = problem.numTicks ?? 0;
    if (n > 0) {
      segments.push({
        key: 'ascents',
        node: (
          <>
            <span className='tabular-nums'>{n}</span>
            {n === 1 ? ' ascent' : ' ascents'}
          </>
        ),
      });
    }

    if (segments.length === 0) return null;

    const metaMuted = tickFlags;
    /** Route type: reads as a label, not buried in gray meta. */
    const metaTypeClass =
      'inline-flex max-w-full items-center rounded-md border border-white/12 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-100 antialiased shadow-sm sm:text-[11px]';

    return (
      <>
        {segments.map((seg, i) => (
          <Fragment key={seg.key}>
            {i > 0 ? segments[i - 1]!.key === 'subtype' || seg.key === 'subtype' ? ' ' : <ProfileRowTextSep /> : null}
            <span className={seg.key === 'subtype' ? metaTypeClass : metaMuted}>{seg.node}</span>
          </Fragment>
        ))}
      </>
    );
  })();

  const hasMediaTrail = !!problem.coordinates || !!problem.hasTopo || !!problem.hasImages || !!problem.hasMovies;

  const hasLock = !!(problem.lockedAdmin || problem.lockedSuperadmin);
  const hasBroken = !!problem.broken;
  const lockBrokenBlock =
    hasLock || hasBroken ? (
      <>
        {hasLock ? (
          <span className={lockInlineClass}>
            <LockSymbol lockedAdmin={!!problem.lockedAdmin} lockedSuperadmin={!!problem.lockedSuperadmin} />
          </span>
        ) : null}
        {hasBroken ? (
          <>
            {hasLock ? ' ' : null}
            <span className='rounded border border-red-500/25 bg-red-500/12 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-red-300 uppercase'>
              {problem.broken}
            </span>
          </>
        ) : null}
      </>
    ) : null;

  const mediaTrailBlock = hasMediaTrail ? (
    <span className='inline text-slate-500'>
      {problem.coordinates ? (
        <span className='inline' title='Coordinates'>
          <MapPin size={12} strokeWidth={2} className='inline-block align-[-0.125em]' />
        </span>
      ) : null}
      {problem.hasTopo ? (
        <span className='inline pl-1' title='Topo line'>
          <Spline size={12} strokeWidth={2} className='inline-block align-[-0.125em]' />
        </span>
      ) : null}
      {problem.hasImages ? (
        <span className='inline pl-1' title='Images'>
          <ImageIcon size={12} strokeWidth={2} className='inline-block align-[-0.125em]' />
        </span>
      ) : null}
      {problem.hasMovies ? (
        <span className='inline pl-1' title='Movies'>
          <Film size={12} strokeWidth={2} className='inline-block align-[-0.125em]' />
        </span>
      ) : null}
    </span>
  ) : null;

  const lockAndMedia =
    lockBrokenBlock || mediaTrailBlock ? (
      <>
        {lockBrokenBlock}
        {lockBrokenBlock && mediaTrailBlock ? ' ' : null}
        {mediaTrailBlock}
      </>
    ) : null;

  const hasIconRunBeforeFa = !!(lockAndMedia || (problem.stars && problem.stars > 0));

  return (
    <div className={cn(profileRowRootClass, 'min-w-0 py-1 text-pretty [overflow-wrap:anywhere] sm:py-1.5')}>
      <div className='min-w-0 leading-snug'>
        {problem.danger ? (
          <AlertTriangle
            size={12}
            className='mr-1 inline-block shrink-0 align-[-0.125em] text-red-400'
            strokeWidth={2.25}
          />
        ) : null}
        <span
          className={cn(
            tickWhenGrade,
            'mr-1.5 inline-block tabular-nums sm:mr-2',
            problem.ticked ? 'text-emerald-400' : problem.todo ? 'text-sky-400' : null,
          )}
          title={
            problem.ticked ? 'Ticked' : problem.todo ? 'On to-do list' : `${isBouldering ? 'Boulder' : 'Route'} number`
          }
        >
          #{problem.nr}
        </span>
        <Link
          to={`/problem/${problem.id}`}
          className={cn(tickProblemLink, problem.broken ? 'line-through opacity-60' : undefined)}
        >
          {problem.name}
        </Link>
        {problem.grade ? (
          <span className={cn(tickWhenGrade, 'ml-1 whitespace-nowrap tabular-nums')}>{problem.grade}</span>
        ) : null}
        {problem.stars ? (
          <span className='ml-1 inline-block align-[-0.15em] opacity-90'>
            <Stars numStars={problem.stars} includeStarOutlines={false} size={11} />
          </span>
        ) : null}
        {lockAndMedia ? <> {lockAndMedia}</> : null}
        {faMetaBlock ? (
          <>
            {hasIconRunBeforeFa ? ' ' : <ProfileRowTextSep />}
            {faMetaBlock}
          </>
        ) : null}
        {problem.rock ? (
          <>
            <ProfileRowTextSep />
            <span className={cn(tickFlags, 'not-italic')}>Rock: {problem.rock}</span>
          </>
        ) : null}
        {problem.comment ? (
          <>
            <ProfileRowTextSep />
            <span className={tickCommentSmall}>{problem.comment}</span>
          </>
        ) : null}
      </div>
    </div>
  );
};

type ProblemType = NonNullable<NonNullable<ReturnType<typeof useSector>['data']>['problems']>[number];

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
    const hasApproachOrDescent =
      (data.approach?.coordinates ?? []).length > 0 || (data.descent?.coordinates ?? []).length > 0;
    if (markers.length > 0 || (data.outline ?? []).length || hasApproachOrDescent) {
      t.push({ id: 'map', label: 'Map', icon: MapIcon });
    }
    if ((data.problems ?? []).length > 0) {
      t.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
      t.push({ id: 'top', label: 'Top', icon: Trophy });
      t.push({ id: 'todo', label: 'Todo', icon: Bookmark });
      t.push({ id: 'activity', label: 'Activity', icon: Clock });
    }
    return t;
  }, [data, markers]);

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
      backgroundColor: 'lime',
      slope: data.approach as Slope,
      label: getDistanceWithUnit(data.approach as Slope) ?? undefined,
    });
  }
  if ((data.descent?.coordinates ?? []).length) {
    slopes.push({
      backgroundColor: 'purple',
      slope: data.descent as Slope,
      label: getDistanceWithUnit(data.descent as Slope) ?? undefined,
    });
  }
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
      const txt = numTicked === 0 ? String(problemsOfType.length) : `${problemsOfType.length} (${numTicked} ticked)`;
      return { key: header, header, txt, count: problemsOfType.length };
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
      <div className='min-w-0 space-y-2 text-[12px] leading-relaxed sm:text-[13px]'>
        {(data.areaAccessClosed || data.accessClosed) && (
          <p className='text-pretty text-red-300/90'>
            {(data.areaAccessClosed ? 'Area' : 'Sector') + ' closed: '}
            {(data.areaAccessClosed || '') + (data.accessClosed || '')}
          </p>
        )}
        {(data.areaNoDogsAllowed || data.areaAccessInfo || data.accessInfo) && (
          <div className='space-y-1.5 text-orange-300/90'>
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

      <div className='mb-3 min-w-0 space-y-3 pt-1 sm:mb-4 sm:space-y-2 sm:pt-1 lg:pt-0'>
        <PageCardBreadcrumbRow
          className='mb-0'
          breadcrumb={
            <>
              <nav className='flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-2 text-[12px] leading-relaxed text-pretty break-words sm:text-[13px]'>
                <Link to='/areas' className='inline align-middle text-slate-400 transition-colors hover:text-slate-200'>
                  Areas
                </Link>
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                <Link
                  to={`/area/${data.areaId}`}
                  className='inline min-w-0 align-middle text-slate-400 transition-colors hover:text-slate-200'
                >
                  {data.areaName}
                </Link>
                <LockSymbol lockedAdmin={!!data.areaLockedAdmin} lockedSuperadmin={!!data.areaLockedSuperadmin} />
                <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
                {(data.sectors ?? []).length > 1 ? (
                  <div className='relative inline-flex max-w-full min-w-0 align-middle' ref={sectorPickerRef}>
                    <button
                      type='button'
                      aria-expanded={sectorPickerOpen}
                      aria-haspopup='listbox'
                      aria-label={`Sector: ${data.name}. Open list of sectors in this area.`}
                      onClick={() => setSectorPickerOpen((o) => !o)}
                      className={cn(
                        'group inline-flex max-w-full min-w-0 items-center gap-1 border-0 bg-transparent p-0 text-left text-[12px] font-semibold text-slate-50 transition-colors sm:text-[13px]',
                        'hover:text-slate-100',
                        'focus-visible:ring-brand/40 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none',
                      )}
                    >
                      <span className='min-w-0 truncate'>{data.name}</span>
                      <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
                      <ChevronDown
                        size={11}
                        strokeWidth={2.25}
                        className={cn(
                          'shrink-0 text-slate-500 transition-transform group-hover:text-slate-400',
                          sectorPickerOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </button>
                    {sectorPickerOpen && (
                      <ul
                        className='border-surface-border bg-surface-card/98 absolute top-[calc(100%+0.35rem)] left-0 z-50 max-h-64 min-w-[min(100vw-2rem,18rem)] overflow-auto rounded-2xl border py-1 shadow-2xl ring-1 ring-white/10 backdrop-blur-md'
                        role='listbox'
                      >
                        {(data.sectors ?? []).map((s) => {
                          const current = data.id === s.id;
                          return (
                            <li key={s.id} role='option' aria-selected={current}>
                              <Link
                                to={`/sector/${s.id}`}
                                className={cn(
                                  'flex min-w-0 items-center gap-2 px-3 py-2 text-sm transition-colors',
                                  current
                                    ? 'bg-white/[0.08] font-medium text-slate-100'
                                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200',
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
                  </div>
                ) : (
                  <span className='inline-flex max-w-full min-w-0 items-center gap-1 align-middle text-[12px] font-semibold text-slate-50 sm:text-[13px]'>
                    <span className='min-w-0 truncate'>{data.name}</span>
                    <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
                  </span>
                )}
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
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    designContract.controls.pageHeaderIconButtonAdd,
                  )}
                >
                  <Plus className={designContract.controls.pageHeaderIconGlyph} />
                </Link>
                <Link
                  to={`/sector/edit/${data.areaId}/${data.id}`}
                  title='Edit sector'
                  aria-label='Edit sector'
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    'border-amber-300/45 bg-amber-400/18 text-amber-100 hover:bg-amber-400/28',
                  )}
                >
                  <Edit className={designContract.controls.pageHeaderIconGlyph} />
                </Link>
              </>
            ) : null
          }
        />
      </div>

      <Card flush className='min-w-0 border-0 shadow-sm sm:border'>
        {tabs.length > 0 && (
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
                    <span className='type-small block min-w-0 truncate leading-none sm:text-[12px]'>{t.label}</span>
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

                    <div className='flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2'>
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
                          className={designContract.surfaces.metaChipInteractive}
                        >
                          <MapIcon size={11} className='shrink-0 text-slate-100' strokeWidth={2.25} />
                          Parking
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
                          className={designContract.surfaces.metaChipInteractive}
                        >
                          <MapIcon size={11} className='shrink-0 text-slate-100' strokeWidth={2.25} />
                          Sector
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

      {effectiveTab === 'map' &&
        ((data.approach?.coordinates ?? []).length > 0 || (data.descent?.coordinates ?? []).length > 0) && (
          <div className={cn('mt-4 min-w-0 sm:mt-5', 'max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] sm:mx-0 sm:w-full')}>
            <div className='grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch md:gap-4'>
              {(data.approach?.coordinates ?? []).length > 0 && (
                <div className={cn((data.descent?.coordinates ?? []).length === 0 && 'min-w-0 md:col-span-2')}>
                  <SlopeProfile
                    compact
                    title='Approach'
                    areaName={data.areaName ?? ''}
                    sectorName={data.name ?? ''}
                    slope={data.approach as Slope}
                  />
                </div>
              )}
              {(data.descent?.coordinates ?? []).length > 0 && (
                <div className={cn((data.approach?.coordinates ?? []).length === 0 && 'min-w-0 md:col-span-2')}>
                  <SlopeProfile
                    compact
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
        <Card flush className='min-w-0 border-0 shadow-sm sm:border'>
          <div className='p-4 sm:p-5'>
            <ProblemList
              storageKey={`sector/${sectorId}`}
              mode='sector'
              defaultOrder={data.orderByGrade ? 'grade-desc' : 'number'}
              rows={sectorProblemListRows}
              contentBeforeList={
                sectorTypeSummaries.length > 1 ? (
                  <div className='min-w-0'>
                    <p
                      className='min-w-0 text-[13px] leading-relaxed text-pretty [overflow-wrap:anywhere] text-slate-300 sm:text-sm'
                      aria-label='Route counts by type in this sector'
                    >
                      {sectorTypeSummaries.map((s, i) => (
                        <Fragment key={s.key}>
                          {i > 0 ? <span className={profileRowMiddleDotClass}> · </span> : null}
                          <span title={`${s.header}: ${s.txt}`}>
                            <span className='font-semibold text-slate-200'>{s.header}:</span>{' '}
                            <span className='font-normal text-slate-300'>{s.txt}</span>
                          </span>
                        </Fragment>
                      ))}
                    </p>
                  </div>
                ) : null
              }
            />
          </div>
        </Card>
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
