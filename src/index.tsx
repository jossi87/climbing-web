import React from 'react';
import ReactDOM from 'react-dom';
import Analytics from 'react-router-ga';
import history from "./utils/history";
import { Router } from 'react-router-dom';
import { Auth0Provider } from "./utils/react-auth0-spa";
import App from './app';

const onRedirectCallback = appState => {
  history.push(
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
      <Analytics id="UA-76534258-1">
        <App />
      </Analytics>
    </Router>
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))
