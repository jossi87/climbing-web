import React from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { useFilter } from "../context";
import { Dropdown } from "semantic-ui-react";
import { useFaYears } from "../../meta";

// TODO: This was created by copy-and-pasting the GradeSelect component and then
//       simplifying (because the data is much less complex). Is there an
//       opportunity for creating a generic component here? Or would it just
//       wind up being more trouble than it's worth with all the data mapping
//       and different state updates and high-on-left vs high-on-right?
export const YearSelect = () => {
  const { filterFaYearLow, filterFaYearHigh, dispatch } = useFilter();
  const faYears = useFaYears();

  const max = Math.max(faYears.length - 1, 0);
  const low = filterFaYearLow || faYears[0];
  const high = filterFaYearHigh || faYears[max];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <RangeSlider
          key={`${0}-${max}`}
          min={faYears[0]}
          max={faYears[max]}
          value={[low, high]}
          onInput={([l, h]) => {
            dispatch({
              action: "set-fa-years",
              low: l ?? faYears[0],
              high: h ?? faYears[max],
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
            text={String(low)}
            value={low}
            scrolling
            pointing="top left"
            options={faYears
              .filter((value) => value < high)
              .map((year) => ({ key: year, text: String(year), value: year }))}
            onChange={(_, { value }) => {
              dispatch({
                action: "set-fa-year",
                low: +value,
              });
            }}
          />
        </div>
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
          <Dropdown
            text={String(high)}
            value={high}
            scrolling
            pointing="top right"
            options={faYears
              .filter((value) => value > low)
              .map((year) => ({ key: year, text: String(year), value: year }))}
            onChange={(_, { value }) => {
              dispatch({
                action: "set-fa-year",
                high: +value,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
