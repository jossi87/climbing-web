import fetch from 'isomorphic-fetch';
require('es6-promise').polyfill();

export function getArea(id) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas?id=${id}`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getAreaEdit(id) {
  if (id === -1) {
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta`))
      .then((data) => data.json())
      .then((json) => {
        return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New area | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter}};
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas/edit?id=${id}`), {credentials: 'include'})
      .then((data) => data.json())
      .then((json) => {
        return {id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, newMedia: [], metadata: res.metadata};
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  }
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

export function getGrades() {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/grades`))
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

export function getProblem(id) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/problems?id=${id}`), {credentials: 'include'})
    .then((data) => data.json())
    .then((json) => json[0])
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getUserPassword(token, password) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/password?token=${token}&password=${password}`));
}

export function getUserForgotPassword(username) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/forgotPassword?username=${username}`));
}

export function postArea(id, visibility, name, comment, lat, lng, newMedia) {
  const formData = new FormData();
  formData.append('json', JSON.stringify({id, visibility, name, comment, lat, lng, newMedia}));
  newMedia.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/register`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postComment(idProblem, comment) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/comments`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({idProblem, comment}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postSearch(value) {
  return fetch("https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/search", {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({value}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postTicks(del, id, idProblem, comment, date, stars, grade) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/ticks`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({delete: del, id, idProblem, comment, date, stars, grade}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postUserRegister(firstname, lastname, username, password) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users/register`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({firstname, lastname, username, password}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
