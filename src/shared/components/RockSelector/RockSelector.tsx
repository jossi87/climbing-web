import { useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { GroupBase, StylesConfig } from 'react-select';
import { themedSelectStyles } from '../../ui/reactSelectStyles';

type RockOption = { label: string; value: string };

type RockSelectorProps = {
  rock: string | null;
  rocks: string[] | null;
  onRockUpdated: (newValue: string | null) => void;
  placeholder: string;
};

/**
 * Creatable picker for the optional **rock grouping** on a problem.
 *
 * `react-select` ships fixed white-on-white inline styles, so an unstyled instance ignores our
 * theme entirely and looks like a foreign element on the dark form (and washed out on the light
 * one). We therefore route the styles through {@link themedSelectStyles}, which paints every
 * surface with the same CSS custom properties the rest of the app uses — those vars are
 * redefined under `.light` in `src/index.css`, so the same style object renders correctly in
 * both modes without any prop wiring.
 *
 * Single-select + creatable: users typically pick from existing rocks on the sector but can
 * type a new name to create one (`isClearable` lets them undo a stray pick without reaching for
 * the "n/a" sentinel).
 */
const RockSelector = ({ rock, rocks, onRockUpdated, placeholder }: RockSelectorProps) => {
  const [value, setValue] = useState<RockOption | null>(rock ? { label: rock, value: rock } : null);

  /** Memoised so identity-stable styles don't churn react-select internals each render. */
  const styles = useMemo<StylesConfig<RockOption, false, GroupBase<RockOption>>>(
    () => themedSelectStyles<RockOption, false>(),
    [],
  );

  function handleChange(newValue: RockOption | null) {
    setValue(newValue);
    onRockUpdated(newValue ? newValue.value : null);
  }
  const options = rocks ? rocks.map((r) => ({ label: r, value: r })) : [];
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CreatableSelect<RockOption, false>
          isClearable
          placeholder={placeholder}
          options={options}
          onChange={handleChange}
          value={value}
          styles={styles}
        />
      </div>
    </div>
  );
};

export default RockSelector;
