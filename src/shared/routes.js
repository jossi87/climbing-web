import Area from './components/area';
import AreaEdit from './components/area-edit';
import Browse from './components/browse';
import Callback from './components/callback';
import Ethics from './components/ethics';
import Finder from './components/finder';
import Index from './components/frontpage/index';
import Login from './components/login';
import Logout from './components/logout';
import Problem from './components/problem';
import ProblemEdit from './components/problem-edit';
import ProblemEditMedia from './components/problem-edit-media';
import Sector from './components/sector';
import SectorEdit from './components/sector-edit';
import SvgEdit from './components/common/svg/svg-edit';
import User from './components/user';
import UserEdit from './components/user-edit';
import NoMatch from './components/no-match';

import { getArea, getAreaEdit, getBrowse, getFinder, getFrontpage, getMeta, getProblem, getProblemEdit, getProblemEditMedia, getSector, getSectorEdit, getUser, getUserEdit, getSvgEdit } from './api';

const routes =  [
  {path: '/', exact: true, component: Index, fetchInitialData: (cookies, path = '') => getFrontpage(cookies)},
  {path: '/browse', exact: false, component: Browse, fetchInitialData: (cookies, path = '') => getBrowse(cookies)},
  {path: '/callback', exact: false, component: Callback},
  {path: '/ethics', exact: false, component: Ethics, fetchInitialData: (cookies, path = '') => getMeta(cookies)},
  {path: '/area/:areaId', exact: true, component: Area, fetchInitialData: (cookies, path = '') => getArea(cookies, path.split('/').pop())},
  {path: '/area/edit/:areaId', exact: true, component: AreaEdit, fetchInitialData: (cookies, path = '') => getAreaEdit(cookies, path.split('/').pop())},
  {path: '/sector/:sectorId', exact: true, component: Sector, fetchInitialData: (cookies, path = '') => getSector(cookies, path.split('/').pop())},
  {path: '/sector/edit/:sectorId', exact: true, component: SectorEdit, fetchInitialData: (cookies, path = '') => getSectorEdit(cookies, path.split('/').pop())},
  {path: '/problem/:problemId', exact: true, component: Problem, fetchInitialData: (cookies, path = '') => getProblem(cookies, path.split('/').pop())},
  {path: '/problem/edit/:problemId', exact: true, component: ProblemEdit, fetchInitialData: (cookies, path = '') => getProblemEdit(cookies, path.split('/').pop())},
  {path: '/problem/edit/media/:problemId', exact: true, component: ProblemEditMedia},
  {path: '/problem/svg-edit/:problemIdMediaId', exact: true, component: SvgEdit, fetchInitialData: (cookies, path = '') => getSvgEdit(cookies, path.split('/').pop())},
  {path: '/finder/:grade', exact: true, component: Finder, fetchInitialData: (cookies, path = '') => getFinder(cookies, path.split('/').pop())},
  {path: '/user', exact: true, component: User, fetchInitialData: (cookies, path = '') => getUser(cookies, path.split('/').pop())},
  {path: '/user/:userId', exact: true, component: User, fetchInitialData: (cookies, path = '') => getUser(cookies, path.split('/').pop())},
  {path: '/user/edit/:userId', exact: true, component: UserEdit, fetchInitialData: (cookies, path = '') => getUserEdit(cookies, path.split('/').pop())},
  {path: '/login', exact: false, component: Login},
  {path: '/logout', exact: false, component: Logout},
  {path: '*', status: 404, component: NoMatch}
]

export default routes
