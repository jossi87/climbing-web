import React, {Component} from 'react';
import ReactDOM from 'react-dom'; // Used for navbar hack
import { Route, Switch } from 'react-router-dom';

import Area from './area';
import AreaEdit from './area-edit';
import Browse from './browse';
import Ethics from './ethics';
import Finder from './finder';
import Index from './frontpage/index';
import Login from './login';
import Logout from './logout';
import Navigation from './navigation';
import Problem from './problem';
import ProblemEdit from './problem-edit';
import Recover from './recover';
import Register from './register';
import Sector from './sector';
import SectorEdit from './sector-edit';
import SvgEdit from './common/svg/svg-edit';
import User from './user';
import UserEdit from './user-edit';

export default class App extends Component {
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
  }

  render() {
    return (
      <span>
        <Navigation/>
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
            <Route exact path="/problem/svg-edit/:problemId" component={SvgEdit}/>
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
            buldreinfo.com &amp; brattelinjer.no &copy; 2006-2018
          </footer>
        </div>
      </span>
    );
  }
}
