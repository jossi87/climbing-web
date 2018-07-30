import fetch from 'isomorphic-fetch';

export function getBrowse() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/browse`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getEthics() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/ethics`))
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getFinder(grade) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/finder?grade=${grade}`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getFrontpage() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/frontpage`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getLogin() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/login`))
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getRecover() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/recover`))
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getUserPassword(token, password) {
  fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/password?token=${token}&password=${password}`));
}

export function getUserForgotPassword(username) {
  fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/forgotPassword?username=${username}`));
}
