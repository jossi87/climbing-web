import React, { CSSProperties } from 'react';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { Dropdown } from 'semantic-ui-react';
import { useGrades } from '../../meta';

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

export const GradeSelect = ({
  low: filterGradeLow,
  high: filterGradeHigh,
  dispatch,
  style,
}: Props) => {
  const { easyToHard, mapping: gradeIndexMapping } = useGrades();

  const max = Math.max(easyToHard.length - 1, 0);
  const low = filterGradeLow || easyToHard[0];
  const high = filterGradeHigh || easyToHard[max];

  return (
    <div style={style}>
      <div style={{ marginBottom: 20 }}>
        <RangeSlider
          key={`${0}-${max}`}
          min={0}
          max={max}
          value={[gradeIndexMapping[low] ?? 0, gradeIndexMapping[high] ?? max]}
          onInput={([l, h]) => {
            dispatch({
              action: 'set-grades',
              low: easyToHard[l] ?? easyToHard[0],
              high: easyToHard[h] ?? easyToHard[max],
            });
          }}
          disabled={max === 0}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
          <Dropdown
            text={low}
            value={low}
            scrolling
            pointing='top left'
            options={easyToHard
              .filter((label) => {
                const rank = gradeIndexMapping[label];
                return rank < (gradeIndexMapping[high] ?? max);
              })
              .map((label) => ({ key: label, text: label, value: label }))}
            onChange={(_, { value }) => {
              dispatch({
                action: 'set-grade',
                low: String(value),
              });
            }}
          />
        </div>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <Dropdown
            text={high}
            value={high}
            scrolling
            pointing='top right'
            options={easyToHard
              .filter((label) => {
                const rank = gradeIndexMapping[label];
                return rank > (gradeIndexMapping[low] ?? 0);
              })
              .map((label) => ({ key: label, text: label, value: label }))}
            onChange={(_, { value }) => {
              dispatch({
                action: 'set-grade',
                high: String(value),
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
