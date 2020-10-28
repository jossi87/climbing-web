import React, { useState, useEffect, useContext } from "react";
import createAuth0Client, { Auth0Client } from "@auth0/auth0-spa-js";

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

export const Auth0Context = React.createContext(null);
export const useAuth0 = () => useContext(Auth0Context)!;
export const Auth0Provider = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...initOptions
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [auth0Client, setAuth0] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const initAuth0 = async () => {
      let client;
      try {
        client = await createAuth0Client(initOptions as any);
        setAuth0(client);
      } catch (e) {
        console.log(e);
        // Something has gone wrong when the SDK has attempted to create an
        // Auth0 client and have it set up the correct authentication status for
        // the user. In this bad state, there's not much we can do but force a
        // log out on the user so that they can log in again.
        client = new Auth0Client(initOptions as any);
        client.logout();
        setAuth0(client);
      }

      if (
        window.location.search.includes("code=") &&
        window.location.search.includes("state=")
      ) {
        const { appState } = await client.handleRedirectCallback();
        window.location.replace(
          appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname
        );
      }

      const isAuthenticated = await client.isAuthenticated();

      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const accessToken = await client.getTokenSilently();
        setAccessToken(accessToken);
      }

      setLoading(false);
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  const loginWithPopup = async (params = {}) => {
    setPopupOpen(true);
    try {
      await auth0Client.loginWithPopup(params);
    } catch (error) {
      console.error(error);
    } finally {
      setPopupOpen(false);
    }
    const accessToken = await auth0Client!.getTokenSilently();
    setAccessToken(accessToken);
    setIsAuthenticated(true);
  };

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const accessToken = await auth0Client!.getTokenSilently();
    setIsAuthenticated(true);
    setAccessToken(accessToken);
    setLoading(false);
  };
  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        accessToken,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p)
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};