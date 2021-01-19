import fetch from 'isomorphic-fetch';

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

export function getBuldreinfoMediaUrl(id: number, isMovie: boolean): string {
  if (isMovie) {
    return getBaseUrl() + '/buldreinfo_media/mp4/' + (Math.floor(id/100)*100) + "/" + id + '.mp4';
  }
  return getBaseUrl() + '/buldreinfo_media/original/jpg/' + (Math.floor(id/100)*100) + "/" + id + '.jpg';
}

export function getAreaPdfUrl(accessToken: string, id: number): string {
  return getUrl(`/areas/pdf?accessToken=${accessToken}&id=${id}`);
}

export function getSectorPdfUrl(accessToken: string, id: number): string {
  return getUrl(`/sectors/pdf?accessToken=${accessToken}&id=${id}`);
}

export function getProblemPdfUrl(accessToken: string, id: number): string {
  return getUrl(`/problems/pdf?accessToken=${accessToken}&id=${id}`);
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

export function getActivity(accessToken: string, idArea: number, idSector: number, lowerGrade: number, fa: boolean, comments: boolean, ticks: boolean, media: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/activity?idArea=${idArea}&idSector=${idSector}&lowerGrade=${lowerGrade}&fa=${fa}&comments=${comments}&ticks=${ticks}&media=${media}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getArea(accessToken: string, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`, null)
  .then((response) => response.json())
  .then((data) => {
    if (data.redirectUrl && data.redirectUrl!=window.location.href) {
      window.location.href = data.redirectUrl;
    }
    return data;
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getAreaEdit(accessToken: string, id: number): Promise<any> {
  if (id == -1) {
    return getMeta(accessToken)
    .then((res) => {
      return {id: -1, lockedAdmin: false, lockedSuperadmin: false, name: '', comment: '', lat: 0, lng: 0, newMedia: [], metadata: {title: 'New area | ' + res.metadata.title, defaultZoom: res.metadata.defaultZoom, defaultCenter: res.metadata.defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return makeAuthenticatedRequest(accessToken, `/areas?id=${id}`, null)
    .then((data) => data.json())
    .then((res) => {
      return {id: res.id, lockedAdmin: res.lockedAdmin, lockedSuperadmin: res.lockedSuperadmin, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, newMedia: [], metadata: res.metadata};
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

export function getCameras(): Promise<any> {
  return makeAuthenticatedRequest(null, `/cameras`, null)
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
  .then((response) => response.json())
  .then((data) => {
    if (data.redirectUrl && data.redirectUrl!=window.location.href) {
      window.location.href = data.redirectUrl;
    }
    return data;
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getProblemEdit(accessToken: string, sectorIdProblemId: string): Promise<any> {
  const parts = sectorIdProblemId.split("-");
  const sectorId = parseInt(parts[0]);
  const problemId = parseInt(parts[1]);
  if (problemId === 0) {
    return getSector(accessToken, sectorId)
    .then((res) => {
      let defaultCenter = res.metadata.defaultCenter;
      let defaultZoom = res.metadata.defaultZoom;
      if (res.lat && res.lng && parseFloat(res.lat)>0) {
        defaultCenter = {lat: parseFloat(res.lat), lng: parseFloat(res.lng)};
        defaultZoom = 15;
      }
      return {
        id: -1,
        sectorId: res.id,
        lockedAdmin: false,
        lockedSuperadmin: false,
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
          defaultZoom: defaultZoom,
          defaultCenter: defaultCenter,
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
    return getProblem(accessToken, problemId)
    .then((res) => {
      let m = res.metadata;
      if (res.sectorLat && res.sectorLng && parseFloat(res.sectorLat)>0) {
        m.defaultCenter = {lat: parseFloat(res.sectorLat), lng: parseFloat(res.sectorLng)};
        m.defaultZoom = 15;
      }
      return {
        id: res.id,
        sectorId: res.sectorId,
        lockedAdmin: res.lockedAdmin, lockedSuperadmin: res.lockedSuperadmin,
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
        faAid: res.faAid,
        metadata: m,
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
  .then((response) => response.json())
  .then((data) => {
    if (data.redirectUrl && data.redirectUrl!=window.location.href) {
      window.location.href = data.redirectUrl;
    }
    return data;
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getSectorEdit(accessToken: string, areaIdSectorId: string): Promise<any> {
  const parts = areaIdSectorId.split("-");
  const areaId = parseInt(parts[0]);
  const sectorId = parseInt(parts[1]);
  if (sectorId === 0) {
    return getArea(accessToken, areaId)
    .then((res) => {
      const defaultCenter = res.lat && res.lng && parseFloat(res.lat)>0? {lat: parseFloat(res.lat), lng: parseFloat(res.lng)} : res.metadata.defaultCenter;
      return {
        areaId: res.id,
        id: -1,
        lockedAdmin: false,
        lockedSuperadmin: false,
        name: '',
        comment: '',
        lat: 0,
        lng: 0,
        newMedia: [],
        metadata: {title: 'New sector | ' + res.metadata.title, defaultZoom: 12, defaultCenter: defaultCenter, isAdmin: res.metadata.isAdmin, isSuperAdmin: res.metadata.isSuperAdmin}
      };
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  } else {
    return getSector(accessToken, sectorId)
    .then((res) => {
      return {id: res.id, areaId: res.areaId, lockedAdmin: res.lockedAdmin, lockedSuperadmin: res.lockedSuperadmin, name: res.name, comment: res.comment, lat: res.lat, lng: res.lng, polygonCoords: res.polygonCoords, polyline: res.polyline, newMedia: [], metadata: res.metadata};
    })
    .catch((error) => {
      console.warn(error);
      return null;
    });
  }
}

export function getSites(accessToken: string, type: string): Promise<any> {
  let isBouldering = type==='bouldering'? true : false;
  return makeAuthenticatedRequest(accessToken, `/sites?isBouldering=${isBouldering}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
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
    var path = null;
    var anchors = [];
    var texts = [];
    if (m.svgs) {
      for (let svg of m.svgs) {
        if (svg.problemId===res.id) {
          svgId = svg.id;
          path = svg.path;
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
      path: path,
      anchors: anchors,
      texts: texts,
      readOnlySvgs: readOnlySvgs,
      activePoint: 0,
      draggedPoint: false,
      draggedCubic: false,
      hasAnchor: hasAnchor,
      areaId: res.areaId,
      areaName: res.areaName,
      areaLockedAdmin: res.areaLockedAdmin,
	  areaLockedSuperadmin: res.areaLockedSuperadmin,
      sectorId: res.sectorId,
      sectorName: res.sectorName,
      sectorLockedAdmin: res.sectorLockedAdmin,
	  sectorLockedSuperadmin: res.sectorLockedSuperadmin,
      id: res.id,
      name: res.name,
      grade: res.grade,
      lockedAdmin: res.lockedAdmin,
	  lockedSuperadmin: res.lockedSuperadmin,
      metadata: res.metadata
    };
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getTicks(accessToken: string, page: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/ticks?page=${page}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getToc(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/toc`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getTocXlsx(accessToken: string): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/toc/xlsx`, {
    expose:  ['Content-Disposition']
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getTodo(accessToken: string, id: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/todo?id=${id}`, null)
  .then((data) => data.json())
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function getUser(accessToken: string, id: number): Promise<any> {
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
  return makeAuthenticatedRequest(accessToken, `/users/ticks`, {
    expose:  ['Content-Disposition']
  })
  .catch((error) => {
    console.warn(error);
    return null;
  });
}

export function postArea(accessToken: string, id: number, lockedAdmin: number, lockedSuperadmin: number, forDevelopers: boolean, name: string, comment: string, lat: number, lng: number, media: any): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file && m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto, description: m.description, embedVideoUrl: m.embedVideoUrl, embedThumbnailUrl: m.embedThumbnailUrl}});
  formData.append('json', JSON.stringify({id, lockedAdmin, lockedSuperadmin, forDevelopers, name, comment, lat, lng, newMedia}));
  media.forEach(m => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
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

export function postPermissions(accessToken: string, userId: number, adminRead: boolean, adminWrite: boolean, superadminRead: boolean, superadminWrite: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/permissions`,{
    method: 'POST',
    body: JSON.stringify({userId, adminRead, adminWrite, superadminRead, superadminWrite}),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function postProblem(accessToken: string, sectorId: number, id: number, lockedAdmin: number, lockedSuperadmin: number, name: string, comment: string, originalGrade: string, fa: any, faDate: string, nr: number, t: any, lat: number, lng: number, sections: any, media: any, faAid: any): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file && m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto, pitch: m.pitch, description: m.description, embedVideoUrl: m.embedVideoUrl, embedThumbnailUrl: m.embedThumbnailUrl}});
  formData.append('json', JSON.stringify({sectorId, id, lockedAdmin, lockedSuperadmin, name, comment, originalGrade, fa, faDate, nr, t, lat, lng, sections, newMedia, faAid}));
  media.forEach(m => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
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
  const newMedia = media.map(m => {return {name: m.file && m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto, pitch: m.pitch, description: m.description, embedVideoUrl: m.embedVideoUrl, embedThumbnailUrl: m.embedThumbnailUrl}});
  formData.append('json', JSON.stringify({id, newMedia}));
  media.forEach(m => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
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

export function postSector(accessToken: string, areaId: number, id: number, lockedAdmin: number, lockedSuperadmin: number, name: string, comment: string, lat: number, lng: number, polygonCoords: any, polyline: any, media: any): Promise<any> {
  const formData = new FormData();
  const newMedia = media.map(m => {return {name: m.file && m.file.name.replace(/[^-a-z0-9.]/ig,'_'), photographer: m.photographer, inPhoto: m.inPhoto, description: m.description, embedVideoUrl: m.embedVideoUrl, embedThumbnailUrl: m.embedThumbnailUrl}});
  formData.append('json', JSON.stringify({areaId, id, lockedAdmin, lockedSuperadmin, name, comment, lat, lng, polygonCoords, polyline, newMedia}));
  media.forEach(m => m.file && formData.append(m.file.name.replace(/[^-a-z0-9.]/ig,'_'), m.file));
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

export function postTodo(accessToken: string, problemId: number): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/todo?idProblem=${problemId}`,{
    method: 'POST'
  });
}

export function postUser(accessToken: string, useBlueNotRed: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/user?useBlueNotRed=${useBlueNotRed}`,{
    method: 'POST'
  });
}

export function postUserRegion(accessToken: string, regionId: number, del: boolean): Promise<any> {
  return makeAuthenticatedRequest(accessToken, `/user/regions?regionId=${regionId}&delete=${del}`,{
    method: 'POST'
  });
}