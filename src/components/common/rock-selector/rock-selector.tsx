import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";

const RockSelector = ({ rock, rocks, onRockUpdated, placeholder }) => {
  const [value, setValue] = useState(
    rock ? { label: rock, value: rock } : null
  );

  function handleChange(newValue: any, actionMeta: any) {
    if (!newValue) {
      newValue = null;
    }
    setValue(newValue);
    onRockUpdated(newValue ? newValue.value : null);
  }
  const options = rocks ? rocks.map((r) => ({ label: r, value: r })) : [];
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ width: "100%" }}>
        <CreatableSelect
          isClearable
          placeholder={placeholder}
          options={options}
          onChange={handleChange}
          value={value}
        />
      </div>
    </div>
  );
};

export default RockSelector;
