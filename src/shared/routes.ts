import Area from './components/area';
import AreaEdit from './components/area-edit';
import Browse from './components/browse';
import Callback from './components/callback';
import Ethics from './components/ethics';
import Frontpage from './components/frontpage';
import Logout from './components/logout';
import Problem from './components/problem';
import ProblemEdit from './components/problem-edit';
import ProblemEditMedia from './components/problem-edit-media';
import ProblemHse from './components/problem-hse';
import Sector from './components/sector';
import SectorEdit from './components/sector-edit';
import SvgEdit from './components/svg-edit';
import User from './components/user';
import NoMatch from './components/no-match';

import { getArea, getAreaEdit, getBrowse, getFrontpage, getMeta, getProblem, getProblemEdit, getProblemHse, getSector, getSectorEdit, getUser, getSvgEdit } from './api';

const routes =  [
  {path: '/', exact: true, component: Frontpage, fetchInitialData: (accessToken, path = '') => getFrontpage(accessToken)},
  {path: '/browse', exact: false, component: Browse, fetchInitialData: (accessToken, path = '') => getBrowse(accessToken)},
  {path: '/callback', exact: false, component: Callback},
  {path: '/ethics', exact: false, component: Ethics, fetchInitialData: (accessToken, path = '') => getMeta(accessToken)},
  {path: '/area/:areaId', exact: true, component: Area, fetchInitialData: (accessToken, path = '') => getArea(accessToken, parseInt(path.split('/').pop()))},
  {path: '/area/edit/:areaId', exact: true, component: AreaEdit, fetchInitialData: (accessToken, path = '') => getAreaEdit(accessToken, parseInt(path.split('/').pop()))},
  {path: '/sector/:sectorId', exact: true, component: Sector, fetchInitialData: (accessToken, path = '') => getSector(accessToken, parseInt(path.split('/').pop()))},
  {path: '/sector/edit/:sectorId', exact: true, component: SectorEdit, fetchInitialData: (accessToken, path = '') => getSectorEdit(accessToken, parseInt(path.split('/').pop()))},
  {path: '/problem/:problemId', exact: true, component: Problem, fetchInitialData: (accessToken, path = '') => getProblem(accessToken, parseInt(path.split('/').pop()))},
  {path: '/problem/edit/:problemId', exact: true, component: ProblemEdit, fetchInitialData: (accessToken, path = '') => getProblemEdit(accessToken, parseInt(path.split('/').pop()))},
  {path: '/problem/edit/media/:problemId', exact: true, component: ProblemEditMedia},
  {path: '/hse', exact: true, component: ProblemHse, fetchInitialData: (accessToken, path = '') => getProblemHse(accessToken)},
  {path: '/problem/svg-edit/:problemIdMediaId', exact: true, component: SvgEdit, fetchInitialData: (accessToken, path = '') => getSvgEdit(accessToken, path.split('/').pop())},
  {path: '/user', exact: true, component: User, fetchInitialData: (accessToken, path = '') => getUser(accessToken, path.split('/').pop())},
  {path: '/user/:userId', exact: true, component: User, fetchInitialData: (accessToken, path = '') => getUser(accessToken, path.split('/').pop())},
  {path: '/logout', exact: false, component: Logout},
  {path: '*', status: 404, component: NoMatch}
]

export default routes
