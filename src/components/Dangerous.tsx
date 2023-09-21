import React from "react";
import { Helmet } from "react-helmet";
import { Loading } from "./common/widgets/widgets";
import { Segment, Icon, Header } from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { useData } from "../api";
import TableOfContents from "./common/TableOfContents";
import { Success } from "../@types/buldreinfo";

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData<Success<"getDangerous">>(`/dangerous`);

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
  const description = `${numProblems} ${
    meta.isClimbing ? "routes" : "boulders"
  } flagged as dangerous (located in ${numAreas} areas, ${numSectors} sectors)`;
  const areas = data.map((area) => ({
    id: area.id,
    lockedAdmin: area.lockedAdmin,
    lockedSuperadmin: area.lockedSuperadmin,
    sunFromHour: area.sunFromHour,
    sunToHour: area.sunToHour,
    name: area.name,
    sectors: area.sectors.map((sector) => ({
      id: sector.id,
      lockedAdmin: sector.lockedAdmin,
      lockedSuperadmin: sector.lockedSuperadmin,
      polygonCoords: "",
      wallDirectionCalculated: sector.wallDirectionCalculated,
      wallDirectionManual: sector.wallDirectionManual,
      name: sector.name,
      problems: sector.problems.map((problem) => ({
        id: problem.id,
        broken: problem.broken,
        lockedAdmin: problem.lockedAdmin,
        lockedSuperadmin: problem.lockedSuperadmin,
        name: problem.name,
        nr: problem.nr,
        grade: problem.grade,
        text: problem.postTxt,
        subText: "(" + problem.postWhen + " - " + problem.postBy + ")",
      })),
    })),
  }));

  return (
    <>
      <Helmet>
        <title>Dangerous</title>
        <meta name="description" content={description}></meta>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="warning sign" />
          <Header.Content>
            Dangerous
            <Header.Subheader>{description}</Header.Subheader>
          </Header.Content>
        </Header>
        <TableOfContents areas={areas} />
      </Segment>
    </>
  );
};

export default Dangerous;
