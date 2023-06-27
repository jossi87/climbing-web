import React, { useRef } from "react";
import { Helmet } from "react-helmet";
import { LockSymbol, Loading } from "./common/widgets/widgets";
import { Segment, Icon, List, Header } from "semantic-ui-react";
import { useMeta } from "./common/meta";
import { useData } from "../api";

const Dangerous = () => {
  const meta = useMeta();
  const { data } = useData(`/dangerous`);
  const areaRefs = useRef({});

  if (!data) {
    return <Loading />;
  }
  const description = meta.isBouldering? "Problems flagged as dangerous" : "Routes flagged as dangerous";
  return (
    <>
      <Helmet>
        <title>Dangerous | {meta.title}</title>
        <meta name="description" content={description}></meta>
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="warning sign" />
          <Header.Content>
            Dangerous
            <Header.Subheader>
              {description}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <List celled link horizontal size="small">
          {data.map((area, i) => (
            <React.Fragment key={i}>
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
                            <small>
                              <i
                                style={{ color: "gray" }}
                              >{`${problem.postTxt} (${problem.postWhen} - ${problem.postBy})`}</i>
                            </small>
                            <LockSymbol
                              lockedAdmin={problem.lockedAdmin}
                              lockedSuperadmin={problem.lockedSuperadmin}
                            />
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

export default Dangerous;
