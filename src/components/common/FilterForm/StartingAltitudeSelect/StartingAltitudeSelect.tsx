import RangeSlider from '../../RangeSlider';
import 'react-range-slider-input/dist/style.css';
import { useFilter } from '../context';
import { ChevronDown } from 'lucide-react';

export const StartingAltitudeSelect = () => {
  const { filterStartingAltitudeLow, filterStartingAltitudeHigh, dispatch } = useFilter();

  const minAlt = 0;
  const maxAlt = 1000;
  const step = 25;

  const low = filterStartingAltitudeLow ?? minAlt;
  const high = filterStartingAltitudeHigh ?? maxAlt;

  const altitudeRange = Array.from(
    { length: (maxAlt - minAlt) / step + 1 },
    (_, i) => minAlt + i * step,
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='px-1 mt-2'>
        <RangeSlider
          min={minAlt}
          max={maxAlt}
          step={step}
          value={[low, high]}
          onInput={([l, h]) => {
            dispatch({
              action: 'set-starting-altitudes',
              low: l ?? minAlt,
              high: h ?? maxAlt,
            });
          }}
        />
      </div>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <select
            className='w-full appearance-none bg-surface-nav border border-surface-border rounded-md px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-brand'
            value={low}
            onChange={(e) => {
              dispatch({
                action: 'set-starting-altitude',
                low: Number(e.target.value),
              });
            }}
          >
            {altitudeRange
              .filter((value) => value < high)
              .map((alt) => (
                <option key={alt} value={alt}>
                  {alt}m
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
            className='w-full appearance-none bg-surface-nav border border-surface-border rounded-md px-3 py-1.5 text-sm text-white pr-8 focus:outline-none focus:border-brand'
            value={high}
            onChange={(e) => {
              dispatch({
                action: 'set-starting-altitude',
                high: Number(e.target.value),
              });
            }}
          >
            {altitudeRange
              .filter((value) => value > low)
              .map((alt) => (
                <option key={alt} value={alt}>
                  {alt}m
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
