import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill'; // Important for PhantomJS (Googlebot) to be able to render page
import { BrowserRouter, Route } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory'
import App from './components/app';
import ReactGA from 'react-ga';
ReactGA.initialize('UA-76534258-1');

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
