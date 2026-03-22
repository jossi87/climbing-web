import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataReloader } from './components/DataReloader';
import { init, browserTracingIntegration, ErrorBoundary } from '@sentry/react';
import { type ReactNode, lazy, Suspense } from 'react';

const ReactQueryDevtoolsLazy = lazy(() =>
  import('@tanstack/react-query-devtools').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

const APP_ENV = import.meta.env.REACT_APP_ENV;

setTimeout(() => {
  init({
    dsn: 'https://32152968271f46afa0efa8608b252e42@o4505452714786816.ingest.sentry.io/4505452716556288',
    integrations: [browserTracingIntegration()],
    environment: APP_ENV ?? 'unknown',
    tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
  });
}, 100);

function ErrorFallback({
  error,
  componentStack,
  resetError,
}: {
  error: unknown;
  componentStack: string;
  resetError: () => void;
}) {
  return (
    <div
      role='alert'
      className='min-h-screen bg-stone-950 text-stone-600 p-6 flex flex-col items-center justify-center font-sans'
    >
      <div className='max-w-3xl w-full bg-stone-900 border border-stone-800 rounded-stone p-8 shadow-2xl'>
        <h1 className='text-3xl font-bold text-white mb-2'>Something went wrong</h1>
        <div className='space-y-4 text-xs font-mono bg-stone-950 p-4 rounded-stone border border-stone-800 overflow-auto max-h-96'>
          <div>
            <span className='text-brand font-bold'>Error:</span> {`${error}`}
          </div>
          <pre className='mt-2 opacity-80'>{componentStack}</pre>
        </div>
        <button
          onClick={resetError}
          className='mt-8 px-6 py-2 bg-brand hover:bg-brand/90 text-white font-bold rounded-stone transition-colors'
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Auth0ProviderWithNavigate = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState?: { returnTo?: string } | null) => {
    navigate(appState?.returnTo || window.location.pathname);
  };
  return (
    <Auth0Provider
      domain='climbing.eu.auth0.com'
      clientId='DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt'
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'https://buldreinfo.com',
        scope: 'openid profile email',
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
  defaultOptions: { queries: { staleTime: 1000 * 60 * 60 * 24 } },
});

const Index = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ErrorBoundary fallback={ErrorFallback} onReset={() => window.location.reload()}>
        <DataReloader>
          <Auth0ProviderWithNavigate>
            <App />
          </Auth0ProviderWithNavigate>
        </DataReloader>
      </ErrorBoundary>
    </BrowserRouter>
    {APP_ENV === 'development' && (
      <Suspense fallback={null}>
        <ReactQueryDevtoolsLazy />
      </Suspense>
    )}
  </QueryClientProvider>
);

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<Index />);
