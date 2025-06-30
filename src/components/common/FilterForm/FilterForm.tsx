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
import { YearSelect } from "./YearSelect";
import { hours } from "../../../utils/hours";

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
      <Header as="h5" style={{ flex: 1, margin: 0 }}>
        {title}
      </Header>
      {buttons?.filter(Boolean)?.map(({ icon, onClick }) => (
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
  "show-some": { maxHeight: "10vh", overflow: "auto" },
  "too-few": {},
} as const;

const ICONS: Record<AreaSizeState, SemanticICONS | undefined> = {
  "show-all": "compress",
  "show-some": "expand",
  "too-few": undefined,
};

const useSizing = () => {
  const ref = useRef<HTMLDivElement | null>(null);
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
    filterRegionIds,
    filterAreaIds,
    filterOnlySunOnWallAt,
    filterOnlyShadeOnWallAt,
    filterGradeHigh,
    filterGradeLow,
    filterSectorWallDirections,
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

  const compassDirectionOptions = meta.compassDirections.map((cd) => ({
    key: cd.id,
    value: cd.id,
    text: cd.direction,
  }));

  const {
    ref: regionContainerRef,
    style: regionContainerStyle,
    icon: regionContainerButton,
    onClick: regionContainerAction,
  } = useSizing();

  const {
    ref: areaContainerRef,
    style: areaContainerStyle,
    icon: areaContainerButton,
    onClick: areaContainerAction,
  } = useSizing();

  return (
    <Form>
      <HeaderButtons header="Filter">
        {filteredProblems > 0 ? (
          <Button
            icon
            labelPosition="left"
            onClick={() => dispatch({ action: "reset", section: "all" })}
          >
            <Icon name="trash alternate outline" />
            Clear filter
          </Button>
        ) : null}
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
        <GradeSelect
          low={filterGradeLow}
          high={filterGradeHigh}
          dispatch={dispatch}
        />
      </Form.Field>
      {disciplineOptions.length > 1 && (
        <>
          <GroupHeader title="Types" reset="types" />
          <Form.Group inline>
            <Form.Field>
              {disciplineOptions.map((discipline) => (
                <Checkbox
                  key={discipline.key}
                  label={discipline.text}
                  checked={!!filterTypes?.[discipline.value]}
                  onChange={(_, { checked }) => {
                    dispatch?.({
                      action: "toggle-types",
                      option: discipline.value,
                      checked: !!checked,
                    });
                  }}
                  style={{ marginRight: 10 }}
                />
              ))}
            </Form.Field>
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
                      checked: !!checked,
                    });
                  }}
                />
              </Form.Field>
            ))}
          </Form.Group>
        </>
      )}
      <Form.Field>
        <GroupHeader title="First Ascent Year" reset="fa-year" />
        <YearSelect />
      </Form.Field>
      <GroupHeader title="Options" reset="options" />
      <Form.Group inline>
        <Form.Field>
          <Checkbox
            label="Hide ticked"
            checked={!!filterHideTicked}
            disabled={!meta.isAuthenticated}
            onChange={(_, { checked }) =>
              dispatch?.({ action: "set-hide-ticked", checked: !!checked })
            }
          />
        </Form.Field>
        {meta.isAdmin && (
          <Form.Field>
            <Checkbox
              label="Only admin"
              checked={!!filterOnlyAdmin}
              onChange={(_, { checked }) => {
                dispatch?.({ action: "set-only-admin", checked: !!checked });
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
                dispatch?.({
                  action: "set-only-super-admin",
                  checked: !!checked,
                });
              }}
            />
          </Form.Field>
        )}
      </Form.Group>
      {meta.isClimbing && (
        <>
          <GroupHeader title="Wall direction" reset="wall-directions" />
          <Form.Group inline>
            <Form.Field>
              {compassDirectionOptions.map((option) => (
                <Checkbox
                  key={option.key}
                  label={option.text}
                  checked={!!filterSectorWallDirections?.[option.value]}
                  onChange={(_, { checked }) => {
                    dispatch?.({
                      action: "toggle-sector-wall-directions",
                      option: option.value,
                      checked: !!checked,
                    });
                  }}
                  style={{ marginRight: 10 }}
                />
              ))}
            </Form.Field>
          </Form.Group>
          <GroupHeader title="Conditions" reset="conditions" />
          <Form.Group inline>
            <Form.Field>
              Sun on wall at{" "}
              <Dropdown
                floating
                scrolling
                inline
                options={hours}
                value={filterOnlySunOnWallAt || 0}
                onChange={(_, { value }) => {
                  dispatch?.({
                    action: "set-only-sun-on-wall-at",
                    hour: value as number,
                  });
                }}
              />
              .
            </Form.Field>
            <Form.Field>
              Shade on wall at{" "}
              <Dropdown
                floating
                scrolling
                inline
                options={hours}
                value={filterOnlyShadeOnWallAt || 0}
                onChange={(_, { value }) => {
                  dispatch?.({
                    action: "set-only-shade-on-wall-at",
                    hour: value as number,
                  });
                }}
              />
              .
            </Form.Field>
          </Form.Group>
        </>
      )}
      {(unfilteredData?.regions?.length ?? 0) > 1 && (
        <>
          <GroupHeader
            title="Regions"
            reset="regions"
            buttons={
              regionContainerButton
                ? [
                    {
                      icon: regionContainerButton,
                      onClick: regionContainerAction,
                    },
                  ]
                : undefined
            }
          />
          <Form.Group inline>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                ...regionContainerStyle,
              }}
              ref={regionContainerRef}
            >
              {unfilteredData?.regions?.map(({ id = 0, name = "" }) => (
                <Form.Field key={id}>
                  <Checkbox
                    label={name}
                    checked={!!filterRegionIds[id]}
                    onChange={(_, { checked }) =>
                      dispatch({
                        action: "toggle-region",
                        regionId: id,
                        enabled: !!checked,
                      })
                    }
                    style={{ marginRight: 10 }}
                  />
                </Form.Field>
              ))}
            </div>
          </Form.Group>
        </>
      )}
      <GroupHeader
        title="Areas"
        reset="areas"
        buttons={
          areaContainerButton
            ? [{ icon: areaContainerButton, onClick: areaContainerAction }]
            : undefined
        }
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
          {unfilteredData?.regions?.map((region) =>
            region.areas?.map(({ id = 0, name = "" }) => (
              <Form.Field key={id}>
                <Checkbox
                  label={name}
                  checked={!!filterAreaIds[id]}
                  onChange={(_, { checked }) =>
                    dispatch({
                      action: "toggle-area",
                      areaId: id,
                      enabled: !!checked,
                    })
                  }
                />
              </Form.Field>
            )),
          )}
        </div>
      </Form.Group>
    </Form>
  );
};
