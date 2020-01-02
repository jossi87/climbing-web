import fetch from 'isomorphic-fetch';
import { saveAs } from 'file-saver';
import { parsePath } from './utils/svg';

export function getBaseUrl(): string {
  var origin = window.origin;
  if (origin === 'http://localhost:3000') {
    origin = 'https://brattelinjer.no';
  }
  return origin;
}

function getUrl(urlSuffix: string): string {
  return encodeURI(`${getBaseUrl()}/com.buldreinfo.jersey.jaxb/v2${urlSuffix}`);
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

export function getImageUrl(id: number, minDimention?: number): string {
  if (minDimention) {
    return getUrl(`/images?id=${id}&minDimention=${minDimention}`);
  }
  return getUrl(`/images?id=${id}`);
}

export function numberWithCommas(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

export function getGradeDistribution(accessToken: string, idArea: number, idSector: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/grade/distribution?idArea=${idArea}&idSector=${idSector}`, null)
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

export function getPermissions(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/permissions`, null)
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
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemEdit(accessToken: string, id: number): Promise<any> {
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
  if (id == -1) {
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
      return {id: res.id, visibility: res.visibility, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, polygonCoords: res.polygonCoords, polyline: res.polyline, newMedia: [], metadata: res.metadata};
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
  .then((res) => {
    const m = res.media.filter(x => x.id==mediaId)[0];
    const readOnlySvgs = [];
    var svgId = 0;
    var hasAnchor = true;
    var points = [];
    var anchors = [];
    var texts = [];
    if (m.svgs) {
      for (let svg of m.svgs) {
        if (svg.problemId===res.id) {
          svgId = svg.id;
          points = parsePath(svg.path);
          hasAnchor = svg.hasAnchor;
          anchors = svg.anchors? JSON.parse(svg.anchors) : [];
          texts = svg.texts? JSON.parse(svg.texts) : [];
        }
        else {
          readOnlySvgs.push({ nr: svg.nr, hasAnchor: svg.hasAnchor, path: svg.path, anchors: svg.anchors? JSON.parse(svg.anchors) : [], texts: svg.texts? JSON.parse(svg.texts) : [] });
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
      anchors: anchors,
      texts: texts,
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

export function getTicks(accessToken: string, page: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/ticks?page=${page}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getTodo(accessToken: string, id: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/todo?id=${id}`, null)
  .then((data) => data.json())
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

export function getUsersTicks(accessToken: string): Promise<any> {
  let filename = "ticks.xlsx";
  return makeAuthenticatedRequest(accessToken, `/users/ticks`, {
    expose:  ['Content-Disposition']
  })
  .then(response => {
    filename = response.headers.get("content-disposition").substring(22,42);
    return response.blob()
  })
  .then(blob => saveAs(blob, filename))
  .catch((error) => {
    console.warn(error);
    return null;
  });;
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

export function postFilter(accessToken: string, grades: Array<number>, types: Array<number>): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/filter`, {
    method: 'POST',
    body: JSON.stringify({grades, types}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postPermissions(accessToken: string, userId: number, write: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/permissions`,{
    method: 'POST',
    body: JSON.stringify({userId, write}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
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

export function postSearch(accessToken: string, value: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/search`, {
    method: 'POST',
    body: JSON.stringify({value}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => data.json());
}

export function postProblemSvg(accessToken: string, problemId: number, mediaId: number, del: boolean, id: number, path: string, hasAnchor: boolean, anchors: string, texts: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/problems/svg?problemId=${problemId}&mediaId=${mediaId}`,{
    method: 'POST',
    body: JSON.stringify({delete: del, id, path, hasAnchor, anchors, texts}),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

export function postSector(accessToken: string, areaId: number, id: number, visibility: number, name: string, comment: string, lat: number, lng: number, polygonCoords: any, polyline: any, media: any): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto}});
  formData.append('json', JSON.stringify({areaId, id, visibility, name, comment, lat, lng, polygonCoords, polyline, newMedia}));
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

export function postTodo(accessToken: string, id: number, problemId: number, priority: number, isDelete: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/todo`,{
    method: 'POST',
    body: JSON.stringify({id, problemId, priority, isDelete}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function postUser(accessToken: string, useBlueNotRed: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/user?useBlueNotRed=${useBlueNotRed}`,{
    method: 'POST'
  });
}