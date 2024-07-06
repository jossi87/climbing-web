import { Meta, StoryObj } from "@storybook/react";
import { SunriseSunset } from "./SunriseSunset";
import { ComponentProps } from "react";

export default {
  title: "components/common/widgets/SunriseSunset",
  component: SunriseSunset,
  args: {
    lat: 69.75885227587338,
    lng: 18.52388329795636,
    date: new Date("2024-03-14T15:09:26.000Z"),
  } satisfies ComponentProps<typeof SunriseSunset>,
} satisfies Meta<typeof SunriseSunset>;

export const Default: StoryObj<typeof SunriseSunset> = {};

export const MidnightSun: typeof Default = {
  args: {
    date: new Date("2024-07-06T07:43:41.000Z"),
  },
};

export const PolarNight: typeof Default = {
  args: {
    date: new Date("2024-12-14T15:09:26.000Z"),
  },
};
