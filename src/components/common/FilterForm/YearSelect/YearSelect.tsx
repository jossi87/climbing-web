import RangeSlider from '../../RangeSlider';
import 'react-range-slider-input/dist/style.css';
import { useFilter } from '../context';
import { useFaYears } from '../../meta';
import { ChevronDown } from 'lucide-react';

export const YearSelect = () => {
  const { filterFaYearLow, filterFaYearHigh, dispatch } = useFilter();
  const faYears = useFaYears();

  const max = Math.max(faYears.length - 1, 0);
  const low = filterFaYearLow || faYears[0];
  const high = filterFaYearHigh || faYears[max];

  return (
    <div className='flex flex-col gap-4'>
      <div className='px-1 mt-2'>
        <RangeSlider
          key={`${0}-${max}`}
          min={faYears[0]}
          max={faYears[max]}
          value={[low, high]}
          onInput={([l, h]) => {
            dispatch({
              action: 'set-fa-years',
              low: l ?? faYears[0],
              high: h ?? faYears[max],
            });
          }}
          disabled={max === 0}
        />
      </div>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <select
            className='w-full appearance-none bg-surface-nav border border-surface-border rounded-md px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed'
            value={low}
            onChange={(e) => {
              dispatch({
                action: 'set-fa-year',
                low: Number(e.target.value),
              });
            }}
            disabled={max === 0}
          >
            {faYears
              .filter((value) => value < high)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
          <ChevronDown
            size={14}
            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
          />
        </div>
        <div className='relative flex-1'>
          <select
            className='w-full appearance-none bg-surface-nav border border-surface-border rounded-md px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed'
            value={high}
            onChange={(e) => {
              dispatch({
                action: 'set-fa-year',
                high: Number(e.target.value),
              });
            }}
            disabled={max === 0}
          >
            {faYears
              .filter((value) => value > low)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
          <ChevronDown
            size={14}
            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none'
          />
        </div>
      </div>
    </div>
  );
};
