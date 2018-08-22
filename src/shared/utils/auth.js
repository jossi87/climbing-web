import auth0 from 'auth0-js';

export default class Auth {
  cookies;
  tokenRenewalTimeout;

  auth0 = new auth0.WebAuth({
    domain: 'climbing.eu.auth0.com',
    clientID: 'DNJNVzhxbF7PtaBFh7H6iBSNLh2UJWHt',
    redirectUri: `${__isBrowser__? window.origin : global.myOrigin}/callback`,
    responseType: 'token id_token',
    scope: 'openid email profile'
  });

  constructor(cookies) {
    this.cookies = cookies;
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.silentAuthentication = this.silentAuthentication.bind(this);
    this.scheduleRenewal();
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setCookies(authResult);
      } else if (err) {
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  setCookies(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    const expiryDate = new Date(new Date().getTime() + (7*24*60*60*1000));
    const options = {path: '/', expires: expiryDate};
    this.cookies.set('access_token', authResult.accessToken, options);
    this.cookies.set('id_token', authResult.idToken, options);
    this.cookies.set('expires_at', expiresAt, options);

    // schedule a token renewal
    this.scheduleRenewal();
  }

  getAccessToken() {
    const accessToken = this.cookies.get('access_token');
    if (!accessToken) {
      return null;
    }
    return accessToken;
  }

  logout() {
    // Clear access token and ID token from cookies
    this.cookies.remove('access_token');
    this.cookies.remove('id_token');
    this.cookies.remove('expires_at');
    clearTimeout(this.tokenRenewalTimeout);
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    const cookie = this.cookies.get('expires_at');
    if (!cookie) {
      return false;
    }
    let expiresAt = JSON.parse(cookie);
    return new Date().getTime() < expiresAt;
  }

  renewToken() {
    this.auth0.checkSession({},
      (err, result) => {
        if (err) {
          console.log(`Could not get a new token (${err.error}: ${err.error_description}).`);
          this.logout();
        } else {
          this.setCookies(result);
        }
      }
    );
  }

  scheduleRenewal() {
    const cookie = this.cookies.get('expires_at');
    if (cookie) {
      const expiresAt = JSON.parse(cookie);
      const delay = expiresAt - Date.now();
      if (delay > 0) {
        this.tokenRenewalTimeout = setTimeout(() => {
          this.renewToken();
        }, delay);
      }
    }
  }

  silentAuthentication() {
    const cookie = this.cookies.get('expires_at');
    if (cookie && !this.isAuthenticated()) {
      this.renewToken();
    }
  }
}
