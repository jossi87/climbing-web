import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';
import { Loading } from '../../ui/StatusWidgets';
import { useGradeDistribution } from '../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';
import { Card } from '../../ui';

type Data = components['schemas']['GradeDistribution'][];

type Props =
  | { idArea: number; idSector?: never; data?: never }
  | { idArea?: never; idSector: number; data?: never }
  | { idArea?: never; idSector?: never; data: Data };

type PropsWithHeader = Props & {
  header?: ReactNode;
  /** Omit outer Card (e.g. inside Area tab panel) */ embedded?: boolean;
};

const ChartGradeDistribution = ({
  idArea = 0,
  idSector = 0,
  data = undefined,
  header,
  embedded = false,
}: PropsWithHeader) => {
  const { data: fetchedGradeDistribution } = useGradeDistribution(idArea, idSector, data || undefined);
  const gradeDistribution = data ?? fetchedGradeDistribution;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!gradeDistribution) {
    return <Loading />;
  }

  const maxValue = Math.max(1, ...gradeDistribution.map((d) => (d.prim ?? 0) + (d.sec ?? 0)));
  const activeGrade = selectedIdx !== null ? gradeDistribution[selectedIdx] : null;
  const axisTop = Math.ceil(maxValue / 5) * 5;
  const axisMid = Math.floor(axisTop / 2);

  const categories = [
    { key: 'numBoulder', label: 'Boulder' },
    { key: 'numSport', label: 'Sport' },
    { key: 'numTrad', label: 'Trad' },
    { key: 'numMixed', label: 'Mixed' },
    { key: 'numTopRope', label: 'Top Rope' },
    { key: 'numAid', label: 'Aid' },
    { key: 'numAidTrad', label: 'Aid/Trad' },
    { key: 'numIce', label: 'Ice' },
  ] as const;

  const activeCategories = categories.filter((cat) =>
    activeGrade?.rows?.some((row) => ((row[cat.key as keyof typeof row] as number) ?? 0) > 0),
  );

  /** One type column === same as row sum — hide redundant Total; keep Total for 0 (fallback) or 2+ types. */
  const showTotalColumn = activeCategories.length !== 1;

  const body = (
    <>
      {header}
      <div className='mb-2 flex h-56 w-full gap-2 sm:h-64 sm:gap-3'>
        <div
          className={cn(
            designContract.typography.micro,
            'flex h-full w-9 shrink-0 flex-col justify-between pb-9 text-right text-slate-500',
          )}
        >
          <span>{axisTop}</span>
          <span>{axisMid}</span>
          <span>0</span>
        </div>
        <div className='flex h-full w-full items-end justify-start gap-0.5 px-0 sm:gap-1 lg:gap-2'>
          {gradeDistribution.map((g, i) => {
            const hPrim = ((g.prim ?? 0) / maxValue) * 100;
            const hSec = ((g.sec ?? 0) / maxValue) * 100;
            const totalH = hPrim + hSec;
            const hasPrim = (g.prim ?? 0) > 0;
            const hasSec = (g.sec ?? 0) > 0;
            const isActive = selectedIdx === i;
            const pctSecInStack = totalH > 0 && hasSec && hasPrim ? (hSec / totalH) * 100 : hasSec ? 100 : 0;
            const pctPrimInStack = totalH > 0 && hasSec && hasPrim ? (hPrim / totalH) * 100 : hasPrim ? 100 : 0;

            return (
              <div
                key={i}
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                className='group relative flex h-full flex-1 cursor-pointer flex-col justify-end pt-3 lg:w-14 lg:flex-none xl:w-16'
              >
                {isActive && (
                  <div className='pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2'>
                    <span
                      className={
                        embedded
                          ? 'border-surface-border/50 bg-surface-card rounded-md border px-2 py-0.5 text-[10px] font-semibold text-slate-200'
                          : 'border-surface-border/50 bg-surface-raised rounded-md border px-2 py-0.5 text-[10px] font-semibold text-slate-200 shadow-sm'
                      }
                    >
                      {g.num}
                    </span>
                  </div>
                )}
                {/*
                 * Full-height track is square. Rounding applies only to the inner stack, sized to the
                 * bar height — every grade gets the same corner radius, not only near-full columns.
                 */}
                <div
                  className={cn(
                    'flex h-full w-full flex-col justify-end transition-all duration-300',
                    embedded
                      ? isActive
                        ? 'ring-surface-border/60 ring-1'
                        : 'bg-surface-card group-hover:bg-surface-raised'
                      : isActive
                        ? 'bg-surface-hover ring-1 ring-red-300/35'
                        : 'bg-surface-raised group-hover:bg-surface-raised-hover',
                  )}
                >
                  {totalH > 0 ? (
                    <div
                      className='flex w-full flex-col justify-end overflow-hidden rounded-md'
                      style={{
                        height: `${totalH}%`,
                        minHeight: totalH > 0 && totalH < 2 ? 4 : undefined,
                      }}
                    >
                      {hasSec ? (
                        <div
                          style={{ height: hasPrim ? `${pctSecInStack}%` : '100%' }}
                          className={`w-full shrink-0 transition-colors ${
                            embedded
                              ? isActive
                                ? 'bg-blue-400/90'
                                : 'bg-blue-400/40 group-hover:bg-blue-400/55'
                              : isActive
                                ? 'bg-blue-400'
                                : 'bg-blue-400/45 group-hover:bg-blue-400/65'
                          }`}
                        />
                      ) : null}
                      {hasPrim ? (
                        <div
                          style={{ height: hasSec ? `${pctPrimInStack}%` : '100%' }}
                          className={`w-full shrink-0 transition-colors ${
                            embedded
                              ? isActive
                                ? 'bg-red-400/90'
                                : 'bg-red-400/50 group-hover:bg-red-400/70'
                              : isActive
                                ? 'bg-red-400'
                                : 'bg-red-400/55 group-hover:bg-red-400/80'
                          }`}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div
                  className={
                    embedded ? 'mt-3 pt-2 text-center' : 'border-surface-border/40 mt-3 border-t pt-2 text-center'
                  }
                >
                  <span
                    className={cn(
                      designContract.typography.menuItem,
                      'font-semibold tracking-tight transition-colors',
                      isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200',
                    )}
                  >
                    {g.grade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeGrade && (
        <div className={embedded ? 'mt-2 pt-2' : 'border-surface-border/35 mt-2 border-t pt-2'}>
          <div className='overflow-x-auto'>
            <table className='w-auto min-w-max table-auto text-left'>
              <thead>
                <tr>
                  <th
                    className={cn(
                      designContract.typography.menuItem,
                      'px-1.5 py-0.5 font-bold whitespace-nowrap text-slate-400',
                    )}
                  >
                    {idArea > 0 || idSector > 0 ? 'Sector' : 'Region'}
                  </th>
                  {showTotalColumn ? (
                    <th
                      className={cn(
                        designContract.typography.menuItem,
                        'px-1.5 py-0.5 text-left font-bold whitespace-nowrap text-slate-400',
                      )}
                    >
                      Total
                    </th>
                  ) : null}
                  {activeCategories.map((cat) => (
                    <th
                      key={cat.key}
                      className={cn(
                        designContract.typography.menuItem,
                        'px-1.5 py-0.5 text-left font-bold whitespace-nowrap text-slate-400',
                      )}
                    >
                      {cat.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={embedded ? '' : 'divide-surface-border/15 divide-y'}>
                {activeGrade.rows?.map((row, idx) => {
                  const total = categories.reduce(
                    (acc, cat) => acc + ((row[cat.key as keyof typeof row] as number) ?? 0),
                    0,
                  );
                  return (
                    <tr key={idx} className='transition-colors'>
                      <td
                        className={cn(
                          designContract.typography.menuItem,
                          'px-1.5 py-1 font-normal whitespace-nowrap text-slate-400',
                        )}
                      >
                        {row.name}
                      </td>
                      {showTotalColumn ? (
                        <td
                          className={cn(
                            designContract.typography.menuItem,
                            'px-1.5 py-1 text-left font-normal whitespace-nowrap text-slate-400 tabular-nums',
                          )}
                        >
                          {total}
                        </td>
                      ) : null}
                      {activeCategories.map((cat) => {
                        const value = ((row[cat.key as keyof typeof row] as number) ?? 0) || 0;
                        return (
                          <td
                            key={cat.key}
                            className={cn(
                              designContract.typography.menuItem,
                              'px-1.5 py-1 text-left font-normal whitespace-nowrap text-slate-400 tabular-nums',
                            )}
                          >
                            {value > 0 ? value : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  return <div className='w-full select-none'>{embedded ? body : <Card>{body}</Card>}</div>;
};

export default ChartGradeDistribution;
