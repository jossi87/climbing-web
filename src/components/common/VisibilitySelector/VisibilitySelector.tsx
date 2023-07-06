import React, { ComponentProps } from "react";
import { Dropdown, DropdownProps, Form } from "semantic-ui-react";
import { useMeta } from "../meta";

type CustomProps = {
  value: { lockedSuperadmin: boolean; lockedAdmin: boolean };
  onChange: (val: { lockedAdmin: boolean; lockedSuperadmin: boolean }) => void;
};

type Props = CustomProps &
  Omit<DropdownProps, "value" | "onChange" | "options">;

const lockedOptions = [
  { key: 0, value: 0, text: "Visible for everyone" },
  { key: 1, value: 1, text: "Only visible for administrators" },
] as const;

const superAdminOptions = [
  ...lockedOptions,
  {
    key: 2,
    value: 2,
    text: "Only visible for super administrators",
  },
] as const;

type Mutable<T> = { -readonly [P in keyof T]: Mutable<T[P]> };

export const VisibilitySelector = ({
  value: incomingValue,
  onChange,
  ...rest
}: Props) => {
  const meta = useMeta();

  const options = meta.isSuperAdmin
    ? superAdminOptions
    : meta.isAdmin
    ? lockedOptions
    : [];

  const value = incomingValue.lockedSuperadmin
    ? 2
    : incomingValue.lockedAdmin
    ? 1
    : 0;

  return (
    <Dropdown
      {...rest}
      onChange={(_, { value }) =>
        onChange({
          lockedAdmin: value === 1,
          lockedSuperadmin: value === 2,
        })
      }
      value={value}
      options={options as Mutable<typeof options>}
    />
  );
};

export const VisibilitySelectorField = (
  props: CustomProps &
    Omit<
      ComponentProps<typeof Form.Field>,
      "options" | "value" | "onChange" | "control"
    >,
) => {
  return (
    <Form.Field
      label="Visibility"
      selection
      {...props}
      control={VisibilitySelector}
    />
  );
};
