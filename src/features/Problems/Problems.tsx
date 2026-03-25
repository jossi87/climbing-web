import { useEffect, useState } from 'react';
import { Loading } from '../../shared/components/Widgets/Widgets';
import { useMeta } from '../../shared/components/Meta/context';
import { downloadTocXlsx, useAccessToken, useToc } from '../../api';
import TableOfContents from '../../shared/components/TableOfContents';
import { useFilterState } from './reducer';
import { FilterContext, FilterForm } from '../../shared/components/FilterForm';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemsMap } from '../../shared/components/TableOfContents/ProblemsMap';
import { Filter, Download, Map as MapIcon, Edit, Trash2, Database, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type Props = { filterOpen?: boolean };

const description = (
  regions: number,
  areas: number,
  sectors: number,
  problems: number,
  kind: 'routes' | 'problems',
): string => `${regions} regions, ${areas} areas, ${sectors} sectors, ${problems} ${kind}`;

type FilterProblem = {
  id: number;
  broken: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  name: string;
  nr: number;
  grade: string;
  stars?: number;
  ticked?: boolean;
  todo?: boolean;
  text: string;
  subText?: string;
  lat?: number;
  lng?: number;
  faYear: number;
  mAsl: number;
};

type FilterSector = Pick<components['schemas']['TocSector'], 'outline'> & {
  id: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  name: string;
  wallDirectionCalculated: components['schemas']['CompassDirection'];
  wallDirectionManual: components['schemas']['CompassDirection'];
  sunFromHour: number;
  sunToHour: number;
  lat?: number;
  lng?: number;
  problems: FilterProblem[];
};

type FilterArea = {
  id: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  sunFromHour: number;
  sunToHour: number;
  name: string;
  lat?: number;
  lng?: number;
  sectors: FilterSector[];
};

export const Problems = ({ filterOpen }: Props) => {
  const meta = useMeta();
  const [state, dispatch] = useFilterState({
    visible: !!filterOpen || window.innerWidth > 991,
  });

  const accessToken = useAccessToken();
  const { data: loadedData, status } = useToc();
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(!!(matchMedia && matchMedia('(pointer:fine)')?.matches));

  useEffect(() => {
    if (status === 'success' && loadedData) {
      dispatch({ action: 'set-data', data: loadedData });
    }
  }, [dispatch, loadedData, status]);

  const {
    totalRegions,
    totalAreas,
    totalSectors,
    totalProblems,
    filteredData,
    filteredRegions,
    filteredAreas,
    filteredSectors,
    filteredProblems,
    visible,
  } = state;

  if (status === 'pending' || totalProblems === 0) {
    return <Loading />;
  }

  const title = meta.isBouldering ? 'Problems' : 'Routes';
  const things = meta.isBouldering ? 'problems' : 'routes';
  const totalDescription = description(totalRegions, totalAreas, totalSectors, totalProblems, things);

  const areas: FilterArea[] =
    filteredData?.regions?.flatMap((region) => {
      return (
        region.areas?.map(
          (area) =>
            ({
              id: area.id ?? 0,
              lockedAdmin: !!area.lockedAdmin,
              lockedSuperadmin: !!area.lockedSuperadmin,
              sunFromHour: area.sunFromHour ?? 0,
              sunToHour: area.sunToHour ?? 0,
              name: area.name ?? '',
              lat: area.coordinates?.latitude,
              lng: area.coordinates?.longitude,
              sectors:
                area.sectors?.map(
                  (sector) =>
                    ({
                      id: sector.id ?? 0,
                      lockedAdmin: !!sector.lockedAdmin,
                      lockedSuperadmin: !!sector.lockedSuperadmin,
                      name: sector.name ?? '',
                      lat: sector.parking?.latitude,
                      lng: sector.parking?.longitude,
                      outline: sector.outline,
                      wallDirectionCalculated: sector.wallDirectionCalculated ?? {},
                      wallDirectionManual: sector.wallDirectionManual ?? {},
                      sunFromHour: sector.sunFromHour ?? 0,
                      sunToHour: sector.sunToHour ?? 0,
                      problems:
                        sector.problems?.map((problem) => {
                          const metaParts: string[] = [];
                          if (meta.isClimbing) {
                            if (problem.t?.subType) metaParts.push(problem.t.subType);
                            if ((problem.numPitches ?? 0) > 1) metaParts.push(`${problem.numPitches}p`);
                          }
                          if (problem.numTicks) {
                            metaParts.push(`${problem.numTicks} asc${problem.numTicks === 1 ? '' : 's'}`);
                          }
                          const sAlt = problem.startingAltitude;
                          const cElev = problem.coordinates?.elevation;
                          const elev =
                            (sAlt ?? 0) > 0
                              ? { v: sAlt as number, p: '' }
                              : typeof cElev === 'number'
                                ? { v: cElev, p: '~' }
                                : null;

                          if (elev) {
                            metaParts.push(`${elev.p}${Math.round(elev.v)}m a.s.l.`);
                          }
                          const metaString = metaParts.length ? `(${metaParts.join(', ')})` : '';
                          const text = [problem.fa, problem.faYear, metaString].filter(Boolean).join(' ').trim();
                          return {
                            id: problem.id ?? 0,
                            broken: problem.broken ?? '',
                            lockedAdmin: !!problem.lockedAdmin,
                            lockedSuperadmin: !!problem.lockedSuperadmin,
                            name: problem.name ?? '',
                            lat: problem.coordinates?.latitude,
                            lng: problem.coordinates?.longitude,
                            nr: problem.nr ?? 0,
                            grade: problem.grade ?? '',
                            stars: problem.stars,
                            ticked: problem.ticked,
                            todo: problem.todo,
                            text: text,
                            subText: problem.description,
                            faYear: problem.faYear ?? 0,
                            mAsl: (problem.startingAltitude ?? 0) > 0 ? (problem.startingAltitude ?? 0) : (cElev ?? 0),
                          } satisfies FilterProblem;
                        }) ?? [],
                    }) satisfies FilterSector,
                ) ?? [],
            }) satisfies FilterArea,
        ) ?? []
      );
    }) ?? [];

  return (
    <FilterContext.Provider value={{ ...state, dispatch }}>
      <title>{`${title} | ${meta?.title}`}</title>
      <meta name='description' content={totalDescription} />

      <div className={designContract.layout.pageShell}>
        <div className={designContract.layout.pageHeaderRow}>
          <nav className={designContract.layout.breadcrumb}>
            <span className='uppercase'>Navigation</span>
            <ChevronRight size={12} className='opacity-20' />
            <div className='type-small flex items-center gap-1.5'>
              <Database size={14} className='text-brand' />
              <span className='uppercase'>{title}</span>
              <span className='font-mono text-slate-500 normal-case'>({totalDescription})</span>
            </div>
          </nav>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => dispatch({ action: 'toggle-filter' })}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all',
                visible
                  ? 'bg-brand border-brand shadow-brand'
                  : 'bg-surface-nav border-surface-border hover:bg-surface-hover opacity-70 hover:opacity-100',
              )}
            >
              <Filter size={14} /> Filter {things}
            </button>
            <button
              onClick={() => {
                setIsSaving(true);
                downloadTocXlsx(accessToken).finally(() => {
                  setIsSaving(false);
                });
              }}
              disabled={isSaving}
              className='bg-surface-nav border-surface-border hover:border-brand/50 type-label flex items-center gap-2 rounded-lg border px-3 py-1.5 opacity-70 transition-all hover:opacity-100 disabled:cursor-wait disabled:opacity-50'
            >
              <Download size={14} /> {isSaving ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>

        <div className='space-y-6'>
          {visible && (
            <div className='bg-surface-card border-surface-border rounded-xl border p-4'>
              <FilterForm />
            </div>
          )}

          {!visible && filteredProblems > 0 && (
            <div className='flex flex-col justify-between gap-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 sm:flex-row sm:items-center'>
              <div className='text-sm text-orange-400'>
                There is an active filter which is hiding{' '}
                <strong className='font-bold text-orange-500'>
                  {description(filteredRegions, filteredAreas, filteredSectors, filteredProblems, things)}
                </strong>
                .
              </div>
              <div className='flex shrink-0 flex-wrap items-center gap-2'>
                <button
                  onClick={() => dispatch({ action: 'open-filter' })}
                  className='flex items-center gap-1.5 rounded-lg bg-orange-500/20 px-3 py-1.5 text-[11px] font-bold tracking-wider text-orange-500 uppercase transition-colors hover:bg-orange-500/30'
                >
                  <Edit size={14} /> Edit filter
                </button>
                <button
                  onClick={() => dispatch({ action: 'reset', section: 'all' })}
                  className='bg-surface-nav hover:bg-surface-hover border-surface-border type-label flex items-center gap-1.5 rounded-lg border px-3 py-1.5 opacity-85 transition-colors hover:opacity-100'
                >
                  <Trash2 size={14} /> Clear filter
                </button>
              </div>
            </div>
          )}

          <div className={cn(designContract.surfaces.card, 'overflow-hidden p-6')}>
            <TableOfContents
              header={
                <div className='mb-4 flex justify-end'>
                  <button
                    onClick={() => setShowMap((v) => !v)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all',
                      showMap
                        ? 'bg-brand/10 text-brand border-brand/30'
                        : 'bg-surface-nav border-surface-border hover:bg-surface-hover opacity-70 hover:opacity-100',
                    )}
                  >
                    <MapIcon size={14} /> Map
                  </button>
                </div>
              }
              subHeader={
                showMap && (
                  <div className='border-surface-border mb-8 overflow-hidden rounded-xl border'>
                    <ProblemsMap areas={areas} />
                  </div>
                )
              }
              areas={areas}
            />
          </div>
        </div>
      </div>
    </FilterContext.Provider>
  );
};
