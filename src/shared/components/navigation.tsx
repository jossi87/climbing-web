import React, {Component} from 'react';
import { Container, Dropdown, Image, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import SearchBox from './common/search-box/search-box';
import { getMeta } from './../api';

class Navigation extends Component<any, any> {
  constructor(props) {
    super(props);
    let metadata;
    if (__isBrowser__ && window) {
      metadata = window.__INITIAL_METADATA__;
      delete window.__INITIAL_METADATA__;
    } else {
      metadata = props.staticContext.metadata;
    }
    this.state = {metadata};
  }

  componentDidMount() {
    if (!this.state.metadata) {
      this.refresh();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isAuthenticated !== prevProps.isAuthenticated) {
      this.refresh();
    }
  }

  refresh() {
    getMeta(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({metadata: data.metadata})));
  }

  login() {
    localStorage.setItem('redirect', this.props.location.pathname);
    this.props.auth.login();
  }

  render() {
    return (
      <Menu fixed='top' inverted size="tiny" compact borderless>
        <Container>
          <Menu.Item header as={Link} to='/'>
            <Image size='mini' src='/png/buldreinfo.png' />
          </Menu.Item>
          <Menu.Item style={{maxWidth: '120px'}} as={SearchBox} auth={this.props.auth} />
          <Menu.Menu position='right'>
            <Menu.Item as={Link} to='/browse' icon='list' />
            <Dropdown item simple icon='filter'>
              <Dropdown.Menu>
                {this.state.metadata && !this.state.metadata.isBouldering && <Dropdown.Item as={Link} to="/hse">Flagged as dangerous (HSE)</Dropdown.Item>}
                {this.state.metadata && this.state.metadata.isSuperAdmin && <Dropdown.Item as={Link} to="/finder/-1">Grade: <strong>superadmin</strong></Dropdown.Item>}
                {this.state.metadata && this.state.metadata.grades && this.state.metadata.grades.map((g, i) => (<Dropdown.Item key={i} as={Link} to={"/finder/" + g.id}>Grade: <strong>{g.grade}</strong></Dropdown.Item>))}
              </Dropdown.Menu>
            </Dropdown>
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
                  <Dropdown.Item onClick={this.login.bind(this)}>Sign in</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            }
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}

export default Navigation;
