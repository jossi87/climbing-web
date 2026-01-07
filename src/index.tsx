import './buldreinfo.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataReloader } from './components/DataReloader';
import * as Sentry from '@sentry/react';
import { ReactNode, lazy, Suspense } from 'react';

const ReactQueryDevtoolsLazy = lazy(() =>
  import('@tanstack/react-query-devtools').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

Sentry.init({
  dsn: 'https://32152968271f46afa0efa8608b252e42@o4505452714786816.ingest.sentry.io/4505452716556288',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  environment: process.env.REACT_APP_ENV ?? 'unknown',
  tracesSampleRate: process.env.REACT_APP_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
});

function ErrorFallback({
  error,
  componentStack,
  resetError,
}: {
  error: unknown;
  componentStack: string;
  resetError: () => void;
}) {
  const userAgent = navigator.userAgent;
  return (
    <div role='alert'>
      <h1>Something went wrong</h1>
      <b>User Agent:</b>
      <pre>{userAgent}</pre>
      <b>Error message:</b>
      <pre>{`${error}`}</pre>
      <b>Stack trace:</b>
      <pre>{componentStack}</pre>
      <button onClick={resetError}>Try again</button>
      <button
        onClick={() => {
          const body =
            'URL: ' +
            window.location.href +
            '%0D%0A%0D%0A' +
            'User Agent: ' +
            userAgent +
            '%0D%0A%0D%0A' +
            'Error: ' +
            error +
            '%0D%0A%0D%0A' +
            'Stack trace:%0D%0A' +
            componentStack;
          const link =
            'mailto:jostein.oygarden@gmail.com' +
            '?subject=Buldreinfo/Brattelinjer-error' +
            '&body=' +
            body;
          window.location.href = link;
        }}
      >
        Send error to administrator as email
      </button>
    </div>
  );
}

export const Auth0ProviderWithNavigate = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const domain = 'climbing.eu.auth0.com';
  const clientId = 'DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt';
  const onRedirectCallback = (appState?: { returnTo?: string } | null) => {
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
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      cacheLocation={'localstorage'}
    >
      {children}
    </Auth0Provider>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const Index = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={ErrorFallback} onReset={() => window.location.reload()}>
        <DataReloader>
          <Auth0ProviderWithNavigate>
            <App />
          </Auth0ProviderWithNavigate>
        </DataReloader>
      </Sentry.ErrorBoundary>
    </BrowserRouter>
    {process.env.REACT_APP_ENV === 'development' && (
      <Suspense fallback={null}>
        <ReactQueryDevtoolsLazy />
      </Suspense>
    )}
  </QueryClientProvider>
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<Index />);
