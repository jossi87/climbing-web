import fetch from 'isomorphic-fetch';
require('es6-promise').polyfill();

function getUrl(str) {
  var uri = __isBrowser__? window.origin : global.myOrigin;
  if (uri === 'http://localhost:3000') {
    uri = 'https://brattelinjer.no';
  }
  return encodeURI(`${uri}/com.buldreinfo.jersey.jaxb/v2${str}`);
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
  return fetch(getUrl(`/media?id=${id}`), {
    mode: 'cors',
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getArea(accessToken, id) {
  return fetch(getUrl(`/areas?id=${id}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getAreaEdit(accessToken, id) {
  if (id == -1) {
    return fetch(getUrl(`/meta`), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((data) => data.json())
    .then((res) => {
      return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New area | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return fetch(getUrl(`/areas?id=${id}`), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
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
  return fetch(getUrl(`/browse`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFinder(accessToken, grade) {
  return fetch(getUrl(`/finder?grade=${grade}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFrontpage(accessToken) {
  return fetch(getUrl(`/frontpage`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getMeta(accessToken) {
  return fetch(getUrl("/meta"), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblem(accessToken, id) {
  return fetch(getUrl(`/problems?id=${id}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .then((json) => json[0])
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemEdit(accessToken, id) {
  if (id == -1) {
    return fetch(getUrl(`/meta`), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((data) => data.json())
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
    return fetch(getUrl(`/problems?id=${id}`), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
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
  return fetch(getUrl(`/sectors?id=${id}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getSectorEdit(accessToken, id) {
  if (id == -1) {
    return fetch(getUrl(`/meta`), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((data) => data.json())
    .then((res) => {
      return {id: -1, visibility: 0, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New sector | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return fetch(getUrl(`/sectors?id=${id}`), {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
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

export function getSvgEdit(accessToken, problemId, mediaId) {
  return fetch(getUrl(`/problems?id=${problemId}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .then((json) => json[0])
  .then((res) => {
    const m = res.body[0].media.filter(x => x.id==mediaId)[0];
    const readOnlySvgs = [];
    var svgId = 0;
    var points = [];
    if (m.svgs) {
      for (let svg of m.svgs) {
        if (svg.problemId===res.body[0].id) {
          svgId = svg.id;
          points = this.parsePath(svg.path);
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
      visibility: res.visibility
    };
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUser(accessToken, id) {
  return fetch(getUrl(`/users?id=${id}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserEdit(accessToken, id) {
  return fetch(getUrl(`/users/edit?id=${id}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then((data) => data.json())
  .then((res) => {
    return {id: res.id, username: res.username, firstname: res.firstname, lastname: res.lastname, currentPassword: null, newPassword: null, newPassword2: null, message: null};
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserSearch(accessToken, value) {
  return fetch(getUrl(`/users/search?value=${value}`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
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
  return fetch(getUrl(`/areas`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postComment(accessToken, idProblem, comment) {
  return fetch(getUrl(`/comments`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({idProblem, comment}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

export function postProblem(accessToken, sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({sectorId, id, visibility, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return fetch(getUrl(`/problems`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemMedia(accessToken, id, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({id, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return fetch(getUrl(`/problems/media`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemSvg(accessToken, problemId, mediaId, del, id, path, hasAnchor) {
  return fetch(getUrl(`/problems/svg?problemId=${problemId}&mediaId=${mediaId}`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({delete: del, id, path, hasAnchor}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postSearch(accessToken, value) {
  return fetch(getUrl("/search"), {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({value}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postSector(accessToken, areaId, id, visibility, name, comment, lat, lng, media) {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({areaId, id, visibility, name, comment, lat, lng, newMedia}));
  media.forEach(m => formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
  return fetch(getUrl(`/sectors`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postTicks(accessToken, del, id, idProblem, comment, date, stars, grade) {
  return fetch(getUrl(`/ticks`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({delete: del, id, idProblem, comment, date, stars, grade}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

export function postUserEdit(accessToken, id, username, firstname, lastname, currentPassword, newPassword) {
  return fetch(getUrl(`/users/edit`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({id, username, firstname, lastname, currentPassword, newPassword}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

export function postUserRegister(accessToken, firstname, lastname, username, password) {
  return fetch(getUrl(`/users/register`),{
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({firstname, lastname, username, password}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}
