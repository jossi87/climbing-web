import React, { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { useAnalytics } from 'use-analytics';


const About = lazy(() => import(/* webpackChunkName: "about" */'./about'));
const Area = lazy(() => import(/* webpackChunkName: "area" */ './area'));
const AreaEdit = lazy(() => import(/* webpackChunkName: "area-edit" */ './area-edit'));
const Browse = lazy(() => import(/* webpackChunkName: "browse" */ './browse'));
const Dangerous = lazy(() => import(/* webpackChunkName: "dangerous" */'./dangerous'));
const Donations = lazy(() => import(/* webpackChunkName: "donations" */'./donations'));
const Frontpage = lazy(() => import(/* webpackPrefetch: true, webpackChunkName: "frontpage" */'./frontpage'));
const Filter = lazy(() => import(/* webpackChunkName: "filter" */'./filter'));
const MediaSvgEdit = lazy(() => import(/* webpackChunkName: "media-svg-edit" */'./media-svg-edit'));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */'./privacy-policy'));
const Problem = lazy(() => import(/* webpackChunkName: "problem" */'./problem'));
const ProblemEdit = lazy(() => import(/* webpackChunkName: "problem-edit" */'./problem-edit'));
const ProblemEditMedia = lazy(() => import(/* webpackChunkName: "problem-edit-media" */'./problem-edit-media'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */'./profile'));
const Sector = lazy(() => import(/* webpackChunkName: "sector" */'./sector'));
const SectorEdit = lazy(() => import(/* webpackChunkName: "sector-edit" */'./sector-edit'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */'./sites'));
const SvgEdit = lazy(() => import(/* webpackChunkName: "svg-edit" */'./svg-edit'));
const Ticks = lazy(() => import(/* webpackChunkName: "ticks" */'./ticks'));
const Toc = lazy(() => import(/* webpackChunkName: "toc" */'./toc'));
const ContentGraph = lazy(() => import(/* webpackChunkName: "cg" */'./content-graph'));
const Trash = lazy(() => import(/* webpackChunkName: "trash" */'./trash'));
const Permissions = lazy(() => import(/* webpackChunkName: "permissions" */'./permissions'));
const WebcamMap = lazy(() => import(/* webpackChunkName: "webcam-map" */'./webcam-map'));
const routes = {
    "/" : <Frontpage />,
    '/about' : <About/>,
      '/browse' : <Browse/>,
      '/area/:areaId' : <Area/>,
      '/area/edit/:areaId' : <AreaEdit/>,
      '/dangerous' : <Dangerous/>,
      '/donations' : <Donations/>,
      '/filter' : <Filter/>,
      '/media/svg-edit/:mediaId' : <MediaSvgEdit/>,
      '/permissions' : <Permissions/>,
      '/privacy-policy' : <PrivacyPolicy/>,
      '/problem/:problemId' : <Problem/>,
      '/problem/edit/:sectorIdProblemId' : <ProblemEdit/>,
      '/problem/edit/media/:problemId' : <ProblemEditMedia/>,
      '/problem/svg-edit/:problemIdMediaId' : <SvgEdit/>,
      '/sites/:type' : <Sites/>,
      '/sector/:sectorId' : <Sector/>,
      '/sector/edit/:areaIdSectorId' : <SectorEdit/>,
      '/ticks/:page' : <Ticks/>,
      '/toc' : <Toc/>,
      '/cg' : <ContentGraph/>,
      '/trash' : <Trash/>,
      '/user' : <Profile/>,
      '/user/:userId' : <Profile/>,
      '/user/:userId/:page' : <Profile/>,
      '/webcam-map' : <WebcamMap/>,
      '/webcam-map/:json' : <WebcamMap/>,
}

function AppRoutes() {
    const location = useLocation();
    const analytics = useAnalytics();
    React.useEffect(() => {
        analytics.page()
     }, [location]);

    return (
        <Suspense fallback={<LoadingAndRestoreScroll />}>
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
    </Suspense>
    )
}

export default AppRoutes