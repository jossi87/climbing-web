import { useMemo, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { GroupBase, SelectInstance, StylesConfig } from 'react-select';
import { useUserSearch } from '../../api';
import type { components } from '../../@types/buldreinfo/swagger';
import { themedSelectStyles } from './reactSelectStyles';

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

/**
 * Portaled menus (`menuPortalTarget=document.body`) do not inherit the control's font size — the
 * shared base sets the menu reading size to `0.875rem`; the variant builders below override
 * `option`/`noOptionsMessage`/`loadingMessage` to `0.8125rem` so portaled options sit at the same
 * 13px reading size as the compact / inline-style controls.
 */
const menuFontMatchField = '0.8125rem';

/**
 * Theme-aware base for both the single + multi user pickers — see {@link themedSelectStyles} for
 * the token mapping. The compact / inline-input variants below spread this base then override
 * height + padding only, so any future palette change in the shared module flows through here for
 * free.
 */
const darkSelectStyles = themedSelectStyles<UserOption, boolean>();

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
      option: (base, state) => ({
        ...darkSelectStyles.option!(base, state),
        fontSize: menuFontMatchField,
      }),
      noOptionsMessage: (base, props) => ({
        ...darkSelectStyles.noOptionsMessage!(base, props),
        fontSize: menuFontMatchField,
      }),
      loadingMessage: (base, props) => ({
        ...darkSelectStyles.loadingMessage!(base, props),
        fontSize: menuFontMatchField,
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
    option: (base, state) => ({
      ...darkSelectStyles.option!(base, state),
      fontSize: menuFontMatchField,
    }),
    noOptionsMessage: (base, props) => ({
      ...darkSelectStyles.noOptionsMessage!(base, props),
      fontSize: menuFontMatchField,
    }),
    loadingMessage: (base, props) => ({
      ...darkSelectStyles.loadingMessage!(base, props),
      fontSize: menuFontMatchField,
    }),
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
