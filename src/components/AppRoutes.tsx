import React, { lazy, Suspense, useLayoutEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Loading } from './common/widgets/widgets';

const About = lazy(() => import(/* webpackChunkName: "about" */'./About'));
const Area = lazy(() => import(/* webpackChunkName: "area" */ './Area'));
const AreaEdit = lazy(() => import(/* webpackChunkName: "area-edit" */ './AreaEdit'));
const Browse = lazy(() => import(/* webpackChunkName: "browse" */ './Browse'));
const Dangerous = lazy(() => import(/* webpackChunkName: "dangerous" */'./Dangerous'));
const Donations = lazy(() => import(/* webpackChunkName: "donations" */'./Donations'));
const Frontpage = lazy(() => import(/* webpackPrefetch: true, webpackChunkName: "frontpage" */'./Frontpage'));
const Filter = lazy(() => import(/* webpackChunkName: "filter" */'./Filter'));
const MediaSvgEdit = lazy(() => import(/* webpackChunkName: "media-svg-edit" */'./MediaSvgEdit'));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */'./PrivacyPolicy'));
const Problem = lazy(() => import(/* webpackChunkName: "problem" */'./Problem'));
const ProblemEdit = lazy(() => import(/* webpackChunkName: "problem-edit" */'./ProblemEdit'));
const ProblemEditMedia = lazy(() => import(/* webpackChunkName: "problem-edit-media" */'./ProblemEditMedia'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */'./Profile'));
const Sector = lazy(() => import(/* webpackChunkName: "sector" */'./Sector'));
const SectorEdit = lazy(() => import(/* webpackChunkName: "sector-edit" */'./SectorEdit'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */'./Sites'));
const SvgEdit = lazy(() => import(/* webpackChunkName: "svg-edit" */'./SvgEdit'));
const Ticks = lazy(() => import(/* webpackChunkName: "ticks" */'./Ticks'));
const Toc = lazy(() => import(/* webpackChunkName: "toc" */'./Toc'));
const ContentGraph = lazy(() => import(/* webpackChunkName: "cg" */'./ContentGraph'));
const Trash = lazy(() => import(/* webpackChunkName: "trash" */'./Trash'));
const Permissions = lazy(() => import(/* webpackChunkName: "permissions" */'./Permissions'));
const WebcamMap = lazy(() => import(/* webpackChunkName: "webcam-map" */'./WebcamMap'));

function AppRoutes() {
  const Wrapper = ({children}) => {
    const location = useLocation();
    useLayoutEffect(() => {
      setTimeout(() => window.scrollTo(0, 0), 1);
    }, [location.pathname]);
    return children;
  } 

  return (
    <Suspense fallback={<Loading />}>
      <Wrapper>
        <Routes>
          <Route path='/' element={<Frontpage/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/browse' element={<Browse/>}/>
          <Route path='/area/:areaId' element={<Area/>}/>
          <Route path='/area/edit/:areaId' element={<AreaEdit/>}/>
          <Route path='/dangerous' element={<Dangerous/>}/>
          <Route path='/donations' element={<Donations/>}/>
          <Route path='/filter' element={<Filter/>}/>
          <Route path='/media/svg-edit/:mediaId' element={<MediaSvgEdit/>}/>
          <Route path='/permissions' element={<Permissions/>}/>
          <Route path='/privacy-policy' element={<PrivacyPolicy/>}/>
          <Route path='/problem/:problemId' element={<Problem/>}/>
          <Route path='/problem/edit/:sectorIdProblemId' element={<ProblemEdit/>}/>
          <Route path='/problem/edit/media/:problemId' element={<ProblemEditMedia/>}/>
          <Route path='/problem/svg-edit/:problemIdMediaId' element={<SvgEdit/>}/>
          <Route path='/sites/:type' element={<Sites/>}/>
          <Route path='/sector/:sectorId' element={<Sector/>}/>
          <Route path='/sector/edit/:areaIdSectorId' element={<SectorEdit/>}/>
          <Route path='/ticks/:page' element={<Ticks/>}/>
          <Route path='/toc' element={<Toc/>}/>
          <Route path='/cg' element={<ContentGraph/>}/>
          <Route path='/trash' element={<Trash/>}/>
          <Route path='/user' element={<Profile/>}/>
          <Route path='/user/:userId' element={<Profile/>}/>
          <Route path='/user/:userId/:page' element={<Profile/>}/>
          <Route path='/webcam-map' element={<WebcamMap/>}/>
          <Route path='/webcam-map/:json' element={<WebcamMap/>}/>
        </Routes>
      </Wrapper>
    </Suspense>
  )
}

export default AppRoutes