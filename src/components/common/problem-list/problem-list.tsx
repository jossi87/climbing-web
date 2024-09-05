import React, { ComponentProps, useMemo, useState } from "react";
import {
  Step,
  Dropdown,
  List,
  Segment,
  Checkbox,
  DropdownItemProps,
  Message,
  MessageHeader,
  Icon,
} from "semantic-ui-react";
import AccordionContainer from "./accordion-container";
import { GradeSelect } from "../FilterForm/GradeSelect";
import { type Row } from "./types";
import { GroupOption, OrderOption, State, useProblemListState } from "./state";
import "./ProblemList.css";

type Props = {
  rows: Row[];
  mode: "sector" | "user";
  defaultOrder: OrderOption;
  storageKey: string;
};

const ORDER_BY_OPTIONS: Record<
  "sector" | "user",
  (DropdownItemProps & { value: OrderOption })[]
> = {
  sector: [
    {
      key: "name",
      text: "name",
      value: "name",
    },
    {
      key: "ascents",
      text: "ascents",
      value: "ascents",
    },
    {
      key: "first-ascent",
      text: "first ascent",
      value: "first-ascent",
    },
    {
      key: "grade-asc",
      text: "grade (easy -> hard)",
      value: "grade-asc",
    },
    {
      key: "grade-desc",
      text: "grade (hard -> easy)",
      value: "grade-desc",
    },
    {
      key: "number",
      text: "number",
      value: "number",
    },
    {
      key: "rating",
      text: "rating",
      value: "rating",
    },
  ],
  user: [
    {
      key: "name",
      text: "name",
      value: "name",
    },
    {
      key: "date",
      text: "date",
      value: "date",
    },
    {
      key: "grade-asc",
      text: "grade (easy -> hard)",
      value: "grade-asc",
    },
    {
      key: "grade-desc",
      text: "grade (hard -> easy)",
      value: "grade-desc",
    },
    {
      key: "rating",
      text: "rating",
      value: "rating",
    },
  ],
} as const;

const GROUP_BY: Record<
  GroupOption,
  (
    partialState: Pick<
      State,
      | "uniqueAreas"
      | "uniqueRocks"
      | "uniqueSectors"
      | "uniqueTypes"
      | "filtered"
    >,
  ) => ComponentProps<typeof AccordionContainer>["accordionRows"]
> = {
  area: ({ uniqueAreas, filtered }) =>
    uniqueAreas.map((areaName) => {
      const list = filtered
        .filter((p) => p.areaName == areaName)
        .map((p) => p.element);
      return {
        label: `${areaName || "<Without area>"} (${list.length})`,
        length: list.length,
        content: <List selection>{list}</List>,
      };
    }),

  none: () => {
    throw new Error("This should not have been called");
  },

  rock: ({ uniqueRocks, filtered }) =>
    uniqueRocks.map((rock) => {
      const list = filtered.filter((p) => p.rock == rock).map((p) => p.element);
      return {
        label: `${rock || "<Without rock>"} (${list.length})`,
        length: list.length,
        content: <List selection>{list}</List>,
      };
    }),

  sector: ({ uniqueSectors, filtered }) =>
    uniqueSectors.map((sectorName) => {
      const list = filtered
        .filter((p) => p.sectorName === sectorName)
        .map((p) => p.element);
      return {
        length: list.length,
        label: `${sectorName || "<No sector>"} (${list.length})`,
        content: <List selection>{list}</List>,
      };
    }),

  type: ({ uniqueTypes, filtered }) =>
    uniqueTypes.map((subType) => {
      const list = filtered
        .filter((p) => p.subType == subType)
        .map((p) => p.element);
      return {
        label: `${subType || "<No type>"} (${list.length})`,
        length: list.length,
        content: <List selection>{list}</List>,
      };
    }),
};

const GROUP_BY_OPTIONS: Record<
  GroupOption,
  DropdownItemProps & {
    value: GroupOption;
    isApplicable: (
      state: Pick<
        State,
        "uniqueAreas" | "uniqueRocks" | "uniqueSectors" | "uniqueTypes"
      >,
    ) => boolean;
  }
> = {
  area: {
    key: "area",
    text: "area",
    value: "area",
    isApplicable: ({ uniqueAreas }) => uniqueAreas.length > 1,
  },

  none: {
    key: "none",
    text: "none",
    value: "none",
    isApplicable: () => true,
  },

  rock: {
    key: "rock",
    text: "rock",
    value: "rock",
    isApplicable: ({ uniqueRocks }) => uniqueRocks.length > 1,
  },

  sector: {
    key: "sector",
    text: "sector",
    value: "sector",
    isApplicable: ({ uniqueSectors }) => uniqueSectors.length > 1,
  },

  type: {
    key: "type",
    text: "type",
    value: "type",
    isApplicable: ({ uniqueTypes }) => uniqueTypes.length > 1,
  },
};

