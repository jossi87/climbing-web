import { type ComponentProps, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ChartGradeDistribution from '../../shared/components/ChartGradeDistribution/ChartGradeDistribution';
import Top from '../../shared/components/Top/Top';
import Activity from '../../shared/components/Activity/Activity';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { getDistanceWithUnit } from '../../shared/components/Leaflet/geo-utils';
import Media from '../../shared/components/Media/Media';
import Todo from '../../shared/components/Todo/Todo';
import { Loading } from '../../shared/ui/StatusWidgets';
import { Stars, LockSymbol } from '../../shared/ui/Indicators';
import { WallDirection, SunOnWall } from '../../shared/components/Widgets/ClimbingWidgets';
import { ConditionLabels } from '../../shared/components/Widgets/ConditionLabels';
import { ExternalLinkLabels } from '../../shared/components/Widgets/ExternalLinkLabels';
import { NoDogsAllowed } from '../../shared/components/Widgets/NoDogsAllowed';
import { useMeta } from '../../shared/components/Meta/context';
import { getMediaFileUrl, useArea } from '../../api';
import { Markdown } from '../../shared/components/Markdown/Markdown';
import ProblemList from '../../shared/components/ProblemList';
import type { components } from '../../@types/buldreinfo/swagger';
import { DownloadButton } from '../../shared/ui/DownloadButton';
import {
  ChevronRight,
  Plus,
  Edit,
  AlertTriangle,
  Info,
  Image as ImageIcon,
  Map as MapIcon,
  BarChart2,
  Trophy,
  Clock,
  Bookmark,
  MapPin,
  Brush,
  Film,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = {
  sectorName: string;
  problem: NonNullable<NonNullable<components['schemas']['Area']['sectors']>[number]['problems']>[number];
};

const SectorListItem = ({ sectorName, problem }: Props) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? (problem.t?.subType ?? '') + ((problem.numPitches ?? 1) > 1 ? ', ' + problem.numPitches + ' pitches' : '')
    : null;
  const ascents = problem.numTicks && problem.numTicks === 1 ? '1 ascent' : (problem.numTicks ?? 0) + ' ascents';

  let faTypeAscents = problem.fa;
  if (problem.faDate) {
    faTypeAscents += ' ' + problem.faDate.substring(0, 4);
  }
  if (type && ascents) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ', ' + ascents + ')';
  } else if (type) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ')';
  } else if (ascents) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + ascents + ')';
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-x-4 gap-y-2 rounded-xl border p-3 transition-colors xl:flex-row xl:items-start',
        problem.ticked
          ? 'border-green-500/20 bg-green-500/5'
          : problem.todo
            ? 'border-blue-500/20 bg-blue-500/5'
            : 'bg-surface-card border-surface-border hover:border-brand/50 hover:bg-surface-nav/30',
      )}
    >
      <div className='flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex flex-wrap items-center gap-2'>
          {problem.danger && <AlertTriangle size={14} className='shrink-0 text-red-500' />}
          <Link to={`/problem/${problem.id}`} className='type-h2 hover:text-brand transition-colors'>
            {problem.name}
          </Link>
          <span className='font-mono text-[12px] text-slate-400 normal-case'>[{problem.grade}]</span>
          {problem.stars ? (
            <div className='flex shrink-0 origin-left scale-75 items-center'>
              <Stars numStars={problem.stars} includeStarOutlines={false} />
            </div>
          ) : null}
          <div className='text-[10px] whitespace-nowrap text-slate-500 italic'>
            {sectorName} #{problem.nr}
          </div>
          <LockSymbol lockedAdmin={!!problem.lockedAdmin} lockedSuperadmin={!!problem.lockedSuperadmin} />
        </div>

        <div className='flex shrink-0 flex-wrap items-center gap-2 text-slate-400'>
          {problem.coordinates && (
            <span title='Coordinates'>
              <MapPin size={12} />
            </span>
          )}
          {problem.hasTopo && (
            <span title='Topo'>
              <Brush size={12} />
            </span>
          )}
          {problem.hasImages && (
            <span title='Images'>
              <ImageIcon size={12} />
            </span>
          )}
          {problem.hasMovies && (
            <span title='Movies'>
              <Film size={12} />
            </span>
          )}
          {problem.ticked && (
            <span title='Ticked'>
              <CheckCircle2 size={12} className='text-green-500' />
            </span>
          )}
          {problem.todo && (
            <span title='To-Do'>
              <Bookmark size={12} className='text-blue-500' />
            </span>
          )}
        </div>
      </div>

      <div className='flex shrink-0 flex-col gap-0.5 xl:max-w-[40%] xl:text-right'>
        {faTypeAscents && <span className='text-[11px] font-medium text-slate-400'>{faTypeAscents}</span>}
        {(problem.rock || problem.comment) && (
          <span className='text-[11px] leading-relaxed text-slate-500 italic'>
            {problem.rock && <span className='mr-1 font-medium text-slate-400'>Rock: {problem.rock}.</span>}
            {problem.comment}
          </span>
        )}
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

  const outlines: ComponentProps<typeof Leaflet>['outlines'] = [];
  const slopes: ComponentProps<typeof Leaflet>['slopes'] = [];
  const showSlopeLengthOnOutline = (data.sectors?.filter((s) => s.approach && s.outline).length ?? 0) > 1;

  for (const s of data.sectors ?? []) {
    let distance: string | null = null;
    const approach = s.approach;
    if (approach?.coordinates?.length) {
      distance = getDistanceWithUnit(approach);
      const label = (!s.outline || !showSlopeLengthOnOutline) && distance ? distance : '';
      slopes.push({ backgroundColor: 'lime', slope: approach, label: label ?? '' });
    }
    if (s.descent?.coordinates?.length) {
      distance = getDistanceWithUnit(s.descent);
      const label = (!s.outline || !showSlopeLengthOnOutline) && distance ? distance : '';
      slopes.push({ backgroundColor: 'purple', slope: s.descent, label: label ?? '' });
    }
    if (s.outline?.length) {
      const label = (s.name ?? '') + (showSlopeLengthOnOutline && distance ? ' (' + distance + ')' : '');
      outlines.push({ url: '/sector/' + s.id, label, outline: s.outline });
    }
  }

  const tabs = [];
  if (data.media && data.media.length) tabs.push({ id: 'image', label: 'Media', icon: ImageIcon });
  if (markers.length || outlines.length || data.coordinates) tabs.push({ id: 'map', label: 'Map', icon: MapIcon });
  if (data.sectors?.length) {
    tabs.push({ id: 'distribution', label: 'Distribution', icon: BarChart2 });
    tabs.push({ id: 'top', label: 'Top', icon: Trophy });
    tabs.push({ id: 'activity', label: 'Activity', icon: Clock });
    tabs.push({ id: 'todo', label: 'Todo', icon: Bookmark });
  }

  if (activeTab === null && tabs.length > 0) setActiveTab(tabs[0].id);

  const problemRows = (data.sectors ?? [])
    .flatMap((sector) => {
      const name = sector.name ?? '';
      const problems = sector.problems ?? [];
      return problems.map((p) => ({
        element: <SectorListItem key={p.id} sectorName={name} problem={p} />,
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
        num: p.nr ?? 0,
        fa: !!p.fa,
        faDate: p.faDate ?? null,
      }));
    })
    .sort((a, b) => b.gradeNumber - a.gradeNumber);

  return (
    <div className='max-w-container mx-auto space-y-8 px-4 py-6 text-left'>
      <title>{`${data.name} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <Link to='/areas' className='transition-colors'>
            Areas
          </Link>
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <span>{data.name}</span>
            {data.forDevelopers && <span className='font-mono text-slate-500 normal-case'> (under development)</span>}
            <LockSymbol lockedAdmin={!!data.lockedAdmin} lockedSuperadmin={!!data.lockedSuperadmin} />
          </div>
        </nav>

        {meta.isAdmin && (
          <div className='flex items-center gap-2'>
            <Link
              to={`/sector/edit/${data.id}/0`}
              className='flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[10px] font-black tracking-wider text-green-500 uppercase transition-colors hover:bg-green-500/20'
            >
              <Plus size={14} /> Add Sector
            </Link>
            <Link
              to={`/area/edit/${data.id}`}
              className='bg-surface-nav border-surface-border hover:bg-surface-hover type-label flex items-center gap-1.5 rounded-lg border px-3 py-1.5 opacity-85 transition-colors hover:opacity-100'
            >
              <Edit size={14} /> Edit Area
            </Link>
          </div>
        )}
      </div>

      {data.accessClosed && (
        <div className='flex items-start gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4'>
          <AlertTriangle className='mt-0.5 shrink-0 text-red-500' />
          <div>
            <h3 className='mb-1 text-lg font-bold text-red-500'>Area closed!</h3>
            <p className='text-sm text-red-400'>{data.accessClosed}</p>
          </div>
        </div>
      )}

      {tabs.length > 0 && (
        <div className='space-y-4'>
          <div className='scrollbar-hide border-surface-border flex gap-2 overflow-x-auto border-b pb-2'>
            {tabs.map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-all',
                    activeTab === t.id
                      ? 'bg-brand shadow-brand/20 shadow-md'
                      : 'hover:bg-surface-nav opacity-70 hover:opacity-100',
                  )}
                >
                  <IconComp size={16} /> {t.label}
                </button>
              );
            })}
          </div>

          <div className='bg-surface-card border-surface-border min-h-75 overflow-hidden rounded-xl border'>
            {activeTab === 'image' && (
              <div className='p-4'>
                <Media
                  pitches={null}
                  media={data.media ?? []}
                  orderableMedia={orderableMedia}
                  carouselMedia={carouselMedia}
                  optProblemId={null}
                  showLocation={false}
                />
              </div>
            )}
            {activeTab === 'map' && (
              <Leaflet
                key={'area=' + data.id}
                autoZoom={true}
                height='50vh'
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
            )}
            {activeTab === 'distribution' && (
              <div className='p-6'>
                <ChartGradeDistribution idArea={data.id ?? 0} />
              </div>
            )}
            {activeTab === 'top' && (
              <div className='p-4'>
                <Top idArea={data.id ?? 0} idSector={0} />
              </div>
            )}
            {activeTab === 'activity' && (
              <div className='p-4'>
                <Activity idArea={data.id ?? 0} idSector={0} />
              </div>
            )}
            {activeTab === 'todo' && (
              <div className='p-4'>
                <Todo idArea={data.id ?? 0} idSector={0} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className='space-y-4'>
        <div className='space-y-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4'>
          <div className='flex items-center gap-2 text-xs font-black tracking-widest text-orange-500 uppercase'>
            <Info size={14} /> Restrictions
          </div>
          <div className='ml-6 text-sm text-orange-400'>
            {data.noDogsAllowed && <NoDogsAllowed />}
            {data.accessInfo && <p>{data.accessInfo}</p>}
          </div>
        </div>

        <div className='bg-surface-card border-surface-border space-y-4 rounded-2xl border p-6 shadow-sm'>
          <div className='flex flex-wrap gap-2'>
            <div className='bg-surface-nav border-surface-border rounded border px-3 py-1 text-xs text-slate-300'>
              Sectors: <span className='ml-1 font-bold'>{data.sectors?.length ?? 0}</span>
            </div>
            {data.typeNumTickedTodo?.map((t) => (
              <div
                key={t.type}
                className='bg-surface-nav border-surface-border rounded border px-3 py-1 text-xs text-slate-300'
              >
                {t.type}:{' '}
                <span className='ml-1 font-bold'>
                  {t.num} {t.ticked ? `(${t.ticked} ticked)` : ''}
                </span>
              </div>
            ))}
            <div className='bg-surface-nav border-surface-border rounded border px-3 py-1 text-xs text-slate-300'>
              Page views: <span className='ml-1 font-bold'>{data.pageViews}</span>
            </div>
            <DownloadButton href={`/areas/pdf?id=${data.id}`}>area.pdf</DownloadButton>
            {data.coordinates && data.coordinates.latitude && data.coordinates.longitude && (
              <ConditionLabels
                lat={data.coordinates.latitude}
                lng={data.coordinates.longitude}
                label={data.name ?? ''}
                wallDirectionCalculated={undefined}
                wallDirectionManual={undefined}
                sunFromHour={data.sunFromHour ?? 0}
                sunToHour={data.sunToHour ?? 0}
              />
            )}
            <ExternalLinkLabels externalLinks={data.externalLinks} />
          </div>
          <div className='text-sm leading-relaxed text-slate-300'>
            <Markdown content={data.comment} />
          </div>
          {(data.triviaMedia?.length ?? 0) > 0 && (
            <div className='border-surface-border/50 border-t pt-4'>
              <Media
                pitches={null}
                media={data.triviaMedia ?? []}
                orderableMedia={orderableMedia}
                carouselMedia={carouselMedia}
                optProblemId={null}
                showLocation={false}
              />
            </div>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        <div className='border-surface-border flex gap-2 border-b'>
          <button
            onClick={() => setActiveSectorTab('sectors')}
            className={cn(
              'border-b-2 px-6 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase transition-all',
              activeSectorTab === 'sectors' ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            Sectors ({data.sectors?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveSectorTab('problems')}
            className={cn(
              'border-b-2 px-6 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase transition-all',
              activeSectorTab === 'problems' ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100',
            )}
          >
            {meta.isBouldering ? 'Problems' : 'Routes'} ({problemRows.length})
          </button>
        </div>

        {activeSectorTab === 'sectors' ? (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {data.sectors?.map((sector) => (
              <Link
                key={sector.id}
                to={`/sector/${sector.id}`}
                className='group bg-surface-card border-surface-border hover:border-brand/50 flex overflow-hidden rounded-xl border transition-all'
              >
                <div className='bg-surface-nav min-h-30 w-1/3 shrink-0 overflow-hidden'>
                  <img
                    className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                    src={
                      sector.randomMediaId
                        ? getMediaFileUrl(sector.randomMediaId, sector.randomMediaVersionStamp ?? 0, false, {
                            minDimension: 150,
                          })
                        : '/png/image.png'
                    }
                    alt={sector.name ?? ''}
                  />
                </div>
                <div className='flex-1 space-y-2 p-4'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <h4 className='type-h2 group-hover:text-brand truncate transition-colors'>{sector.name}</h4>
                      <LockSymbol lockedAdmin={!!sector.lockedAdmin} lockedSuperadmin={!!sector.lockedSuperadmin} />
                    </div>
                    <div className='flex shrink-0'>
                      <WallDirection
                        wallDirectionCalculated={sector.wallDirectionCalculated}
                        wallDirectionManual={sector.wallDirectionManual}
                      />
                      <SunOnWall sunFromHour={sector.sunFromHour ?? 0} sunToHour={sector.sunToHour ?? 0} />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    {sector.typeNumTickedTodo?.map((x) => (
                      <div key={x.type} className='flex items-center gap-2 text-[11px] text-slate-400'>
                        <Layers
                          size={12}
                          className={cn(
                            x.type === 'Projects'
                              ? 'text-blue-500'
                              : x.type === 'Broken'
                                ? 'text-red-500'
                                : 'text-slate-600',
                          )}
                        />
                        <span>
                          {x.type}: {x.num}{' '}
                          {x.ticked || x.todo
                            ? `(${[x.ticked && `${x.ticked} ticked`, x.todo && `${x.todo} todo`].filter(Boolean).join(', ')})`
                            : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  {sector.accessClosed && (
                    <div className='text-[10px] font-bold text-red-500 uppercase'>{sector.accessClosed}</div>
                  )}
                  <div className='line-clamp-2 text-xs text-slate-500 italic'>
                    <Markdown content={sector.comment} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <ProblemList storageKey={`area/${areaId}`} mode='sector' defaultOrder='grade-desc' rows={problemRows} />
        )}
      </div>
    </div>
  );
};

export default Area;
