import { useState } from 'react';
import { Loading } from '../../ui/StatusWidgets';
import { useGradeDistribution } from '../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

type Data = components['schemas']['GradeDistribution'][];

type Props =
  | { idArea: number; idSector?: never; data?: never }
  | { idArea?: never; idSector: number; data?: never }
  | { idArea?: never; idSector?: never; data: Data };

const ChartGradeDistribution = ({ idArea = 0, idSector = 0, data = undefined }: Props) => {
  const { data: gradeDistribution } = useGradeDistribution(idArea, idSector, data || undefined);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!gradeDistribution) {
    return <Loading />;
  }

  const maxValue = Math.max(1, ...gradeDistribution.map((d) => (d.prim ?? 0) + (d.sec ?? 0)));
  const activeGrade = selectedIdx !== null ? gradeDistribution[selectedIdx] : null;

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

  return (
    <div className='w-full select-none'>
      <div className='mb-10 flex items-center justify-end px-2'>
        <div className='bg-surface-nav/40 border-surface-border flex items-center gap-2 rounded-full border px-3 py-1.5'>
          <span className={designContract.typography.label}>Click bar for details</span>
        </div>
      </div>

      <div className='flex h-64 w-full items-end justify-between gap-1 px-1 sm:gap-2'>
        {gradeDistribution.map((g, i) => {
          const hPrim = ((g.prim ?? 0) / maxValue) * 100;
          const hSec = ((g.sec ?? 0) / maxValue) * 100;
          const isActive = selectedIdx === i;

          return (
            <div
              key={i}
              onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
              className='group flex h-full flex-1 cursor-pointer flex-col justify-end pt-6'
            >
              <div className='mb-2 h-4 text-center'>
                <span
                  className={`font-mono text-[10px] font-black transition-all ${
                    isActive ? '' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {g.num || ''}
                </span>
              </div>

              <div
                className={`flex w-full flex-col justify-end overflow-hidden rounded-t-md transition-all duration-300 ${
                  isActive
                    ? 'bg-surface-hover ring-surface-border/50 ring-1'
                    : 'bg-surface-nav/20 group-hover:bg-surface-nav/60'
                }`}
                style={{ height: '100%' }}
              >
                <div
                  style={{ height: `${hSec}%` }}
                  className={`w-full transition-colors ${isActive ? 'bg-slate-500' : 'bg-slate-700/50'}`}
                />
                <div
                  style={{ height: `${hPrim}%` }}
                  className={`w-full transition-colors ${isActive ? 'bg-brand' : 'bg-slate-600 group-hover:bg-slate-500'}`}
                />
              </div>

              <div className='border-surface-border/50 mt-4 border-t pt-2 text-center'>
                <span
                  className={`text-[10px] font-semibold tracking-tight uppercase transition-colors sm:text-xs ${
                    isActive ? '' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {g.grade}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {activeGrade && (
        <div className='bg-surface-dark border-surface-border animate-in fade-in zoom-in-95 mt-12 overflow-hidden rounded-xl border shadow-2xl duration-300'>
          <div className='bg-surface-nav/50 border-surface-border flex items-center justify-between border-b px-5 py-4'>
            <h3 className={cn('text-xs', designContract.typography.label)}>
              Distribution <span className='mx-2 text-slate-500'>/</span> Grade {activeGrade.grade}
            </h3>
            <span className='bg-surface-card border-surface-border rounded border px-2 py-1 font-mono text-[11px] font-black text-slate-300'>
              {activeGrade.num} TOTAL
            </span>
          </div>
          <div className='max-h-100 overflow-y-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='bg-surface-dark/80 sticky top-0 z-10 backdrop-blur'>
                  <th className={cn('border-surface-border border-b px-5 py-4', designContract.typography.label)}>
                    {idArea > 0 || idSector > 0 ? 'Sector' : 'Region'}
                  </th>
                  {activeCategories.map((cat) => (
                    <th
                      key={cat.key}
                      className={cn(
                        'border-surface-border border-b px-5 py-4 text-right',
                        designContract.typography.label,
                      )}
                    >
                      {cat.label}
                    </th>
                  ))}
                  <th className='border-surface-border border-b px-5 py-4 text-right text-[10px] font-semibold text-slate-200 uppercase'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className='divide-surface-border/20 divide-y'>
                {activeGrade.rows?.map((row, idx) => {
                  const total = categories.reduce(
                    (acc, cat) => acc + ((row[cat.key as keyof typeof row] as number) ?? 0),
                    0,
                  );
                  return (
                    <tr key={idx} className='hover:bg-surface-hover/40 group/row transition-colors'>
                      <td className='px-5 py-4 text-[11px] font-bold tracking-tight text-slate-200 uppercase'>
                        {row.name}
                      </td>
                      {activeCategories.map((cat) => (
                        <td key={cat.key} className='px-5 py-4 text-right font-mono text-xs text-slate-400'>
                          {(row[cat.key as keyof typeof row] as number) || '-'}
                        </td>
                      ))}
                      <td className='bg-surface-nav/30 px-5 py-4 text-right font-mono text-xs font-black text-slate-200'>
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartGradeDistribution;
