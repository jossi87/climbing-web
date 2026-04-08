import { useMemo, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { GroupBase, SelectInstance, StylesConfig } from 'react-select';
import { useUserSearch } from '../../api';
import type { components } from '../../@types/buldreinfo/swagger';

type UserOption = {
  value?: string | number;
  label?: string;
} & components['schemas']['User'];

type MultiUserProps = {
  placeholder: string;
  users: UserOption[];
  onUsersUpdated: (user: UserOption[]) => void;
  /** Match MediaUpload caption input look (same border/background/text rhythm). */
  matchInputLeadStyle?: boolean;
};

type SingleUserProps = {
  placeholder: string;
  /** Controlled selected name (plain string from API / creatable). */
  value: string | undefined;
  onUserUpdated: (user: UserOption | null) => void;
  /** Match MediaUpload caption input look (same border/background/text rhythm). */
  matchInputLeadStyle?: boolean;
};

/** Dark UI to match `bg-surface-nav` / cards (react-select defaults to white). */
const darkSelectStyles: StylesConfig<UserOption, boolean, GroupBase<UserOption>> = {
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
  input: (base, _state) => ({
    ...base,
    color: 'var(--color-datepicker-text)',
    boxShadow: 'none',
    outline: 'none',
  }),
  placeholder: (base, _state) => ({ ...base, color: 'var(--color-datepicker-muted)' }),
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
  noOptionsMessage: (base) => ({ ...base, color: 'var(--color-datepicker-muted)' }),
  loadingMessage: (base) => ({ ...base, color: 'var(--color-datepicker-muted)' }),
};

/** Tighter control + border-only focus (avoid stacked ring + placeholder clash when focused). */
function buildSelectStyles(
  compact: boolean,
  matchInputLeadStyle: boolean,
): StylesConfig<UserOption, boolean, GroupBase<UserOption>> {
  if (matchInputLeadStyle) {
    return {
      ...darkSelectStyles,
      control: (base, state) => ({
        ...darkSelectStyles.control!(base, state),
        minHeight: '2.25rem',
        fontSize: '0.8125rem',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--color-surface-nav)',
        borderColor: state.isFocused
          ? 'color-mix(in srgb, var(--color-brand) 55%, transparent)'
          : 'color-mix(in srgb, var(--color-surface-border) 80%, transparent)',
      }),
      valueContainer: (base) => ({
        ...base,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: '0.375rem',
        paddingRight: '0.25rem',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        height: '2.25rem',
      }),
      input: (base, state) => ({
        ...darkSelectStyles.input!(base, state),
        margin: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }),
      placeholder: (base, state) => ({
        ...darkSelectStyles.placeholder!(base, state),
        margin: 0,
      }),
    };
  }
  if (!compact) return darkSelectStyles;
  return {
    ...darkSelectStyles,
    control: (base, state) => {
      const b = darkSelectStyles.control!(base, state);
      return {
        ...b,
        minHeight: '2.25rem',
        fontSize: '0.8125rem',
        borderRadius: '0.5rem',
        outline: 'none',
        boxShadow: 'none',
        borderColor: state.isFocused
          ? 'var(--color-brand-border)'
          : 'color-mix(in srgb, var(--color-surface-border) 85%, transparent)',
      };
    },
    valueContainer: (base) => ({
      ...base,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: '0.375rem',
      paddingRight: '0.25rem',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '2.25rem',
    }),
    input: (base, state) => ({
      ...darkSelectStyles.input!(base, state),
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    placeholder: (base, props) => {
      const sp = props.selectProps as { value?: unknown; inputValue?: string };
      const v = sp.value;
      const hasSelection = v != null && (Array.isArray(v) ? v.length > 0 : true);
      const typing = (sp.inputValue ?? '').length > 0;
      const hideWhileFocused = props.isFocused && (hasSelection || typing);
      return {
        ...base,
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity: hideWhileFocused ? 0 : 1,
        transition: 'opacity 80ms ease',
        pointerEvents: hideWhileFocused ? 'none' : undefined,
      };
    },
  };
}

const menuProps = {
  menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
  menuPosition: 'fixed' as const,
};
const selectClassPrefix = 'user-select';

export const UserSelector = ({
  placeholder,
  value: photographerName,
  onUserUpdated,
  compact,
  matchInputLeadStyle = false,
}: SingleUserProps & { compact?: boolean }) => {
  const [searchInput, setSearchInput] = useState('');
  const { data: options = [] } = useUserSearch(searchInput);
  const styles = useMemo(() => buildSelectStyles(!!compact, matchInputLeadStyle), [compact, matchInputLeadStyle]);
  const selectRef = useRef<SelectInstance<UserOption, false>>(null);

  const selectedOption =
    photographerName != null && photographerName !== '' ? { label: photographerName, value: photographerName } : null;

  const blurIfCleared = (next: UserOption | null) => {
    if (next !== null) return;
    const run = () => selectRef.current?.blur();
    queueMicrotask(run);
    setTimeout(run, 0);
  };

  return (
    <div className='min-w-0 flex-1' style={{ position: 'relative', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CreatableSelect<UserOption, false>
          ref={selectRef}
          {...menuProps}
          classNamePrefix={selectClassPrefix}
          styles={styles}
          isClearable
          blurInputOnSelect
          value={selectedOption}
          onInputChange={(newValue) => setSearchInput(newValue)}
          options={options
            .filter((user) => user.id && user.name)
            .map((user) => ({
              ...user,
              value: user.id ?? 0,
              label: user.name ?? '',
            }))}
          isValidNewOption={(inputValue) => {
            const userExist = !!options.find((u) => u.name && inputValue.toLowerCase() === u.name.toLowerCase());
            return !userExist;
          }}
          placeholder={placeholder}
          onChange={(newValue) => {
            blurIfCleared(newValue as UserOption | null);
            onUserUpdated(newValue as UserOption | null);
          }}
        />
      </div>
    </div>
  );
};

export const UsersSelector = ({
  placeholder,
  users,
  onUsersUpdated,
  compact,
  matchInputLeadStyle = false,
}: MultiUserProps & { compact?: boolean }) => {
  const [searchInput, setSearchInput] = useState('');
  const { data: options = [] } = useUserSearch(searchInput);
  const styles = useMemo(() => buildSelectStyles(!!compact, matchInputLeadStyle), [compact, matchInputLeadStyle]);
  const selectRef = useRef<SelectInstance<UserOption, true>>(null);

  const blurIfAllCleared = (next: readonly UserOption[] | null) => {
    if (next && next.length > 0) return;
    const run = () => selectRef.current?.blur();
    queueMicrotask(run);
    setTimeout(run, 0);
  };

  return (
    <div className='min-w-0 flex-1' style={{ position: 'relative', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CreatableSelect<UserOption, true>
          ref={selectRef}
          {...menuProps}
          classNamePrefix={selectClassPrefix}
          styles={styles}
          isMulti
          isClearable
          blurInputOnSelect
          onInputChange={(newValue) => setSearchInput(newValue)}
          options={options
            .filter((user) => user.id && user.name)
            .map((user) => ({
              ...user,
              value: user.id ?? 0,
              label: user.name ?? '',
            }))}
          isValidNewOption={(inputValue) => {
            const userExist = !!options.find((u) => u.name && inputValue.toLowerCase() === u.name.toLowerCase());
            return !userExist;
          }}
          placeholder={placeholder}
          value={users?.map((user) => ({
            ...user,
            value: user.id ?? 0,
            label: user.name ?? '',
          }))}
          onChange={(newValue) => {
            blurIfAllCleared(newValue as readonly UserOption[] | null);
            onUsersUpdated(newValue as UserOption[]);
          }}
        />
      </div>
    </div>
  );
};
