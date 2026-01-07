import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loading } from './common/widgets/widgets';
import { lazy } from '../utils/lazyRetry';

const AuthContainer = lazy(() => import('./AuthContainer'), 'auth');
const About = lazy(() => import('./About'), 'about');
const Area = lazy(() => import('./Area'), 'area');
const AreaEdit = lazy(() => import('./AreaEdit'), 'area-edit');
const Areas = lazy(() => import('./Areas'), 'areas');
const Dangerous = lazy(() => import('./Dangerous'), 'dangerous');
const Donations = lazy(() => import('./Donations'), 'donations');
const Frontpage = lazy(() => import('./Frontpage'), 'frontpage');
const Graph = lazy(() => import('./Graph'), 'graph');
const MediaSvgEdit = lazy(() => import('./MediaSvgEdit'), 'media-svg-edit');
const Permissions = lazy(() => import('./Permissions'), 'permissions');
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'), 'privacy-policy');
const Problem = lazy(() => import('./Problem'), 'problem');
const ProblemEdit = lazy(() => import('./ProblemEdit'), 'problem-edit');
const ProblemEditMedia = lazy(() => import('./ProblemEditMedia'), 'problem-edit-media');
const Problems = lazy(() => import('./Problems'), 'problems');
const Profile = lazy(() => import('./Profile'), 'profile');
const Sector = lazy(() => import('./Sector'), 'sector');
const SectorEdit = lazy(() => import('./SectorEdit'), 'sector-edit');
const Sites = lazy(() => import('./Sites'), 'sites');
const SvgEdit = lazy(() => import('./SvgEdit'), 'svg-edit');
const Swagger = lazy(() => import('./Swagger'), 'swagger');
const Ticks = lazy(() => import('./Ticks'), 'ticks');
const Trash = lazy(() => import('./Trash'), 'trash');
const Webcams = lazy(() => import('./Webcams'), 'webcams');

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path='/' element={<Frontpage />} />
        <Route path='/about' element={<About />} />
        <Route path='/area/:areaId/:mediaId?' element={<Area />} />
        <Route
          path='/area/edit/:areaId'
          element={
            <AuthContainer level='admin'>
              <AreaEdit />
            </AuthContainer>
          }
        />
        <Route path='/areas' element={<Areas />} />
        <Route path='/dangerous' element={<Dangerous />} />
        <Route path='/donations' element={<Donations />} />
        <Route path='/filter' element={<Problems filterOpen />} />
        <Route path='/graph' element={<Graph />} />
        <Route
          path='/media/svg-edit/:mediaId'
          element={
            <AuthContainer level='admin'>
              <MediaSvgEdit />
            </AuthContainer>
          }
        />
        <Route
          path='/permissions'
          element={
            <AuthContainer level='super-admin'>
              <Permissions />
            </AuthContainer>
          }
        />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/problem/:problemId/:mediaId?/:pitch?' element={<Problem />} />
        <Route
          path='/problem/edit/media/:problemId'
          element={
            <AuthContainer level='logged-in'>
              <ProblemEditMedia />
            </AuthContainer>
          }
        />
        <Route
          path='/problem/edit/:sectorId/:problemId'
          element={
            <AuthContainer level='admin'>
              <ProblemEdit />
            </AuthContainer>
          }
        />
        <Route
          path='/problem/svg-edit/:problemId/:pitch/:mediaId'
          element={
            <AuthContainer level='admin'>
              <SvgEdit />
            </AuthContainer>
          }
        />
        <Route path='/problems' element={<Problems />} />
        <Route path='/sites/:type' element={<Sites />} />
        <Route path='/sector/:sectorId/:mediaId?' element={<Sector />} />
        <Route
          path='/sector/edit/:areaId/:sectorId'
          element={
            <AuthContainer level='admin'>
              <SectorEdit />
            </AuthContainer>
          }
        />
        <Route path='/ticks/:page' element={<Ticks />} />
        <Route path='/swagger' element={<Swagger />} />
        <Route
          path='/trash'
          element={
            <AuthContainer level='super-admin'>
              <Trash />
            </AuthContainer>
          }
        />
        <Route
          path='/user'
          element={
            <AuthContainer level='logged-in'>
              <Profile />
            </AuthContainer>
          }
        />
        <Route path='/user/:userId/:page?/:mediaId?' element={<Profile />} />
        <Route path='/webcams/:json?' element={<Webcams />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
