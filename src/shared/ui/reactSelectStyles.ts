import type { GroupBase, StylesConfig } from 'react-select';

/**
 * **Theme-aware base styles for `react-select` (and `react-select/creatable`).**
 *
 * `react-select` renders its own DOM with **inline styles**, so unstyled instances ignore the
 * surrounding theme entirely (it ships a fixed white-on-white control + menu). To make selects
 * follow our light/dark mode we point each surface at the same CSS custom properties the rest of
 * the app uses — those vars are redefined under `.light` in `src/index.css`, so the same style
 * object renders correctly in either theme.
 *
 * Why a thunk (vs a plain object): `StylesConfig` is parameterised on `<TOption, IsMulti, Group>`,
 * and a single concrete object can only fit one `TOption`. Returning `as StylesConfig<TOption, …>`
 * from a generic factory keeps every caller's `<TOption>` type-safe without a leaky `unknown` cast
 * at the call site.
 *
 * Tokens used (see `src/index.css`):
 * - `--color-surface-nav`     → control / chip background
 * - `--color-surface-card`    → menu background
 * - `--color-surface-border`  → control + menu borders, indicator separator
 * - `--color-surface-hover`   → focused option, multi-value chip mix base
 * - `--color-brand-border`    → focused control border
 * - `--color-datepicker-text` → input text + selected value + option text
 * - `--color-datepicker-muted`→ placeholder + idle indicator icons
 * - `--color-datepicker-nav` / `--color-datepicker-nav-hover` → indicator hover/focus
 * - `--color-muted-ink`       → multi-value remove (×) idle ink
 *
 * Composability: callers that need a different control height / font (compact toolbar, modal,
 * etc.) should spread this object first then override only the keys they care about — see
 * `buildSelectStyles` in `UserSelector.tsx` for the canonical pattern.
 *
 * Portaled menus: when `menuPortalTarget=document.body` is passed, the menu element escapes the
 * control's font cascade — `option`, `noOptionsMessage` and `loadingMessage` therefore set
 * `fontSize` explicitly here so portaled options match the field's reading size instead of
 * inheriting the user-agent default (~16px) on top of a 13px control.
 */

/** Portaled menus do not inherit the control's font size — set explicitly so options match the field. */
const optionFontSize = '0.875rem';

export function themedSelectStyles<TOption, IsMulti extends boolean = boolean>(): StylesConfig<
  TOption,
  IsMulti,
  GroupBase<TOption>
> {
  return {
    control: (base, state) => ({
      ...base,
      cursor: 'text',
      backgroundColor: 'var(--color-surface-nav)',
      borderColor: state.isFocused ? 'var(--color-brand-border)' : 'var(--color-surface-border)',
      borderRadius: '0.5rem',
      minHeight: '2.625rem',
      boxShadow: 'none',
      outline: 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--color-brand-border)' : 'var(--color-surface-border)',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--color-surface-card)',
      border: '1px solid var(--color-surface-border)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
    }),
    menuList: (base) => ({ ...base, padding: '0.25rem' }),
    menuPortal: (base) => ({ ...base, zIndex: 1100 }),
    option: (base, state) => ({
      ...base,
      fontSize: optionFontSize,
      lineHeight: 1.35,
      cursor: 'pointer',
      backgroundColor: state.isFocused ? 'var(--color-surface-hover)' : 'transparent',
      color: 'var(--color-datepicker-text)',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'color-mix(in srgb, var(--color-surface-hover) 88%, var(--color-surface-border))',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (base) => ({ ...base, color: 'var(--color-datepicker-text)', fontSize: '0.8125rem' }),
    multiValueRemove: (base) => ({
      ...base,
      cursor: 'pointer',
      color: 'var(--color-muted-ink)',
      ':hover': { backgroundColor: 'transparent', color: 'var(--color-datepicker-text)' },
    }),
    input: (base) => ({
      ...base,
      color: 'var(--color-datepicker-text)',
      boxShadow: 'none',
      outline: 'none',
    }),
    placeholder: (base) => ({ ...base, color: 'var(--color-datepicker-muted)' }),
    singleValue: (base) => ({ ...base, color: 'var(--color-datepicker-text)' }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: 'var(--color-surface-border)' }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? 'var(--color-datepicker-nav)' : 'var(--color-datepicker-muted)',
      ':hover': { color: 'var(--color-datepicker-nav-hover)' },
    }),
    clearIndicator: (base) => ({
      ...base,
      cursor: 'pointer',
      color: 'var(--color-datepicker-muted)',
      ':hover': { color: 'var(--color-datepicker-nav-hover)' },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      fontSize: optionFontSize,
      lineHeight: 1.35,
      color: 'var(--color-datepicker-muted)',
    }),
    loadingMessage: (base) => ({
      ...base,
      fontSize: optionFontSize,
      lineHeight: 1.35,
      color: 'var(--color-datepicker-muted)',
    }),
  };
}
