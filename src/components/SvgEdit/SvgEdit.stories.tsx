import { ComponentProps } from "react";
import { withMeta } from "../common/meta/withMeta";
import { SvgEdit } from "./SvgEdit";
import { actions } from "@storybook/addon-actions";
import { StoryObj } from "@storybook/react";

export default {
  title: "components/SvgEdit",
  component: SvgEdit,
  decorators: [withMeta],
  args: {
    imageUrl: "https://picsum.photos/seed/buldre/600/800?grayscale",
    saving: false,
    anchors: [],
    h: 800,
    w: 600,
    hasAnchor: false,
    nr: 234,
    path: "",
    svgId: 345,
    texts: [],
    tradBelayStations: [],
    readOnlySvgs: [],
    ...actions("onSave", "onCancel"),
  } satisfies Required<ComponentProps<typeof SvgEdit>>,
};

type Story = StoryObj<typeof SvgEdit>;

export const Default: Story = {};

export const WithPath: Story = {
  args: {
    path: "M 254 420 L 234 375 L 209 336 L 197 285 L 179 258 L 166 223 L 167 195 L 172 153",
  },
};

export const WithCubicPath: Story = {
  args: {
    path: "M 247 405 C 209 355 244 348 191 291 C 154 233 201 249 182 211 C 169 200.5 178 151 206 190 ",
  },
};

export const WithTradBelayStations: Story = {
  args: {
    tradBelayStations: [
      { x: 100, y: 200 },
      { x: 325, y: 150 },
    ],
  },
};

export const WithText: Story = {
  args: {
    texts: [{ x: 100, y: 200, txt: "Foo" }],
  },
};

export const WithAnchors: Story = {
  args: {
    anchors: [
      { x: 100, y: 200 },
      { x: 325, y: 150 },
    ],
  },
};

export const WithOtherSvgs: Story = {
  args: {
    readOnlySvgs: [
      {
        nr: 1,
        anchors: [],
        hasAnchor: false,
        path: WithPath.args?.path ?? "",
        tradBelayStations: [],
        texts: [
          {
            txt: "Sample text", // This should not show
            x: 500,
            y: 350,
          },
        ],
        t: "other",
      },
      {
        nr: 2,
        anchors: [],
        hasAnchor: false,
        path: "M 396 379 C 344.5 357.5 402 316 343 336 C 284 354 300 276 368 248 C 375 225.5 480 244 432 203 C 384 174 458 171 386 145 C 333.5 135 384 117 331 125 ",
        tradBelayStations: [],
        texts: [],
        t: "other",
      },
    ],
  },
};

// Show that we only do the snapping at dragging, not in the cleanup pass.
export const WithCloseOverlap: Story = {
  ...WithOtherSvgs,
  args: {
    ...WithOtherSvgs.args,
    path:
      WithOtherSvgs?.args?.readOnlySvgs?.[0]?.path
        ?.split(" ")
        .map((v) => {
          const num = +v;
          if (Number.isNaN(num)) {
            return v;
          }

          return num - 10;
        })
        .join(" ") ?? "",
  },
};
