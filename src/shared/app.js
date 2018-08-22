import React, {Component} from 'react';
import ReactDOM from 'react-dom'; // Used for navbar hack
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import {Route,  Switch} from 'react-router-dom';
import routes from './routes';
import Navigation from './components/navigation';
import ReactGA from 'react-ga';
import Auth from './utils/auth';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCheck, faComment, faEdit, faHashtag, faImage, faLock, faMapMarker, faPlane, faPlusSquare, faSpinner, faStar, faStarHalf, faTrash, faUserSecret, faVideo } from '@fortawesome/free-solid-svg-icons';
library.add(faCamera);
library.add(faCheck);
library.add(faComment);
library.add(faEdit);
library.add(faHashtag);
library.add(faImage);
library.add(faLock);
library.add(faMapMarker);
library.add(faPlane);
library.add(faPlusSquare);
library.add(faSpinner);
library.add(faStar);
library.add(faStarHalf);
library.add(faTrash);
library.add(faUserSecret);
library.add(faVideo);

var auth;

if (__isBrowser__) {
  ReactGA.initialize('UA-76534258-1');
}

function Analytics(props) {
  if (__isBrowser__) {
    ReactGA.set({ page: props.location.pathname + props.location.search });
    ReactGA.pageview(props.location.pathname + props.location.search);
  }
  return null;
};

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.auth = new Auth(cookies);
  }

  componentDidMount() {
    // Temp fix to collapse nav-button on devices: https://github.com/lefant/react-bootstrap/commit/c68b46baea + https://github.com/react-bootstrap/react-router-bootstrap/issues/112#issuecomment-142599003
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
      <Switch>
        {routes.map(({ path, exact, component: Component, ...rest }) => (
          <Route key={path} path={path} exact={exact} render={(props) => (
            <div>
              <Analytics {...props}/>
              <Navigation auth={this.auth} {...props}/>
              <div className="container">
                <Component auth={this.auth} {...props} {...rest} />
              </div>
              <footer style={{paddingTop: '10px', marginTop: '40px', color: '#777', textAlign: 'center', borderTop: '1px solid #e5e5e5'}}>
                Buldreinfo &amp; Bratte Linjer &copy; 2006-2018
              </footer>
            </div>
          )} />
        ))}
      </Switch>
    );
  }
}

export default withCookies(App);
