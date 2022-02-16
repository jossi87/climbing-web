import React, { Suspense, lazy, useEffect } from 'react';
import { Button, Icon, Container, Divider, Grid, Header, List, Segment } from 'semantic-ui-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LoadingAndRestoreScroll } from './components/common/widgets/widgets';
import { useAnalytics } from 'use-analytics';

import Navigation from './components/navigation';
const About = lazy(() => import(/* webpackChunkName: "about" */'./components/about'));
const Area = lazy(() => import(/* webpackChunkName: "area" */ './components/area'));
const AreaEdit = lazy(() => import(/* webpackChunkName: "area-edit" */ './components/area-edit'));
const Browse = lazy(() => import(/* webpackChunkName: "browse" */ './components/browse'));
const Dangerous = lazy(() => import(/* webpackChunkName: "dangerous" */'./components/dangerous'));
const Donations = lazy(() => import(/* webpackChunkName: "donations" */'./components/donations'));
const Frontpage = lazy(() => import(/* webpackPrefetch: true, webpackChunkName: "frontpage" */'./components/frontpage'));
const Filter = lazy(() => import(/* webpackChunkName: "filter" */'./components/filter'));
const MediaSvgEdit = lazy(() => import(/* webpackChunkName: "media-svg-edit" */'./components/media-svg-edit'));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */'./components/privacy-policy'));
const Problem = lazy(() => import(/* webpackChunkName: "problem" */'./components/problem'));
const ProblemEdit = lazy(() => import(/* webpackChunkName: "problem-edit" */'./components/problem-edit'));
const ProblemEditMedia = lazy(() => import(/* webpackChunkName: "problem-edit-media" */'./components/problem-edit-media'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */'./components/profile'));
const Sector = lazy(() => import(/* webpackChunkName: "sector" */'./components/sector'));
const SectorEdit = lazy(() => import(/* webpackChunkName: "sector-edit" */'./components/sector-edit'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */'./components/sites'));
const SvgEdit = lazy(() => import(/* webpackChunkName: "svg-edit" */'./components/svg-edit'));
const Ticks = lazy(() => import(/* webpackChunkName: "ticks" */'./components/ticks'));
const Toc = lazy(() => import(/* webpackChunkName: "toc" */'./components/toc'));
const ContentGraph = lazy(() => import(/* webpackChunkName: "cg" */'./components/content-graph'));
const Trash = lazy(() => import(/* webpackChunkName: "trash" */'./components/trash'));
const Permissions = lazy(() => import(/* webpackChunkName: "permissions" */'./components/permissions'));
const WebcamMap = lazy(() => import(/* webpackChunkName: "webcam-map" */'./components/webcam-map'));

const App = () => {
  let location = useLocation();
  const analytics = useAnalytics();
  useEffect(() => {
    analytics.page()
  }, [location]);
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
      <Navigation />
      <Container style={{ marginTop: '1em' }}>
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
                  <List.Item as='a' href='https://buldreinfo.com' rel='noreferrer noopener' target='_blank'>Rogaland</List.Item>
                  <List.Item as='a' href='https://buldre.forer.no' rel='noreferrer noopener' target='_blank'>Fredrikstad</List.Item>
                  <List.Item as='a' href='https://buldreforer.tromsoklatring.no' rel='noreferrer noopener' target='_blank'>Troms</List.Item>
                  <List.Item as='a' href='https://buldring.bergen-klatreklubb.no' rel='noreferrer noopener' target='_blank'>Bergen</List.Item>
                  <List.Item as='a' href='https://buldring.flatangeradventure.no' rel='noreferrer noopener' target='_blank'>Trondheim</List.Item>
                  <List.Item as='a' href='https://buldring.jotunheimenfjellsport.com' rel='noreferrer noopener' target='_blank'>Jotunheimen</List.Item>
                  <List.Item as='a' href='https://buldring.narvikklatreklubb.no' rel='noreferrer noopener' target='_blank'>Narvik</List.Item>
                  <List.Item as='a' href='https://hkl.buldreinfo.com' rel='noreferrer noopener' target='_blank'>Haugalandet</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Route climbing' />
                <List link inverted>
                  <List.Item as='a' href='/sites/climbing'>Map</List.Item>
                  <br/>
                  <List.Item as='a' href='https://brattelinjer.no' rel='noreferrer noopener' target='_blank'>Rogaland</List.Item>
                  <List.Item as='a' href='https://hkl.brattelinjer.no' rel='noreferrer noopener' target='_blank'>Haugalandet</List.Item>
                  <List.Item as='a' href='https://klatreforer.narvikklatreklubb.no' rel='noreferrer noopener' target='_blank'>Narvik</List.Item>
                  <List.Item as='a' href='https://klatreforer.tromsoklatring.no' rel='noreferrer noopener' target='_blank'>Troms</List.Item>
                  <List.Item as='a' href='https://klatring.flatangeradventure.no' rel='noreferrer noopener' target='_blank'>Trondheim</List.Item>
                  <List.Item as='a' href='https://klatring.jotunheimenfjellsport.com' rel='noreferrer noopener' target='_blank'>Jotunheimen</List.Item>
                  <List.Item as='a' href='https://tau.forer.no' rel='noreferrer noopener' target='_blank'>Fredrikstad</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Ice climbing' />
                <List link inverted>
                  <List.Item as='a' href='/sites/ice'>Map</List.Item>
                  <br/>
                  <List.Item as='a' href='https://is.brattelinjer.no' rel='noreferrer noopener' target='_blank'>Rogaland</List.Item>
                  <List.Item as='a' href='https://is.forer.no' rel='noreferrer noopener' target='_blank'>Fredrikstad</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Links' />
                <a href={"https://www.facebook.com/groups/brattelinjer"} rel="noreferrer noopener" target="_blank"><Button style={styleFacebook} color='facebook'><Icon name='facebook' /> Facebook</Button></a><br/>
                <a href={"https://brv.no"} rel="noreferrer noopener" target="_blank"><img style={styleBrv} src={"/png/brv.png"} alt="Bratte Rogalands venner"/></a><br/>
                <a href='https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'  rel="noreferrer noopener" target="_blank"><img style={styleGoogle} alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/></a>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Divider inverted section />
          <List horizontal inverted divided link>
            <List.Item as={Link} to='/about'>About</List.Item>
            <List.Item as='a' href={`mailto:jostein.oygarden@gmail.com?subject=${window.location.href}`}>Contact</List.Item>
            <List.Item as='a' href='/gpl-3.0.txt' rel='noreferrer noopener' target='_blank'>GNU Public License</List.Item>
            <List.Item as={Link} to='/privacy-policy'>Privacy Policy</List.Item>
          </List>
          <p>
            Buldreinfo &amp; Bratte Linjer - 2006-2021
          </p>
        </Container>
      </Segment>
    </div>
  );
}

export default App;