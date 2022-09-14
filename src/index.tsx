import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from './utils/react-auth0-spa';
import CookieConsent from "react-cookie-consent";
import { ErrorBoundary } from 'react-error-boundary'
import App from './App';
import './buldreinfo.css';
import Analytics from 'analytics';
import { AnalyticsProvider } from 'use-analytics';
import googleAnalytics from '@analytics/google-analytics';

const analytics = Analytics({
  app: 'buldreinfo/brattelinjer',
  plugins: [
    googleAnalytics({
      measurementIds: ['UA-76534258-1']
    })
  ]
})

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

const Index = () => (
  <Auth0Provider
    domain='climbing.eu.auth0.com'
    client_id='DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt'
    redirect_uri={window.location.origin}
    useRefreshTokens
    cacheLocation="localstorage"
  >
    <AnalyticsProvider instance={analytics}>
      <BrowserRouter>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <App />
        </ErrorBoundary>
        <CookieConsent>This website uses cookies to enhance the user experience.</CookieConsent>
      </BrowserRouter>
    </AnalyticsProvider>
  </Auth0Provider>
);

const root = createRoot(document.getElementById('app'));
root.render(<Index />);