import React, { Suspense, lazy } from 'react';
import { Button, Icon, Container, Divider, Grid, Header, List, Segment } from 'semantic-ui-react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Analytics from 'react-router-ga';
import { LoadingAndRestoreScroll } from './components/common/widgets/widgets';

import Navigation from './components/navigation';
const Area = lazy(() => import('./components/area'));
const AreaEdit = lazy(() => import('./components/area-edit'));
const Browse = lazy(() => import('./components/browse'));
const Frontpage = lazy(() => import('./components/frontpage'));
const Filter = lazy(() => import('./components/filter'));
const Help = lazy(() => import('./components/help'));
const MediaSvgEdit = lazy(() => import('./components/media-svg-edit'));
const Problem = lazy(() => import('./components/problem'));
const ProblemEdit = lazy(() => import('./components/problem-edit'));
const ProblemEditMedia = lazy(() => import('./components/problem-edit-media'));
const ProblemHse = lazy(() => import('./components/problem-hse'));
const Sector = lazy(() => import('./components/sector'));
const SectorEdit = lazy(() => import('./components/sector-edit'));
const Sites = lazy(() => import('./components/sites'));
const SvgEdit = lazy(() => import('./components/svg-edit'));
const Ticks = lazy(() => import('./components/ticks'));
const Toc = lazy(() => import('./components/toc'));
const Todo = lazy(() => import('./components/todo'));
const Trash = lazy(() => import('./components/trash'));
const User = lazy(() => import('./components/user'));
const UserMedia = lazy(() => import('./components/user-media'));
const Permissions = lazy(() => import('./components/permissions'));
const Weather = lazy(() => import('./components/weather'));

