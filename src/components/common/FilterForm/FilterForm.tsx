import React from "react";
import {
  Form,
  Header,
  Checkbox,
  Button,
  Icon,
  Divider,
  Container,
} from "semantic-ui-react";
import { GradeSelect } from "./GradeSelect";
import { getLocales } from "../../../api";
import { useMeta } from "../meta";
import { useFilter } from "./context";
import { HeaderButtons } from "../HeaderButtons";
import { ResetField } from "../../Problems/reducer";

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

const GroupHeader = ({
  title,
  reset,
}: {
  title: string;
  reset: ResetField;
}) => {
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

export const FilterForm = () => {
  const meta = useMeta();
  const {
    unfilteredData,
    filterAreaIds,
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
      <GroupHeader title="Areas" reset="areas" />
      <Form.Group inline style={{ display: "flex", flexWrap: "wrap" }}>
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
      </Form.Group>
    </Form>
  );
};
