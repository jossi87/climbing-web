import { memo } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  ticks: NonNullable<components['schemas']['ProfileStatistics']['ticks']>;
};

/**
 * Bar length = (fa + tick) / maxValue of the column (distribution vs busiest grade).
 * Inside that pill: FA (red) and tick (blue) share width by count. `rounded-full` + `overflow-hidden`
 * keeps both ends round for one or two segments.
 */
function FaTickBar({ fa, tick, totalWidthPct }: { fa: number; tick: number; totalWidthPct: number }) {
  if (fa <= 0 && tick <= 0) {
    return <div className='mx-0 h-1.5 w-full sm:h-2' />;
  }

  return (
    <div className='mx-0 w-full'>
      <div
        className='flex h-1.5 min-h-[6px] overflow-hidden rounded-full sm:h-2'
        style={{ width: `${totalWidthPct}%` }}
      >
        {fa > 0 ? <div className='h-full min-w-0 bg-red-400' style={{ flex: fa }} /> : null}
        {tick > 0 ? <div className='h-full min-w-0 bg-blue-400' style={{ flex: tick }} /> : null}
      </div>
    </div>
  );
}

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

  if (!grades.length) {
    return <div className='py-4 text-center text-[11px] text-slate-500 sm:text-[12px]'>No grade distribution yet.</div>;
  }

  return (
    <div className='overflow-hidden'>
      <table className='w-full table-auto border-separate border-spacing-0 text-left'>
        <thead>
          <tr>
            <th className='w-px px-1 py-0.5 text-[11px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
              Grade
            </th>
            <th className='w-px px-1 py-0.5 text-left text-[11px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
              FA
            </th>
            <th className='w-px px-1 py-0.5 text-left text-[11px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
              Tick
            </th>
            <th className='w-px px-1 py-0.5 text-left text-[11px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
              Total
            </th>
            <th className='w-full px-1 py-0.5 text-right sm:px-1.5' aria-hidden='true'>
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody className='divide-surface-border/15 divide-y'>
          {grades.map((g) => {
            const faPct = (g.fa / maxValue) * 100;
            const tickPct = (g.tick / maxValue) * 100;
            const totalWidthPct = faPct + tickPct;
            const total = g.fa + g.tick;

            return (
              <tr key={[g.grade, g.fa, g.tick].join('/')} className='hover:bg-surface-raised-hover transition-colors'>
                <td className='px-1 py-0.5 text-[11px] leading-none font-medium whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
                  {g.grade}
                </td>
                <td className='px-1 py-0.5 text-left text-[11px] leading-none whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
                  {g.fa}
                </td>
                <td className='px-1 py-0.5 text-left text-[11px] leading-none whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
                  {g.tick}
                </td>
                <td className='px-1 py-0.5 text-left text-[11px] leading-none whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[12px]'>
                  {total}
                </td>
                <td className='w-full px-1 py-0.5 text-right sm:px-1.5 sm:py-0.5'>
                  <FaTickBar fa={g.fa} tick={g.tick} totalWidthPct={totalWidthPct} />
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
