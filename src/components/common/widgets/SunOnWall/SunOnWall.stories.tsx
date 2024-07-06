import { Meta, StoryObj } from "@storybook/react";
import { SunOnWall } from "./SunOnWall";
import { ComponentProps } from "react";

export default {
  title: "components/common/widgets/SunOnWall",
  component: SunOnWall,
  args: {
    sunFromHour: 6,
    sunToHour: 18,
  } satisfies ComponentProps<typeof SunOnWall>,
} satisfies Meta<typeof SunOnWall>;

export const Default: StoryObj<typeof SunOnWall> = {};

export const InvalidFrom: typeof Default = {
  args: {
    sunFromHour: -1,
  },
};

export const InvalidTo: typeof Default = {
  args: {
    sunToHour: 25,
  },
};

export const Flipped: typeof Default = {
  args: {
    sunFromHour: 18,
    sunToHour: 6,
  },
};

export const MidnightSun: typeof Default = {
  args: {
    sunFromHour: Number.NaN,
    sunToHour: Number.NaN,
  },
};
