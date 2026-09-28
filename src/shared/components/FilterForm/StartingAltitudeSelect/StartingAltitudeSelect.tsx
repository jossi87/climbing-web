import { useFilter } from '../context';
import { ChevronDown } from 'lucide-react';

/**
 * `0` is the "no bound" value for both ends of the range (see the problems reducer), so
 * each select offers an explicit "Any" option instead of a bound that is not applied.
 */
export const StartingAltitudeSelect = () => {
  const { filterStartingAltitudeLow, filterStartingAltitudeHigh, dispatch } = useFilter();

  const minAlt = 0;
  const maxAlt = 1000;
  const step = 25;

  // Bounds used to build the option lists (the other select's *effective* bound).
  const low = filterStartingAltitudeLow || minAlt;
  const high = filterStartingAltitudeHigh || maxAlt;

  const altitudeRange = Array.from({ length: (maxAlt - minAlt) / step + 1 }, (_, i) => minAlt + i * step);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <select
            className='bg-surface-nav border-surface-border type-body focus:border-brand w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none'
            value={filterStartingAltitudeLow}
            onChange={(e) => {
              dispatch({
                action: 'set-starting-altitude',
                low: Number(e.target.value),
              });
            }}
          >
            <option value={0}>Any</option>
            {/* Inclusive bounds (`<=` / `>=`) so “500m – 500m” is selectable; 0m stays the “Any” option. */}
            {altitudeRange
              .filter((value) => value > minAlt && value <= high)
              .map((alt) => (
                <option key={alt} value={alt}>
                  {alt}m
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
            className='bg-surface-nav border-surface-border type-body focus:border-brand w-full appearance-none rounded-md border px-3 py-1.5 pr-8 focus:outline-none'
            value={filterStartingAltitudeHigh}
            onChange={(e) => {
              dispatch({
                action: 'set-starting-altitude',
                high: Number(e.target.value),
              });
            }}
          >
            {altitudeRange
              .filter((value) => value > minAlt && value >= low)
              .map((alt) => (
                <option key={alt} value={alt}>
                  {alt}m
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
