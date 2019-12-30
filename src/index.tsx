import React from 'react';
import ReactDOM from 'react-dom';
import Analytics from 'react-router-ga';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from "./utils/react-auth0-spa";
import App from './app';

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
    <BrowserRouter>
      <Analytics id="UA-76534258-1">
        <App />
      </Analytics>
    </BrowserRouter>
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))
