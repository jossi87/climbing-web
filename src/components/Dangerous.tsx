import React from "react";
import { Helmet } from "react-helmet";
import { Loading } from "./common/widgets/widgets";
import { Segment, Icon, Header } from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { useData } from "../api";
import TableOfContents from "./common/TableOfContents";

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData(`/dangerous`);

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
    lockedSuperAdmin: area.lockedSuperAdmin,
    name: area.name,
    sectors: area.sectors.map((sector) => ({
      id: sector.id,
      lockedAdmin: sector.lockedAdmin,
      lockedSuperAdmin: sector.lockedSuperAdmin,
      name: sector.name,
      problems: sector.problems.map((problem) => ({
        id: problem.id,
        lockedAdmin: problem.lockedAdmin,
        lockedSuperAdmin: problem.lockedSuperAdmin,
        name: problem.name,
        nr: problem.nr,
        grade: problem.grade,
        stars: problem.stars,
        ticked: problem.ticked,
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
