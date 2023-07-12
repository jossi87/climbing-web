import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { List, Icon } from "semantic-ui-react";
import { LockSymbol, Stars } from "../../common/widgets/widgets";

const JumpToTop = () => (
  <a onClick={() => window.scrollTo(0, 0)}>
    <Icon name="arrow alternate circle up outline" color="black" />
  </a>
);

type Props = {
  areas: {
    id: number;
    lockedAdmin: boolean;
    lockedSuperadmin: boolean;
    name: string;
    sectors: {
      id: number;
      lockedAdmin: boolean;
      lockedSuperadmin: boolean;
      name: string;
      problems: {
        id: number;
        lockedAdmin: boolean;
        lockedSuperadmin: boolean;
        name: string;
        nr: number;
        grade: string;
        stars?: number;
        ticked?: boolean;
        text?: string;
        subText?: string;
      }[];
    }[];
  }[];
};

export const TableOfContents = ({ areas }: Props) => {
  const areaRefs = useRef({});

  return (
    <>
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
      <List celled>
        {areas.map((area) => (
          <List.Item key={area.id}>
            <List.Header>
              <Link
                to={`/area/${area.id}`}
                ref={(ref) => (areaRefs.current[area.id] = ref)}
              >
                {area.name}
              </Link>
              <LockSymbol
                lockedAdmin={area.lockedAdmin}
                lockedSuperadmin={area.lockedSuperadmin}
              />{" "}
              <JumpToTop />
            </List.Header>
            {area.sectors.map((sector) => (
              <List.List key={sector.id}>
                <List.Header>
                  <Link to={`/sector/${sector.id}`}>{sector.name}</Link>
                  <LockSymbol
                    lockedAdmin={sector.lockedAdmin}
                    lockedSuperadmin={sector.lockedSuperadmin}
                  />
                </List.Header>
                <List.List>
                  {sector.problems.map((problem) => (
                    <List.Item key={problem.id}>
                      <List.Header>
                        {`#${problem.nr} `}
                        <Link to={`/problem/${problem.id}`}>
                          {problem.name}
                        </Link>{" "}
                        {problem.grade}{" "}
                        {problem.stars > 0 && (
                          <Stars
                            numStars={problem.stars}
                            includeNoRating={false}
                          />
                        )}
                        {problem.text && <small>{problem.text} </small>}
                        {problem.subText && (
                          <small>
                            <i style={{ color: "gray" }}>{problem.subText} </i>
                          </small>
                        )}
                        <LockSymbol
                          lockedAdmin={problem.lockedAdmin}
                          lockedSuperadmin={problem.lockedSuperadmin}
                        />
                        {problem.ticked && <Icon color="green" name="check" />}
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
