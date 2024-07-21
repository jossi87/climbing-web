import { SectorListItem } from "../../Sector";
import { ProblemList } from "./problem-list";
import { StoryObj, type Meta } from "@storybook/react";
import React from "react";
import { withMeta } from "../meta/withMeta";
import { Row } from "./types";

const CLIMBING_DATA = [
  {
    id: 123,
    name: "First bolt",
    nr: 1,
    gradeNumber: 1,
    stars: 3,
    numTicks: 4,
    ticked: true,
    fa: "",
    rock: "",
    t: {
      id: 2,
      subType: "Bolt",
      type: "Route",
    },
    areaName: "Area 1",
    sectorName: "Sector A",
  },
  {
    id: 234,
    name: "Second bolt",
    nr: 2,
    gradeNumber: 2,
    stars: 4,
    numTicks: 1,
    ticked: false,
    fa: "",
    rock: "",
    t: {
      id: 2,
      subType: "Bolt",
      type: "Route",
    },
    areaName: "Area 2",
    sectorName: "Sector B",
  },
  {
    id: 345,
    name: "First trad",
    nr: 3,
    gradeNumber: 3,
    stars: 1,
    numTicks: 2,
    ticked: true,
    fa: "Some Climber",
    rock: "",
    t: {
      id: 2,
      subType: "Trad",
      type: "Route",
    },
    areaName: "Area 2",
    sectorName: "Sector B",
  },
  {
    id: 456,
    name: "Second trad",
    nr: 4,
    gradeNumber: 4,
    stars: 2,
    numTicks: 3,
    ticked: false,
    fa: "Other Climber",
    rock: "",
    t: {
      id: 2,
      subType: "Trad",
      type: "Route",
    },
    areaName: "Area 2",
    sectorName: "Sector A",
  },
];

const BOULDERING_DATA = CLIMBING_DATA.map((p, i, data) => ({
  ...p,
  t: {
    id: 1,
    subType: "Boulder",
    type: "Boulder",
  },
  rock: `Rock #${i % Math.floor(data.length / 2)}`,
}));

const toRow = (p: Partial<(typeof CLIMBING_DATA)[number]>): Row => ({
  element: <SectorListItem key={p.id} problem={p} />,
  name: p.name ?? "",
  nr: p.nr ?? 0,
  gradeNumber: p.gradeNumber ?? 0,
  stars: p.stars ?? 0,
  numTicks: p.numTicks ?? 0,
  ticked: p.ticked ?? false,
  rock: p.rock ?? "",
  subType: (p.t?.subType || p.t?.type) ?? "",
  num: 0,
  fa: !!p.fa,
  areaName: p.areaName ?? "",
  sectorName: p.sectorName ?? "",
});

export default {
  title: "components/common/problem-list/ProblemList",
  component: ProblemList,
  args: {
    rows: CLIMBING_DATA.map(toRow),
    mode: "sector",
    defaultOrder: "grade-desc",
    storageKey: "storybook",
  },
  decorators: [withMeta],
} satisfies Meta<typeof ProblemList>;

type Story = StoryObj<typeof ProblemList>;

export const Empty: Story = {
  args: {
    rows: [],
  },
};

export const Climbing: Story = {};

export const Bouldering: Story = {
  args: {
    rows: [
      ...BOULDERING_DATA,
      ...BOULDERING_DATA.map((p) => ({
        ...p,
        id: p.id + 1000,
        name: `Rockless ${p.name}`,
        rock: "",
      })),
    ].map(toRow),
  },
};

export const ProfilePage: Story = {
  args: {
    rows: CLIMBING_DATA.map((p) => ({ ...p, ticked: false })).map(toRow),
    mode: "user",
    defaultOrder: "date",
  },
};

export const NoTicks: Story = {
  args: {
    rows: CLIMBING_DATA.map((p) => ({ ...p, ticked: false })).map(toRow),
  },
};

export const SameType: Story = {
  args: {
    rows: CLIMBING_DATA.map((p, _, self) => ({ ...p, t: self[0].t })).map(
      toRow,
    ),
  },
};

export const NoOptions: Story = {
  args: {
    rows: CLIMBING_DATA.map((p, _, self) => ({
      ...p,
      t: self[0].t,
      ticked: false,
      areaName: self[0].areaName,
      sectorName: self[0].sectorName,
    })).map(toRow),
  },
};
