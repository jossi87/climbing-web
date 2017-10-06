import React, {Component} from 'react';
import ReactDOM from 'react-dom'; // Used for navbar hack
import { Navbar, Nav, NavItem, FormGroup, FormControl, MenuItem, NavDropdown } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Request from 'superagent';
import auth from '../utils/auth.js';
import config from '../utils/config.js';

import Index from './frontpage/index';
import Browse from './browse';
import Ethics from './ethics';
import Area from './area';
import AreaEdit from './area-edit';
import Sector from './sector';
import SectorEdit from './sector-edit';
import Problem from './problem';
import ProblemEdit from './problem-edit';
import Finder from './finder';
import User from './user';
import UserEdit from './user-edit';
import Login from './login';
import Register from './register';
import Recover from './recover';
import Logout from './logout';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logo: '/png/buldreinfo_logo_gray.png',
      searchString: '',
      loggedIn: auth.loggedIn()
    };
  }

  updateAuth(loggedIn) {
    this.setState({loggedIn: !!loggedIn});
  }

  componentWillMount() {
    auth.onChange = this.updateAuth.bind(this);
    auth.login();
  }

  // Temp fix to collapse nav-button on devices: https://github.com/lefant/react-bootstrap/commit/c68b46baea + https://github.com/react-bootstrap/react-router-bootstrap/issues/112#issuecomment-142599003
  componentDidMount() {
    const navBar = ReactDOM.findDOMNode(this).querySelector('nav.navbar');
    const collapsibleNav = navBar.querySelector('div.navbar-collapse');
    const btnToggle = navBar.querySelector('button.navbar-toggle');

    navBar.addEventListener('click', (evt) => {
      if (evt.target.tagName !== 'A' || evt.target.classList.contains('dropdown-toggle') || ! collapsibleNav.classList.contains('in')) {
        return;
      }

      btnToggle.click();
    }, false);

    Request.get(config.getUrl("grades?regionId=" + config.getRegion())).end((err, res) => {
      this.setState({
        error: err? err : null,
        grades: err? null : res.body
      });
    });
  }

  inputChange(e) {
    const value = e.target.value;
    if (value && value.length>0) {
      this.setState({searchString: value});
      Request.get(config.getUrl("search?regionId=" + config.getRegion() + "&value=" + value)).withCredentials().end((err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({searchResults: res.body});
      });
    }
    else {
      this.setState({searchString: value, searchResults: null});
    }
  }

  menuItemSelect() {
    this.setState({searchString: '', searchResults: null});
  }

  hoverImage(hover) {
    const logo = hover? '/png/buldreinfo_logo_white.png' : '/png/buldreinfo_logo_gray.png';
    this.setState({logo: logo});
  }

  render() {
    var searchResults = "";
    if (this.state && this.state.searchResults && this.state.searchResults.length>0) {
      const rows = this.state.searchResults.map((s, i) => {
        return (
          <LinkContainer key={i} to={`/problem/${s.id}`}>
            <MenuItem key={i} href="#" onSelect={this.menuItemSelect.bind(this)}>{s.value} {s.visibility===1 && <i className="fa fa-lock"></i>}{s.visibility===2 && <i className="fa fa-expeditedssl"></i>}</MenuItem>
          </LinkContainer>
        )
      });
      searchResults=(
        <div className="clearfix">
          <ul className="dropdown-menu open" style={{display:'inline', right:'auto'}}>
            {rows}
          </ul>
        </div>
      );
    }
    return (
      <span>
        <Navbar inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <LinkContainer to="/">
                <a href="/" onMouseOver={this.hoverImage.bind(this, true)} onMouseOut={this.hoverImage.bind(this, false)}><img src={this.state.logo}/></a>
              </LinkContainer>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <LinkContainer to="/browse">
                <NavItem eventKey={1}>Browse</NavItem>
              </LinkContainer>
              <LinkContainer to="/ethics">
                <NavItem eventKey={2}>Ethics</NavItem>
              </LinkContainer>
              <NavDropdown eventKey={3} title="Finder" id='basic-nav-dropdown'>
                {auth.isSuperAdmin() && <LinkContainer to="/finder/-1"><MenuItem eventKey={3.0}>Grade: <strong>superadmin</strong></MenuItem></LinkContainer>}
                {this.state && this.state.grades && this.state.grades.map((g, i) => { return <LinkContainer key={"3." + i} to={"/finder/" + g.id}><MenuItem eventKey={"3." + i}>Grade: <strong>{g.grade}</strong></MenuItem></LinkContainer> })}
              </NavDropdown>
            </Nav>
            <Nav pullRight>
              {this.state.loggedIn?
                <NavDropdown eventKey={4} title="Logged in" id='basic-nav-dropdown'>
                  <LinkContainer to="/user"><MenuItem eventKey={4.1}>My profile</MenuItem></LinkContainer>
                  <MenuItem divider />
                  <LinkContainer to="/logout"><MenuItem eventKey={4.2}>Log out</MenuItem></LinkContainer>
                </NavDropdown>
                :
                <LinkContainer to="/login"><NavItem eventKey={5}>Sign in</NavItem></LinkContainer>
              }
              <NavItem eventKey={6} href="mailto:jostein.oygarden@gmail.com">Contact</NavItem>
            </Nav>
            <Navbar.Form pullRight>
              <FormGroup bsSize="small">
                <FormControl type="text" placeholder="Search" value={this.state.searchString} onChange={this.inputChange.bind(this)} />
              </FormGroup>
              {searchResults}
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>
        <div className="container">
          <Switch>
            <Route exact path='/' component={Index}/>
            <Route path="/browse" component={Browse}/>
            <Route path="/ethics" component={Ethics}/>
            <Route exact path="/area/:areaId" component={Area}/>
            <Route exact path="/area/edit/:areaId" component={AreaEdit}/>
            <Route exact path="/sector/:sectorId" component={Sector}/>
            <Route exact path="/sector/edit/:sectorId" component={SectorEdit}/>
            <Route exact path="/problem/:problemId" component={Problem}/>
            <Route exact path="/problem/edit/:problemId" component={ProblemEdit}/>
            <Route exact path="/finder/:grade" component={Finder}/>
            <Route exact path="/user" component={User}/>
            <Route exact path="/user/:userId" component={User}/>
            <Route exact path="/user/:userId/edit" component={UserEdit}/>
            <Route path="/login" component={Login}/>
            <Route path="/register" component={Register}/>
            <Route exact path="/recover/:token" component={Recover}/>
            <Route path="/logout" component={Logout}/>
          </Switch>
          <footer style={{paddingTop: '10px', marginTop: '40px', color: '#777', textAlign: 'center', borderTop: '1px solid #e5e5e5'}}>
            &copy; buldreinfo.com 2006-2017
          </footer>
        </div>
      </span>
    );
  }
}
