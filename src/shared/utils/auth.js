import auth0 from 'auth0-js';

export default class Auth {
  cookies;
  userProfile;
  tokenRenewalTimeout;

  auth0 = new auth0.WebAuth({
    domain: 'buldreinfo.auth0.com',
    clientID: 'zexpFfou6HkgNWH5QVi3zyT1rrw6MXAn',
    redirectUri: `${__isBrowser__? window.origin : global.myOrigin}/callback`,
    responseType: 'token id_token',
    scope: 'openid'
  });

  constructor(cookies) {
    this.cookies = cookies;
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getProfile = this.getProfile.bind(this);
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

    const options = [{path: '/', secure: true, httpOnly: true}];
    this.cookies.set('access_token', authResult.accessToken, options);
    this.cookies.set('id_token', authResult.idToken, options);
    this.cookies.set('expires_at', expiresAt, options);

    // schedule a token renewal
    this.scheduleRenewal();

    // navigate to the home route
    window.location.href = "/";
  }

  getAccessToken() {
    const accessToken = this.cookies.get('access_token');
    if (!accessToken) {
      return null;
    }
    return accessToken;
  }

  getProfile(cb) {
    let accessToken = this.getAccessToken();
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        this.userProfile = profile;
      }
      cb(err, profile);
    });
  }

  logout() {
    // Clear access token and ID token from cookies
    this.cookies.remove('access_token');
    this.cookies.remove('id_token');
    this.cookies.remove('expires_at');
    this.cookies.remove('scopes');
    this.userProfile = null;
    clearTimeout(this.tokenRenewalTimeout);
    // navigate to the home route
    window.location.href = "/";
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
          alert(
            `Could not get a new token (${err.error}: ${err.error_description}).`
          );
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
}
