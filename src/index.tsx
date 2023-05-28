import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import CookieConsent from "react-cookie-consent";
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './buldreinfo.css';

function ErrorFallback({error, resetErrorBoundary}) {
  const userAgent = navigator.userAgent;
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <b>User Agent:</b>
      <pre>{userAgent}</pre>
      <b>Error message:</b>
      <pre>{error.message}</pre>
      <b>Stack trace:</b>
      <pre>{error.stack}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
      <button onClick={() => {
        let body = "URL: " + window.location.href + "%0D%0A%0D%0A"
                + "User Agent: " + userAgent + "%0D%0A%0D%0A"
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

export const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const domain = "climbing.eu.auth0.com";
  const clientId = "DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt";
  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };
  if (!(domain && clientId)) {
    return null;
  }
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

const Index = () => (
  <BrowserRouter>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <Auth0ProviderWithNavigate>
        <App />
      </Auth0ProviderWithNavigate>
    </ErrorBoundary>
    <CookieConsent>This website uses cookies to enhance the user experience.</CookieConsent>
  </BrowserRouter>
);

const root = createRoot(document.getElementById('app'));
root.render(<Index />);