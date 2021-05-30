import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { getPermissions, postPermissions } from '../api';
import { Header, Icon, Segment, Image, Dropdown, Card } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '../utils/react-auth0-spa';
import { InsufficientPrivileges } from './common/widgets/widgets';

const Permissions = () => {
  const { isAuthenticated, loading, accessToken, loginWithRedirect } = useAuth0();
  const [data, setPermission] = useState(null);
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
      <Segment>
        <Header as="h2">
          <Icon name='users' />
          <Header.Content>
            Permissions
            <Header.Subheader>{data.users.length} users</Header.Subheader>
          </Header.Content>
        </Header>
      </Segment>
      {data.users.length == 0?
        <Segment>No data</Segment>
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
            let value = 0;
            if (u.superadminWrite) {
              value = 3;
            } else if (u.adminWrite) {
              value = 2;
            } else if (u.adminRead) {
              value = 1;
            }
            return (
              <Card color={color} key={key} raised>
                <Card.Content>
                  <Image floated='right' size='mini' src={u.picture? u.picture : '/png/image.png'} />
                  <Card.Header as={Link} to={`/user/${u.userId}`}>{u.name} <LockSymbol lockedAdmin={u.adminRead||u.adminWrite} lockedSuperadmin={u.superadminRead||u.superadminWrite}/></Card.Header>
                  <Card.Meta>Last seen {u.lastLogin}</Card.Meta>
                  <Card.Description>
                    <Dropdown value={value}
                      disabled={u.readOnly}
                      options={[
                        {key: 0, value: 0, icon: "user", text: "Default user"},
                        {key: 1, value: 1, icon: "user plus", text: "Read hidden data"},
                        {key: 2, value: 2, icon: "lock", text: "Admin (read+write hidden data)"},
                        {key: 3, value: 3, icon: "user secret", text: "Admin + manage users"}
                      ]}
                      onChange={(e, data) => {
                        let adminRead = data.value===1||data.value===2;
                        let adminWrite = data.value===2;
                        let superadminRead = data.value===3;
                        let superadminWrite = data.value===3;
                        postPermissions(accessToken, u.userId, adminRead, adminWrite, superadminRead, superadminWrite)
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