import type { CSSProperties } from 'react';
import type { GradeFilter } from '../../../../features/Problems/gradeFilters';
import { ChevronDown } from 'lucide-react';

/**
 * One system's range update. Both bounds travel together — the reducer replaces the system's whole entry, so sending
 * only the side that changed would drop the other one.
 */
export type GradeRangeUpdate = { action: 'set-grade-range'; gradeSystemId: number; low?: string; high?: string };

type Props = {
  /** Grade system the control filters, with its domain and the range currently selected for it. */
  filter: GradeFilter;
  dispatch: (update: GradeRangeUpdate) => void;
  style?: CSSProperties;
};

export const GradeSelect = ({ filter, dispatch, style }: Props) => {
  const { gradeSystemId, easyToHard, mapping: gradeIndexMapping, low: selectedLow, high: selectedHigh } = filter;

  const max = Math.max(easyToHard.length - 1, 0);
  const low = selectedLow || easyToHard[0];
  const high = selectedHigh || easyToHard[max];

  return (
    <div style={style} className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <select
            className='bg-surface-nav border-surface-border type-body focus:border-brand w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={low}
            onChange={(e) => {
              dispatch({
                action: 'set-grade-range',
                gradeSystemId,
                low: e.target.value,
                high: selectedHigh,
              });
            }}
            disabled={max === 0}
          >
            {easyToHard
              .filter((label) => {
                const rank = gradeIndexMapping[label];
                return rank <= (gradeIndexMapping[high] ?? max);
              })
              .map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
          </select>
          <ChevronDown
            size={14}
            className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
          />
        </div>
        <div className='relative flex-1'>
          <select
            className='bg-surface-nav border-surface-border type-body focus:border-brand w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={high}
            onChange={(e) => {
              dispatch({
                action: 'set-grade-range',
                gradeSystemId,
                low: selectedLow,
                high: e.target.value,
              });
            }}
            disabled={max === 0}
          >
            {easyToHard
              .filter((label) => {
                const rank = gradeIndexMapping[label];
                return rank >= (gradeIndexMapping[low] ?? 0);
              })
              .map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
          </select>
          <ChevronDown
            size={14}
            className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
          />
        </div>
      </div>
    </div>
  );
};
