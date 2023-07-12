import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  Header,
  Segment,
  Icon,
  Button,
  ButtonGroup,
  Message,
  Divider,
} from "semantic-ui-react";
import { Loading } from "../common/widgets/widgets";
import { useMeta } from "../common/meta";
import { getProblemsXlsx, useAccessToken, useProblems } from "../../api";
import { saveAs } from "file-saver";
import TableOfContents from "../common/TableOfContents";
import { useFilterState } from "./reducer";
import { FilterContext, FilterForm } from "../common/FilterForm";

type Props = { filterOpen?: boolean };

const description = (
  areas: number,
  sectors: number,
  problems: number,
  kind: "routes" | "problems",
): string => `${areas} areas, ${sectors} sectors, ${problems} ${kind}`;

export const Problems = ({ filterOpen }: Props) => {
  const { isBouldering, isClimbing } = useMeta();
  const [state, dispatch] = useFilterState({ visible: !!filterOpen });

  const accessToken = useAccessToken();
  const { data: loadedData, status } = useProblems();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "success") {
      dispatch({ action: "set-data", data: loadedData });
    }
  }, [dispatch, loadedData, status]);

  if (!loadedData) {
    return <Loading />;
  }

  const {
    totalAreas,
    totalSectors,
    totalProblems,
    filteredData,
    filteredAreas,
    filteredSectors,
    filteredProblems,
  } = state;

  const title = isBouldering ? "Problems" : "Routes";
  const things = isBouldering ? "problems" : "routes";
  const totalDescription = description(
    totalAreas,
    totalSectors,
    totalProblems,
    things,
  );

  const areas = filteredData.map((area) => ({
    id: area.id,
    lockedAdmin: !!area.lockedAdmin,
    lockedSuperadmin: !!area.lockedSuperadmin,
    name: area.name,
    sectors: area.sectors.map((sector) => ({
      id: sector.id,
      lockedAdmin: !!sector.lockedAdmin,
      lockedSuperadmin: !!sector.lockedSuperadmin,
      name: sector.name,
      problems: sector.problems.map((problem) => {
        const ascents =
          problem.numTicks > 0 &&
          problem.numTicks + (problem.numTicks == 1 ? " ascent" : " ascents");
        let typeAscents;
        if (isClimbing) {
          let t = problem.t.subType;
          if (problem.numPitches > 1)
            t += ", " + problem.numPitches + " pitches";
          if (ascents) {
            typeAscents = " (" + t + ", " + ascents + ") ";
          } else {
            typeAscents = " (" + t + ") ";
          }
        } else if (!isClimbing) {
          if (ascents) {
            typeAscents = " (" + ascents + ") ";
          } else {
            typeAscents = " ";
          }
        }
        const text = [problem.fa, typeAscents].filter(Boolean).join(" ");
        return {
          id: problem.id,
          lockedAdmin: !!problem.lockedAdmin,
          lockedSuperadmin: !!problem.lockedSuperadmin,
          name: problem.name,
          nr: problem.nr,
          grade: problem.grade,
          stars: problem.stars,
          ticked: problem.ticked,
          text: text,
          subText: problem.description,
        };
      }),
    })),
  }));

  const preamble = (
    <>
      <ButtonGroup size="mini" floated="right">
        <Button
          labelPosition="left"
          icon
          toggle
          active={state.visible}
          onClick={() => dispatch({ action: "toggle-filter" })}
          primary={state.filteredProblems > 0}
        >
          <Icon name="filter" />
          Filter {things}
        </Button>
        <Button
          loading={isSaving}
          icon
          labelPosition="left"
          onClick={() => {
            setIsSaving(true);
            let filename = "problems.xlsx";
            getProblemsXlsx(accessToken)
              .then((response) => {
                filename = response.headers
                  .get("content-disposition")
                  .slice(22, -1);
                return response.blob();
              })
              .then((blob) => {
                setIsSaving(false);
                saveAs(blob, filename);
              });
          }}
        >
          <Icon name="file excel" />
          Download
        </Button>
      </ButtonGroup>
      <Header as="h2">
        <Icon name="database" />
        <Header.Content>
          {title}
          <Header.Subheader>{totalDescription}</Header.Subheader>
        </Header.Content>
      </Header>
      {state.visible && (
        <>
          <Divider />
          <FilterForm />
          <Divider />
        </>
      )}
      {!state.visible && state.filteredProblems > 0 && (
        <Message warning raised>
          There is an active filter which is hiding{" "}
          <strong>
            {description(
              filteredAreas,
              filteredSectors,
              filteredProblems,
              things,
            )}
          </strong>
          .
          <br />
          <ButtonGroup size="tiny">
            <Button compact onClick={() => dispatch({ action: "open-filter" })}>
              <Icon name="edit outline" />
              Edit filter
            </Button>
            <Button.Or />
            <Button compact onClick={() => dispatch({ action: "reset" })}>
              <Icon name="trash alternate outline" />
              Clear filter
            </Button>
          </ButtonGroup>
        </Message>
      )}
    </>
  );

  const mainContents = <TableOfContents areas={areas} />;

  const content = state.visible ? (
    <>
      <Segment>{preamble}</Segment>
      <Segment>{mainContents}</Segment>
    </>
  ) : (
    <Segment>
      {preamble}
      {mainContents}
    </Segment>
  );

  return (
    <FilterContext.Provider value={{ ...state, dispatch }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={totalDescription}></meta>
      </Helmet>
      {content}
    </FilterContext.Provider>
  );
};
