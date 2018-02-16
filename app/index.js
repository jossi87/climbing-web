import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory'
import App from './components/app';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-76534258-1');

import fontawesome from '@fortawesome/fontawesome';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner';
fontawesome.library.add(faSpinner);

function Analytics(props) {
  ReactGA.set({ page: props.location.pathname + props.location.search });
  ReactGA.pageview(props.location.pathname + props.location.search);
  return null;
};

ReactDOM.render((
  <BrowserRouter>
    <div>
      <Route path="/" component={Analytics}/>
      <Route path="/" component={App}/>
    </div>
  </BrowserRouter>
), document.getElementById('index'))
