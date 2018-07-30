import Area from './components/area';
import AreaEdit from './components/area-edit';
import Browse from './components/browse';
import Ethics from './components/ethics';
import Finder from './components/finder';
import Index from './components/frontpage/index';
import Login from './components/login';
import Logout from './components/logout';
import Problem from './components/problem';
import ProblemEdit from './components/problem-edit';
import ProblemEditMedia from './components/problem-edit-media';
import Recover from './components/recover';
import Register from './components/register';
import Sector from './components/sector';
import SectorEdit from './components/sector-edit';
import SvgEdit from './components/common/svg/svg-edit';
import User from './components/user';
import UserEdit from './components/user-edit';

import { getBrowse, getEthics, getFinder, getFrontpage, getLogin, getRecover } from './api';

const routes =  [
  {path: '/', exact: true, component: Index, fetchInitialData: (path = '') => getFrontpage()},
  {path: '/browse', exact: false, component: Browse, fetchInitialData: (path = '') => getBrowse()},
  {path: '/ethics', exact: false, component: Ethics, fetchInitialData: (path = '') => getEthics()},
  {path: '/area/:areaId', exact: true, component: Area},
  {path: '/area/edit/:areaId', exact: true, component: AreaEdit},
  {path: '/sector/:sectorId', exact: true, component: Sector},
  {path: '/sector/edit/:sectorId', exact: true, component: SectorEdit},
  {path: '/problem/:problemId', exact: true, component: Problem},
  {path: '/problem/edit/:problemId', exact: true, component: ProblemEdit},
  {path: '/problem/edit/media/:problemId', exact: true, component: ProblemEditMedia},
  {path: '/problem/svg-edit/:problemId/:mediaId', exact: true, component: SvgEdit},
  {path: '/finder/:grade', exact: true, component: Finder, fetchInitialData: (path = '') => getFinder(path.split('/').pop())},
  {path: '/user', exact: true, component: User},
  {path: '/user/:userId', exact: true, component: User},
  {path: '/user/:userId/edit', exact: true, component: UserEdit},
  {path: '/login', exact: false, component: Login, fetchInitialData: (path = '') => getLogin()},
  {path: '/register', exact: false, component: Register},
  {path: '/recover/:token', exact: true, component: Recover, fetchInitialData: (path = '') => getRecover()},
  {path: '/logout', exact: false, component: Logout}
]

export default routes
