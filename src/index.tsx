import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import { Auth0Provider } from "./utils/react-auth0-spa";
import App from './app';
import { Router } from 'react-router-dom';

const history = createBrowserHistory();

// Initialize google analytics page view tracking
ReactGA.initialize("UA-76534258-1");
history.listen(location => {
  ReactGA.set({ page: location.pathname }); // Update the user's current page
  ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

const onRedirectCallback = appState => {
  window.history.replaceState(
    {},
    document.title,
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

const Index = () => (
  <Auth0Provider
      domain='climbing.eu.auth0.com'
      client_id='DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt'
      redirect_uri={window.location.origin}
      onRedirectCallback={() => {onRedirectCallback}}
    >
    <Router history={history}>
      <App />
    </Router>
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))
