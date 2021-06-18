import React, { useState, useEffect } from 'react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { Container, Dropdown, Image, Menu, Icon } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';
import SearchBox from './common/search-box/search-box';
import { getBaseUrl, getMeta } from '../api';

const Navigation = () => {
  const { loading, isAuthenticated, loginWithRedirect, logout, accessToken } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsUserAdmin] = useState(false);
  let location = useLocation();
  useEffect(() => {
    getMeta(accessToken).then((data) => {
      setIsAdmin(data.metadata.isAdmin)
      setIsUserAdmin(data.metadata.isSuperAdmin);
    });
  }, [accessToken, isAuthenticated]);

  return (
    <Menu attached='top' inverted compact borderless>
      <Container>
        <Menu.Item header as={Link} to='/'><Image size='mini' src='/png/buldreinfo.png' /></Menu.Item>
        <Menu.Item as={SearchBox}  style={{maxWidth: '35vw'}} />
        <Dropdown item simple icon='database'>
          <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/browse"><Icon name="list"/>Browse areas</Dropdown.Item>
              <Dropdown.Item as={Link} to="/toc"><Icon name="database"/>Table of Contents</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/filter"><Icon name="find"/>Filter</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/weather"><Icon name="sun"/>Weather map</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {!loading && 
          (isAuthenticated?
            <Dropdown item simple icon='user'>
              <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user"><Icon name="user"/>Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/todo"><Icon name="tasks"/>To-do list</Dropdown.Item>
                  {(isAdmin || isSuperAdmin) && <>
                    <Dropdown.Divider/>
                    {isAdmin && <Dropdown.Item as={Link} to="/trash"><Icon name="trash"/>Trash</Dropdown.Item>}
                    {isSuperAdmin && <Dropdown.Item as={Link} to="/permissions"><Icon name="users"/>Permissions</Dropdown.Item>}
                  </>}
                  <Dropdown.Divider/>
                  <Dropdown.Item as="a" onClick={() => logout({returnTo: getBaseUrl()})}><Icon name="sign out"/>Sign out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          :
            <Menu.Item as="a" onClick={() => loginWithRedirect({appState: { targetUrl: location.pathname }})} icon="sign in" />
          )
        }
        <Menu.Item as={Link} to="/help" icon="help" />
      </Container>
    </Menu>
  );
}

export default Navigation;
