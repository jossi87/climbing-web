import { useEffect, useState } from 'react';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { downloadTocXlsx, useAccessToken, useToc } from '../../api';
import TableOfContents from '../../shared/components/TableOfContents';
import { isFilterSectionActive, useFilterState } from './reducer';
import { describeFilterResult } from './filterSummary';
import { ActiveFilterSummary, FilterContext, FilterForm } from '../../shared/components/FilterForm';
import type { components } from '../../@types/buldreinfo/swagger';
import { ProblemsMap } from '../../shared/components/TableOfContents/ProblemsMap';
import { Filter, Download, Database } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';
import {
  climbingRouteUsesPassiveGear,
  formatPassiveGearMarkerLine,
  formatRouteTypeLabel,
} from '../../utils/routeTradGear';
import { formatFaDisplay } from '../../utils/firstAscentDisplay';
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
  orientationCalculated: components['schemas']['CompassDirection'];
  orientationManual: components['schemas']['CompassDirection'];
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
  // Collapsed by default (only the `/filter` route opens the panel on load): the header's “Showing n routes”
  // line and the chips beside the Filter button already say what the list is filtered on, so the list gets the
  // space back on every screen size.
  const [state, dispatch] = useFilterState({ visible: !!filterOpen });

  const accessToken = useAccessToken();
  const { data: loadedData, status } = useToc();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'success' && loadedData) {
      dispatch({ action: 'set-data', data: loadedData });
    }
  }, [dispatch, loadedData, status]);

  const { totalRegions, totalAreas, totalSectors, totalProblems, filteredData, visible } = state;

  if (status === 'pending' || totalProblems === 0) {
    return <Loading />;
  }

  const title = meta.isBouldering ? 'Problems' : 'Routes';
  const things = meta.isBouldering ? 'problems' : 'routes';
  const totalDescription = description(totalRegions, totalAreas, totalSectors, totalProblems, things);

  /** Any filter section deviating from the defaults — brand “on” affordance for the toolbar toggle. */
  const anyFilterActive = isFilterSectionActive(state, 'all');
  const closedFilterToggleClass = anyFilterActive
    ? 'border-brand-border bg-brand/20 text-brand hover:bg-brand/30 light:border-brand light:bg-brand/25 light:text-amber-800 light:hover:bg-brand/40'
    : 'border-surface-border bg-surface-raised hover:bg-surface-raised-hover text-slate-300 hover:text-slate-200';

  /** The header subheader keeps listing what is available; this is how much of it survives the filter. */
  const filterResult = anyFilterActive ? describeFilterResult(state, things) : undefined;

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
                      orientationCalculated: sector.orientationCalculated ?? {},
                      orientationManual: sector.orientationManual ?? {},
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
                          const faText = formatFaDisplay(
                            problem.faUser,
                            problem.faYear,
                            problem.ffaUser,
                            problem.ffaYear,
                          );
                          const text = [faText, metaString].filter(Boolean).join(' ').trim();
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
          <div className='space-y-3 p-4 sm:p-5'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <SectionHeader
                className='mb-0'
                title={title}
                icon={Database}
                subheader={totalDescription}
                description={
                  filterResult && (
                    <span
                      className={cn(
                        'tabular-nums',
                        filterResult.tone === 'warning' && 'light:text-amber-800 font-medium text-amber-300/90',
                      )}
                    >
                      {filterResult.text}
                    </span>
                  )
                }
              />
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => dispatch({ action: 'toggle-filter' })}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] leading-none font-medium transition-colors sm:text-[13px]',
                    visible ? 'bg-surface-hover border-surface-border text-slate-100' : closedFilterToggleClass,
                  )}
                >
                  <Filter size={12} /> Filter
                </button>
                <button
                  onClick={() => {
                    setIsSaving(true);
                    downloadTocXlsx(accessToken).finally(() => {
                      setIsSaving(false);
                    });
                  }}
                  disabled={isSaving}
                  className='border-surface-border bg-surface-raised hover:bg-surface-raised-hover inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] leading-none font-medium text-slate-300 transition-colors hover:text-slate-200 disabled:cursor-wait disabled:opacity-50 sm:text-[13px]'
                >
                  <Download size={12} /> {isSaving ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>

            {/* The panel below *is* the filter UI while it is open; repeating the chips here would be noise. */}
            {anyFilterActive && !visible && <ActiveFilterSummary />}
          </div>

          {visible && (
            <div className='px-4 pb-2 sm:px-5'>
              <div className='bg-surface-card rounded-lg p-4'>
                <FilterForm />
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
