import React, {Component} from 'react';
import { Container, Dropdown, Image, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import SearchBox from './common/search-box/search-box';

class Navigation extends Component<any, any> {
  login = () => {
    localStorage.setItem('redirect', this.props.location.pathname);
    this.props.auth.login();
  }

  render() {
    return (
      <Menu attached='top' inverted compact borderless>
        <Container>
          <Menu.Item header as={Link} to='/'><Image size='mini' src='/png/buldreinfo.png' /></Menu.Item>
          <Menu.Item as={SearchBox} auth={this.props.auth} style={{maxWidth: '35vw'}} />
          <Menu.Item as={Link} to='/browse' icon='list' />
          {this.props.isAuthenticated?
            <Dropdown item simple icon='user'>
              <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user">My profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/logout">Sign out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          :
            <Dropdown item simple icon='users'>
              <Dropdown.Menu>
                <Dropdown.Item onClick={this.login}>Sign in</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          }
        </Container>
      </Menu>
    );
  }
}

export default Navigation;
