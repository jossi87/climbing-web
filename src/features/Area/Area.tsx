import { Fragment, type ComponentProps, type ReactNode, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import { useMeta } from '../../shared/components/Meta/context';
import { getMediaFileUrl, useArea } from '../../api';
import { ExpandableMarkdown } from '../../shared/components/ExpandableMarkdown';
import ProblemList from '../../shared/components/ProblemList';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import { Card, PageCardBreadcrumbRow } from '../../shared/ui';
import {
  ChevronRight,
  Plus,
  Edit,
  AlertTriangle,
  Image as ImageIcon,
  Map as MapIcon,
  MapPinned,
  BarChart2,
  Trophy,
  Bookmark,
  MapPin,
  Spline,
  Film,
  LayoutGrid,
  LayoutDashboard,
  List,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import {
  tabBarButtonClassName,
  tabBarButtonClassNameInline,
  tabBarIconClassName,
  tabBarStripContainerClassName,
  TAB_BAR_ICON_SIZE,
} from '../../design/tabBar';
import { ProfileRowTextSep } from '../../shared/components/Profile/ProfileRowTextSep';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from '../../shared/components/Profile/profileRowTypography';

/** Project / Projects subtype chips — no green “complete” border (not ticked like graded lines). */
function isProjectSubtypeChip(typeLabel: string | undefined): boolean {
  const t = (typeLabel ?? '').trim().toLowerCase();
  return t === 'project' || t === 'projects';
}

/** Per-type completion for area sector stat chips: user has ticked every line of this subtype in the sector. */
function isTypeChipFullyTicked(x: components['schemas']['TypeNumTickedTodo']): boolean {
  if (isProjectSubtypeChip(x.type)) return false;
  const n = x.num ?? 0;
  const t = x.ticked ?? 0;
  return n > 0 && t === n;
}

type Props = {
  sectorId: number;
  sectorName: string;
  problem: NonNullable<NonNullable<components['schemas']['Area']['sectors']>[number]['problems']>[number];
};

const areaListLockInlineClass = 'ml-0.5 inline-block align-middle';

/** Area Routes tab row — same typography/layout as the sector problem list; includes sector name for context. */
const SectorListItem = ({ sectorId, sectorName, problem }: Props) => {
  const { isClimbing, isBouldering } = useMeta();

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
    const metaTypeClass =
      'inline-flex max-w-full items-center rounded-md border border-white/12 bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-slate-100 antialiased shadow-sm sm:text-[11px]';

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
          <span className={areaListLockInlineClass}>
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

  const iconRunBeforeSector = !!((problem.stars && problem.stars > 0) || lockAndMedia);
  /** Middle dot only between text segments; plain space after star / lock / media icons. */
  const faMetaLead = sectorName || !iconRunBeforeSector ? <ProfileRowTextSep /> : ' ';

  return (
    <div className={cn(profileRowRootClass, 'min-w-0 py-1 text-pretty [overflow-wrap:anywhere] sm:py-1.5')}>
      <div className='min-w-0 leading-snug'>
        {problem.danger ? (
          <AlertTriangle
            size={12}
            className={cn('mr-1 inline-block shrink-0 align-[-0.125em]', designContract.ascentStatus.dangerous)}
            strokeWidth={2.25}
          />
        ) : null}
        <span
          className={cn(
            tickWhenGrade,
            'mr-1.5 inline-block tabular-nums sm:mr-2',
            problem.ticked
              ? designContract.ascentStatus.ticked
              : problem.todo
                ? designContract.ascentStatus.todo
                : null,
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
        {sectorName ? (
          <>
            {iconRunBeforeSector ? ' ' : <ProfileRowTextSep />}
            {sectorId > 0 ? (
              <Link
                to={`/sector/${sectorId}`}
                className={cn(tickFlags, designContract.typography.listLinkMuted, 'underline-offset-2 hover:underline')}
              >
                {sectorName}
              </Link>
            ) : (
              <span className={cn(tickFlags, 'text-slate-300')}>{sectorName}</span>
            )}
          </>
        ) : null}
        {faMetaBlock ? (
          <>
            {faMetaLead}
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

type AreaSectorType = NonNullable<components['schemas']['Area']['sectors']>[number];
type SectorWithParking = AreaSectorType &
  (Pick<AreaSectorType, 'parking'> & {
    parking: Required<Pick<NonNullable<AreaSectorType['parking']>, 'latitude' | 'longitude'>>;
  });

const isSectorWithParking = (s: AreaSectorType): s is SectorWithParking => {
  return !!(s.parking && s.parking.latitude && s.parking.longitude);
};

const Area = () => {
  const meta = useMeta();
  const { areaId } = useParams();
  const [activeTab, setActiveTab] = useState<string | null>(null);
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
    if (markers.length || outlines.length || data.coordinates) t.push({ id: 'map', label: 'Map', icon: MapIcon });
    if (data.sectors?.length) {
      t.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
      t.push({ id: 'top', label: 'Top', icon: Trophy });
      t.push({ id: 'todo', label: 'Todo', icon: Bookmark });
      t.push({ id: 'activity', label: 'Activity', icon: Clock });
    }
    return t;
  }, [data, markers.length, outlines.length]);

  const normalizedActiveTab = activeTab === 'image' ? 'overview' : activeTab;
  const effectiveTab =
    tabs.length === 0
      ? null
      : normalizedActiveTab !== null && tabs.some((x) => x.id === normalizedActiveTab)
        ? normalizedActiveTab
        : tabs[0].id;

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

  if (error) {
    return (
      <div className='bg-surface-card border-surface-border mx-auto mt-12 max-w-2xl space-y-4 rounded-2xl border p-8 text-center'>
        <AlertTriangle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='type-h1'>404 Error</h2>
        <p className='text-slate-400'>
          Cannot find the specified area because it does not exist or you do not have sufficient permissions.
        </p>
      </div>
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
      <div className='min-w-0 space-y-2 text-[12px] leading-relaxed sm:text-[13px]'>
        {data.accessClosed && <p className='text-pretty text-red-300/90'>{data.accessClosed}</p>}
        {(data.noDogsAllowed || data.accessInfo) && (
          <div className='space-y-1.5 text-orange-300/90'>
            {data.noDogsAllowed && <p className='text-pretty'>No dogs allowed (landowner request).</p>}
            {data.accessInfo && <p className='text-pretty'>{data.accessInfo}</p>}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className='w-full min-w-0'>
      <title>{`${data.name} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className='mb-3 min-w-0 space-y-3 pt-1 sm:mb-4 sm:space-y-2 sm:pt-1 lg:pt-0'>
        <PageCardBreadcrumbRow
          className='mb-0'
          breadcrumb={
            <nav className='block min-w-0 text-[12px] leading-relaxed text-pretty break-words sm:text-[13px] [&>*+*]:ml-1.5'>
              <Link to='/areas' className='inline align-middle text-slate-400 transition-colors hover:text-slate-200'>
                Areas
              </Link>
              <ChevronRight size={12} className='inline-block shrink-0 align-middle opacity-30' />
              <span className='inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle'>
                <span className='min-w-0 font-semibold text-slate-50'>{data.name}</span>
                <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
              </span>
            </nav>
          }
          actions={
            meta.isAdmin ? (
              <>
                <Link
                  to={`/sector/edit/${data.id}/0`}
                  title='Add sector'
                  aria-label='Add sector'
                  className={cn(
                    designContract.controls.pageHeaderIconButton,
                    designContract.controls.pageHeaderIconButtonAdd,
                  )}
                >
                  <Plus className={designContract.controls.pageHeaderIconGlyph} />
                </Link>
                <Link
                  to={`/area/edit/${data.id}`}
                  title='Edit area'
                  aria-label='Edit area'
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

      <Card flush className='min-w-0 border-0 sm:border'>
        {tabs.length > 0 && (
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

                    <div className='flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2'>
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
                            'text-[10px] font-semibold tracking-wide text-amber-400/90 uppercase',
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
        <Card flush className='mt-6 min-w-0 overflow-hidden border-0 shadow-sm sm:border'>
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
              <span className='type-small font-semibold whitespace-nowrap'>
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
              <span className='type-small font-semibold whitespace-nowrap'>
                {meta.isBouldering ? 'Problems' : 'Routes'}{' '}
                <span className={cn(designContract.typography.micro, 'font-normal text-slate-500 tabular-nums')}>
                  ({problemRows.length})
                </span>
              </span>
            </button>
          </div>
          <div className='min-w-0 p-4 sm:p-5'>
            {activeSectorTab === 'sectors' ? (
              <div className={cn('min-w-0', designContract.layout.areaSectorCardGrid)}>
                {data.sectors?.map((sector) => {
                  const sectorHasThumb = !!sector.randomMediaId;
                  return (
                    <div
                      key={sector.id}
                      className='bg-surface-card border-surface-border h-full max-w-full min-w-0 overflow-hidden rounded-xl border shadow-lg max-sm:!mx-0 max-sm:!w-full sm:border sm:shadow-xl'
                    >
                      <Link
                        to={`/sector/${sector.id}`}
                        className='group relative block min-h-[12rem] overflow-hidden rounded-xl sm:min-h-[14rem] md:min-h-[15rem]'
                      >
                        <div
                          className='absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-800 to-slate-950'
                          aria-hidden
                        />
                        <div
                          className='pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(148,163,184,0.22),transparent_65%)]'
                          aria-hidden
                        >
                          <MapPinned
                            className='h-[4.5rem] w-[4.5rem] text-slate-300/55 sm:h-[5.25rem] sm:w-[5.25rem] md:h-24 md:w-24'
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
                              ? 'bg-linear-to-t from-black/95 via-black/55 to-black/20'
                              : 'bg-linear-to-t from-black/90 via-black/40 to-slate-800/25',
                          )}
                        />
                        <div className='absolute inset-0 z-[3] bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                        <div className='relative z-[4] flex min-h-[12rem] flex-col justify-end p-2.5 sm:min-h-[14rem] sm:p-3 md:min-h-[15rem] md:p-4'>
                          <div className='flex items-start justify-between gap-2'>
                            <h4 className='type-h2 line-clamp-2 min-w-0 flex-1 text-[0.95rem] leading-tight text-slate-100 drop-shadow-md sm:text-[1.1rem] md:text-[1.25rem]'>
                              {sector.name}
                            </h4>
                            <span className='shrink-0 drop-shadow'>
                              <LockSymbol
                                lockedAdmin={!!sector.lockedAdmin}
                                lockedSuperadmin={!!sector.lockedSuperadmin}
                              />
                            </span>
                          </div>
                          {sector.typeNumTickedTodo && sector.typeNumTickedTodo.length > 0 && (
                            <div className='mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2'>
                              {sector.typeNumTickedTodo.map((x) => {
                                const tickTodo = [x.ticked && `${x.ticked} ticked`, x.todo && `${x.todo} todo`]
                                  .filter(Boolean)
                                  .join(', ');
                                const greenBorderOnly = isTypeChipFullyTicked(x);
                                return (
                                  <div
                                    key={x.type}
                                    title={[x.type, `${x.num}`, tickTodo].filter(Boolean).join(' · ')}
                                    className={cn(
                                      'bg-surface-raised inline-flex max-w-[min(100%,11rem)] min-w-0 items-center gap-x-0.5 rounded-full border border-white/15 px-1.5 py-px text-[7px] leading-tight text-slate-200 shadow-sm sm:text-[8px]',
                                      greenBorderOnly && 'border-emerald-500/50',
                                    )}
                                  >
                                    <span className='min-w-0 truncate font-medium text-slate-300'>{x.type}</span>
                                    <span className='shrink-0 font-semibold text-slate-50 tabular-nums'>{x.num}</span>
                                    {tickTodo ? (
                                      <span className='min-w-0 truncate text-slate-400'>· {tickTodo}</span>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {sector.accessClosed && (
                            <p className='type-micro mt-1 font-semibold text-red-300/95 drop-shadow'>
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
              <ProblemList storageKey={`area/${areaId}`} mode='sector' defaultOrder='grade-desc' rows={problemRows} />
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
