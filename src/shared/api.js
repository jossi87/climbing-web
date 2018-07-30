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
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/finder?grade=${grade}`))
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getFrontpage() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/frontpage`))
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

export function getUserForgotPassword(username, successCallback, errorCallback) {
  fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/forgotPassword?username=${username}`))
  .then(successCallback)
  .catch(errorCallback);
}
