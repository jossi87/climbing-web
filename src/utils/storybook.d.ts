import type { Meta } from "@storybook/react";
import { ComponentProps } from "react";

export type MetaArgs<T> = Meta<T> & { args: ComponentProps<T> };
