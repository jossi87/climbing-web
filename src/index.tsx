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
  resetError,
}: {
  error: unknown;
  componentStack: string;
  resetError: () => void;
}) {
  return (
    <div
      role='alert'
      className='min-h-screen bg-surface-dark text-slate-400 p-6 flex flex-col items-center justify-center font-sans'
    >
      <div className='max-w-2xl w-full bg-surface-card border border-surface-border rounded-xl p-8 shadow-2xl'>
        <h1 className='text-2xl font-bold text-slate-100 mb-2'>Something went wrong</h1>
        <p className='text-sm text-slate-500 mb-6'>
          The application encountered an unexpected error.
        </p>
        <div className='space-y-4 text-[11px] font-mono bg-surface-dark p-4 rounded-lg border border-surface-border overflow-auto max-h-64'>
          <div className='text-brand font-bold uppercase tracking-wider'>Error Log</div>
          <div className='text-slate-300 whitespace-pre-wrap'>{`${error}`}</div>
        </div>
        <button
          onClick={resetError}
          className='mt-8 px-6 py-2 bg-brand hover:brightness-110 text-surface-dark font-black uppercase text-[11px] tracking-widest rounded-md transition-all active:scale-95'
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
