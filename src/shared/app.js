import React, {Component} from 'react';
import ReactDOM from 'react-dom'; // Used for navbar hack
import {Route,  Switch} from 'react-router-dom';
import Loading from './components/common/loading/loading';
import routes from './routes';
import Navigation from './components/navigation';

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

class App extends Component {
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
            {routes.map(({ path, exact, component: Component, ...rest }) => (
              <Route key={path} path={path} exact={exact} render={(props) => (
                <Component {...props} {...rest} />
              )} />
            ))}
          </Switch>
          <footer style={{paddingTop: '10px', marginTop: '40px', color: '#777', textAlign: 'center', borderTop: '1px solid #e5e5e5'}}>
            buldreinfo.com &amp; brattelinjer.no &copy; 2006-2018
          </footer>
        </div>
      </span>
    );
  }
}

export default App;
