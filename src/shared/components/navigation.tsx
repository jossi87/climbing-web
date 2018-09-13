import React, {Component} from 'react';
import { Navbar, Nav, NavItem, FormGroup, MenuItem, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Search from './common/search/search';
import { getMeta } from './../api';

class Navigation extends Component<any, any> {
  constructor(props) {
    super(props);
    let metadata;
    if (__isBrowser__) {
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
      <Navbar inverse>
        <Navbar.Header>
          <Navbar.Brand>
            <LinkContainer to="/">
              <a href="/" onMouseOver={this.hoverImage.bind(this, true)} onMouseOut={this.hoverImage.bind(this, false)}><img src={this.state.logo} alt="Logo"/></a>
            </LinkContainer>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <LinkContainer to="/browse">
              <NavItem eventKey={1}>Browse</NavItem>
            </LinkContainer>
            <NavDropdown eventKey={2} title="Finder" id='basic-nav-dropdown'>
              {this.state.metadata && this.state.metadata.isSuperAdmin && <LinkContainer to="/finder/-1"><MenuItem eventKey={2.0}>Grade: <strong>superadmin</strong></MenuItem></LinkContainer>}
              {this.state.metadata && this.state.metadata.grades && this.state.metadata.grades.map((g, i) => { return <LinkContainer key={"2." + i} to={"/finder/" + g.id}><MenuItem eventKey={"3." + i}>Grade: <strong>{g.grade}</strong></MenuItem></LinkContainer> })}
            </NavDropdown>
          </Nav>
          <Navbar.Form pullLeft>
            <FormGroup style={{width: '350px'}}>
              <Search auth={this.props.auth}/>
            </FormGroup>
          </Navbar.Form>

          <Nav pullRight>
            {this.props.isAuthenticated?
              <NavDropdown eventKey={4} title="Logged in" id='basic-nav-dropdown'>
                <LinkContainer to="/user"><MenuItem eventKey={4.1}>My profile</MenuItem></LinkContainer>
                <MenuItem divider />
                <LinkContainer to="/logout"><MenuItem eventKey={4.2}>Log out</MenuItem></LinkContainer>
              </NavDropdown>
              :
              <NavItem eventKey={5} onClick={this.login.bind(this)}>Sign in</NavItem>
            }
            <NavDropdown eventKey={6} title="More" id='basic-nav-dropdown'>
              {this.state.metadata && !this.state.metadata.isBouldering &&
                <LinkContainer to="/hse">
                  <NavItem eventKey={6.0}>Flagged as dangerous (HSE)</NavItem>
                </LinkContainer>
              }
              <LinkContainer to="/ethics">
                <NavItem eventKey={6.1}>Ethics</NavItem>
              </LinkContainer>
              <MenuItem divider />
              <MenuItem eventKey={6.2} href="mailto:jostein.oygarden@gmail.com">Contact</MenuItem>
              <MenuItem eventKey={6.3} href="/gpl-3.0.txt" rel="noopener" target="_blank">GNU Public License</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey={6.4} href="https://buldreinfo.com" rel="noopener" target="_blank">buldreinfo.com</MenuItem>
              <MenuItem eventKey={6.5} href="https://buldring.bergen-klatreklubb.no" rel="noopener" target="_blank">buldring.bergen-klatreklubb.no</MenuItem>
              <MenuItem eventKey={6.6} href="https://buldring.fredrikstadklatreklubb.org" rel="noopener" target="_blank">buldring.fredrikstadklatreklubb.org</MenuItem>
              <MenuItem eventKey={6.7} href="https://buldring.jotunheimenfjellsport.com" rel="noopener" target="_blank">buldring.jotunheimenfjellsport.com</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey={6.8} href="https://brattelinjer.no" rel="noopener" target="_blank">brattelinjer.no</MenuItem>
              <MenuItem eventKey={6.9} href="https://klatring.jotunheimenfjellsport.com" rel="noopener" target="_blank">klatring.jotunheimenfjellsport.com</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Navigation;
