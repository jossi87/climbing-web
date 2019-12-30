import React from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from "./utils/react-auth0-spa";
import App from './app';

ReactGA.initialize("UA-76534258-1");

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
      <App />
    </BrowserRouter>
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))
