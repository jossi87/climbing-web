import { Trans, useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Link } from 'react-router-dom';
import Chart from '../Chart/Chart';
import ProblemList from '../ProblemList';
import type { Row } from '../ProblemList/types';
import Leaflet from '../Leaflet/Leaflet';
import { LockSymbol, Stars } from '../../ui/Indicators';
import { Loading } from '../../ui/StatusWidgets';
import { useProfileAscents } from '../../../api';
import { useMeta } from '../Meta';
import type { components } from '../../../@types/buldreinfo/swagger';
import { AlertCircle } from 'lucide-react';
import { NoPersonalGradeBadge } from '../../ui/NoPersonalGradeBadge';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { twInk } from '../../../design/twInk';
import { TradGearMarker } from '../../ui/TradGearMarker';
import { formatPassiveGearMarkerLine, formatRouteTypeLabel } from '../../../utils/routeTradGear';
import { ProfileRowTextSep } from './ProfileRowTextSep';
import {
  profileRowRootClass,
  tickCommentSmall,
  tickCrag,
  tickCragLinkArea,
  tickCragLinkSector,
  tickFa,
  tickFlags,
  tickProblemLink,
  tickWhenGrade,
} from './profileRowTypography';
import { captureSentryException } from '../../../utils/sentry';
import type { MarkerDef } from '../Leaflet/markers';

type TickListItemProps = {
  tick: components['schemas']['ProfileAscent'];
};

const TickListItem = ({ tick }: TickListItemProps) => <TickListItemInner tick={tick} />;

const TickListItemInner = ({ tick }: TickListItemProps) => {
  const { t } = useTranslation();
  const { isClimbing } = useMeta();
  const areaId = tick.areaId;
  const sectorId = tick.sectorId;
  const hasSector =
    (sectorId != null && sectorId > 0) || (typeof tick.sectorName === 'string' && tick.sectorName.trim() !== '');
  const pitchCount = tick.numPitches ?? 0;
  const multiPitch = pitchCount > 1;
  const routeTypeLabel = formatRouteTypeLabel(undefined, tick.subType);
  /** Passive-gear glyph: driven by the DB flag (`tradGear`), never by the type/subtype text. */
  const showPassiveGear = !!tick.tradGear;
  const passiveGearLine = showPassiveGear ? formatPassiveGearMarkerLine(routeTypeLabel, tick.numPitches, t) : '';

  return (
    <div className={profileRowRootClass}>
      {tick.dateHr ? (
        <>
          <span className={cn(tickFlags, 'tabular-nums')}>{tick.dateHr}</span>{' '}
        </>
      ) : null}
      {areaId ? (
        <Link to={`/area/${areaId}`} className={tickCragLinkArea}>
          {tick.areaName}
        </Link>
      ) : (
        <span className={tickCrag}>{tick.areaName}</span>
      )}
      <LockSymbol lockedAdmin={!!tick.areaLockedAdmin} lockedSuperadmin={!!tick.areaLockedSuperadmin} />
      {hasSector ? (
        <>
          <ProfileRowTextSep />
          {sectorId ? (
            <Link to={`/sector/${sectorId}`} className={tickCragLinkSector}>
              {tick.sectorName}
            </Link>
          ) : (
            <span className={tickCrag}>{tick.sectorName}</span>
          )}
          <LockSymbol lockedAdmin={!!tick.sectorLockedAdmin} lockedSuperadmin={!!tick.sectorLockedSuperadmin} />
        </>
      ) : null}
      <ProfileRowTextSep />
      <Link to={`/problem/${tick.idProblem}`} className={tickProblemLink}>
        {tick.name}
      </Link>{' '}
      <span className={cn(tickWhenGrade, 'whitespace-nowrap tabular-nums')}>{tick.grade}</span>
      {showPassiveGear ? <TradGearMarker line={passiveGearLine} /> : null}
      <LockSymbol lockedAdmin={!!tick.lockedAdmin} lockedSuperadmin={!!tick.lockedSuperadmin} />{' '}
      <span className='inline-flex align-middle'>
        <Stars muted numStars={tick.stars ?? 0} size={12} />
      </span>
      {tick.fa ? (
        <>
          {' '}
          <span className={tickFa}>FA</span>
        </>
      ) : null}
      {isClimbing && tick.idTickRepeat ? (
        <>
          {' '}
          <span className={tickFlags}>{t('profile.statistics.repeatChip')}</span>
        </>
      ) : null}
      {tick.noPersonalGrade ? (
        <>
          {' '}
          <NoPersonalGradeBadge variant='dense' />
        </>
      ) : null}
      {!showPassiveGear && multiPitch ? (
        <>
          {' '}
          <span className={tickFlags}>{t('problems.metaPitches', { count: pitchCount })}</span>
        </>
      ) : null}
      {tick.comment ? (
        <>
          {' '}
          <span className={tickCommentSmall}>{tick.comment}</span>
        </>
      ) : null}
    </div>
  );
};

