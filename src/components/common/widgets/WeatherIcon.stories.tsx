import { TWeatherSymbolKey } from "../../../yr";
import { WeatherIcon } from "./widgets";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/common/widgets/WeatherIcon",
  component: WeatherIcon,
  args: {
    symbol: undefined,
  },
} satisfies Meta<typeof WeatherIcon>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Undefined: Story = {
  args: {
    symbol: undefined as TWeatherSymbolKey,
  },
};

export const Loading: Story = {
  args: {
    symbol: "loading" as TWeatherSymbolKey,
  },
};

export const ClearPolarTwilight: Story = {
  args: {
    symbol: "clearsky_polartwilight" as TWeatherSymbolKey,
  },
};
