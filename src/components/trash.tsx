import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { getTrash, putTrash } from '../api';
import { Segment, Icon, Header, List, Button } from 'semantic-ui-react';
import { useLocation, useHistory } from 'react-router-dom';
import { useAuth0 } from '../utils/react-auth0-spa';
import { InsufficientPrivileges } from './common/widgets/widgets';

const Trash = () => {
  const { isAuthenticated, loading, accessToken, loginWithRedirect } = useAuth0();
  const [data, setData] = useState(null);
  let location = useLocation();
  let history = useHistory();

  useEffect(() => {
    if (!loading) {
      getTrash(accessToken).then((res) => {
        setData(res);
      });
    }
  }, [loading, accessToken]);

  if (loading || (isAuthenticated && !data)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  } else if (!data.metadata.isSuperAdmin) {
    return <InsufficientPrivileges />
  }
  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </MetaTags>
      <Segment>
        <Header as="h2">
          <Icon name='trash' />
          <Header.Content>
            Trash
            <Header.Subheader>{data.trash.length} items</Header.Subheader>
          </Header.Content>
        </Header>
        {data.trash.length == 0?
          <i>No data</i>
        :
          <List divided verticalAlign='middle'>
            {data.trash.map((t, key) => {
              let label = null;
              if (t.idArea>0) label = "Area";
              else if (t.idSector>0) label = "Sector";
              else if (t.idProblem>0) label = "Problem";
              return (
                <List.Item key={key}>
                  <List.Content floated='right'>
                    <Button onClick={() => {
                      if (confirm("Are you sure you want to restore " + t.name)) {
                        putTrash(accessToken, t.idArea, t.idSector, t.idProblem)
                        .then((response) => {
                          if (t.idArea>0) {
                            history.push("/area/" + t.idArea);
                          } else if (t.idSector>0) {
                            history.push("/sector/" + t.idSector);
                          } else if (t.idProblem>0) {
                            history.push("/problem/" + t.idProblem);
                          }
                        })
                      }
                    }}>Restore</Button>
                  </List.Content>
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
        }
      </Segment>
    </>
  )
}

export default Trash;