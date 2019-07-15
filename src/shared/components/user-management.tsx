import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll, LockSymbol } from './common/widgets/widgets';
import { getManagementUsers, postManagementUsers } from '../api';
import { Segment, Header, List, Image, Dropdown } from 'semantic-ui-react';

const UserManagement = ({auth}) => {
  const [userManagement, setUserManagement] = useState([]);

  useEffect(() => {
    getManagementUsers(auth.getAccessToken()).then((res) => {
      setUserManagement(res);
    });
  }, [auth]);

  if (!userManagement) {
    return <LoadingAndRestoreScroll />;
  }
  return (
    <Segment>
      <MetaTags>
        <title>User management</title>
        <meta name="description" content={"User management"} />
      </MetaTags>
      <Header as="h2">User management</Header>
      <List>
        {userManagement.map((u, key) => (
          <List.Item key={key}>
            <Image avatar src={u.picture? u.picture : '/png/image.png'} />
            <List.Content>
              <List.Header>{u.name} <LockSymbol visibility={u.write}/></List.Header>
              <List.Description>
                <Dropdown value={u.write}
                  disabled={u.readOnly}
                  options={[
                    {key: 0, value: 0, icon: "user", text: "Default user"},
                    {key: 1, value: 1, icon: "lock", text: "Administrator"},
                    {key: 2, value: 2, icon: "user secret", text: "Super administrator (can mange users)"}
                  ]}
                  onChange={(e, data) => {
                    u.write=data.value;
                    postManagementUsers(auth.getAccessToken(), u.userId, u.write)
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

export default UserManagement;