const App = () => {
  const styleFacebook = {
    width: '170px',
    marginTop: '3px',
    marginLeft: '5px',
    marginBottom: '5px',
  }
  const styleBrv = {
    marginBottom: '10px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    paddingLeft: '10px',
    paddingRight: '10px',
    maxWidth: '170px',
    backgroundColor: '#FFFFFF'
  };
  const styleGoogle = {
    width: '200px',
    marginTop: '-22px',
  }
  return (
    <div style={{background: "#F5F5F5"}}>
      <Router>
        <Navigation />
        <Container style={{ marginTop: '1em' }}>
          <Analytics id="UA-76534258-1">
          <Suspense fallback={<LoadingAndRestoreScroll />}>
              <Switch>
                <Route exact path='/'><Frontpage/></Route>
                <Route path='/browse'><Browse/></Route>
                <Route exact path='/area/:areaId'><Area/></Route>
                <Route exact path='/area/edit/:areaId'><AreaEdit/></Route>
                <Route path='/filter'><Filter/></Route>
                <Route path='/help'><Help/></Route>
                <Route path='/hse'><ProblemHse/></Route>
                <Route exact path='/media/svg-edit/:mediaId'><MediaSvgEdit/></Route>
                <Route path='/permissions'><Permissions/></Route>
                <Route exact path='/problem/:problemId'><Problem/></Route>
                <Route exact path='/problem/edit/:sectorIdProblemId'><ProblemEdit/></Route>
                <Route exact path='/problem/edit/media/:problemId'><ProblemEditMedia/></Route>
                <Route exact path='/problem/svg-edit/:problemIdMediaId'><SvgEdit/></Route>
                <Route exact path='/sites/:type'><Sites/></Route>
                <Route exact path='/sector/:sectorId'><Sector/></Route>
                <Route exact path='/sector/edit/:areaIdSectorId'><SectorEdit/></Route>
                <Route path='/ticks/:page'><Ticks/></Route>
                <Route exact path='/user'><User/></Route>
                <Route exact path='/user/:userId'><User/></Route>
                <Route exact path='/user/media/:userId'><UserMedia/></Route>
                <Route exact path='/toc'><Toc/></Route>
                <Route exact path='/todo'><Todo/></Route>
                <Route exact path='/todo/:userId'><Todo/></Route>
                <Route exact path='/trash'><Trash/></Route>
                <Route exact path='/weather'><Weather/></Route>
                <Route exact path='/weather/:json'><Weather/></Route>
              </Switch>
            </Suspense>
          </Analytics>
        </Container>
        <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
          <Container textAlign='center'>
            <Grid divided inverted stackable>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Header inverted as='h4' content='Bouldering' />
                  <List link inverted>
                    <List.Item as='a' href='/sites/boulder'>Map</List.Item>
                    <br/>
                    <List.Item as='a' href='https://buldreinfo.com' rel='noopener' target='_blank'>Rogaland</List.Item>
                    <List.Item as='a' href='https://buldre.forer.no' rel='noopener' target='_blank'>Fredrikstad</List.Item>
                    <List.Item as='a' href='https://buldreforer.tromsoklatring.no' rel='noopener' target='_blank'>Troms</List.Item>
                    <List.Item as='a' href='https://buldring.bergen-klatreklubb.no' rel='noopener' target='_blank'>Bergen</List.Item>
                    <List.Item as='a' href='https://buldring.flatangeradventure.no' rel='noopener' target='_blank'>Trondheim</List.Item>
                    <List.Item as='a' href='https://buldring.jotunheimenfjellsport.com' rel='noopener' target='_blank'>Jotunheimen</List.Item>
                    <List.Item as='a' href='https://buldring.narvikklatreklubb.no' rel='noopener' target='_blank'>Narvik</List.Item>
                    <List.Item as='a' href='https://hkl.buldreinfo.com' rel='noopener' target='_blank'>Haugalandet</List.Item>
                  </List>
                </Grid.Column>
                <Grid.Column width={4}>
                  <Header inverted as='h4' content='Route climbing' />
                  <List link inverted>
                    <List.Item as='a' href='/sites/climbing'>Map</List.Item>
                    <br/>
                    <List.Item as='a' href='https://brattelinjer.no' rel='noopener' target='_blank'>Rogaland</List.Item>
                    <List.Item as='a' href='https://hkl.brattelinjer.no' rel='noopener' target='_blank'>Haugalandet</List.Item>
                    <List.Item as='a' href='https://klatreforer.narvikklatreklubb.no' rel='noopener' target='_blank'>Narvik</List.Item>
                    <List.Item as='a' href='https://klatreforer.tromsoklatring.no' rel='noopener' target='_blank'>Troms</List.Item>
                    <List.Item as='a' href='https://klatring.flatangeradventure.no' rel='noopener' target='_blank'>Trondheim</List.Item>
                    <List.Item as='a' href='https://klatring.jotunheimenfjellsport.com' rel='noopener' target='_blank'>Jotunheimen</List.Item>
                    <List.Item as='a' href='https://tau.forer.no' rel='noopener' target='_blank'>Fredrikstad</List.Item>
                  </List>
                </Grid.Column>
                <Grid.Column width={4}>
                  <Header inverted as='h4' content='Ice climbing' />
                  <List link inverted>
                    <List.Item as='a' href='/sites/ice'>Map</List.Item>
                    <br/>
                    <List.Item as='a' href='https://is.brattelinjer.no' rel='noopener' target='_blank'>Rogaland</List.Item>
                    <List.Item as='a' href='https://is.forer.no' rel='noopener' target='_blank'>Fredrikstad</List.Item>
                  </List>
                </Grid.Column>
                <Grid.Column width={4}>
                  <Header inverted as='h4' content='Links' />
                  <a href={"https://www.facebook.com/groups/brattelinjer"} rel="noopener" target="_blank"><Button style={styleFacebook} color='facebook'><Icon name='facebook' /> Facebook</Button></a><br/>
                  <a href={"https://brv.no"} rel="noopener" target="_blank"><img style={styleBrv} src={"/png/brv.png"} alt="Bratte Rogalands venner"/></a><br/>
                  <a href='https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'  rel="noopener" target="_blank"><img style={styleGoogle} alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/></a>
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <Divider inverted section />
            <List horizontal inverted divided link>
              <List.Item as={Link} to='/help'>Help</List.Item>
              <List.Item as={Link} to='/hse'>HSE</List.Item>
              <List.Item as='a' href={`mailto:jostein.oygarden@gmail.com?subject=${window.location.href}`}>Contact</List.Item>
              <List.Item as='a' href='/gpl-3.0.txt' rel='noopener' target='_blank'>GNU Public License</List.Item>
            </List>
            <p>
              Buldreinfo &amp; Bratte Linjer - 2006-2021
            </p>
          </Container>
        </Segment>
      </Router>
    </div>
  );
}

export default App;