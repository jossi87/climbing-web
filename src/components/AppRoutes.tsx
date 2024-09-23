import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loading } from "./common/widgets/widgets";
import { lazy } from "../utils/lazyRetry";

const AuthContainer = lazy(
  () => import(/* webpackChunkName: "auth" */ "./AuthContainer"),
  "auth",
);
const About = lazy(
  () => import(/* webpackChunkName: "about" */ "./About"),
  "about",
);
const Area = lazy(
  () => import(/* webpackChunkName: "area" */ "./Area"),
  "area",
);
const AreaEdit = lazy(
  () => import(/* webpackChunkName: "area-edit" */ "./AreaEdit"),
  "area-edit",
);
const Areas = lazy(
  () => import(/* webpackChunkName: "areas" */ "./Areas"),
  "areas",
);
const Dangerous = lazy(
  () => import(/* webpackChunkName: "dangerous" */ "./Dangerous"),
  "dangerous",
);
const Donations = lazy(
  () => import(/* webpackChunkName: "donations" */ "./Donations"),
  "donations",
);
const Frontpage = lazy(
  () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "frontpage" */ "./Frontpage"
    ),
  "frontpage",
);
const Graph = lazy(
  () => import(/* webpackChunkName: "graph" */ "./Graph"),
  "graph",
);
const MediaSvgEdit = lazy(
  () => import(/* webpackChunkName: "media-svg-edit" */ "./MediaSvgEdit"),
  "media-svg-edit",
);
const Permissions = lazy(
  () => import(/* webpackChunkName: "permissions" */ "./Permissions"),
  "permissions",
);
const PrivacyPolicy = lazy(
  () => import(/* webpackChunkName: "privacy-policy" */ "./PrivacyPolicy"),
  "privacy-policy",
);
const Problem = lazy(
  () => import(/* webpackChunkName: "problem" */ "./Problem"),
  "problem",
);
const ProblemEdit = lazy(
  () => import(/* webpackChunkName: "problem-edit" */ "./ProblemEdit"),
  "problem-edit",
);
const ProblemEditMedia = lazy(
  () =>
    import(/* webpackChunkName: "problem-edit-media" */ "./ProblemEditMedia"),
  "problem-edit-media",
);
const Problems = lazy(
  () => import(/* webpackChunkName: "problems" */ "./Problems"),
  "problems",
);
const Profile = lazy(
  () => import(/* webpackChunkName: "profile" */ "./Profile"),
  "profile",
);
const Sector = lazy(
  () => import(/* webpackChunkName: "sector" */ "./Sector"),
  "sector",
);
const SectorEdit = lazy(
  () => import(/* webpackChunkName: "sector-edit" */ "./SectorEdit"),
  "sector-edit",
);
const Sites = lazy(
  () => import(/* webpackChunkName: "sites" */ "./Sites"),
  "sites",
);
const SvgEdit = lazy(
  () => import(/* webpackChunkName: "svg-edit" */ "./SvgEdit"),
  "svg-edit",
);
const Swagger = lazy(
  () => import(/* webpackChunkName: "swagger" */ "./Swagger"),
  "swagger",
);
const Ticks = lazy(
  () => import(/* webpackChunkName: "ticks" */ "./Ticks"),
  "ticks",
);
const Trash = lazy(
  () => import(/* webpackChunkName: "trash" */ "./Trash"),
  "trash",
);
const Webcams = lazy(
  () => import(/* webpackChunkName: "webcams" */ "./Webcams"),
  "webcams",
);

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Frontpage />} />
        <Route path="/about" element={<About />} />
        <Route path="/area/:areaId/:mediaId?" element={<Area />} />
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
        <Route path="/filter" element={<Problems filterOpen />} />
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
        <Route
          path="/problem/:problemId/:mediaId?/:pitch?"
          element={<Problem />}
        />
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
          path="/problem/svg-edit/:problemId/:pitch/:mediaId"
          element={
            <AuthContainer level="admin">
              <SvgEdit />
            </AuthContainer>
          }
        />
        <Route path="/problems" element={<Problems />} />
        <Route path="/sites/:type" element={<Sites />} />
        <Route path="/sector/:sectorId/:mediaId?" element={<Sector />} />
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
        <Route path="/user/:userId/:page?/:mediaId?" element={<Profile />} />
        <Route path="/webcams/:json?" element={<Webcams />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
