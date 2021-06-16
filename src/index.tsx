import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth0Provider } from './utils/react-auth0-spa';
import CookieConsent from "react-cookie-consent";
import { ErrorBoundary } from 'react-error-boundary'
import App from './app';
import 'semantic-ui-css/semantic.min.css';
import './buldreinfo.css';

function getBrowser() {
  var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
  if(/trident/i.test(M[1])){
      tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
      return {name:'IE',version:(tem[1]||'')};
      }   
  if(M[1]==='Chrome'){
      tem=ua.match(/\bOPR|Edge\/(\d+)/)
      if(tem!=null)   {return {name:'Opera', version:tem[1]};}
      }   
  M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
  return {
    name: M[0],
    version: M[1]
  };
}

function ErrorFallback({error, resetErrorBoundary}) {
  let browser = getBrowser();
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <b>Browser:</b>
      <pre>{browser?.name} {browser?.version}</pre>
      <b>Error message:</b>
      <pre>{error.message}</pre>
      <b>Stack trace:</b>
      <pre>{error.stack}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
      <button onClick={() => {
        let body = "URL: " + window.location.href + "%0D%0A%0D%0A"
                + "Browser: " + browser?.name + " " + browser?.version + "%0D%0A%0D%0A"
                + "Error message: " + error.message + "%0D%0A%0D%0A"
                + "Stack trace:%0D%0A" + error.stack;
        let link = "mailto:jostein.oygarden@gmail.com"
                + "?subject=Buldreinfo/Brattelinjer-error"
                + "&body=" + body;
        window.location.href = link;
      }}>Send error to administrator as email</button>
    </div>
  )
}

const Index = () => (
  <Auth0Provider
      domain='climbing.eu.auth0.com'
      client_id='DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt'
      redirect_uri={window.location.origin}
      useRefreshTokens
      cacheLocation="localstorage"
    >
    <Router>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          window.location.reload();
        }}
      >
        <App />
      </ErrorBoundary>
      <CookieConsent>This website uses cookies to enhance the user experience.</CookieConsent>
    </Router>
  </Auth0Provider>
);

ReactDOM.render((<Index />), document.getElementById('app'))