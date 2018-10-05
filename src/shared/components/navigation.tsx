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
    this.state = {metadata, logo: '/png/buldreinfo_logo_gray.png'};
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

  hoverImage(hover) {
    const logo = hover? '/png/buldreinfo_logo_white.png' : '/png/buldreinfo_logo_gray.png';
    this.setState({logo: logo});
  }

  login() {
    localStorage.setItem('redirect', this.props.location.pathname);
    this.props.auth.login();
  }

  render() {
    return (
      <Menu fixed='top' inverted>
        <Container>
          <Menu.Item header as={Link} to='/'>
            <Image size='mini' src={this.state.logo} style={{ marginRight: '1.5em' }} />
            Buldreinfo
          </Menu.Item>
          <Menu.Item as={Link} to='/browse'>Browse</Menu.Item>

          <Menu.Item as={SearchBox} {...this.props}/>

          <Dropdown item simple text='Finder'>
            <Dropdown.Menu>
              {this.state.metadata && !this.state.metadata.isBouldering && <Dropdown.Item as={Link} to="/hse">Flagged as dangerous (HSE)</Dropdown.Item>}
              {this.state.metadata && this.state.metadata.isSuperAdmin && <Dropdown.Item as={Link} to="/finder/-1">Grade: <strong>superadmin</strong></Dropdown.Item>}
              {this.state.metadata && this.state.metadata.grades && this.state.metadata.grades.map(g => (<Dropdown.Item as={Link} to={"/finder/" + g.id}>Grade: <strong>{g.grade}</strong></Dropdown.Item>))}
            </Dropdown.Menu>
          </Dropdown>

          {this.props.isAuthenticated?
            <Dropdown item simple text='Logged in'>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/user">My profile</Dropdown.Item>
                <Dropdown.Item as={Link} to="/logout">Sign out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            :
            <Menu.Item as="a" onClick={this.login.bind(this)}>Sign in</Menu.Item>
          }
        </Container>
      </Menu>
    );
  }
}

export default Navigation;
