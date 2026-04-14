import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataReloader } from './shared/providers/DataReloader';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import { Component, type ErrorInfo, type ReactNode, lazy, Suspense } from 'react';
import { captureSentryException, initSentry } from './utils/sentry';

const ReactQueryDevtoolsLazy = lazy(() =>
  import('@tanstack/react-query-devtools').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
);

const APP_ENV = import.meta.env.REACT_APP_ENV;

initSentry(APP_ENV);

function ErrorFallback({ error, resetError }: { error: unknown; componentStack: string; resetError: () => void }) {
  return (
    <div
      role='alert'
      className='bg-surface-dark flex min-h-screen flex-col items-center justify-center p-6 font-sans text-slate-300'
    >
      <div className='bg-surface-card border-surface-border w-full max-w-2xl rounded-xl border p-8 shadow-2xl'>
        <h1 className='mb-2 text-2xl font-semibold text-slate-100'>Something went wrong</h1>
        <p className='mb-6 text-sm text-slate-400'>The application encountered an unexpected error.</p>
        <div className='bg-surface-dark border-surface-border max-h-64 space-y-4 overflow-auto rounded-lg border p-4 font-mono text-[12px]'>
          <div className='text-brand font-semibold tracking-wide uppercase'>Error Log</div>
          <div className='whitespace-pre-wrap text-slate-300'>{`${error}`}</div>
        </div>
        <button
          onClick={resetError}
          className='btn-brand-solid mt-8 rounded-md px-6 py-2 text-[12px] font-semibold tracking-wide uppercase transition active:scale-95'
        >
          Try again
        </button>
      </div>
    </div>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: unknown | null }> {
  state: { error: unknown | null } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    captureSentryException(error, { componentStack: errorInfo.componentStack });
  }

  onReset = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} componentStack='' resetError={this.onReset} />;
    }
    return this.props.children;
  }
}

export const Auth0ProviderWithNavigate = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState?: { returnTo?: string } | null) => {
    const to = appState?.returnTo ?? `${window.location.pathname}${window.location.search}${window.location.hash}`;
    navigate(to, { replace: true });
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
      <ThemeProvider>
        <AppErrorBoundary>
          <DataReloader>
            <Auth0ProviderWithNavigate>
              <App />
            </Auth0ProviderWithNavigate>
          </DataReloader>
        </AppErrorBoundary>
      </ThemeProvider>
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
