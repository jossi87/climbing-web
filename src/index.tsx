import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Auth0Provider } from './utils/react-auth0-spa';
import App from './app';
import LeafletPrint from './leaflet-print';

const Index = () => (
  <Auth0Provider
      domain='climbing.eu.auth0.com'
      client_id='DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt'
      redirect_uri={window.location.origin}
    >
    <Router>
      <Switch>
        <Route exact path="/leaflet-print/:json" component={LeafletPrint} />
        <Route component={App}/>
      </Switch>
    </Router>
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))