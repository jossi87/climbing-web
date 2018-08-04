import decode from 'jwt-decode';
import auth0 from 'auth0-js';
const ID_TOKEN_KEY = 'id_token';
const ACCESS_TOKEN_KEY = 'access_token';

var auth = new auth0.WebAuth({
  domain: 'buldreinfo.auth0.com',
  clientID: 'zexpFfou6HkgNWH5QVi3zyT1rrw6MXAn',
});

export function login() {
  auth.authorize({
    domain: 'buldreinfo.auth0.com',
    clientID: 'zexpFfou6HkgNWH5QVi3zyT1rrw6MXAn',
    redirectUri: `${window.location.origin}/callback`,
    audience: 'https://buldreinfo.auth0.com/userinfo',
    responseType: 'token id_token',
    scope: 'openid'
  });
}

export function logout(cookies) {
  clearIdToken(cookies);
  clearAccessToken(cookies);
}

export function getIdToken(cookies) {
  return cookies.get(ID_TOKEN_KEY);
}

export function getAccessToken(cookies) {
  return cookies.get(ACCESS_TOKEN_KEY);
}

function clearIdToken(cookies) {
  cookies.remove(ID_TOKEN_KEY);
}

function clearAccessToken(cookies) {
  cookies.remove(ACCESS_TOKEN_KEY);
}

// Helper function that will allow us to extract the access_token and id_token
function getParameterByName(name) {
  let match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

export function setCookies(cookies) {
  let accessToken = getParameterByName('access_token');
  let idToken = getParameterByName('id_token');
  const expirationDate = getTokenExpirationDate(idToken);
  const options = [{path: '/', expires: expirationDate, secure: true, httpOnly: true}];
  cookies.set(ACCESS_TOKEN_KEY, accessToken, options);
  cookies.set(ID_TOKEN_KEY, idToken, options);
}

export function isLoggedIn() {
  const idToken = getIdToken();
  return !!idToken && !isTokenExpired(idToken);
}

function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) { return null; }
  const date = new Date(0);
  date.setUTCSeconds(token.exp);
  return date;
}

function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}
