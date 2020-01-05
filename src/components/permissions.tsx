import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { getPermissions, postPermissions } from '../api';
import { Header, Image, Dropdown, Card } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '../utils/react-auth0-spa';
import { InsufficientPrivileges } from './common/widgets/widgets';

const Permissions = () => {
  const { isAuthenticated, loading, accessToken, loginWithRedirect } = useAuth0();
  const [data, setPermission] = useState();
  let location = useLocation();

  useEffect(() => {
    if (!loading) {
      getPermissions(accessToken).then((res) => {
        setPermission(res);
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
      <Header as="h2">Permissions ({data.users.length} users)</Header>
      {data.users.length == 0?
        <i>No data</i>
      :
        <Card.Group doubling stackable itemsPerRow={4}>
          {data.users.map((u, key) => {
            var color : any = 'white';
            if (u.write == 2) {
              color = 'black';
            } else if (u.write == 1) {
              color = 'red';
            } else if (u.write == 0) {
              color = 'green';
            } else {
              color = 'yellow';
            }
            return (
              <Card color={color} key={key} raised>
                <Card.Content>
                  <Image floated='right' size='mini' src={u.picture? u.picture : '/png/image.png'} />
                  <Card.Header as={Link} to={`/user/${u.userId}`}>{u.name} <LockSymbol visibility={u.write}/></Card.Header>
                  <Card.Meta>Last seen {u.lastLogin}</Card.Meta>
                  <Card.Description>
                    <Dropdown value={u.write}
                      disabled={u.readOnly}
                      options={[
                        {key: -1, value: -1, icon: "user", text: "Default user"},
                        {key: 0, value: 0, icon: "user plus", text: "Read hidden data"},
                        {key: 1, value: 1, icon: "lock", text: "Admin (read+write hidden data)"},
                        {key: 2, value: 2, icon: "user secret", text: "Admin + manage users"}
                      ]}
                      onChange={(e, data) => {
                        u.write=data.value;
                        postPermissions(accessToken, u.userId, u.write)
                        .then((response) => {
                          window.location.reload();
                        })
                        .catch((error) => {
                          console.warn(error);
                          alert(error.toString());
                        });
                      }}
                    />
                  </Card.Description>
                </Card.Content>
              </Card>
            );
          })}
        </Card.Group>
      }
    </>
  )
}

export default Permissions;