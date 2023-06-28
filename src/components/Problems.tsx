import React, { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import {
  Header,
  List,
  Segment,
  Icon,
  Button,
  ButtonGroup,
} from "semantic-ui-react";
import { Loading, LockSymbol, Stars } from "./common/widgets/widgets";
import { useMeta } from "./common/meta";
import { getProblemsXlsx, useAccessToken, useData } from "../api";
import { saveAs } from "file-saver";

const Problems = () => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useData(`/problems`);
  const [isSaving, setIsSaving] = useState(false);
  const areaRefs = useRef({});

  if (!data) {
    return <Loading />;
  }
  let numAreas = data.length;
  let numSectors = 0;
  let numProblems = 0;
  data.forEach(a => {
    numSectors += a.sectors.length;
    a.sectors.forEach(s => {
      numProblems += s.problems.length;
    })
  });
  const description = `${numAreas} areas, ${numSectors} sectors, ${numProblems} ${meta.isClimbing? "routes" : "boulders"}`;
  return (
    <>
      <Helmet>
        <title>Table of Contents | {meta.title}</title>
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
            Table of Contents
            <Header.Subheader>
             {description}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <List celled link horizontal size="small">
          {data.map((area, i) => (
            <React.Fragment key={i}>
              <List.Item
                key={i}
                as="a"
                onClick={() =>
                  areaRefs.current[area.id].scrollIntoView({ block: "start" })
                }
              >
                {area.name}
              </List.Item>
              <LockSymbol
                lockedAdmin={area.lockedAdmin}
                lockedSuperadmin={area.lockedSuperadmin}
              />
            </React.Fragment>
          ))}
        </List>
        <List celled>
          {data.map((area, i) => (
            <List.Item key={i}>
              <List.Header>
                <a
                  id={area.id}
                  href={area.url}
                  rel="noreferrer noopener"
                  target="_blank"
                  ref={(ref) => (areaRefs.current[area.id] = ref)}
                >
                  {area.name}
                </a>
                <LockSymbol
                  lockedAdmin={area.lockedAdmin}
                  lockedSuperadmin={area.lockedSuperadmin}
                />{" "}
                <a onClick={() => window.scrollTo(0, 0)}>
                  <Icon
                    name="arrow alternate circle up outline"
                    color="black"
                  />
                </a>
              </List.Header>
              {area.sectors.map((sector, i) => (
                <List.List key={i}>
                  <List.Header>
                    <a
                      href={sector.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {sector.name}
                    </a>
                    <LockSymbol
                      lockedAdmin={sector.lockedAdmin}
                      lockedSuperadmin={sector.lockedSuperadmin}
                    />
                  </List.Header>
                  <List.List>
                    {sector.problems.map((problem, i) => {
                      const ascents =
                        problem.numTicks > 0 &&
                        problem.numTicks +
                          (problem.numTicks == 1 ? " ascent" : " ascents");
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
                      return (
                        <List.Item key={i}>
                          <List.Header>
                            {`#${problem.nr} `}
                            <a
                              href={problem.url}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              {problem.name}
                            </a>{" "}
                            {problem.grade}{" "}
                            <Stars
                              numStars={problem.stars}
                              includeNoRating={false}
                            />
                            {problem.fa && <small>{problem.fa}</small>}
                            {typeAscents && <small>{typeAscents}</small>}
                            <small>
                              <i style={{ color: "gray" }}>
                                {problem.description}
                              </i>
                            </small>
                            <LockSymbol
                              lockedAdmin={problem.lockedAdmin}
                              lockedSuperadmin={problem.lockedSuperadmin}
                            />
                            {problem.ticked && (
                              <Icon color="green" name="check" />
                            )}
                          </List.Header>
                        </List.Item>
                      );
                    })}
                  </List.List>
                </List.List>
              ))}
            </List.Item>
          ))}
        </List>
      </Segment>
    </>
  );
};

export default Problems;
