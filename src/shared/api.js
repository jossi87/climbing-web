import fetch from 'isomorphic-fetch';
require('es6-promise').polyfill();
import { parsePath } from './utils/svg.js';
import { isLoggedIn, getAccessToken } from './utils/auth';

function getUrl(urlSuffix) {
  var uri = __isBrowser__? window.origin : global.myOrigin;
  if (uri === 'http://localhost:3000') {
    uri = 'https://brattelinjer.no';
  }
  return encodeURI(`${uri}/com.buldreinfo.jersey.jaxb/v2${urlSuffix}`);
}

function makeAuthenticatedRequest(cookies, urlSuffix, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.mode = 'cors';
  if (isLoggedIn(cookies)) {
    opts.headers.Authorization = `Bearer ${getAccessToken(cookies)}`;
  }
  return fetch(getUrl(urlSuffix), opts);
}

export function getImageUrl(id, maxHeight) {
  if (maxHeight) {
    return getUrl(`/images?id=${id}&targetHeight=${maxHeight}`);
  }
  return getUrl(`/images?id=${id}`);
}

export function convertFromDateToString(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

export function deleteMedia(cookies, id) {
  return makeAuthenticatedRequest(cookies, `/media?id=${id}`, {
    method: 'DELETE'
  });
}

export function getArea(cookies, id) {
  return makeAuthenticatedRequest(cookies, `/areas?id=${id}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getAreaEdit(cookies, id) {
  if (id == -1) {
    return getMeta(cookies)
    .then((res) => {
      return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New area | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(cookies, `/areas?id=${id}`)
    .then((data) => data.json())
    .then((res) => {
      return {id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, newMedia: [], metadata: res.metadata};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  }
}

export function getBrowse(cookies) {
  return makeAuthenticatedRequest(cookies, `/browse`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFinder(cookies, grade) {
  return makeAuthenticatedRequest(cookies, `/finder?grade=${grade}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFrontpage(cookies) {
  return makeAuthenticatedRequest(cookies, `/frontpage`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getMeta(cookies) {
  return makeAuthenticatedRequest(cookies, `/meta`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblem(cookies, id) {
  return makeAuthenticatedRequest(cookies, `/problems?id=${id}`)
  .then((data) => data.json())
  .then((json) => json[0])
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemEdit(cookies, id) {
  if (id == -1) {
    return getMeta(cookies)
    .then((res) => {
      return {
        id: -1,
        visibility: 0,
        name: '',
        comment: '',
        originalGrade: 'n/a',
        fa: [],
        faDate: convertFromDateToString(new Date()),
        nr: 0,
        lat: 0,
        lng: 0,
        newMedia: [],
        metadata: {
          title: 'New problem | ' + res.metadata.title,
          defaultZoom: res.metadata.defaultZoom,
          defaultCenter: res.metadata.defaultCenter,
          grades: res.metadata.grades,
          types: res.metadata.types,
          isAdmin: res.metadata.isAdmin,
          isSuperAdmin: res.metadata.isSuperAdmin
        }
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(cookies, `/problems?id=${id}`)
    .then((data) => data.json())
    .then((json) => json[0])
    .then((res) => {
      return {
        id: res.id,
        visibility: res.visibility,
        name: res.name,
        comment: res.comment,
        originalGrade: res.originalGrade,
        fa: res.fa,
        faDate: res.faDate,
        nr: res.nr,
        typeId: res.t.id,
        lat: res.lat,
        lng: res.lng,
        sections: res.sections,
        metadata: res.metadata,
        newMedia: []
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  }
}

export function getSector(cookies, id) {
  return makeAuthenticatedRequest(cookies, `/sectors?id=${id}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getSectorEdit(cookies, id) {
  if (id == -1) {
    return getMeta(cookies)
    .then((res) => {
      return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New sector | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(cookies, `/sectors?id=${id}`)
    .then((data) => data.json())
    .then((res) => {
      return {id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, newMedia: [], metadata: res.metadata};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  }
}

export function getSvgEdit(cookies, problemIdMediaId) {
  const parts = problemIdMediaId.split("-");
  const problemId = parts[0];
  const mediaId = parts[1];
  return makeAuthenticatedRequest(cookies, `/problems?id=${problemId}`)
  .then((data) => data.json())
  .then((json) => json[0])
  .then((res) => {
    const m = res.media.filter(x => x.id==mediaId)[0];
    const readOnlySvgs = [];
    var svgId = 0;
    var points = [];
    if (m.svgs) {
      for (let svg of m.svgs) {
        if (svg.problemId===res.id) {
          svgId = svg.id;
          points = parsePath(svg.path);
        }
        else {
          readOnlySvgs.push({ nr: svg.nr, hasAnchor: svg.hasAnchor, path: svg.path });
        }
      }
    }
    return {
      mediaId: m.id,
      nr: res.nr,
      w: m.width,
      h: m.height,
      ctrl: false,
      svgId: svgId,
      points: points,
      readOnlySvgs: readOnlySvgs,
      activePoint: 0,
      draggedPoint: false,
      draggedCubic: false,
      hasAnchor: true,
      areaId: res.areaId,
      areaName: res.areaName,
      areaVisibility: res.areaVisibility,
      sectorId: res.sectorId,
      sectorName: res.sectorName,
      sectorVisibility: res.sectorVisibility,
      id: res.id,
      name: res.name,
      grade: res.grade,
      visibility: res.visibility,
      metadata: res.metadata
    };
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUser(cookies, id) {
  return makeAuthenticatedRequest(cookies, `/users?id=${id}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserEdit(cookies, id) {
  return getUser(cookies, id)
  .then((res) => {
    return {
      id: res.id,
      username: res.username,
      email: res.email,
      firstname: res.firstname,
      lastname: res.lastname,
      metadata: {title: 'Edit user: ' + res.metadata.title, isAuthenticated: res.metadata.isAuthenticated},
      currentPassword: null,
      newPassword: null,
      newPassword2: null,
      message: null};
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserSearch(cookies, value) {
  return makeAuthenticatedRequest(cookies, `/users/search?value=${value}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function postArea(cookies, id, visibility, name, comment, lat, lng, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({id, visibility, name, comment, lat, lng, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(cookies, `/areas`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postComment(cookies, idProblem, comment) {
  return makeAuthenticatedRequest(cookies, `/comments`,{
    method: 'POST',
    body: JSON.stringify({idProblem, comment}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postProblem(cookies, sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(cookies, `/problems`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemMedia(cookies, id, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({id, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(cookies, `/problems/media`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemSvg(cookies, problemId, mediaId, del, id, path, hasAnchor) {
  return makeAuthenticatedRequest(cookies, `/problems/svg?problemId=${problemId}&mediaId=${mediaId}`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, path, hasAnchor}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

export function postSearch(cookies, value) {
  return makeAuthenticatedRequest(cookies, `/search`, {
    method: 'POST',
    body: JSON.stringify({value}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postSector(cookies, areaId, id, visibility, name, comment, lat, lng, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({areaId, id, visibility, name, comment, lat, lng, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(cookies, `/sectors`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postTicks(cookies, del, id, idProblem, comment, date, stars, grade) {
  return makeAuthenticatedRequest(cookies, `/ticks`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, idProblem, comment, date, stars, grade}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postUserEdit(cookies, id, username, email, firstname, lastname, currentPassword, newPassword) {
  return makeAuthenticatedRequest(cookies, `/users/edit`,{
    method: 'POST',
    body: JSON.stringify({id, username, email, firstname, lastname, currentPassword, newPassword}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
