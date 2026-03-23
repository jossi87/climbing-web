import { type ComponentProps, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ChartGradeDistribution from './common/chart-grade-distribution/chart-grade-distribution';
import Top from './common/top/top';
import Activity from './common/activity/activity';
import Leaflet from './common/leaflet/leaflet';
import { getDistanceWithUnit } from './common/leaflet/geo-utils';
import Media from './common/media/media';
import Todo from './common/todo/todo';
import {
  Stars,
  LockSymbol,
  Loading,
  ConditionLabels,
  WallDirection,
  SunOnWall,
  ExternalLinkLabels,
  NoDogsAllowed,
} from './common/widgets/widgets';
import { useMeta } from './common/meta/context';
import { getMediaFileUrl, useArea } from '../api';
import { Markdown } from './Markdown/Markdown';
import ProblemList from './common/problem-list';
import type { components } from '../@types/buldreinfo/swagger';
import { DownloadButton } from '../components/ui/DownloadButton';
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
import { cn } from '../lib/utils';

type Props = {
  sectorName: string;
  problem: NonNullable<
    NonNullable<components['schemas']['Area']['sectors']>[number]['problems']
  >[number];
};

const SectorListItem = ({ sectorName, problem }: Props) => {
  const { isClimbing } = useMeta();
  const type = isClimbing
    ? (problem.t?.subType ?? '') +
      ((problem.numPitches ?? 1) > 1 ? ', ' + problem.numPitches + ' pitches' : '')
    : null;
  const ascents =
    problem.numTicks && problem.numTicks === 1 ? '1 ascent' : (problem.numTicks ?? 0) + ' ascents';

  let faTypeAscents = problem.fa;
  if (problem.faDate) {
    faTypeAscents += ' ' + problem.faDate.substring(0, 4);
  }
  if (type && ascents) {
    faTypeAscents =
      (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ', ' + ascents + ')';
  } else if (type) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + type + ')';
  } else if (ascents) {
    faTypeAscents = (faTypeAscents != null ? faTypeAscents + ' (' : '(') + ascents + ')';
  }

  return (
    <div
      className={cn(
        'flex flex-col xl:flex-row xl:items-start gap-x-4 gap-y-2 p-3 rounded-xl transition-colors border',
        problem.ticked
          ? 'bg-green-500/5 border-green-500/20'
          : problem.todo
            ? 'bg-blue-500/5 border-blue-500/20'
            : 'bg-surface-card border-surface-border hover:border-brand/50 hover:bg-surface-nav/30',
      )}
    >
      <div className='flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          {problem.danger && <AlertTriangle size={14} className='text-red-500 shrink-0' />}
          <Link
            to={`/problem/${problem.id}`}
            className='text-[15px] font-bold text-white hover:text-brand transition-colors'
          >
            {problem.name}
          </Link>
          <span className='text-[12px] font-mono text-slate-400 normal-case'>
            [{problem.grade}]
          </span>
          {problem.stars ? (
            <div className='scale-75 origin-left flex items-center shrink-0'>
              <Stars numStars={problem.stars} includeStarOutlines={false} />
            </div>
          ) : null}
          <div className='text-[10px] text-slate-500 italic whitespace-nowrap'>
            {sectorName} #{problem.nr}
          </div>
          <LockSymbol
            lockedAdmin={!!problem.lockedAdmin}
            lockedSuperadmin={!!problem.lockedSuperadmin}
          />
        </div>

        <div className='flex items-center gap-2 text-slate-400 shrink-0 flex-wrap'>
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

      <div className='flex flex-col gap-0.5 xl:text-right shrink-0 xl:max-w-[40%]'>
        {faTypeAscents && (
          <span className='text-[11px] text-slate-400 font-medium'>{faTypeAscents}</span>
        )}
        {(problem.rock || problem.comment) && (
          <span className='text-[11px] text-slate-500 italic leading-relaxed'>
            {problem.rock && (
              <span className='mr-1 text-slate-400 font-medium'>Rock: {problem.rock}.</span>
            )}
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
      <div className='max-w-2xl mx-auto mt-12 p-8 bg-surface-card border border-surface-border rounded-2xl text-center space-y-4'>
        <AlertTriangle size={48} className='mx-auto text-red-500 opacity-50' />
        <h2 className='text-2xl font-black text-white'>404 Error</h2>
        <p className='text-slate-400'>
          Cannot find the specified area because it does not exist or you do not have sufficient
          permissions.
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
  const showSlopeLengthOnOutline =
    (data.sectors?.filter((s) => s.approach && s.outline).length ?? 0) > 1;

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
      const label =
        (s.name ?? '') + (showSlopeLengthOnOutline && distance ? ' (' + distance + ')' : '');
      outlines.push({ url: '/sector/' + s.id, label, outline: s.outline });
    }
  }

  const tabs = [];
  if (data.media && data.media.length) tabs.push({ id: 'image', label: 'Media', icon: ImageIcon });
  if (markers.length || outlines.length || data.coordinates)
    tabs.push({ id: 'map', label: 'Map', icon: MapIcon });
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
    <div className='max-w-container mx-auto px-4 py-6 space-y-8 text-left'>
      <title>{`${data.name} | ${meta?.title}`}</title>
      <meta name='description' content={data.comment} />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase'>
          <Link to='/areas' className='hover:text-white transition-colors'>
            Areas
          </Link>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <span>{data.name}</span>
            {data.forDevelopers && (
              <span className='text-slate-500 font-mono normal-case'> (under development)</span>
            )}
            <LockSymbol
              lockedAdmin={!!data.lockedAdmin}
              lockedSuperadmin={!!data.lockedSuperadmin}
            />
          </div>
        </nav>

        {meta.isAdmin && (
          <div className='flex items-center gap-2'>
            <Link
              to={`/sector/edit/${data.id}/0`}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-colors text-[10px] font-black uppercase tracking-wider'
            >
              <Plus size={14} /> Add Sector
            </Link>
            <Link
              to={`/area/edit/${data.id}`}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-nav border border-surface-border text-slate-300 hover:text-white hover:bg-surface-hover transition-colors text-[10px] font-black uppercase tracking-wider'
            >
              <Edit size={14} /> Edit Area
            </Link>
          </div>
        )}
      </div>

      {data.accessClosed && (
        <div className='flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl'>
          <AlertTriangle className='text-red-500 shrink-0 mt-0.5' />
          <div>
            <h3 className='text-red-500 font-bold text-lg mb-1'>Area closed!</h3>
            <p className='text-red-400 text-sm'>{data.accessClosed}</p>
          </div>
        </div>
      )}

      {tabs.length > 0 && (
        <div className='space-y-4'>
          <div className='flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-surface-border'>
            {tabs.map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap',
                    activeTab === t.id
                      ? 'bg-brand text-white shadow-md shadow-brand/20'
                      : 'text-slate-400 hover:text-white hover:bg-surface-nav',
                  )}
                >
                  <IconComp size={16} /> {t.label}
                </button>
              );
            })}
          </div>

          <div className='bg-surface-card border border-surface-border rounded-xl overflow-hidden min-h-75'>
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
        <div className='bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 space-y-3'>
          <div className='flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest'>
            <Info size={14} /> Restrictions
          </div>
          <div className='text-orange-400 text-sm ml-6'>
            {data.noDogsAllowed && <NoDogsAllowed />}
            {data.accessInfo && <p>{data.accessInfo}</p>}
          </div>
        </div>

        <div className='bg-surface-card border border-surface-border rounded-2xl p-6 shadow-sm space-y-4'>
          <div className='flex flex-wrap gap-2'>
            <div className='px-3 py-1 rounded bg-surface-nav border border-surface-border text-xs text-slate-300'>
              Sectors:{' '}
              <span className='font-bold text-white ml-1'>{data.sectors?.length ?? 0}</span>
            </div>
            {data.typeNumTickedTodo?.map((t) => (
              <div
                key={t.type}
                className='px-3 py-1 rounded bg-surface-nav border border-surface-border text-xs text-slate-300'
              >
                {t.type}:{' '}
                <span className='font-bold text-white ml-1'>
                  {t.num} {t.ticked ? `(${t.ticked} ticked)` : ''}
                </span>
              </div>
            ))}
            <div className='px-3 py-1 rounded bg-surface-nav border border-surface-border text-xs text-slate-300'>
              Page views: <span className='font-bold text-white ml-1'>{data.pageViews}</span>
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
          <div className='text-slate-300 text-sm leading-relaxed'>
            <Markdown content={data.comment} />
          </div>
          {(data.triviaMedia?.length ?? 0) > 0 && (
            <div className='pt-4 border-t border-surface-border/50'>
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
        <div className='flex gap-2 border-b border-surface-border'>
          <button
            onClick={() => setActiveSectorTab('sectors')}
            className={cn(
              'px-6 py-2 text-sm font-bold transition-all border-b-2',
              activeSectorTab === 'sectors'
                ? 'border-brand text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            Sectors ({data.sectors?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveSectorTab('problems')}
            className={cn(
              'px-6 py-2 text-sm font-bold transition-all border-b-2',
              activeSectorTab === 'problems'
                ? 'border-brand text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            {meta.isBouldering ? 'Problems' : 'Routes'} ({problemRows.length})
          </button>
        </div>

        {activeSectorTab === 'sectors' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {data.sectors?.map((sector) => (
              <Link
                key={sector.id}
                to={`/sector/${sector.id}`}
                className='group flex bg-surface-card border border-surface-border rounded-xl overflow-hidden hover:border-brand/50 transition-all'
              >
                <div className='w-1/3 min-h-30 shrink-0 overflow-hidden bg-surface-nav'>
                  <img
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    src={
                      sector.randomMediaId
                        ? getMediaFileUrl(
                            sector.randomMediaId,
                            sector.randomMediaVersionStamp ?? 0,
                            false,
                            { minDimension: 150 },
                          )
                        : '/png/image.png'
                    }
                    alt={sector.name ?? ''}
                  />
                </div>
                <div className='p-4 flex-1 space-y-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <h4 className='font-black uppercase tracking-tight text-white group-hover:text-brand transition-colors truncate'>
                        {sector.name}
                      </h4>
                      <LockSymbol
                        lockedAdmin={!!sector.lockedAdmin}
                        lockedSuperadmin={!!sector.lockedSuperadmin}
                      />
                    </div>
                    <div className='flex shrink-0'>
                      <WallDirection
                        wallDirectionCalculated={sector.wallDirectionCalculated}
                        wallDirectionManual={sector.wallDirectionManual}
                      />
                      <SunOnWall
                        sunFromHour={sector.sunFromHour ?? 0}
                        sunToHour={sector.sunToHour ?? 0}
                      />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    {sector.typeNumTickedTodo?.map((x) => (
                      <div
                        key={x.type}
                        className='flex items-center gap-2 text-[11px] text-slate-400'
                      >
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
                    <div className='text-[10px] font-bold text-red-500 uppercase'>
                      {sector.accessClosed}
                    </div>
                  )}
                  <div className='text-xs text-slate-500 line-clamp-2 italic'>
                    <Markdown content={sector.comment} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <ProblemList
            storageKey={`area/${areaId}`}
            mode='sector'
            defaultOrder='grade-desc'
            rows={problemRows}
          />
        )}
      </div>
    </div>
  );
};

export default Area;
