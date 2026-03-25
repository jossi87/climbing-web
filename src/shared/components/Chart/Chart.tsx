import { memo } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  ticks: NonNullable<components['schemas']['ProfileStatistics']['ticks']>;
};

function Chart({ ticks: data }: Props) {
  type LocalGrade = { gradeNumber: number; grade: string; fa: number; tick: number };
  const grades: LocalGrade[] = [];
  data.forEach((t) => {
    const gradeNumber = t.gradeNumber ?? 0;
    const gradeLabel = t.grade ?? '';
    const d = grades.find((val) => val.gradeNumber === gradeNumber);
    if (!d) {
      grades.push({
        gradeNumber,
        grade: gradeLabel,
        fa: t.fa ? 1 : 0,
        tick: t.fa ? 0 : 1,
      });
    } else {
      if (t.fa) {
        d.fa++;
      } else {
        d.tick++;
      }
    }
  });
  grades.sort((a, b) => b.gradeNumber - a.gradeNumber);
  const maxValue = Math.max(
    1,
    ...grades.map((d) => {
      return d.fa + d.tick;
    }),
  );

  return (
    <div className='overflow-hidden'>
      <table className='w-full table-fixed border-separate border-spacing-0 text-left'>
        <thead>
          <tr>
            <th className='w-[56px] px-1 py-2 text-[10px] font-semibold whitespace-nowrap text-slate-300 sm:w-[70px] sm:px-2'>
              Grade
            </th>
            <th className='w-[34px] px-1 py-2 text-left text-[10px] font-semibold whitespace-nowrap text-slate-300 sm:w-[44px] sm:px-2'>
              FA
            </th>
            <th className='w-[34px] px-1 py-2 text-left text-[10px] font-semibold whitespace-nowrap text-slate-300 sm:w-[44px] sm:px-2'>
              Tick
            </th>
            <th className='w-[42px] px-1 py-2 text-left text-[10px] font-semibold whitespace-nowrap text-slate-300 sm:w-[56px] sm:px-2'>
              Total
            </th>
            <th
              className='px-1 py-2 text-right text-[10px] font-semibold whitespace-nowrap text-slate-300 sm:px-2'
              aria-hidden='true'
            >
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody className='divide-surface-border/15 divide-y'>
          {grades.map((g) => {
            const faPct = (g.fa / maxValue) * 100;
            const tickPct = (g.tick / maxValue) * 100;
            const total = g.fa + g.tick;

            return (
              <tr key={[g.grade, g.fa, g.tick].join('/')} className='hover:bg-surface-hover/20 transition-colors'>
                <td className='px-1 py-1.5 text-[10px] font-semibold whitespace-nowrap text-slate-200 sm:px-2 sm:text-[11px]'>
                  {g.grade}
                </td>
                <td className='overflow-hidden px-1 py-1.5 text-left font-mono text-[11px] whitespace-nowrap text-slate-200 sm:px-2'>
                  {g.fa}
                </td>
                <td className='overflow-hidden px-1 py-1.5 text-left font-mono text-[11px] whitespace-nowrap text-slate-200 sm:px-2'>
                  {g.tick}
                </td>
                <td className='overflow-hidden px-1 py-1.5 text-left font-mono text-[11px] font-semibold whitespace-nowrap text-slate-100 sm:px-2'>
                  {total}
                </td>
                <td className='px-1 py-1.5 text-right sm:px-2'>
                  <div className='mx-0 h-2.5 w-full overflow-hidden rounded-full'>
                    <div className='flex h-full w-full'>
                      <div style={{ width: `${faPct}%` }} className='h-full rounded-l-full bg-red-400' />
                      <div style={{ width: `${tickPct}%` }} className='h-full rounded-r-full bg-blue-400' />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default memo(Chart);
