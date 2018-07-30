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

import { getArea, getAreaEdit, getBrowse, getFinder, getFrontpage, getMeta, getProblem, getProblemEdit, getProblemEditMedia, getSector, getSectorEdit, getUser, getUserEdit, getSvgEdit } from './api';

const routes =  [
  {path: '/', exact: true, component: Index, fetchInitialData: (path = '') => getFrontpage()},
  {path: '/browse', exact: false, component: Browse, fetchInitialData: (path = '') => getBrowse()},
  {path: '/ethics', exact: false, component: Ethics, fetchInitialData: (path = '') => getMeta()},
  {path: '/area/:areaId', exact: true, component: Area, fetchInitialData: (path = '') => getArea(path.split('/').pop())},
  {path: '/area/edit/:areaId', exact: true, component: AreaEdit, fetchInitialData: (path = '') => getAreaEdit(path.split('/').pop())},
  {path: '/sector/:sectorId', exact: true, component: Sector, fetchInitialData: (path = '') => getSector(path.split('/').pop())},
  {path: '/sector/edit/:sectorId', exact: true, component: SectorEdit, fetchInitialData: (path = '') => getSectorEdit(path.split('/').pop())},
  {path: '/problem/:problemId', exact: true, component: Problem, fetchInitialData: (path = '') => getProblem(path.split('/').pop())},
  {path: '/problem/edit/:problemId', exact: true, component: ProblemEdit, fetchInitialData: (path = '') => getProblemEdit(path.split('/').pop())},
  {path: '/problem/edit/media/:problemId', exact: true, component: ProblemEditMedia, fetchInitialData: (path = '') => getProblemEditMedia(path.split('/').pop())},
  {path: '/problem/svg-edit/:problemId/:mediaId', exact: true, component: SvgEdit, fetchInitialData: (path = '') => getSvgEdit(path.split('/').pop().pop(), path.split('/').pop())},
  {path: '/finder/:grade', exact: true, component: Finder, fetchInitialData: (path = '') => getFinder(path.split('/').pop())},
  {path: '/user', exact: true, component: User, fetchInitialData: (path = '') => getUser(path.split('/').pop())},
  {path: '/user/:userId', exact: true, component: User, fetchInitialData: (path = '') => getUser(path.split('/').pop())},
  {path: '/user/:userId/edit', exact: true, component: UserEdit, fetchInitialData: (path = '') => getUserEdit(path.split('/').pop())},
  {path: '/login', exact: false, component: Login, fetchInitialData: (path = '') => getMeta()},
  {path: '/register', exact: false, component: Register, fetchInitialData: (path = '') => getMeta()},
  {path: '/recover/:token', exact: true, component: Recover, fetchInitialData: (path = '') => getMeta()},
  {path: '/logout', exact: false, component: Logout}
]

export default routes
