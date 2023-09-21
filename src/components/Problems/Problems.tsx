import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
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
import { HeaderButtons } from "../common/HeaderButtons";
import { components } from "../../@types/buldreinfo/swagger";
import "./Problems.css";
import { ProblemsMap } from "../common/TableOfContents/ProblemsMap";

type Props = { filterOpen?: boolean };

const description = (
  areas: number,
  sectors: number,
  problems: number,
  kind: "routes" | "problems",
): string => `${areas} areas, ${sectors} sectors, ${problems} ${kind}`;

type FilterProblem = {
  id: number;
  broken: string;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  name: string;
  nr: number;
  grade: string;
  stars?: number;
  ticked?: boolean;
  text: string;
  subText?: string;
  lat?: number;
  lng?: number;
};

type FilterSector = Pick<
  components["schemas"]["ProblemAreaSector"],
  "outline"
> & {
  id: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  name: string;
  wallDirectionCalculated: components["schemas"]["CompassDirection"];
  wallDirectionManual: components["schemas"]["CompassDirection"];
  lat?: number;
  lng?: number;
  problems: FilterProblem[];
};

type FilterArea = {
  id: number;
  lockedAdmin: boolean;
  lockedSuperadmin: boolean;
  sunFromHour: number;
  sunToHour: number;
  name: string;
  lat?: number;
  lng?: number;
  sectors: FilterSector[];
};

export const Problems = ({ filterOpen }: Props) => {
  const { isBouldering, isClimbing } = useMeta();
  const [state, dispatch] = useFilterState({
    visible: !!filterOpen || window.innerWidth > 991,
  });

  const accessToken = useAccessToken();
  const { data: loadedData, status } = useProblems();
  const [isSaving, setIsSaving] = useState(false);
  const [showMap, setShowMap] = useState(
    !!(matchMedia && matchMedia("(pointer:fine)")?.matches),
  );

  useEffect(() => {
    if (status === "success") {
      dispatch({ action: "set-data", data: loadedData });
    }
  }, [dispatch, loadedData, status]);

  const {
    totalAreas,
    totalSectors,
    totalProblems,
    filteredData,
    filteredAreas,
    filteredSectors,
    filteredProblems,
    visible,
  } = state;

  if (!loadedData) {
    return <Loading />;
  } else if (totalProblems === 0) {
    return <Segment>No data</Segment>;
  }

  const title = isBouldering ? "Problems" : "Routes";
  const things = isBouldering ? "problems" : "routes";
  const totalDescription = description(
    totalAreas,
    totalSectors,
    totalProblems,
    things,
  );

  const areas: FilterArea[] = filteredData.map((area) => ({
    id: area.id,
    lockedAdmin: !!area.lockedAdmin,
    lockedSuperadmin: !!area.lockedSuperadmin,
    sunFromHour: area.sunFromHour,
    sunToHour: area.sunToHour,
    name: area.name,
    lat: area.coordinates?.latitude,
    lng: area.coordinates?.longitude,
    sectors: area.sectors.map((sector) => ({
      id: sector.id,
      lockedAdmin: !!sector.lockedAdmin,
      lockedSuperadmin: !!sector.lockedSuperadmin,
      name: sector.name,
      lat: sector.parking?.latitude,
      lng: sector.parking?.longitude,
      outline: sector.outline,
      wallDirectionCalculated: sector.wallDirectionCalculated,
      wallDirectionManual: sector.wallDirectionManual,
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
          broken: problem.broken,
          lockedAdmin: !!problem.lockedAdmin,
          lockedSuperadmin: !!problem.lockedSuperadmin,
          name: problem.name,
          lat: problem.coordinates?.latitude,
          lng: problem.coordinates?.longitude,
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

  return (
    <FilterContext.Provider value={{ ...state, dispatch }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={totalDescription}></meta>
      </Helmet>
      <Segment>
        <div className="filter-container">
          <div className="filter-header">
            <HeaderButtons
              header={title}
              subheader={totalDescription}
              icon="database"
            >
              <Button
                labelPosition="left"
                icon
                toggle
                active={visible}
                onClick={() => dispatch({ action: "toggle-filter" })}
                primary={filteredProblems > 0}
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
            </HeaderButtons>
            <Divider />
          </div>
          <div className="filter-form">
            {visible && (
              <div>
                <FilterForm />
              </div>
            )}
          </div>
          <div className="filter-results">
            {!visible && filteredProblems > 0 && (
              <Message warning>
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
                  <Button
                    compact
                    onClick={() => dispatch({ action: "open-filter" })}
                  >
                    <Icon name="edit outline" />
                    Edit filter
                  </Button>
                  <Button.Or />
                  <Button
                    compact
                    onClick={() =>
                      dispatch({ action: "reset", section: "all" })
                    }
                  >
                    <Icon name="trash alternate outline" />
                    Clear filter
                  </Button>
                </ButtonGroup>
              </Message>
            )}
            <TableOfContents
              header={
                <HeaderButtons>
                  <Button
                    toggle={showMap}
                    active={showMap}
                    icon
                    labelPosition="left"
                    onClick={() => setShowMap((v) => !v)}
                  >
                    <Icon name="map outline" />
                    Map
                  </Button>
                </HeaderButtons>
              }
              subHeader={showMap && <ProblemsMap areas={areas} />}
              areas={areas}
            />
          </div>
        </div>
      </Segment>
    </FilterContext.Provider>
  );
};
