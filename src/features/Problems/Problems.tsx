import { useEffect, useState } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { downloadTocXlsx, useAccessToken, useToc } from '../../api';
import TableOfContents from '../../shared/components/TableOfContents';
import { useFilterState } from './reducer';
import { FilterContext, FilterForm } from '../../shared/components/FilterForm';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemsMap } from '../../shared/components/TableOfContents/ProblemsMap';
import { Filter, Download, Edit, Trash2, Database } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import {
  climbingRouteUsesPassiveGear,
  formatPassiveGearMarkerLine,
  formatRouteTypeLabel,
} from '../../utils/routeTradGear';

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
  passiveGearTooltip?: string;
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
                          let passiveGearTooltip: string | undefined;
                          if (meta.isClimbing) {
                            const typeLine = formatRouteTypeLabel(problem.t?.type, problem.t?.subType);
                            if (typeLine && climbingRouteUsesPassiveGear(typeLine)) {
                              passiveGearTooltip = formatPassiveGearMarkerLine(typeLine, problem.numPitches);
                            }
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
                            passiveGearTooltip,
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

      <div className='w-full min-w-0'>
        <Card flush className='min-w-0 border-0'>
          <div className='flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5'>
            <SectionHeader title={title} icon={Database} subheader={totalDescription} />
            <div className='flex items-center gap-2'>
              <button
                onClick={() => dispatch({ action: 'toggle-filter' })}
                className={
                  visible
                    ? 'bg-surface-hover border-surface-border inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] leading-none font-medium text-slate-100 transition-colors sm:text-[12px]'
                    : 'border-surface-border bg-surface-raised hover:bg-surface-raised-hover inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] leading-none font-medium text-slate-300 transition-colors hover:text-slate-200 sm:text-[12px]'
                }
              >
                <Filter size={11} /> Filter
              </button>
              <button
                onClick={() => {
                  setIsSaving(true);
                  downloadTocXlsx(accessToken).finally(() => {
                    setIsSaving(false);
                  });
                }}
                disabled={isSaving}
                className='border-surface-border bg-surface-raised hover:bg-surface-raised-hover inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] leading-none font-medium text-slate-300 transition-colors hover:text-slate-200 disabled:cursor-wait disabled:opacity-50 sm:text-[12px]'
              >
                <Download size={11} /> {isSaving ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>

          {visible && (
            <div className='px-4 pb-2 sm:px-5'>
              <div className='bg-surface-card rounded-lg p-4'>
                <FilterForm />
              </div>
            </div>
          )}

          {!visible && filteredProblems > 0 && (
            <div className='px-4 pb-2 sm:px-5'>
              <div className='light:border-amber-600/35 light:bg-amber-100/65 flex flex-col justify-between gap-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 sm:flex-row sm:items-center'>
                <div className='light:text-amber-900 text-[11px] text-orange-300 sm:text-[12px]'>
                  Active filter hides{' '}
                  {description(filteredRegions, filteredAreas, filteredSectors, filteredProblems, things)}.
                </div>
                <div className='flex shrink-0 flex-wrap items-center gap-2'>
                  <button
                    onClick={() => dispatch({ action: 'open-filter' })}
                    className='light:border-amber-600/55 light:bg-amber-200/85 light:text-amber-900 light:hover:bg-amber-300/85 inline-flex h-8 items-center gap-1.5 rounded-full border border-orange-400/35 bg-orange-500/15 px-2.5 text-[11px] leading-none font-medium text-orange-300 transition-colors hover:bg-orange-500/25 sm:text-[12px]'
                  >
                    <Edit size={11} /> Edit filter
                  </button>
                  <button
                    onClick={() => dispatch({ action: 'reset', section: 'all' })}
                    className='border-surface-border bg-surface-raised hover:bg-surface-raised-hover light:border-slate-400/70 light:bg-slate-100 light:hover:bg-slate-200/80 inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] leading-none font-medium text-slate-300 transition-colors hover:text-slate-200 sm:text-[12px]'
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='relative z-0 -mx-px mb-2 w-[calc(100%+2px)] overflow-hidden sm:mx-0 sm:w-full'>
            <ProblemsMap areas={areas} />
          </div>

          <div className='relative z-10 p-4 pt-3 sm:p-5 sm:pt-4'>
            <TableOfContents areas={areas} compact showAreaJumpToTop={false} />
          </div>
        </Card>
      </div>
    </FilterContext.Provider>
  );
};