type ProfileStatisticsProps = {
  userId: number;
  view: 'overview' | 'map' | 'ascents';
  disciplines?: components['schemas']['ProfileDiscipline'][];
  kpis?: components['schemas']['ProfileKpis'];
};

/**
 * Heading of an overview card. A whole phrase per discipline rather than the API's type name plus a chip: the locale
 * decides the word order and the plural (“Sport routes”, “Sportovní cesty”), while the API only sends the singular
 * type noun. A combination the client does not model — an unnamed type, or one without a bolting style — falls back to
 * the API name.
 */
const chartHeading = (d: components['schemas']['ProfileDiscipline'], t: TFunction): string => {
  if (d.isBouldering) {
    return t('profile.statistics.overviewHeadingBoulder');
  }
  if (d.isIceClimbing) {
    return t('profile.statistics.overviewHeadingIce');
  }
  if (d.multiPitch) {
    return t('profile.statistics.overviewHeadingMultiPitch');
  }
  if (d.isBolted == null) {
    return d.type ?? t('profile.statistics.unknownType');
  }
  return d.isBolted ? t('profile.statistics.overviewHeadingSport') : t('profile.statistics.overviewHeadingTraditional');
};

/**
 * Overview sub-component — one card per problem type, grade system and pitch kind: a grade axis only means something
 * inside a single system, and sport (`is_bolted = 1`) and traditional (`is_bolted = 0`) are different efforts even when
 * they share one, so the style is part of the chart key. Multi-pitch is the exception: those charts drop the bolting
 * style (the API reports no `is_bolted`), so sport and traditional multi-pitch ascents of one type share a card. Ice
 * climbs get a card of their own because they share the “Route” type name with rope routes, and the API orders the
 * cards with the visiting site's own disciplines first. The heading spells the discipline out instead of tacking a chip
 * onto the type name — see {@link chartHeading} — and the scale it is graded in sits beside that heading as a quiet
 * subtitle, because a card never spans two scales.
 */
