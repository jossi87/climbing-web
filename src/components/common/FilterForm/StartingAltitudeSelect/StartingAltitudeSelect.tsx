import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { useFilter } from '../context';
import { Dropdown } from 'semantic-ui-react';

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
    <div>
      <div style={{ marginBottom: 20 }}>
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
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
          <Dropdown
            text={`${low}m`}
            value={low}
            scrolling
            pointing='top left'
            options={altitudeRange
              .filter((value) => value < high)
              .map((alt) => ({ key: alt, text: `${alt}m`, value: alt }))}
            onChange={(_, { value = 0 }) => {
              dispatch({
                action: 'set-starting-altitude',
                low: +value,
              });
            }}
          />
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <Dropdown
            text={`${high}m`}
            value={high}
            scrolling
            pointing='top right'
            options={altitudeRange
              .filter((value) => value > low)
              .map((alt) => ({ key: alt, text: `${alt}m`, value: alt }))}
            onChange={(_, { value = 0 }) => {
              dispatch({
                action: 'set-starting-altitude',
                high: +value,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
