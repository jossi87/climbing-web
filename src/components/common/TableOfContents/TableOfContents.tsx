import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { List, Icon, Button } from "semantic-ui-react";
import {
  LockSymbol,
  Stars,
  SunOnWall,
  WallDirection,
} from "../../common/widgets/widgets";
import { components } from "../../../@types/buldreinfo/swagger";
import { ProblemsMap } from "./ProblemsMap";
import { HeaderButtons } from "../HeaderButtons";

const JumpToTop = () => (
  <a onClick={() => window.scrollTo(0, 0)}>
    <Icon name="arrow alternate circle up outline" color="black" />
  </a>
);

export type Props = {
  enableMap: boolean;
  areas: (Required<
    Pick<
      components["schemas"]["Area"],
      | "id"
      | "lockedAdmin"
      | "lockedSuperadmin"
      | "name"
      | "sunFromHour"
      | "sunToHour"
    >
  > & {
    sectors: (Required<
      Pick<
        components["schemas"]["Sector"],
        "id" | "name" | "lockedAdmin" | "lockedSuperadmin" | "wallDirection"
      >
    > &
      Pick<
        components["schemas"]["ProblemAreaSector"],
        "polygonCoords" | "lat" | "lng"
      > & {
        problems: (Required<
          Pick<
            components["schemas"]["Problem"],
            "id" | "name" | "lockedAdmin" | "lockedSuperadmin" | "grade" | "nr"
          >
        > &
          Pick<
            components["schemas"]["Problem"],
            "stars" | "ticked" | "lat" | "lng" | "broken"
          > & {
            text?: string;
            subText?: string;
          })[];
      })[];
  })[];
};

export const TableOfContents = ({ enableMap, areas }: Props) => {
  const areaRefs = useRef({});
  const [showMap, setShowMap] = useState(
    enableMap && !!(matchMedia && matchMedia("(pointer:fine)")?.matches),
  );

  if (areas?.length === 0) {
    return <i>No results match your search criteria.</i>;
  }

  return (
    <>
      {enableMap && (
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
      )}
      <List celled link horizontal size="small">
        {areas.map((area) => (
          <React.Fragment key={area.id}>
            <List.Item
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
      {showMap && <ProblemsMap areas={areas} />}
      <List celled>
        {areas.map((area) => (
          <List.Item key={area.id}>
            <List.Header>
              <Link
                to={`/area/${area.id}`}
                ref={(ref) => (areaRefs.current[area.id] = ref)}
              >
                {area.name}
              </Link>{" "}
              <LockSymbol
                lockedAdmin={area.lockedAdmin}
                lockedSuperadmin={area.lockedSuperadmin}
              />
              <SunOnWall
                sunFromHour={area.sunFromHour}
                sunToHour={area.sunToHour}
              />
              <JumpToTop />
            </List.Header>
            {area.sectors.map((sector) => (
              <List.List key={sector.id}>
                <List.Header>
                  <Link to={`/sector/${sector.id}`}>{sector.name}</Link>{" "}
                  <LockSymbol
                    lockedAdmin={sector.lockedAdmin}
                    lockedSuperadmin={sector.lockedSuperadmin}
                  />
                  <WallDirection wallDirection={sector.wallDirection} />
                </List.Header>
                <List.List>
                  {sector.problems.map((problem) => (
                    <List.Item
                      key={problem.id}
                      style={{
                        backgroundColor: problem.ticked ? "#d2f8d2" : "#ffffff",
                      }}
                    >
                      <List.Header>
                        {`#${problem.nr} `}
                        <Link to={`/problem/${problem.id}`}>
                          {problem.broken ? (
                            <del>{problem.name}</del>
                          ) : (
                            problem.name
                          )}
                        </Link>{" "}
                        {problem.grade}{" "}
                        {problem.stars > 0 && (
                          <Stars
                            numStars={problem.stars}
                            includeNoRating={false}
                          />
                        )}
                        {problem.text && <small>{problem.text} </small>}
                        {problem.broken && <u>{problem.broken} </u>}
                        {problem.subText && (
                          <small>
                            <i style={{ color: "gray" }}>{problem.subText} </i>
                          </small>
                        )}
                        <LockSymbol
                          lockedAdmin={problem.lockedAdmin}
                          lockedSuperadmin={problem.lockedSuperadmin}
                        />
                      </List.Header>
                    </List.Item>
                  ))}
                </List.List>
              </List.List>
            ))}
          </List.Item>
        ))}
      </List>
    </>
  );
};
