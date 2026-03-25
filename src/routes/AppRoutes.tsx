import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { lazy } from '../utils/lazyRetry';
import { Loading } from '../shared/ui/StatusWidgets';
import Frontpage from '../features/Frontpage/Frontpage';

const AuthContainer = lazy(() => import('../shared/auth/AuthContainer'), 'auth');
const About = lazy(() => import('../features/About/About'), 'about');
const Area = lazy(() => import('../features/Area/Area'), 'area');
const AreaEdit = lazy(() => import('../features/AreaEdit'), 'area-edit');
const Areas = lazy(() => import('../features/Areas/Areas'), 'areas');
const Dangerous = lazy(() => import('../features/Dangerous/Dangerous'), 'dangerous');
const Donations = lazy(() => import('../features/Donations/Donations'), 'donations');
const Graph = lazy(() => import('../features/Graph/Graph'), 'graph');
const MediaSvgEdit = lazy(() => import('../features/MediaSvgEdit/MediaSvgEdit'), 'media-svg-edit');
const Permissions = lazy(() => import('../features/Permissions/Permissions'), 'permissions');
const PrivacyPolicy = lazy(() => import('../features/PrivacyPolicy/PrivacyPolicy'), 'privacy-policy');
const Problem = lazy(() => import('../features/Problem'), 'problem');
const ProblemEdit = lazy(() => import('../features/ProblemEdit/ProblemEdit'), 'problem-edit');
const ProblemEditMedia = lazy(() => import('../features/ProblemEditMedia/ProblemEditMedia'), 'problem-edit-media');
const Problems = lazy(() => import('../features/Problems'), 'problems');
const Profile = lazy(() => import('../features/Profile/Profile'), 'profile');
const Sector = lazy(() => import('../features/Sector/Sector'), 'sector');
const SectorEdit = lazy(() => import('../features/SectorEdit'), 'sector-edit');
const Sites = lazy(() => import('../features/Sites/Sites'), 'sites');
const SvgEdit = lazy(() => import('../features/SvgEdit'), 'svg-edit');
const Swagger = lazy(() => import('../features/Swagger/Swagger'), 'swagger');
const Ticks = lazy(() => import('../features/Ticks/Ticks'), 'ticks');
const Trash = lazy(() => import('../features/Trash/Trash'), 'trash');
const Webcams = lazy(() => import('../features/Webcams/Webcams'), 'webcams');

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Frontpage />} />

      <Route
        path='*'
        element={
          <Suspense fallback={<Loading />}>
            <Routes>
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
        }
      />
    </Routes>
  );
}

export default AppRoutes;
