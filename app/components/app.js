import React, {Component} from 'react';
import ReactDOM from 'react-dom'; // Used for navbar hack
import { Route, Switch } from 'react-router-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import Loadable from 'react-loadable';
import Loading from './common/loading/loading';
import Navigation from './navigation';
const Area = Loadable({loader: () => import('./area'), loading: Loading});
const AreaEdit = Loadable({loader: () => import('./area-edit'), loading: Loading});
const Browse = Loadable({loader: () => import('./browse'), loading: Loading});
const Ethics = Loadable({loader: () => import('./ethics'), loading: Loading});
const Finder = Loadable({loader: () => import('./finder'), loading: Loading});
const Index = Loadable({loader: () => import('./frontpage/index'), loading: Loading});
const Login = Loadable({loader: () => import('./login'), loading: Loading});
const Logout = Loadable({loader: () => import('./logout'), loading: Loading});
const Problem = Loadable({loader: () => import('./problem'), loading: Loading});
const ProblemEdit = Loadable({loader: () => import('./problem-edit'), loading: Loading});
const Recover = Loadable({loader: () => import('./recover'), loading: Loading});
const Register = Loadable({loader: () => import('./register'), loading: Loading});
const Sector = Loadable({loader: () => import('./sector'), loading: Loading});
const SectorEdit = Loadable({loader: () => import('./sector-edit'), loading: Loading});
const SvgEdit = Loadable({loader: () => import('./common/svg/svg-edit'), loading: Loading});
const User = Loadable({loader: () => import('./user'), loading: Loading});
const UserEdit = Loadable({loader: () => import('./user-edit'), loading: Loading});

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
      <Router>
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
            <Route exact path="/problem/svg-edit/:problemId/:mediaId" component={SvgEdit}/>
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
      </Router>
    );
  }
}
