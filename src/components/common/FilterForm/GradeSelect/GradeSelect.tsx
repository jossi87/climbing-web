import React, { useMemo } from "react";
import RangeSlider from "react-range-slider-input";
import { useMeta } from "../../meta";
import "react-range-slider-input/dist/style.css";
import { useFilter } from "../context";
import { Dropdown } from "semantic-ui-react";

export const GradeSelect = () => {
  const { filterGradeLow, filterGradeHigh, dispatch } = useFilter();
  const { grades } = useMeta();
  const [gradesLowHigh, indexMapping] = useMemo(() => {
    const easyToHard = grades.map(({ grade }) => grade).reverse();
    const indexMapping = easyToHard.reduce(
      (acc, grade, i) => ({ ...acc, [grade]: i }),
      {},
    );
    return [easyToHard, indexMapping];
  }, [grades]);

  const max = Math.max(grades.length - 1, 0);
  const sorted = gradesLowHigh;
  const mapped = indexMapping;
  const low = filterGradeLow || sorted[0];
  const high = filterGradeHigh || sorted[max];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <RangeSlider
          key={`${0}-${max}`}
          min={0}
          max={max}
          value={[mapped[low] ?? 0, mapped[high] ?? max]}
          onInput={([l, h]) => {
            dispatch({
              action: "set-grades",
              low: sorted[l] ?? sorted[0],
              high: sorted[h] ?? sorted[max],
              gradeDifficultyLookup: indexMapping,
            });
          }}
          disabled={max === 0}
        />
      </div>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "start" }}
      >
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-start" }}>
          <Dropdown
            text={low}
            value={low}
            scrolling
            pointing="top left"
            options={(sorted as unknown as string[])
              .filter((label) => {
                const rank = mapped[label];
                return rank < (mapped[high] ?? max);
              })
              .map((label) => ({ key: label, text: label, value: label }))}
            onChange={(_, { value }) => {
              dispatch({
                action: "set-grade",
                low: String(value),
                gradeDifficultyLookup: indexMapping,
              });
            }}
          />
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
          <Dropdown
            text={high}
            value={high}
            scrolling
            pointing="top right"
            options={(sorted as unknown as string[])
              .filter((label) => {
                const rank = mapped[label];
                return rank > (mapped[low] ?? 0);
              })
              .map((label) => ({ key: label, text: label, value: label }))}
            onChange={(_, { value }) => {
              dispatch({
                action: "set-grade",
                high: String(value),
                gradeDifficultyLookup: indexMapping,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
