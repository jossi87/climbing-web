import { useFilter } from '../context';
import { useFaYears } from '../../Meta';
import { ChevronDown } from 'lucide-react';

/**
 * `0` is the "no bound" value for both ends of the range (see the problems reducer), so
 * each select offers an explicit "Any" option: rendering the first/last year while the
 * state is unbounded would claim a bound that is not applied.
 */
export const YearSelect = () => {
  const { filterFaYearLow, filterFaYearHigh, dispatch } = useFilter();
  const faYears = useFaYears();

  const minYear = faYears[0] ?? 0;
  const maxYear = faYears[faYears.length - 1] ?? 0;
  // Bounds used to build the option lists (the other select's *effective* bound).
  const low = filterFaYearLow || minYear;
  const high = filterFaYearHigh || maxYear;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <select
            className='bg-surface-nav border-surface-border type-body focus:border-brand w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={filterFaYearLow}
            onChange={(e) => {
              dispatch({
                action: 'set-fa-year',
                low: Number(e.target.value),
              });
            }}
            disabled={faYears.length < 2}
          >
            <option value={0}>Any</option>
            {/* `<=` / `>=` so both ends can be the same year (e.g. “2005 – 2005”), like the grade filter. */}
            {faYears
              .filter((value) => value <= high)
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
            className='bg-surface-nav border-surface-border type-body focus:border-brand w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            value={filterFaYearHigh}
            onChange={(e) => {
              dispatch({
                action: 'set-fa-year',
                high: Number(e.target.value),
              });
            }}
            disabled={faYears.length < 2}
          >
            {faYears
              .filter((value) => value >= low)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            <option value={0}>Any</option>
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
