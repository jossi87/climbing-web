import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Header, Segment, Icon, Button, ButtonGroup } from "semantic-ui-react";
import { Loading } from "./common/widgets/widgets";
import { useMeta } from "./common/meta";
import { getProblemsXlsx, useAccessToken, useData } from "../api";
import { saveAs } from "file-saver";
import TableOfContents from "./common/TableOfContents";

const Problems = () => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useData(`/problems`);
  const [isSaving, setIsSaving] = useState(false);

  if (!data) {
    return <Loading />;
  }

  const numAreas = data.length;

  const [numSectors, numProblems] = data.reduce(
    ([sectors, problems], area) => [
      sectors + area.sectors.length,
      problems +
        area.sectors.reduce((acc, sector) => sector.problems.length + acc, 0),
    ],
    [0, 0],
  );

  const title = meta.isBouldering ? "Problems" : "Routes";
  const description = `${numAreas} areas, ${numSectors} sectors, ${numProblems} ${
    meta.isClimbing ? "routes" : "boulders"
  }`;

  const areas = data.map((area) => ({
    id: area.id,
    lockedAdmin: area.lockedAdmin,
    lockedSuperAdmin: area.lockedSuperAdmin,
    name: area.name,
    sectors: area.sectors.map((sector) => ({
      id: sector.id,
      lockedAdmin: sector.lockedAdmin,
      lockedSuperAdmin: sector.lockedSuperAdmin,
      name: sector.name,
      problems: sector.problems.map((problem) => {
        const ascents =
          problem.numTicks > 0 &&
          problem.numTicks + (problem.numTicks == 1 ? " ascent" : " ascents");
        let typeAscents;
        if (meta.isClimbing) {
          let t = problem.t.subType;
          if (problem.numPitches > 1)
            t += ", " + problem.numPitches + " pitches";
          if (ascents) {
            typeAscents = " (" + t + ", " + ascents + ") ";
          } else {
            typeAscents = " (" + t + ") ";
          }
        } else if (!meta.isClimbing) {
          if (ascents) {
            typeAscents = " (" + ascents + ") ";
          } else {
            typeAscents = " ";
          }
        }
        const text = [problem.fa, typeAscents].filter(Boolean).join(" ");
        return {
          id: problem.id,
          lockedAdmin: problem.lockedAdmin,
          lockedSuperAdmin: problem.lockedSuperAdmin,
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

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
      </Helmet>
      <Segment>
        <ButtonGroup floated="right" size="mini">
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
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <TableOfContents areas={areas} />
      </Segment>
    </>
  );
};

export default Problems;
