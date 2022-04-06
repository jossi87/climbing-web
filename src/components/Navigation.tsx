import React, { useState, useEffect } from 'react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { Container, Dropdown, Image, Menu, Icon } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';
import SearchBox from './common/search-box/search-box';
import { getBaseUrl, getMeta } from '../api';
import logo from "../../build/png/buldreinfo.png";

const Navigation = () => {
  const { loading, isAuthenticated, loginWithRedirect, logout, accessToken } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsUserAdmin] = useState(false);
  const [isBouldering, setIsBouldering] = useState(false);
  let location = useLocation();
  useEffect(() => {
    getMeta(accessToken).then((data) => {
      setIsAdmin(data.metadata.isAdmin)
      setIsUserAdmin(data.metadata.isSuperAdmin);
      setIsBouldering(data.metadata.gradeSystem==='BOULDER');
    });
  }, [accessToken, isAuthenticated]);

  return (
    <Menu attached='top' inverted compact borderless>
      <Container>
        <Menu.Item header as={Link} to='/'><Image size='mini' src={logo} /></Menu.Item>
        <Menu.Item as={SearchBox}  style={{maxWidth: '35vw'}} />
        <Dropdown item simple icon='ellipsis vertical'>
          <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/browse"><Icon name="list"/>Browse areas</Dropdown.Item>
              <Dropdown.Item as={Link} to="/toc"><Icon name="database"/>Table of Contents</Dropdown.Item>
              <Dropdown.Item as={Link} to="/cg"><Icon name="area graph"/>Content Graph</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/filter"><Icon name="find"/>Filter</Dropdown.Item>
              {!isBouldering && <Dropdown.Item as={Link} to="/dangerous"><Icon name="warning sign"/>Marked as dangerous</Dropdown.Item>}
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/webcam-map"><Icon name="camera"/>Webcam Map</Dropdown.Item>
              <Dropdown.Item as={Link} to="/about"><Icon name="info"/>About</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {!loading && 
          (isAuthenticated?
            <Dropdown item simple icon='user'>
              <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user"><Icon name="user"/>Profile</Dropdown.Item>
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
      </Container>
    </Menu>
  );
}

export default Navigation;