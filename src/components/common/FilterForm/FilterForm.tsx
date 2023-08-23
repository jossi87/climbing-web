import React, {
  CSSProperties,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Form,
  Header,
  Checkbox,
  Dropdown,
  Button,
  Icon,
  Divider,
  Container,
  SemanticICONS,
  ButtonProps,
} from "semantic-ui-react";
import { GradeSelect } from "./GradeSelect";
import { getLocales } from "../../../api";
import { useMeta } from "../meta";
import { useFilter } from "./context";
import { HeaderButtons } from "../HeaderButtons";
import { ResetField } from "../../Problems/reducer";
import { neverGuard } from "../../../utils/neverGuard";

const CLIMBING_OPTIONS = [
  {
    key: "Single-pitch",
    value: "Single-pitch",
    text: "Single-pitch",
  },
  {
    key: "Multi-pitch",
    value: "Multi-pitch",
    text: "Multi-pitch",
  },
] as const;

type GroupHeaderProps = {
  title: string;
  reset: ResetField;
  buttons?: {
    icon: SemanticICONS;
    onClick: NonNullable<ButtonProps["onClick"]>;
  }[];
};

const GroupHeader = ({ title, reset, buttons }: GroupHeaderProps) => {
  const { dispatch } = useFilter();

  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        margin: 4,
      }}
    >
      <Header as="h3" style={{ flex: 1, margin: 0 }}>
        {title}
      </Header>
      {buttons
        ?.filter(Boolean)
        ?.map(({ icon, onClick }) => (
          <Button
            key={icon}
            icon={icon}
            onClick={onClick}
            size="mini"
            basic
            compact
          />
        ))}
      <Button
        icon="trash alternate outline"
        onClick={() => dispatch({ action: "reset", section: reset })}
        size="mini"
        basic
        compact
      />
    </Container>
  );
};

type AreaSizeState = "show-all" | "show-some" | "too-few";

const STYLES: Record<AreaSizeState, CSSProperties> = {
  "show-all": {},
  "show-some": { maxHeight: "20vh", overflow: "auto" },
  "too-few": {},
} as const;

const ICONS: Record<AreaSizeState, SemanticICONS | undefined> = {
  "show-all": "compress",
  "show-some": "expand",
  "too-few": undefined,
};

const useAreaSizing = () => {
  const ref = useRef<HTMLDivElement>();
  const [status, setStatus] = useState<AreaSizeState>("show-some");

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const { clientHeight: containerHeight, scrollHeight: contentsHeight } =
      ref.current;
    if (
      contentsHeight < containerHeight ||
      contentsHeight - containerHeight < containerHeight * 0.25
    ) {
      setStatus("too-few");
    } else {
      setStatus("show-some");
    }
  }, []);

  const onClick = useCallback(() => {
    setStatus((v) => {
      switch (v) {
        case "too-few":
          return v;
        case "show-all":
          return "show-some";
        case "show-some":
          return "show-all";
        default: {
          return neverGuard(v, "show-all");
        }
      }
    });
  }, []);

  return {
    ref,
    style: STYLES[status],
    icon: ICONS[status],
    onClick,
  };
};

