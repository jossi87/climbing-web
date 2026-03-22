import { useState } from 'react';
import { Loading } from '../../ui/StatusWidgets';
import { useGradeDistribution } from './../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';

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
      <div className='flex items-center justify-end mb-10 px-2'>
        <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-nav/40 border border-surface-border'>
          <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
            Click bar for details
          </span>
        </div>
      </div>

      <div className='flex items-end justify-between h-64 w-full px-1 gap-1 sm:gap-2'>
        {gradeDistribution.map((g, i) => {
          const hPrim = ((g.prim ?? 0) / maxValue) * 100;
          const hSec = ((g.sec ?? 0) / maxValue) * 100;
          const isActive = selectedIdx === i;

          return (
            <div
              key={i}
              onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
              className='flex-1 flex flex-col justify-end h-full cursor-pointer group pt-6'
            >
              <div className='text-center mb-2 h-4'>
                <span
                  className={`text-[10px] font-mono font-black transition-all ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {g.num || ''}
                </span>
              </div>

              <div
                className={`w-full flex flex-col justify-end overflow-hidden rounded-t-md transition-all duration-300 ${
                  isActive
                    ? 'bg-surface-hover ring-1 ring-surface-border/50'
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

              <div className='mt-4 text-center border-t border-surface-border/50 pt-2'>
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase tracking-tighter transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'
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
        <div className='mt-12 bg-surface-dark border border-surface-border rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-2xl'>
          <div className='px-5 py-4 bg-surface-nav/50 border-b border-surface-border flex justify-between items-center'>
            <h3 className='text-xs font-bold text-white uppercase tracking-widest'>
              Distribution <span className='text-slate-500 mx-2'>/</span> Grade {activeGrade.grade}
            </h3>
            <span className='text-[11px] font-mono text-slate-300 font-black bg-surface-card border border-surface-border px-2 py-1 rounded'>
              {activeGrade.num} TOTAL
            </span>
          </div>
          <div className='max-h-100 overflow-y-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-surface-dark/80 backdrop-blur sticky top-0 z-10'>
                  <th className='px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-surface-border'>
                    {idArea > 0 || idSector > 0 ? 'Sector' : 'Region'}
                  </th>
                  {activeCategories.map((cat) => (
                    <th
                      key={cat.key}
                      className='px-5 py-4 text-[10px] font-black text-slate-400 uppercase text-right border-b border-surface-border'
                    >
                      {cat.label}
                    </th>
                  ))}
                  <th className='px-5 py-4 text-[10px] font-black text-slate-200 uppercase text-right border-b border-surface-border'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-surface-border/20'>
                {activeGrade.rows?.map((row, idx) => {
                  const total = categories.reduce(
                    (acc, cat) => acc + ((row[cat.key as keyof typeof row] as number) ?? 0),
                    0,
                  );
                  return (
                    <tr key={idx} className='hover:bg-surface-hover/40 transition-colors group/row'>
                      <td className='px-5 py-4 text-slate-200 font-bold uppercase text-[11px] tracking-tight'>
                        {row.name}
                      </td>
                      {activeCategories.map((cat) => (
                        <td
                          key={cat.key}
                          className='px-5 py-4 text-right font-mono text-slate-400 text-xs'
                        >
                          {(row[cat.key as keyof typeof row] as number) || '-'}
                        </td>
                      ))}
                      <td className='px-5 py-4 text-right font-mono text-slate-200 font-black text-xs bg-surface-nav/30'>
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
