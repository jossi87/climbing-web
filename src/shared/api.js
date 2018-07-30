import fetch from 'isomorphic-fetch';

export function getAreaEdit(id) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas?id=${id}`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getAreaEdit(id) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas/edit?id=${id}`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getBrowse() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/browse`), {credentials: 'include'})
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

export function getMeta() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta`))
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

export function postArea(id, visibility, name, comment, lat, lng, newMedia) {
  const formData = new FormData();
  formData.append('json', JSON.stringify({id: this.state.id, visibility: this.state.visibility, name: this.state.name, comment: this.state.comment, lat: this.state.lat, lng: this.state.lng, newMedia: newMedia}));
  newMedia.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/register`),{method: "POST", body: formData});
}

export function postUserRegister(firstname, lastname, username, password) {
  fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/register`),{method: "POST", body: {firstname, lastname, username, password}});
}
