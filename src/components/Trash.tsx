import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Loading } from "./common/widgets/widgets";
import { getImageUrl } from "../api";
import { getTrash, putTrash } from "../api";
import { Segment, Icon, Header, List, Button, Image } from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { InsufficientPrivileges } from "./common/widgets/widgets";

const Trash = () => {
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [data, setData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      const update = async () => {
        const accessToken = isAuthenticated
          ? await getAccessTokenSilently()
          : null;
        getTrash(accessToken).then((data) => setData({ ...data, accessToken }));
      };
      update();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || (isAuthenticated && !data)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
  } else if (!data.metadata.isSuperAdmin) {
    return <InsufficientPrivileges />;
  } else {
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
          <meta
            property="og:image:width"
            content={data.metadata.og.imageWidth}
          />
          <meta
            property="og:image:height"
            content={data.metadata.og.imageHeight}
          />
          <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
        </Helmet>
        <Segment>
          <Header as="h2">
            <Icon name="trash" />
            <Header.Content>
              Trash
              <Header.Subheader>{data.trash.length} items</Header.Subheader>
            </Header.Content>
          </Header>
          {data.trash.length == 0 ? (
            <i>No data</i>
          ) : (
            <List divided verticalAlign="middle">
              {data.trash.map((t, key) => {
                let label = null;
                if (t.idMedia > 0) label = "Media";
                else if (t.idArea > 0) label = "Area";
                else if (t.idSector > 0) label = "Sector";
                else if (t.idProblem > 0) label = "Problem";
                return (
                  <List.Item key={key}>
                    <List.Content floated="right">
                      <Button
                        onClick={() => {
                          if (
                            confirm("Are you sure you want to restore item?")
                          ) {
                            putTrash(
                              data.accessToken,
                              t.idArea,
                              t.idSector,
                              t.idProblem,
                              t.idMedia
                            ).then((response) => {
                              let url;
                              if (t.idArea > 0) {
                                url = "/area/" + t.idArea;
                              } else if (t.idSector > 0) {
                                url = "/sector/" + t.idSector;
                              } else if (t.idProblem > 0) {
                                url = "/problem/" + t.idProblem;
                              }
                              if (t.idMedia > 0) {
                                navigate(url + "?idMedia=" + t.idMedia);
                              } else {
                                navigate(url);
                              }
                            });
                          }
                        }}
                      >
                        Restore
                      </Button>
                    </List.Content>
                    {t.idMedia > 0 && (
                      <Image
                        alt={t.name}
                        key={t.idMedia}
                        src={getImageUrl(t.idMedia, null, 50)}
                        onError={(i) =>
                          (i.target.src = "/png/video_placeholder.png")
                        }
                        rounded
                      />
                    )}
                    <List.Content>
                      <List.Header>{t.name}</List.Header>
                      <List.Description>
                        {label + " deleted by " + t.by + " (" + t.when + ")"}
                      </List.Description>
                    </List.Content>
                  </List.Item>
                );
              })}
            </List>
          )}
        </Segment>
      </>
    );
  }
};

export default Trash;
