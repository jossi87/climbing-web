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
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas?id=${id}`), {credentials: 'include'})
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

export function getProblemEdit(id) {
  if (id === -1) {
    const date = new Date();
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    const faDate = y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta`))
      .then((data) => data.json())
      .then((json) => {
        return {id: -1, visibility: 0, name: '', comment: '', originalGrade: 'n/a', fa: [], faDate: faDate, nr: 0, lat: 0, lng: 0, newMedia: [], metadata: {title: 'New problem | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, grades: res.metadata.grades, types: res.metadata.types}};
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/problems?id=${id}`), {credentials: 'include'})
      .then((data) => data.json())
      .then((json) => {
        return {id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, originalGrade: res.originalGrade, fa: res.fa, faDate: res.faDate, nr: res.nr, typeId: res.t.id, lat: res.lat, lng: res.lng, sections: res.sections, metadata: res.metadata};
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  }
}

export function getSector(id) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/sectors?id=${id}`), {credentials: 'include'})
    .then((data) => data.json())
    .catch((error) => {
      console.warn(error);
      return null;
    });
}

export function getSectorEdit(id) {
  if (id === -1) {
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/meta`))
      .then((data) => data.json())
      .then((json) => {
        return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New sector | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter}};
      })
      .catch((error) => {
        console.warn(error);
        return null;
      });
  } else {
    return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/sectors?id=${id}`), {credentials: 'include'})
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

export function getUser(id) {
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/users?id=${id}`), {credentials: 'include'})
    .then((data) => data.json())
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
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/areas`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
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

export function postProblem(sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia) {
  const formData = new FormData();
  formData.append('json', JSON.stringify({sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia}));
  newMedia.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/problems`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
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

export function postSector(areaId, id, visibility, name, comment, lat, lng, newMedia) {
  const formData = new FormData();
  formData.append('json', JSON.stringify({areaId, id, visibility, name, comment, lat, lng, newMedia}));
  newMedia.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return fetch(encodeURI(`https://buldreinfo.com/com.buldreinfo.jersey.jaxb/v1/sectors`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
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