const ProfileOverview = ({ disciplines }: { disciplines: components['schemas']['ProfileDiscipline'][] }) => {
  const { t } = useTranslation();
  if (!disciplines.length) {
    return <div className='py-10 text-center text-slate-500'>{t('profile.statistics.noGradeData')}</div>;
  }

  return (
    <div className={cn('-mx-4 grid grid-cols-1 gap-6 sm:-mx-6', disciplines.length > 1 && 'sm:grid-cols-2')}>
      {disciplines.map((d) => {
        const gradeDist = d.gradeDistribution ?? [];
        const totalAscents = gradeDist.reduce((sum, g) => sum + (g.fa ?? 0) + (g.tick ?? 0), 0);
        const totalFas = gradeDist.reduce((sum, g) => sum + (g.fa ?? 0), 0);
        const totalTicks = gradeDist.reduce((sum, g) => sum + (g.tick ?? 0), 0);
        // The heading carries the discipline; a multi-pitch chart has no bolting style (sport and traditional share it)
        // and boulders are unbolted by nature, so their phrases name the discipline without a style.
        const heading = chartHeading(d, t);
        const discipline = d.isBouldering ? 'boulder' : d.isIceClimbing ? 'ice' : 'rope';
        const gradeSystem = d.gradeSystem ?? t('profile.statistics.unknownGradeSystem');

        return (
          <div
            key={`${d.type ?? ''}-${d.isBolted ?? 'any'}-${d.gradeSystemId ?? 0}-${d.multiPitch ? 'multi' : 'single'}-${discipline}`}
            className='overflow-hidden'
          >
            <div className='bg-surface-raised px-4 py-3 sm:px-5'>
              {/*
                The scale reads as the heading's subtitle: one line with it while it fits, one step down in size, weight
                and ink (the meta row below keeps only how much was climbed). It wraps under the heading rather than
                truncating when a two-column card gets too narrow for both, so the scale name is never cut.
              */}
              <div className='flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                <h3 className='min-w-0 truncate font-semibold text-slate-100'>{heading}</h3>
                <span className='type-small shrink-0 font-normal'>{gradeSystem}</span>
              </div>
              <div className='mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-slate-400'>
                <span className='tabular-nums'>
                  <Trans
                    i18nKey='profile.statistics.overviewAscents'
                    count={totalAscents}
                    values={{
                      fa: t('profile.statistics.overviewFa', { numFa: totalFas }),
                      ticks: t('profile.statistics.overviewTicks', { count: totalTicks }),
                    }}
                    components={{ count: <span className='font-medium text-slate-200' /> }}
                  />
                </span>
              </div>
            </div>
            {/* Grade distribution chart */}
            <div className='bg-surface-card px-4 py-3 sm:px-5'>
              <Chart gradeDistribution={gradeDist} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Compute area-level markers from filtered ProblemList rows.
 * Groups rows by areaName, computes centroid from marker coordinates,
 * and builds a popup listing all problems in that area.
 */
function computeFilteredAreaMarkers(rows: Row[]): MarkerDef[] {
  // Group rows by area
  const areaGroups = new Map<string, { areaName: string; rows: Row[] }>();

  for (const row of rows) {
    if (!row.marker?.coordinates) continue;
    const key = row.areaName;
    const existing = areaGroups.get(key);
    if (existing) {
      existing.rows.push(row);
    } else {
      areaGroups.set(key, { areaName: key, rows: [row] });
    }
  }

  const markers: MarkerDef[] = [];

  for (const [, group] of areaGroups) {
    const rowsWithCoords = group.rows.filter((r) => r.marker?.coordinates);
    if (rowsWithCoords.length === 0) continue;

    // Compute centroid
    const sumLat = rowsWithCoords.reduce((sum, r) => sum + r.marker!.coordinates.latitude, 0);
    const sumLng = rowsWithCoords.reduce((sum, r) => sum + r.marker!.coordinates.longitude, 0);
    const centerLat = sumLat / rowsWithCoords.length;
    const centerLng = sumLng / rowsWithCoords.length;

    // Group by sector for the popup
    const sectorGroups = new Map<string, Row[]>();
    for (const row of rowsWithCoords) {
      const key = row.sectorName;
      const existing = sectorGroups.get(key);
      if (existing) {
        existing.push(row);
      } else {
        sectorGroups.set(key, [row]);
      }
    }

    // Sort problems by number within each sector group
    for (const sectorRows of sectorGroups.values()) {
      sectorRows.sort((a, b) => (a.nr ?? 0) - (b.nr ?? 0));
    }

    // Sort sectors by name
    const sortedSectors = Array.from(sectorGroups.entries()).sort(([aName], [bName]) => aName.localeCompare(bName));

    const popupContent = (
      <div className='max-h-[280px] min-w-48 space-y-3 overflow-y-auto py-1'>
        {sortedSectors.map(([sectorName, sectorRows]) => (
          <div key={sectorName} className='space-y-1'>
            <div className='flex items-center gap-1'>
              <span className={cn(designContract.typography.meta, 'font-medium text-slate-400')}>{sectorName}</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              {sectorRows.map((row, idx) => (
                <div key={`${row.name}-${idx}`} className='flex items-baseline gap-1.5 pl-2'>
                  {row.nr != null ? <span className={cn(designContract.typography.grade)}>#{row.nr}</span> : null}
                  <a
                    href={row.marker!.url}
                    className={cn(
                      designContract.typography.body,
                      'buldreinfo-popup-primary-link font-medium underline-offset-2 transition-colors hover:underline',
                    )}
                  >
                    {row.name}
                  </a>
                  {row.grade ? <span className={cn(designContract.typography.grade)}>{row.grade}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    markers.push({
      id: group.areaName.charCodeAt(0) + markers.length,
      coordinates: { latitude: centerLat, longitude: centerLng },
      label: `${group.areaName} [${rowsWithCoords.length}]`,
      html: popupContent,
    } as MarkerDef);
  }

  return markers;
}

/** Ascents sub-component — fetches /profile/ascents only when this view is active. */
const ProfileAscentsView = ({ userId }: { userId: number }) => {
  const { t } = useTranslation();
  const { defaultCenter, defaultZoom } = useMeta();
  const { data: ascents, isLoading, error } = useProfileAscents(userId);

  /**
   * One type's summary sentence — the row's `title` and the block's `aria-label` render the same reading.
   * Plural-aware, so a locale inflects the count instead of receiving an English `_other` fallback.
   */
  const typeSummaryTitle = (s: { header: string; count: number; numFa: number }) =>
    t(s.numFa > 0 ? 'profile.statistics.ascentsSummaryFa' : 'profile.statistics.ascentsSummary', {
      header: s.header,
      count: s.count,
      numFa: s.numFa,
    });

  if (isLoading) return <Loading inline />;

  if (error || !ascents) {
    captureSentryException(error, { userId });
    return (
      <div className='py-12 text-center'>
        <AlertCircle size={48} className='mx-auto mb-4 text-red-500' />
        <h3 className='type-h2 mb-2'>{t('profile.statistics.error')}</h3>
        <p className='text-slate-400'>{t('profile.statistics.loadError')}</p>
      </div>
    );
  }

  if (!ascents.length) {
    return <div className='py-10 text-center text-slate-400'>{t('profile.statistics.noAscents')}</div>;
  }

  return (
    <ProblemList
      key={`user/${userId}/ascents`}
      storageKey={`user/${userId}`}
      mode='user'
      defaultOrder='date'
      leadingBottomClassName='mb-2 sm:mb-2.5'
      contentBeforeList={(filteredRows) => {
        type TypeBucket = { count: number; numFa: number };
        const buckets = new Map<string, TypeBucket>();
        for (const row of filteredRows) {
          /**
           * Ascents are summarised per problem type, straight from the database (`type.subType`). Never folded into
           * the grade-based «Projects» bucket that the type filter (`rowListTypeKey`) uses.
           */
          const key = row.subType;
          const prev = buckets.get(key) ?? { count: 0, numFa: 0 };
          prev.count += 1;
          if (row.fa) prev.numFa += 1;
          buckets.set(key, prev);
        }
        const ascentTypeSummaries = [...buckets.entries()]
          .map(([header, { count, numFa }]) => ({ key: header, header, count, numFa }))
          .filter((s) => s.count > 0)
          .sort((a, b) => a.header.localeCompare(b.header, undefined, { sensitivity: 'base' }));

        const typeSummaryBlock =
          ascentTypeSummaries.length > 1 ? (
            <div
              className='min-w-0'
              role='status'
              aria-label={ascentTypeSummaries.map((s) => typeSummaryTitle(s)).join('. ')}
            >
              <div className='flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[13px] leading-snug sm:gap-x-6 sm:text-sm'>
                {ascentTypeSummaries.map((s, i) => (
                  <div
                    key={s.key}
                    className={cn(
                      'inline-flex max-w-full min-w-0 items-center gap-x-2 sm:whitespace-nowrap',
                      i > 0 && 'border-surface-border border-l pl-3 sm:pl-4',
                    )}
                    title={typeSummaryTitle(s)}
                  >
                    <span className={cn('font-semibold text-slate-200', twInk.lightTextSlate800)}>{s.header}:</span>
                    <span className={cn('text-slate-300 tabular-nums', twInk.lightTextSlate700)}>{s.count}</span>
                    {s.numFa > 0 ? (
                      <span className={cn('font-normal tabular-nums', designContract.ascentStatus.ticked)}>
                        {t('profile.statistics.faCount', { numFa: s.numFa })}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null;

        // Compute area-level markers from the filtered rows so the map updates when filtering
        const filteredAreaMarkers = computeFilteredAreaMarkers(filteredRows);

        const mapBlock =
          filteredAreaMarkers.length > 0 ? (
            <div className='-mx-4 mb-2 h-[35vh] w-[calc(100%+2rem)] min-w-0 overflow-hidden sm:-mx-6 sm:w-[calc(100%+3rem)]'>
              <Leaflet
                key={'ticked-inline=' + userId + '-areas'}
                autoZoom={true}
                height='100%'
                markers={filteredAreaMarkers}
                defaultCenter={defaultCenter}
                defaultZoom={defaultZoom}
                clusterMarkers={true}
                flyToId={null}
              />
            </div>
          ) : null;

        if (!typeSummaryBlock && !mapBlock) return null;
        return (
          <>
            {mapBlock}
            {typeSummaryBlock ? <div className='min-w-0'>{typeSummaryBlock}</div> : null}
          </>
        );
      }}
      rows={ascents.map((t) => ({
        element: <TickListItem key={`${t.idProblem}-${t.idTickRepeat ?? '0'}-${t.dateHr ?? ''}`} tick={t} />,
        areaName: t.areaName ?? '',
        sectorName: t.sectorName ?? '',
        name: t.name ?? '',
        nr: t.nr ?? null,
        grade: t.grade ?? '',
        gradeWeight: t.gradeWeight ?? 0,
        gradeSystemId: t.gradeSystemId ?? 0,
        stars: t.stars ?? 0,
        numTicks: 0,
        ticked: false,
        rock: '',
        subType: t.subType ?? '',
        discipline: t.discipline ?? '',
        isBouldering: t.isBouldering ?? false,
        isRopeClimbing: t.isRopeClimbing ?? false,
        isIceClimbing: t.isIceClimbing ?? false,
        num: t.num ?? 0,
        fa: t.fa ?? false,
        faDate: null,
        marker:
          t.coordinates?.latitude != null && t.coordinates?.longitude != null
            ? {
                coordinates: {
                  latitude: t.coordinates.latitude,
                  longitude: t.coordinates.longitude,
                },
                label: t.name ?? '',
                url: '/problem/' + t.idProblem,
              }
            : undefined,
      }))}
    />
  );
};

const ProfileStatistics = ({ userId, view, disciplines }: ProfileStatisticsProps) => {
  if (view === 'overview') {
    return <ProfileOverview disciplines={disciplines ?? []} />;
  }

  if (view === 'ascents') {
    return <ProfileAscentsView userId={userId} />;
  }

  return null;
};

export default ProfileStatistics;
