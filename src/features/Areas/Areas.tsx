import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { LockSymbol } from '../../shared/ui/Indicators';
import { useAreas } from '../../api';
import { useMeta } from '../../shared/components/Meta/context';
import Dropdown from '../../shared/components/dropdown/dropdown';
import { Map as MapIcon, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, SectionHeader } from '../../shared/ui';

const Areas = () => {
  const navigate = useNavigate();
  const { data } = useAreas();
  const meta = useMeta();
  const [showForDevelopers, setShowForDevelopers] = useState(false);
  const areas = useMemo(() => data ?? [], [data]);

  const hasDeveloperAreas = useMemo(() => areas.some((a) => a.forDevelopers), [areas]);

  const filteredData = useMemo(
    () => areas.filter((a) => (hasDeveloperAreas ? Boolean(a.forDevelopers) === showForDevelopers : !a.forDevelopers)),
    [areas, hasDeveloperAreas, showForDevelopers],
  );

  const groupedRegions = useMemo(() => {
    const areasByRegion = filteredData.reduce((acc, area) => {
      const regionName = area.regionName?.trim() || 'Unknown region';
      const existing = acc.get(regionName) ?? [];
      existing.push(area);
      acc.set(regionName, existing);
      return acc;
    }, new Map<string, (typeof filteredData)[number][]>());

    return [...areasByRegion.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredData]);

  const areaRegionById = useMemo(() => {
    const regionById = new Map<number, string>();
    groupedRegions.forEach(([regionName, regionAreas]) => {
      regionAreas.forEach((area) => {
        if (typeof area.id === 'number') {
          regionById.set(area.id, regionName);
        }
      });
    });
    return regionById;
  }, [groupedRegions]);

  const showRegionGrouping = groupedRegions.length > 1;

  if (!data) {
    return <Loading />;
  }

  const typeDescription = meta.isBouldering ? 'problems' : 'routes';

  const markers = filteredData
    .filter((a) => a.coordinates)
    .map((a) => {
      return {
        id: a.id ?? 0,
        coordinates: {
          latitude: a.coordinates?.latitude ?? 0,
          longitude: a.coordinates?.longitude ?? 0,
        },
        label: a.name ?? '',
        url: '/area/' + (a.id ?? 0),
        html: (
          <div className='flex min-w-56 flex-col gap-1.5 p-1 text-left'>
            <div className='flex items-center gap-2'>
              <Link to={'/area/' + (a.id ?? 0)} className='hover:text-brand text-[12px] font-normal transition-colors'>
                {a.name}
              </Link>
              <LockSymbol lockedAdmin={!!a.lockedAdmin} lockedSuperadmin={!!a.lockedSuperadmin} />
            </div>
            <div className='text-[12px] text-slate-400'>
              {a.numSectors ?? 0} sectors, {a.numProblems ?? 0} {typeDescription}
            </div>
          </div>
        ),
      };
    });

  return (
    <div className='w-full min-w-0'>
      <title>{`Areas | ${meta?.title}`}</title>
      <meta name='description' content={`${data.length} areas for climbing.`} />

      <Card flush className='min-w-0 border-0'>
        <div className='relative p-4 pb-3 sm:p-5 sm:pb-4'>
          <div className='flex items-center justify-between'>
            <SectionHeader title='Areas' icon={MapIcon} subheader={`${filteredData.length} areas`} />

            {hasDeveloperAreas ? (
              <div className='mb-3 flex flex-wrap items-center gap-2'>
                <div className='bg-surface-raised border-surface-border/60 inline-flex h-8 items-center gap-1 rounded-full border p-0.5 pl-2 shadow-sm'>
                  <span className='type-micro shrink-0 text-slate-300'>Dataset:</span>
                  <button
                    type='button'
                    onClick={() => setShowForDevelopers(false)}
                    className={cn(
                      'inline-flex h-6 items-center rounded-full px-2.5 text-[12px] leading-none font-medium transition-colors sm:text-[13px]',
                      !showForDevelopers
                        ? designContract.surfaces.segmentActiveBrandBorder
                        : designContract.surfaces.segmentInactiveInGroup,
                    )}
                  >
                    Developed
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowForDevelopers(true)}
                    className={cn(
                      'inline-flex h-6 items-center rounded-full px-2.5 text-[12px] leading-none font-medium transition-colors sm:text-[13px]',
                      showForDevelopers
                        ? designContract.surfaces.segmentActiveBrandBorder
                        : designContract.surfaces.segmentInactiveInGroup,
                    )}
                  >
                    Developers
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className='mb-3 flex items-center gap-2'>
            <Dropdown
              data={filteredData}
              isSearchable={true}
              getLabel={(area) => area.name ?? `Area ${area.id ?? 0}`}
              getGroupLabel={
                showRegionGrouping
                  ? (area) =>
                      (typeof area.id === 'number' ? areaRegionById.get(area.id) : undefined) || 'Unknown region'
                  : undefined
              }
              getKey={(area, index) => area.id ?? index}
              placeholder='Select area'
              searchPlaceholder='Search area ...'
              emptyMessage='No areas found'
              className='w-full max-w-xl'
              onClick={(area) => {
                if (!area.id) return;
                navigate(`/area/${area.id}`);
              }}
            />

            {meta.isAdmin ? (
              <Link
                to={`/area/edit/-1`}
                title='Add area'
                aria-label='Add area'
                data-ph-action='add'
                className={cn(
                  designContract.controls.pageHeaderIconButton,
                  designContract.controls.pageHeaderIconButtonAdd,
                )}
              >
                <Plus className={designContract.controls.pageHeaderIconGlyph} strokeWidth={2.5} />
              </Link>
            ) : null}
          </div>

          <div className='-mx-4 mb-3 w-[calc(100%+2rem)] sm:-mx-5 sm:w-[calc(100%+2.5rem)]'>
            <Leaflet
              autoZoom={true}
              height='65vh'
              markers={markers}
              defaultCenter={meta.defaultCenter}
              defaultZoom={meta.defaultZoom}
              showSatelliteImage={false}
              clusterMarkers={!showForDevelopers}
              flyToId={null}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Areas;
