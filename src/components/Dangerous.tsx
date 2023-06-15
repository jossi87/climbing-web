import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { LockSymbol, Loading } from "./common/widgets/widgets";
import { Segment, Icon, List, Header } from "semantic-ui-react";
import { useAuth0 } from "@auth0/auth0-react";
import { getDangerous } from "../api";

const Dangerous = () => {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState(null);
  const areaRefs = useRef({});
  useEffect(() => {
    if (!isLoading) {
      const update = async () => {
        const accessToken = isAuthenticated
          ? await getAccessTokenSilently()
          : null;
        getDangerous(accessToken).then((data) => setData(data));
      };
      update();
    }
  }, [isLoading, isAuthenticated]);

  if (!data) {
    return <Loading />;
  }
  return (
    <>
      <Helmet>
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta
          property="og:image:height"
          content={data.metadata.og.imageHeight}
        />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </Helmet>
      <Segment>
        <Header as="h2">
          <Icon name="warning sign" />
          <Header.Content>
            Marked as dangerous
            <Header.Subheader>{data.metadata.description}</Header.Subheader>
          </Header.Content>
        </Header>
        <List celled link horizontal size="small">
          {data.areas.map((area, i) => (
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
          {data.areas.map((area, i) => (
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
