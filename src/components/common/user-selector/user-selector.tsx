import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { useUserSearch } from './../../../api';
import { components } from '../../../@types/buldreinfo/swagger';

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

export const UserSelector = ({ placeholder, defaultValue, onUserUpdated }: SingleUserProps) => {
  const [value, setValue] = useState('');
  const { data: options = [] } = useUserSearch(value);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <CreatableSelect<UserOption, false>
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
            const userExist = !!options.find(
              (u) => u.name && inputValue.toLowerCase() === u.name.toLowerCase(),
            );
            return !userExist;
          }}
          placeholder={placeholder}
          onChange={(newValue) => onUserUpdated(newValue as UserOption)}
          defaultValue={
            defaultValue != null ? { label: defaultValue, value: defaultValue } : undefined
          }
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
            const userExist = !!options.find(
              (u) => u.name && inputValue.toLowerCase() === u.name.toLowerCase(),
            );
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