export const FilterForm = () => {
  const meta = useMeta();
  const {
    unfilteredData,
    filterAreaIds,
    filterAreaOnlySunOnWallAt,
    filterAreaOnlyShadeOnWallAt,
    filterOnlyAdmin,
    filterOnlySuperAdmin,
    filterHideTicked,
    filterPitches,
    filterTypes,
    filteredProblems,
    dispatch,
  } = useFilter();

  const disciplineOptions = meta.types
    .sort((a, b) => a.subType.localeCompare(b.subType, getLocales()))
    .map((t) => ({ key: t.id, value: t.id, text: t.subType }));

  const hoursOptions = [
    { key: 0, text: "<disabled>", value: 0 },
    { key: 7, text: "07:00", value: 7 },
    { key: 8, text: "08:00", value: 8 },
    { key: 9, text: "09:00", value: 9 },
    { key: 10, text: "10:00", value: 10 },
    { key: 11, text: "11:00", value: 11 },
    { key: 12, text: "12:00", value: 12 },
    { key: 13, text: "13:00", value: 13 },
    { key: 14, text: "14:00", value: 14 },
    { key: 15, text: "15:00", value: 15 },
    { key: 16, text: "16:00", value: 16 },
    { key: 17, text: "17:00", value: 17 },
    { key: 18, text: "18:00", value: 18 },
    { key: 19, text: "19:00", value: 19 },
    { key: 20, text: "20:00", value: 20 },
    { key: 21, text: "21:00", value: 21 },
    { key: 22, text: "22:00", value: 22 },
    { key: 23, text: "23:00", value: 23 },
  ];

  const {
    ref: areaContainerRef,
    style: areaContainerStyle,
    icon: areaContainerButton,
    onClick: areaContainerAction,
  } = useAreaSizing();

  return (
    <Form>
      <HeaderButtons header="Filter">
        {filteredProblems > 0 && (
          <Button
            icon
            labelPosition="left"
            onClick={() => dispatch({ action: "reset", section: "all" })}
          >
            <Icon name="trash alternate outline" />
            Clear filter
          </Button>
        )}
        <Button
          icon
          labelPosition="left"
          onClick={() => dispatch({ action: "close-filter" })}
        >
          <Icon name="close" />
          Close
        </Button>
      </HeaderButtons>
      <Divider />
      <Form.Field>
        <GroupHeader title="Grades" reset="grades" />
        <GradeSelect />
      </Form.Field>
      {disciplineOptions.length > 1 && (
        <>
          <GroupHeader title="Types" reset="types" />
          <Form.Group inline>
            {disciplineOptions.map((discipline) => (
              <Form.Field key={discipline.key}>
                <Checkbox
                  label={discipline.text}
                  checked={!!filterTypes?.[discipline.value]}
                  onChange={(_, { checked }) => {
                    dispatch?.({
                      action: "toggle-types",
                      option: discipline.value,
                      checked,
                    });
                  }}
                />
              </Form.Field>
            ))}
          </Form.Group>
        </>
      )}
      {!meta.isBouldering && (
        <>
          <GroupHeader title="Pitches" reset="pitches" />
          <Form.Group inline>
            {CLIMBING_OPTIONS.map((option) => (
              <Form.Field key={option.key}>
                <Checkbox
                  label={option.text}
                  checked={!!filterPitches?.[option.value]}
                  onChange={(_, { checked }) => {
                    dispatch?.({
                      action: "toggle-pitches",
                      option: option.value,
                      checked,
                    });
                  }}
                />
              </Form.Field>
            ))}
          </Form.Group>
        </>
      )}
      <GroupHeader title="Options" reset="options" />
      <Form.Group inline>
        <Form.Field>
          <Checkbox
            label="Hide ticked"
            checked={!!filterHideTicked}
            disabled={!meta.isAuthenticated}
            onChange={(_, { checked }) =>
              dispatch?.({ action: "set-hide-ticked", checked })
            }
          />
        </Form.Field>
        {meta.isAdmin && (
          <Form.Field>
            <Checkbox
              label="Only admin"
              checked={!!filterOnlyAdmin}
              onChange={(_, { checked }) => {
                dispatch?.({ action: "set-only-admin", checked });
              }}
            />
          </Form.Field>
        )}
        {meta.isSuperAdmin && (
          <Form.Field>
            <Checkbox
              label="Only superadmin"
              checked={!!filterOnlySuperAdmin}
              onChange={(_, { checked }) => {
                dispatch?.({ action: "set-only-super-admin", checked });
              }}
            />
          </Form.Field>
        )}
      </Form.Group>
      <GroupHeader title="Conditions" reset="conditions" />
      <Form.Group inline>
        <Form.Field>
          Sun on wall at{" "}
          <Dropdown
            floating
            scrolling
            inline
            options={hoursOptions}
            value={filterAreaOnlySunOnWallAt || 0}
            onChange={(_, { value }) => {
              dispatch?.({
                action: "set-area-only-sun-on-wall-at",
                hour: value as number,
              });
            }}
          />
        </Form.Field>
      </Form.Group>
      <Form.Group inline>
        <Form.Field>
          Shade on wall at{" "}
          <Dropdown
            floating
            scrolling
            inline
            options={hoursOptions}
            value={filterAreaOnlyShadeOnWallAt || 0}
            onChange={(_, { value }) => {
              dispatch?.({
                action: "set-area-only-shade-on-wall-at",
                hour: value as number,
              });
            }}
          />
        </Form.Field>
      </Form.Group>
      <GroupHeader
        title="Areas"
        reset="areas"
        buttons={[
          areaContainerButton
            ? { icon: areaContainerButton, onClick: areaContainerAction }
            : undefined,
        ]}
      />
      <Form.Group inline>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            ...areaContainerStyle,
          }}
          ref={areaContainerRef}
        >
          {unfilteredData.map((area) => (
            <Form.Field key={area.id}>
              <Checkbox
                label={area.name}
                checked={!!filterAreaIds[area.id]}
                onChange={(_, { checked }) =>
                  dispatch({
                    action: "toggle-area",
                    areaId: area.id,
                    enabled: checked,
                  })
                }
              />
            </Form.Field>
          ))}
        </div>
      </Form.Group>
    </Form>
  );
};
