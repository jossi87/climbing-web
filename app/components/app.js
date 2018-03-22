import React, {Component} from 'react';
import ReactDOM from 'react-dom'; // Used for navbar hack
import { Route, Switch } from 'react-router-dom';
import DynamicImport from './common/dynamic-import/dynamic-import';
import Loading from './common/loading/loading';

const Area = (props) => (<DynamicImport load={() => import('./area')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>)
const AreaEdit = (props) => (<DynamicImport load={() => import('./area-edit')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Browse = (props) => (<DynamicImport load={() => import('./browse')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Ethics = (props) => (<DynamicImport load={() => import('./ethics')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Finder = (props) => (<DynamicImport load={() => import('./finder')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Index = (props) => (<DynamicImport load={() => import('./frontpage/index')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Login = (props) => (<DynamicImport load={() => import('./login')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Logout = (props) => (<DynamicImport load={() => import('./logout')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Navigation = (props) => (<DynamicImport load={() => import('./navigation')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Problem = (props) => (<DynamicImport load={() => import('./problem')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const ProblemEdit = (props) => (<DynamicImport load={() => import('./problem-edit')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Recover = (props) => (<DynamicImport load={() => import('./recover')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Register = (props) => (<DynamicImport load={() => import('./register')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const Sector = (props) => (<DynamicImport load={() => import('./sector')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const SectorEdit = (props) => (<DynamicImport load={() => import('./sector-edit')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const SvgEdit = (props) => (<DynamicImport load={() => import('./common/svg/svg-edit')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const User = (props) => (<DynamicImport load={() => import('./user')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);
const UserEdit = (props) => (<DynamicImport load={() => import('./user-edit')}>{(Component) => Component === null? <Loading /> : <Component {...props} />}</DynamicImport>);

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
      </span>
    );
  }
}