export const ProblemList = ({
  rows: allRows,
  mode,
  defaultOrder,
  storageKey,
}: Props) => {
  const [showFilter, setFilterShowing] = useState(false);

  const [allTypes, lookup] = useMemo(() => {
    const types = new Set<string>();
    const lookup: Record<string, number> = {};
    for (const row of allRows) {
      types.add(row.subType);
      lookup[row.subType] = (lookup[row.subType] ?? 0) + 1;
    }
    return [[...types].sort(), lookup];
  }, [allRows]);

  const {
    // UI State
    gradeLow,
    gradeHigh,
    order,
    groupBy,
    hideTicked,
    onlyFa,
    types,

    // Derived state
    filtered,
    uniqueAreas,
    uniqueRocks,
    uniqueSectors,
    uniqueTypes,
    containsFa,
    containsTicked,

    dispatch,
  } = useProblemListState({
    rows: allRows,
    order: defaultOrder,
    key: storageKey,
  });

  const orderByOptions = ORDER_BY_OPTIONS[mode];

  if (!allRows?.length) {
    return null;
  }

  const list = (() => {
    if (filtered.length === 0) {
      const hidden = allRows.length - filtered.length;
      return (
        <Message>
          <MessageHeader>No visible data</MessageHeader>
          There are active filters which are hiding {hidden}{" "}
          {hidden > 1 ? "results" : "result"}.
        </Message>
      );
    }

    if (groupBy && groupBy !== "none") {
      const mapper = GROUP_BY[groupBy];
      return (
        <AccordionContainer
          accordionRows={mapper({
            uniqueAreas,
            uniqueRocks,
            uniqueSectors,
            uniqueTypes,
            filtered,
          }).filter(({ length }) => length)}
        />
      );
    }

    return (
      <Segment attached="bottom">
        <List selection>{filtered.map(({ element }) => element)}</List>
      </Segment>
    );
  })();

  const groupByOptions = Object.values(GROUP_BY_OPTIONS)
    .filter(({ isApplicable }) =>
      isApplicable({
        uniqueAreas,
        uniqueRocks,
        uniqueSectors,
        uniqueTypes,
      }),
    )
    .map(({ isApplicable: _, ...props }) => props);

  return (
    <>
      <Step.Group attached="top" size="mini" unstackable fluid>
        {groupByOptions.length > 1 ? (
          <Step
            link
            onClick={(e) =>
              e.currentTarget.querySelector<HTMLElement>(".dropdown")?.focus()
            }
          >
            <Step.Content>
              <Step.Title>Group by</Step.Title>
              <Step.Description>
                <Dropdown
                  key={mode}
                  options={groupByOptions}
                  value={groupBy}
                  onChange={(e, { value }) =>
                    dispatch({
                      action: "group-by",
                      groupBy: (value as GroupOption) ?? "none",
                    })
                  }
                />
              </Step.Description>
            </Step.Content>
          </Step>
        ) : null}
        <Step
          link
          onClick={(e) =>
            e.currentTarget.querySelector<HTMLElement>(".dropdown")?.focus()
          }
        >
          <Step.Content>
            <Step.Title>Order by</Step.Title>
            <Step.Description>
              <Dropdown
                key={mode}
                options={orderByOptions}
                value={order}
                onChange={(e, { value }) =>
                  dispatch({
                    action: "order-by",
                    order: (value as OrderOption) ?? "grade-desc",
                  })
                }
              />
            </Step.Description>
          </Step.Content>
        </Step>
        <Step link onClick={() => setFilterShowing((v) => !v)}>
          <Step.Content>
            <Step.Title>Filter</Step.Title>
            <Step.Description>
              <Icon name="filter" />
            </Step.Description>
          </Step.Content>
        </Step>
      </Step.Group>
      {showFilter ? (
        <Segment attached>
          <div className="problem-list-filter-container">
            <strong>Grades</strong>
            <GradeSelect
              low={gradeLow}
              high={gradeHigh}
              dispatch={dispatch}
              style={{ flex: 1 }}
            />
            {allTypes.length > 1 ? (
              <>
                <strong>Types</strong>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {allTypes.map((type) => (
                    <Checkbox
                      key={type}
                      label={`${type} (${lookup[type]})`}
                      checked={types[type]}
                      onChange={(_, { checked }) => {
                        dispatch({
                          action: "type",
                          type,
                          enabled: !!checked,
                        });
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {mode === "sector" && containsTicked && (
              <>
                <strong>Hide ticked</strong>
                <Checkbox
                  toggle
                  checked={hideTicked}
                  onChange={() => dispatch({ action: "hide-ticked" })}
                />
              </>
            )}
            {mode === "user" && containsFa && (
              <>
                <strong>Only show FA</strong>
                <Checkbox
                  toggle
                  checked={onlyFa}
                  onChange={() => dispatch({ action: "only-fa" })}
                />
              </>
            )}
          </div>
        </Segment>
      ) : null}
      {list}
    </>
  );
};
