import fetch from 'isomorphic-fetch';
require('es6-promise').polyfill();
import { parsePath } from './utils/svg.js';

function getUrl(urlSuffix) {
  var uri = __isBrowser__? window.origin : global.myOrigin;
  if (uri === 'http://localhost:3000') {
    uri = 'https://brattelinjer.no';
  }
  return encodeURI(`${uri}/com.buldreinfo.jersey.jaxb/v2${urlSuffix}`);
}

function makeAuthenticatedRequest(accessToken, urlSuffix, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.mode = 'cors';
  if (accessToken) {
    opts.headers.Authorization = `Bearer ${accessToken}`;
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

export function deleteMedia(accessToken, id) {
  return makeAuthenticatedRequest(accessToken, `/media?id=${id}`, {
    method: 'DELETE'
  });
}

export function getArea(accessToken, id) {
  return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getAreaEdit(accessToken, id) {
  if (id == -1) {
    return getMeta(accessToken)
    .then((res) => {
      return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New area | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`)
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

export function getBrowse(accessToken) {
  return makeAuthenticatedRequest(accessToken, `/browse`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFinder(accessToken, grade) {
  return makeAuthenticatedRequest(accessToken, `/finder?grade=${grade}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFrontpage(accessToken) {
  return makeAuthenticatedRequest(accessToken, `/frontpage`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getMeta(accessToken) {
  return makeAuthenticatedRequest(accessToken, `/meta`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblem(accessToken, id) {
  return makeAuthenticatedRequest(accessToken, `/problems?id=${id}`)
  .then((data) => data.json())
  .then((json) => json[0])
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemEdit(accessToken, id) {
  if (id == -1) {
    return getMeta(accessToken)
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
    return makeAuthenticatedRequest(accessToken, `/problems?id=${id}`)
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

export function getSector(accessToken, id) {
  return makeAuthenticatedRequest(accessToken, `/sectors?id=${id}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getSectorEdit(accessToken, id) {
  if (id == -1) {
    return getMeta(accessToken)
    .then((res) => {
      return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New sector | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(accessToken, `/sectors?id=${id}`)
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

export function getSvgEdit(accessToken, problemIdMediaId) {
  const parts = problemIdMediaId.split("-");
  const problemId = parts[0];
  const mediaId = parts[1];
  return makeAuthenticatedRequest(accessToken, `/problems?id=${problemId}`)
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

export function getUser(accessToken, id) {
  return makeAuthenticatedRequest(accessToken, `/users?id=${id}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserEdit(accessToken, id) {
  return getUser(accessToken, id)
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

export function getUserSearch(accessToken, value) {
  return makeAuthenticatedRequest(accessToken, `/users/search?value=${value}`)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function postArea(accessToken, id, visibility, name, comment, lat, lng, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({id, visibility, name, comment, lat, lng, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(accessToken, `/areas`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postComment(accessToken, idProblem, comment) {
  return makeAuthenticatedRequest(accessToken, `/comments`,{
    method: 'POST',
    body: JSON.stringify({idProblem, comment}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postProblem(accessToken, sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(accessToken, `/problems`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemMedia(accessToken, id, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({id, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(accessToken, `/problems/media`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemSvg(accessToken, problemId, mediaId, del, id, path, hasAnchor) {
  return makeAuthenticatedRequest(accessToken, `/problems/svg?problemId=${problemId}&mediaId=${mediaId}`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, path, hasAnchor}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

export function postSearch(accessToken, value) {
  return makeAuthenticatedRequest(accessToken, `/search`, {
    method: 'POST',
    body: JSON.stringify({value}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postSector(accessToken, areaId, id, visibility, name, comment, lat, lng, polygonCoords, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({areaId, id, visibility, name, comment, lat, lng, polygonCoords, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return makeAuthenticatedRequest(accessToken, `/sectors`,{
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postTicks(accessToken, del, id, idProblem, comment, date, stars, grade) {
  return makeAuthenticatedRequest(accessToken, `/ticks`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, idProblem, comment, date, stars, grade}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postUserEdit(accessToken, id, username, email, firstname, lastname, currentPassword, newPassword) {
  return makeAuthenticatedRequest(accessToken, `/users/edit`,{
    method: 'POST',
    body: JSON.stringify({id, username, email, firstname, lastname, currentPassword, newPassword}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
