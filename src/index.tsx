import React from 'react';
import ReactDOM from 'react-dom';
import history from "./utils/history";
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
    <App />
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))
