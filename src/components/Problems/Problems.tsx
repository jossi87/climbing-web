import { useEffect, useState } from 'react';
import { Loading } from '../common/widgets/widgets';
import { useMeta } from '../common/meta/context';
import { downloadTocXlsx, useAccessToken, useToc } from '../../api';
import TableOfContents from '../common/TableOfContents';
import { useFilterState } from './reducer';
import { FilterContext, FilterForm } from '../common/FilterForm';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemsMap } from '../common/TableOfContents/ProblemsMap';
import {
  Filter,
  Download,
  Map as MapIcon,
  Edit,
  Trash2,
  Database,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

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
  const totalDescription = description(
    totalRegions,
    totalAreas,
    totalSectors,
    totalProblems,
    things,
  );

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
                            if ((problem.numPitches ?? 0) > 1)
                              metaParts.push(`${problem.numPitches}p`);
                          }
                          if (problem.numTicks) {
                            metaParts.push(
                              `${problem.numTicks} asc${problem.numTicks === 1 ? '' : 's'}`,
                            );
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
                          const text = [problem.fa, problem.faYear, metaString]
                            .filter(Boolean)
                            .join(' ')
                            .trim();
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
                            mAsl:
                              (problem.startingAltitude ?? 0) > 0
                                ? (problem.startingAltitude ?? 0)
                                : (cElev ?? 0),
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

      <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
        <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
          <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
            <span className='uppercase'>Navigation</span>
            <ChevronRight size={12} className='opacity-20' />
            <div className='flex items-center gap-1.5 text-white'>
              <Database size={14} className='text-brand' />
              <span className='uppercase'>{title}</span>
              <span className='text-slate-500 font-mono normal-case'>({totalDescription})</span>
            </div>
          </nav>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => dispatch({ action: 'toggle-filter' })}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border',
                visible
                  ? 'bg-brand text-white border-brand shadow-brand'
                  : 'bg-surface-nav border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover',
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
              className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-nav border border-surface-border text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-brand/50 transition-all disabled:opacity-50 disabled:cursor-wait'
            >
              <Download size={14} /> {isSaving ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>

        <div className='space-y-6'>
          {visible && (
            <div className='bg-surface-card border border-surface-border rounded-xl p-4 shadow-sm'>
              <FilterForm />
            </div>
          )}

          {!visible && filteredProblems > 0 && (
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl'>
              <div className='text-sm text-orange-400'>
                There is an active filter which is hiding{' '}
                <strong className='text-orange-500 font-bold'>
                  {description(
                    filteredRegions,
                    filteredAreas,
                    filteredSectors,
                    filteredProblems,
                    things,
                  )}
                </strong>
                .
              </div>
              <div className='flex flex-wrap items-center gap-2 shrink-0'>
                <button
                  onClick={() => dispatch({ action: 'open-filter' })}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 transition-colors text-[11px] font-bold uppercase tracking-wider'
                >
                  <Edit size={14} /> Edit filter
                </button>
                <button
                  onClick={() => dispatch({ action: 'reset', section: 'all' })}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-nav hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider'
                >
                  <Trash2 size={14} /> Clear filter
                </button>
              </div>
            </div>
          )}

          <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm p-6'>
            <TableOfContents
              header={
                <div className='flex justify-end mb-4'>
                  <button
                    onClick={() => setShowMap((v) => !v)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border',
                      showMap
                        ? 'bg-brand/10 text-brand border-brand/30'
                        : 'bg-surface-nav border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover',
                    )}
                  >
                    <MapIcon size={14} /> Map
                  </button>
                </div>
              }
              subHeader={
                showMap && (
                  <div className='mb-8 rounded-xl overflow-hidden border border-surface-border'>
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
