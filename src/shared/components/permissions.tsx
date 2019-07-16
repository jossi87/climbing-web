import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { getPermissions, postPermissions } from '../api';
import { Segment, Header, List, Image, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Permissions = ({auth}) => {
  const [data, setPermission] = useState();

  useEffect(() => {
    getPermissions(auth.getAccessToken()).then((res) => {
      setPermission(res);
    });
  }, [auth]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  return (
    <Segment>
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
      </MetaTags>
      <Header as="h2">Permissions</Header>
      <List divided>
        {data.users.length == 0?
          <i>No data</i>
        :
        data.users.map((u, key) => (
          <List.Item key={key}>
            <Image avatar src={u.picture? u.picture : '/png/image.png'} />
            <List.Content>
              <List.Header as={Link} to={`/user/${u.userId}`}>{u.name} <LockSymbol visibility={u.write}/></List.Header>
              <List.Description>
                <Dropdown value={u.write}
                  disabled={u.readOnly}
                  options={[
                    {key: 0, value: 0, icon: "user", text: "Default user"},
                    {key: 1, value: 1, icon: "lock", text: "Administrator"},
                    {key: 2, value: 2, icon: "user secret", text: "Super administrator (change permissions)"}
                  ]}
                  onChange={(e, data) => {
                    u.write=data.value;
                    postPermissions(auth.getAccessToken(), u.userId, u.write)
                    .then((response) => {
                      window.location.reload();
                    })
                    .catch((error) => {
                      console.warn(error);
                      alert(error.toString());
                    });
                  }}
                /><br/>
                <i>Last seen {u.lastLogin}</i>
              </List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Segment>
  )
}

export default Permissions;