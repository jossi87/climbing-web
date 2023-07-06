import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./buldreinfo.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DataReloader } from "./components/DataReloader";
import * as Sentry from "@sentry/react";
import { getBaseUrl } from "./api";

Sentry.init({
  dsn: "https://32152968271f46afa0efa8608b252e42@o4505452714786816.ingest.sentry.io/4505452716556288",
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", getBaseUrl()],
    }),
    new Sentry.Replay(),
  ],
  environment: process.env.REACT_APP_ENV ?? "unknown",
  // Performance Monitoring
  tracesSampleRate: process.env.REACT_APP_ENV === "production" ? 0.5 : 1.0,
  replaysOnErrorSampleRate: 1.0,
});

function ErrorFallback({
  error,
  componentStack,
  resetError,
}: {
  error: Error;
  componentStack: string;
  resetError: () => void;
}) {
  const userAgent = navigator.userAgent;
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <b>User Agent:</b>
      <pre>{userAgent}</pre>
      <b>Error message:</b>
      <pre>{error.message}</pre>
      <b>Stack trace:</b>
      <pre>{componentStack}</pre>
      <button onClick={resetError}>Try again</button>
      <button
        onClick={() => {
          const body =
            "URL: " +
            window.location.href +
            "%0D%0A%0D%0A" +
            "User Agent: " +
            userAgent +
            "%0D%0A%0D%0A" +
            "Error message: " +
            error.message +
            "%0D%0A%0D%0A" +
            "Stack trace:%0D%0A" +
            componentStack;
          const link =
            "mailto:jostein.oygarden@gmail.com" +
            "?subject=Buldreinfo/Brattelinjer-error" +
            "&body=" +
            body;
          window.location.href = link;
        }}
      >
        Send error to administrator as email
      </button>
    </div>
  );
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
      useRefreshTokens={true}
      cacheLocation={"localstorage"}
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
      <Sentry.ErrorBoundary
        fallback={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <DataReloader>
          <Auth0ProviderWithNavigate>
            <App />
          </Auth0ProviderWithNavigate>
        </DataReloader>
      </Sentry.ErrorBoundary>
    </BrowserRouter>
    {process.env.REACT_APP_ENV === "development" && <ReactQueryDevtools />}
  </QueryClientProvider>
);

const root = createRoot(document.getElementById("app"));
root.render(<Index />);
