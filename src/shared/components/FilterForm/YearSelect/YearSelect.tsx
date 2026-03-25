import RangeSlider from '../../RangeSlider';
import 'react-range-slider-input/dist/style.css';
import { useFilter } from '../context';
import { useFaYears } from '../../Meta';
import { ChevronDown } from 'lucide-react';

export const YearSelect = () => {
  const { filterFaYearLow, filterFaYearHigh, dispatch } = useFilter();
  const faYears = useFaYears();

  const max = Math.max(faYears.length - 1, 0);
  const low = filterFaYearLow || faYears[0];
  const high = filterFaYearHigh || faYears[max];

  return (
    <div className='flex flex-col gap-4'>
      <div className='mt-2 px-1'>
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
            className='bg-surface-nav border-surface-border focus:border-brand type-body w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
            className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
          />
        </div>
        <div className='relative flex-1'>
          <select
            className='bg-surface-nav border-surface-border focus:border-brand type-body w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
            className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-500'
          />
        </div>
      </div>
    </div>
  );
};
