import { Helmet } from "react-helmet";
import { Loading } from "./common/widgets/widgets";
import { useMeta } from "./common/meta";
import { getImageUrl, useData, putTrash } from "../api";
import { Segment, Icon, Header, List, Button, Image } from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { InsufficientPrivileges } from "./common/widgets/widgets";

const Trash = () => {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();
  const meta = useMeta();
  const { data } = useData(`/trash`);
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading || (isAuthenticated && !data)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
  } else if (!meta.isSuperAdmin) {
    return <InsufficientPrivileges />;
  } else {
    return (
      <>
        <Helmet>
          <title>Trash | {meta.title}</title>
        </Helmet>
        <Segment>
          <Header as="h2">
            <Icon name="trash" />
            <Header.Content>
              Trash
              <Header.Subheader>{data.length} items</Header.Subheader>
            </Header.Content>
          </Header>
          {data.length == 0 ? (
            <i>No data</i>
          ) : (
            <List divided verticalAlign="middle">
              {data.map((t, key) => {
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
                            ).then(() => {
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
