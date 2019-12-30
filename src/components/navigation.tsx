import React, {Component} from 'react';
import { Container, Dropdown, Image, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import SearchBox from './common/search-box/search-box';
import { getBaseUrl } from '../api';

class Navigation extends Component<any, any> {
  render() {
    return (
      <Menu attached='top' inverted compact borderless>
        <Container>
          <Menu.Item header as={Link} to='/'><Image size='mini' src='/png/buldreinfo.png' /></Menu.Item>
          <Menu.Item as={SearchBox} accessToken={this.props.accessToken} style={{maxWidth: '35vw'}} />
          <Menu.Item as={Link} to='/browse' icon='map' />
          <Menu.Item as={Link} to='/filter' icon='filter' />
          {this.props.isAuthenticated?
            <Dropdown item simple icon='user'>
              <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user">Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/todo">To-do list</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/permissions">Permissions</Dropdown.Item>
                  <Dropdown.Item as="a" onClick={() => this.props.logout({returnTo: getBaseUrl()})}>Sign out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          :
            <Menu.Item as="a" onClick={() => this.props.loginWithRedirect({})} icon="sign in" />
          }
        </Container>
      </Menu>
    );
  }
}

export default Navigation;
