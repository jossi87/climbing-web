import type { CSSProperties } from 'react';
import { useGrades } from '../../Meta';
import { ChevronDown } from 'lucide-react';

export type DispatchUpdate =
  | { action: 'set-grades'; low: string; high: string }
  | { action: 'set-grade'; low: string }
  | { action: 'set-grade'; high: string };

type Props = {
  low: string | undefined;
  high: string | undefined;
  dispatch: (update: DispatchUpdate) => void;
  style?: CSSProperties;
};

export const GradeSelect = ({ low: filterGradeLow, high: filterGradeHigh, dispatch, style }: Props) => {
  const { easyToHard, mapping: gradeIndexMapping } = useGrades();

  const max = Math.max(easyToHard.length - 1, 0);
  const low = filterGradeLow || easyToHard[0];
  const high = filterGradeHigh || easyToHard[max];

  return (
    <div style={style} className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <select
            className='bg-surface-nav border-surface-border focus:border-brand type-body w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={low}
            onChange={(e) => {
              dispatch({
                action: 'set-grade',
                low: e.target.value,
              });
            }}
            disabled={max === 0}
          >
            {easyToHard
              .filter((label) => {
                const rank = gradeIndexMapping[label];
                return rank < (gradeIndexMapping[high] ?? max);
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
            className='bg-surface-nav border-surface-border focus:border-brand type-body w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={high}
            onChange={(e) => {
              dispatch({
                action: 'set-grade',
                high: e.target.value,
              });
            }}
            disabled={max === 0}
          >
            {easyToHard
              .filter((label) => {
                const rank = gradeIndexMapping[label];
                return rank > (gradeIndexMapping[low] ?? 0);
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
