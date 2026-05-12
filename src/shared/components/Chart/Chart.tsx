import { memo } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  gradeDistribution: components['schemas']['ProfileGradeDistribution'][];
};

/**
 * Bar length = (fa + tick) / maxValue of the column (distribution vs busiest grade).
 * Inside that pill: FA and tick share width by count. `rounded-full` + `overflow-hidden`
 * keeps both ends round for one or two segments.
 * Colors come from the API (gradeDistribution[].color), with a different shade for FA vs tick.
 */
function FaTickBar({
  fa,
  tick,
  totalWidthPct,
  color,
}: {
  fa: number;
  tick: number;
  totalWidthPct: number;
  color?: string;
}) {
  if (fa <= 0 && tick <= 0) {
    return <div className='mx-0 h-1.5 w-full sm:h-2' />;
  }

  const faColor = color ?? 'bg-red-400'; // full color for FA (more important)
  const tickColor = color ?? 'bg-blue-400'; // full color for tick (base)

  return (
    <div className='mx-0 w-full'>
      <div
        className='flex h-1.5 min-h-[6px] overflow-hidden rounded-full ring-1 ring-black/25 sm:h-2'
        style={{ width: `${totalWidthPct}%` }}
      >
        {fa > 0 ? <div className='h-full min-w-0' style={{ flex: fa, backgroundColor: faColor }} /> : null}
        {tick > 0 ? (
          <div className='relative h-full min-w-0' style={{ flex: tick, backgroundColor: tickColor }}>
            <div className='absolute inset-0 bg-white/40' />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chart({ gradeDistribution: data }: Props) {
  const grades = data;
  const maxValue = Math.max(
    1,
    ...grades.map((d) => {
      return (d.fa ?? 0) + (d.tick ?? 0);
    }),
  );

  if (!grades.length) {
    return <div className='py-4 text-center text-[12px] text-slate-500 sm:text-[13px]'>No grade distribution yet.</div>;
  }

  return (
    <div className='overflow-hidden'>
      <table className='w-full table-auto border-separate border-spacing-0 text-left'>
        <thead>
          <tr>
            <th className='w-px px-1 py-0.5 text-[12px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
              Grade
            </th>
            <th className='w-px px-1 py-0.5 text-left text-[12px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
              FA
            </th>
            <th className='w-px px-1 py-0.5 text-left text-[12px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
              Tick
            </th>
            <th className='w-px px-1 py-0.5 text-left text-[12px] leading-none font-medium whitespace-nowrap text-slate-300 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
              Total
            </th>
            <th className='w-full px-1 py-0.5 text-right sm:px-1.5' aria-hidden='true'>
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody className='divide-surface-border/15 divide-y'>
          {grades.map((g) => {
            const fa = g.fa ?? 0;
            const tick = g.tick ?? 0;
            const faPct = (fa / maxValue) * 100;
            const tickPct = (tick / maxValue) * 100;
            const totalWidthPct = faPct + tickPct;
            const total = fa + tick;

            return (
              <tr key={[g.grade, fa, tick].join('/')} className='hover:bg-surface-raised-hover transition-colors'>
                <td className='px-1 py-0.5 text-[12px] leading-none font-medium whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
                  {g.grade}
                </td>
                <td className='px-1 py-0.5 text-left text-[12px] leading-none whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
                  {fa}
                </td>
                <td className='px-1 py-0.5 text-left text-[12px] leading-none whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
                  {tick}
                </td>
                <td className='px-1 py-0.5 text-left text-[12px] leading-none whitespace-nowrap text-slate-400 sm:px-1.5 sm:py-0.5 sm:text-[13px]'>
                  {total}
                </td>
                <td className='w-full px-1 py-0.5 text-right sm:px-1.5 sm:py-0.5'>
                  <FaTickBar fa={fa} tick={tick} totalWidthPct={totalWidthPct} color={g.color} />
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
