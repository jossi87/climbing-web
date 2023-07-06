import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";

type RockSelectorProps = {
  rock: string | null;
  rocks: string[] | null;
  onRockUpdated: (_: any) => void;
  placeholder: string;
};

const RockSelector = ({
  rock,
  rocks,
  onRockUpdated,
  placeholder,
}: RockSelectorProps) => {
  const [value, setValue] = useState(
    rock ? { label: rock, value: rock } : null,
  );

  function handleChange(newValue: any) {
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
