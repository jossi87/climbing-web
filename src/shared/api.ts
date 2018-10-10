import fetch from 'isomorphic-fetch';
import { parsePath } from './utils/svg';

function getUrl(urlSuffix: string): string {
  var uri = __isBrowser__? window.origin : (global as any).myOrigin;
  if (uri === 'http://localhost:3000') {
    uri = 'https://buldreinfo.com';
  }
  return encodeURI(`${uri || ""}/com.buldreinfo.jersey.jaxb/v2${urlSuffix}`);
}

function makeAuthenticatedRequest(accessToken: string, urlSuffix: string, opts: any) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.mode = 'cors';
  if (accessToken) {
    opts.headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(getUrl(urlSuffix), opts);
}

export function getImageUrl(id: number, maxHeight: number): string {
  if (maxHeight) {
    return getUrl(`/images?id=${id}&targetHeight=${maxHeight}`);
  }
  return getUrl(`/images?id=${id}`);
}

export function getGradeColor(grade: string) {
  switch(grade.substring(0, 1)) {
    case "n": return "brown";
    case "3": return "yellow";
    case "4": return "olive";
    case "5": return "green";
    case "6": return "teal";
    case "7": return "blue";
    case "8": return "violet";
    case "9": return "purple";
    default: return "pink";
  }
}

export function convertFromDateToString(date: Date): string {
  if (!date) {
    return null;
  }
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

export function convertFromStringToDate(yyyy_MM_dd: string): Date {
  if (!yyyy_MM_dd) {
    return null;
  }
  var year = parseInt(yyyy_MM_dd.substring(0,4));
  var month = parseInt(yyyy_MM_dd.substring(5,7));
  var day = parseInt(yyyy_MM_dd.substring(8,10));
  return new Date(year, month-1, day);
}

export function deleteMedia(accessToken: string, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/media?id=${id}`, {
    method: 'DELETE'
  });
}

export function getArea(accessToken: string, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getAreaEdit(accessToken: string, id: number): Promise<any> {
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
    return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`, null)
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

export function getBrowse(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/browse`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getFrontpage(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/frontpage`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getMeta(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/meta`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemHse(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/problems/hse`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblem(accessToken: string, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/problems?id=${id}`, null)
  .then((data) => data.json())
  .then((json) => json[0])
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemEdit(accessToken: string, id: number): Promise<any> {
  if (id === -1) {
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
          isSuperAdmin: res.metadata.isSuperAdmin,
          isBouldering: res.metadata.isBouldering
        }
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(accessToken, `/problems?id=${id}`, null)
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

export function getSector(accessToken: string, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/sectors?id=${id}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getSectorEdit(accessToken: string, id: number): Promise<any> {
  if (id === -1) {
    return getMeta(accessToken)
    .then((res) => {
      return {
        id: -1,
        visibility: 0,
        name: '',
        comment: '',
        lat: 0,
        lng: 0,
        newMedia: [],
        metadata: {title: 'New sector | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(accessToken, `/sectors?id=${id}`, null)
    .then((data) => data.json())
    .then((res) => {
      return {id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, polygonCoords: res.polygonCoords, newMedia: [], metadata: res.metadata};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  }
}

export function getSvgEdit(accessToken: string, problemIdMediaId: string): Promise<any> {
  const parts = problemIdMediaId.split("-");
  const problemId = parts[0];
  const mediaId = parts[1];
  return makeAuthenticatedRequest(accessToken, `/problems?id=${problemId}`, null)
  .then((data) => data.json())
  .then((json) => json[0])
  .then((res) => {
    const m = res.media.filter(x => x.id==mediaId)[0];
    const readOnlySvgs = [];
    var svgId = 0;
    var hasAnchor = true;
    var points = [];
    if (m.svgs) {
      for (let svg of m.svgs) {
        if (svg.problemId===res.id) {
          svgId = svg.id;
          points = parsePath(svg.path);
          hasAnchor = svg.hasAnchor;
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
      hasAnchor: hasAnchor,
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

export function getUser(accessToken: string, id: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/users?id=${id}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUserSearch(accessToken: string, value: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/users/search?value=${value}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function postArea(accessToken: string, id: number, visibility: number, name: string, comment: string, lat: number, lng: number, media: any): Promise<any> {
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

export function postComment(accessToken: string, id: number, idProblem: number, comment: string, danger: boolean, resolved: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/comments`,{
    method: 'POST',
    body: JSON.stringify({id, idProblem, comment, danger, resolved}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postFind(accessToken: string, value: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/find`, {
    method: 'POST',
    body: JSON.stringify({value}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblem(accessToken: string, sectorId: number, id: number, visibility: number, name: string, comment: string, originalGrade: string, fa: any, faDate: string, nr: number, t: any, lat: number, lng: number, sections: any, media: any): Promise<any> {
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

export function postProblemMedia(accessToken: string, id: number, media: any): Promise<any> {
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

export function postProblemSvg(accessToken: string, problemId: number, mediaId: number, del: boolean, id: number, path: string, hasAnchor: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/problems/svg?problemId=${problemId}&mediaId=${mediaId}`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, path, hasAnchor}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

export function postSector(accessToken: string, areaId: number, id: number, visibility: number, name: string, comment: string, lat: number, lng: number, polygonCoords: any, media: any): Promise<any> {
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

export function postTicks(accessToken: string, del: boolean, id: number, idProblem: number, comment: string, date: string, stars: number, grade: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/ticks`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, idProblem, comment, date, stars, grade}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
