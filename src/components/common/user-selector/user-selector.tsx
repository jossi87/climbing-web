import React, { ComponentProps } from "react";
import CreatableSelect from "react-select/creatable";
import { useUserSearch } from "./../../../api";
import { components } from "../../../@types/buldreinfo/swagger";

type UserOption = {
  value?: string | number;
  label?: string;
} & components["schemas"]["User"];

type MultiUserProps = {
  onUsersUpdated: (user: UserOption[]) => void;
  placeholder: string;
  users: UserOption[];
};

type SingleUserProps = {
  onUserUpdated: (user: UserOption) => void;
  placeholder: string;
  defaultValue: string;
};

const UserSelect = (
  props:
    | Required<
        Pick<
          ComponentProps<typeof CreatableSelect<UserOption, true>>,
          "onChange" | "placeholder" | "value"
        > & { isMulti: true }
      >
    | Required<
        Pick<
          ComponentProps<typeof CreatableSelect<UserOption, false>>,
          "onChange" | "placeholder" | "defaultValue"
        > & { isMulti: false }
      >,
) => {
  const { data: options = [] } = useUserSearch();

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ width: "100%" }}>
        <CreatableSelect<UserOption, boolean>
          isClearable
          options={options
            .filter((user) => user.id && user.name)
            .map((user) => ({
              ...user,
              value: user.id ?? 0,
              label: user.name ?? "",
            }))}
          isValidNewOption={(inputValue) => {
            const userExist = !!options.find(
              (u) =>
                u.name && inputValue.toLowerCase() === u.name.toLowerCase(),
            );
            return !userExist;
          }}
          {...props}
        />
      </div>
    </div>
  );
};

export const UserSelector = ({
  placeholder,
  defaultValue,
  onUserUpdated,
}: SingleUserProps) => {
  return (
    <UserSelect
      isMulti={false}
      placeholder={placeholder}
      onChange={onUserUpdated}
      defaultValue={{ label: defaultValue }}
    />
  );
};

export const UsersSelector = ({
  placeholder,
  users,
  onUsersUpdated,
}: MultiUserProps) => {
  return (
    <UserSelect
      isMulti={true}
      placeholder={placeholder}
      value={users?.map((user) => ({
        ...user,
        value: user.id ?? 0,
        label: user.name ?? "",
      }))}
      onChange={onUsersUpdated}
    />
  );
};
