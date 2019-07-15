import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { getManagementUsers, postManagementUsers } from '../api';
import { Segment, Breadcrumb, List, Image, Dropdown } from 'semantic-ui-react'

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
        <title>Data management</title>
        <meta name="description" content={"Data management"} />
      </MetaTags>
      <Breadcrumb>
        <Breadcrumb.Section active>User management</Breadcrumb.Section>
      </Breadcrumb>
      <List>
        {userManagement.map((u, key) => (
          <List.Item key={key}>
            <Image avatar src={u.picture? u.picture : '/png/image.png'} />
            <List.Content>
              <List.Header>{u.name}</List.Header>
              <List.Description>
                Last seen {u.lastLogin}<br/>
                <Dropdown selection value={u.write}
                  disabled={u.readOnly}
                  options={[
                    {key: 0, value: 0, text: "Default user"},
                    {key: 1, value: 1, text: "Administrator"},
                    {key: 2, value: 2, text: "Super administrator (can mange users)"}
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
                  }}/>
              </List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Segment>
  )
}

export default UserManagement;