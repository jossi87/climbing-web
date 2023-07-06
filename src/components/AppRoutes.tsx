import React, { lazy, Suspense, useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Loading } from "./common/widgets/widgets";

const AuthContainer = lazy(
  () => import(/* webpackChunkName: "auth" */ "./AuthContainer")
);

const About = lazy(() => import(/* webpackChunkName: "about" */ "./About"));
const Area = lazy(() => import(/* webpackChunkName: "area" */ "./Area"));
const AreaEdit = lazy(
  () => import(/* webpackChunkName: "area-edit" */ "./AreaEdit")
);
const Areas = lazy(() => import(/* webpackChunkName: "areas" */ "./Areas"));
const Dangerous = lazy(
  () => import(/* webpackChunkName: "dangerous" */ "./Dangerous")
);
const Donations = lazy(
  () => import(/* webpackChunkName: "donations" */ "./Donations")
);
const Frontpage = lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "frontpage" */ "./Frontpage"
    )
);
const Filter = lazy(() => import(/* webpackChunkName: "filter" */ "./Filter"));
const Graph = lazy(() => import(/* webpackChunkName: "graph" */ "./Graph"));
const MediaSvgEdit = lazy(
  () => import(/* webpackChunkName: "media-svg-edit" */ "./MediaSvgEdit")
);
const PrivacyPolicy = lazy(
  () => import(/* webpackChunkName: "privacy-policy" */ "./PrivacyPolicy")
);
const Problem = lazy(
  () => import(/* webpackChunkName: "problem" */ "./Problem")
);
const ProblemEdit = lazy(
  () => import(/* webpackChunkName: "problem-edit" */ "./ProblemEdit")
);
const ProblemEditMedia = lazy(
  () =>
    import(/* webpackChunkName: "problem-edit-media" */ "./ProblemEditMedia")
);
const Problems = lazy(
  () => import(/* webpackChunkName: "problems" */ "./Problems")
);
const Profile = lazy(
  () => import(/* webpackChunkName: "profile" */ "./Profile")
);
const Sector = lazy(() => import(/* webpackChunkName: "sector" */ "./Sector"));
const SectorEdit = lazy(
  () => import(/* webpackChunkName: "sector-edit" */ "./SectorEdit")
);
const Sites = lazy(() => import(/* webpackChunkName: "sites" */ "./Sites"));
const SvgEdit = lazy(
  () => import(/* webpackChunkName: "svg-edit" */ "./SvgEdit")
);
const Swagger = lazy(
  () => import(/* webpackChunkName: "swagger" */ "./Swagger")
);
const Ticks = lazy(() => import(/* webpackChunkName: "ticks" */ "./Ticks"));
const Trash = lazy(() => import(/* webpackChunkName: "trash" */ "./Trash"));
const Permissions = lazy(
  () => import(/* webpackChunkName: "permissions" */ "./Permissions")
);
const Webcams = lazy(
  () => import(/* webpackChunkName: "webcams" */ "./Webcams")
);

function AppRoutes() {
  const Wrapper = ({ children }) => {
    const location = useLocation();
    useLayoutEffect(() => {
      setTimeout(() => window.scrollTo(0, 0), 1);
    }, [location.pathname]);
    return children;
  };

  return (
    <Suspense fallback={<Loading />}>
      <Wrapper>
        <Routes>
          <Route path="/" element={<Frontpage />} />
          <Route path="/about" element={<About />} />
          <Route path="/area/:areaId" element={<Area />} />
          <Route
            path="/area/edit/:areaId"
            element={
              <AuthContainer level="admin">
                <AreaEdit />
              </AuthContainer>
            }
          />
          <Route path="/areas" element={<Areas />} />
          <Route path="/dangerous" element={<Dangerous />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/filter" element={<Filter />} />
          <Route path="/graph" element={<Graph />} />
          <Route
            path="/media/svg-edit/:mediaId"
            element={
              <AuthContainer level="admin">
                <MediaSvgEdit />
              </AuthContainer>
            }
          />
          <Route
            path="/permissions"
            element={
              <AuthContainer level="super-admin">
                <Permissions />
              </AuthContainer>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/problem/:problemId" element={<Problem />} />
          <Route
            path="/problem/edit/media/:problemId"
            element={
              <AuthContainer level="logged-in">
                <ProblemEditMedia />
              </AuthContainer>
            }
          />
          <Route
            path="/problem/edit/:sectorId/:problemId"
            element={
              <AuthContainer level="admin">
                <ProblemEdit />
              </AuthContainer>
            }
          />
          <Route
            path="/problem/svg-edit/:problemId/:mediaId"
            element={
              <AuthContainer level="admin">
                <SvgEdit />
              </AuthContainer>
            }
          />
          <Route path="/problems" element={<Problems />} />
          <Route path="/sites/:type" element={<Sites />} />
          <Route path="/sector/:sectorId" element={<Sector />} />
          <Route
            path="/sector/edit/:areaId/:sectorId"
            element={
              <AuthContainer level="admin">
                <SectorEdit />
              </AuthContainer>
            }
          />
          <Route path="/ticks/:page" element={<Ticks />} />
          <Route path="/swagger" element={<Swagger />} />
          <Route
            path="/trash"
            element={
              <AuthContainer level="super-admin">
                <Trash />
              </AuthContainer>
            }
          />
          <Route
            path="/user"
            element={
              <AuthContainer level="logged-in">
                <Profile />
              </AuthContainer>
            }
          />
          <Route path="/user/:userId" element={<Profile />} />
          <Route path="/user/:userId/:page" element={<Profile />} />
          <Route path="/webcams" element={<Webcams />} />
          <Route path="/webcams/:json" element={<Webcams />} />
        </Routes>
      </Wrapper>
    </Suspense>
  );
}

export default AppRoutes;
