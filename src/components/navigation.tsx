import React, { useState, useEffect } from 'react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { Container, Dropdown, Image, Menu } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';
import SearchBox from './common/search-box/search-box';
import { getBaseUrl, getMeta } from '../api';

const Navigation = () => {
  const { loading, isAuthenticated, loginWithRedirect, logout, accessToken } = useAuth0();
  const [isSuperAdmin, setIsUserAdmin] = useState(false);
  let location = useLocation();
  useEffect(() => {
    getMeta(accessToken).then((data) => setIsUserAdmin(data.metadata.isSuperAdmin));
  }, [accessToken]);

  return (
    <Menu attached='top' inverted compact borderless>
      <Container>
        <Menu.Item header as={Link} to='/'><Image size='mini' src='/png/buldreinfo.png' /></Menu.Item>
        <Menu.Item as={SearchBox}  style={{maxWidth: '35vw'}} />
        <Dropdown item simple icon='bars'>
          <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/browse">Browse areas</Dropdown.Item>
              <Dropdown.Item as={Link} to="/toc">Table of Contents</Dropdown.Item>
              <Dropdown.Item as={Link} to="/weather">Weather map</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item as={Link} to='/filter' icon='filter' />
        {!loading && 
          (isAuthenticated?
            <Dropdown item simple icon='user'>
              <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/todo">To-do list</Dropdown.Item>
                  {isSuperAdmin && <Dropdown.Item as={Link} to="/permissions">Permissions</Dropdown.Item>}
                  <Dropdown.Item as="a" onClick={() => logout({returnTo: getBaseUrl()})}>Sign out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          :
            <Menu.Item as="a" onClick={() => loginWithRedirect({appState: { targetUrl: location.pathname }})} icon="sign in" />
          )
        }
      </Container>
    </Menu>
  );
}

export default Navigation;
