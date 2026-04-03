import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { GroupBase, StylesConfig } from 'react-select';
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
};

type SingleUserProps = {
  placeholder: string;
  defaultValue: string;
  onUserUpdated: (user: UserOption) => void;
};

/** Dark UI to match `bg-surface-nav` / cards (react-select defaults to white). */
const darkSelectStyles: StylesConfig<UserOption, boolean, GroupBase<UserOption>> = {
  control: (base, state) => ({
    ...base,
    cursor: 'default',
    backgroundColor: 'var(--color-surface-nav)',
    borderColor: state.isFocused
      ? 'color-mix(in srgb, var(--color-brand) 55%, transparent)'
      : 'var(--color-surface-border)',
    borderRadius: '0.5rem',
    minHeight: '2.625rem',
    boxShadow: state.isFocused ? '0 0 0 1px color-mix(in srgb, var(--color-brand) 35%, transparent)' : 'none',
    '&:hover': { borderColor: 'var(--color-surface-border)' },
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
    color: 'rgb(226 232 240)',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgb(41 45 53)',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base) => ({ ...base, color: 'rgb(226 232 240)', fontSize: '0.8125rem' }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'rgb(148 163 184)',
    ':hover': { backgroundColor: 'transparent', color: 'rgb(226 232 240)' },
  }),
  input: (base) => ({ ...base, color: 'rgb(226 232 240)' }),
  placeholder: (base) => ({ ...base, color: 'rgb(100 116 139)' }),
  singleValue: (base) => ({ ...base, color: 'rgb(226 232 240)' }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: 'var(--color-surface-border)' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
    ':hover': { color: 'rgb(203 213 225)' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'rgb(100 116 139)',
    ':hover': { color: 'rgb(203 213 225)' },
  }),
};

const selectProps = {
  styles: darkSelectStyles,
  menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
  menuPosition: 'fixed' as const,
};

export const UserSelector = ({ placeholder, defaultValue, onUserUpdated }: SingleUserProps) => {
  const [value, setValue] = useState('');
  const { data: options = [] } = useUserSearch(value);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CreatableSelect<UserOption, false>
          {...selectProps}
          isClearable
          onInputChange={(newValue) => setValue(newValue)}
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
          onChange={(newValue) => onUserUpdated(newValue as UserOption)}
          defaultValue={defaultValue != null ? { label: defaultValue, value: defaultValue } : undefined}
        />
      </div>
    </div>
  );
};

export const UsersSelector = ({ placeholder, users, onUsersUpdated }: MultiUserProps) => {
  const [value, setValue] = useState('');
  const { data: options = [] } = useUserSearch(value);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CreatableSelect<UserOption, true>
          {...selectProps}
          isMulti
          isClearable
          onInputChange={(newValue) => setValue(newValue)}
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
          onChange={(newValue) => onUsersUpdated(newValue as UserOption[])}
        />
      </div>
    </div>
  );
};
