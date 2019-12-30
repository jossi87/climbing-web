import React, { useEffect, useState } from 'react';
import { useAuth0 } from "./utils/react-auth0-spa";
import { Container, Divider, Grid, Header, List, Segment } from 'semantic-ui-react'
import { Link, Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import Navigation from './components/navigation';

import Area from './components/area';
import AreaEdit from './components/area-edit';
import Browse from './components/browse';
import Ethics from './components/ethics';
import Frontpage from './components/frontpage';
import Filter from './components/filter';
import Problem from './components/problem';
import ProblemEdit from './components/problem-edit';
import ProblemEditMedia from './components/problem-edit-media';
import ProblemHse from './components/problem-hse';
import Sector from './components/sector';
import SectorEdit from './components/sector-edit';
import SvgEdit from './components/svg-edit';
import Ticks from './components/ticks';
import Todo from './components/todo';
import User from './components/user';
import Permissions from './components/permissions';
import NoMatch from './components/no-match';

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}
const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}

const App = (props) => {
  const { isAuthenticated, loginWithRedirect, logout, getTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getTokenSilently();
      setAccessToken(token);
    };
    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getTokenSilently]);
  
  const styleGoogle = {
    width: '200px',
    marginTop: '-10px',
    marginBottom: '-5px'
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
  return (
    <div style={{background: "#F5F5F5"}}>
      <Navigation accessToken={accessToken} isAuthenticated={isAuthenticated} logout={logout} loginWithRedirect={loginWithRedirect} />
      <Container style={{ marginTop: '1em' }}>
        <Switch>
          <PropsRoute exact path='/' component={Frontpage} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='/browse' component={Browse} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='/ethics' component={Ethics} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/area/:areaId' component={Area} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/area/edit/:areaId' component={AreaEdit} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='/filter' component={Filter} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='/hse' component={ProblemHse} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='/permissions' component={Permissions} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/problem/:problemId' component={Problem} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/problem/edit/:problemId' component={ProblemEdit} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/problem/edit/media/:problemId' component={ProblemEditMedia} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/problem/svg-edit/:problemIdMediaId' component={SvgEdit} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/sector/:sectorId' component={Sector} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/sector/edit/:sectorId' component={SectorEdit} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='/ticks/:page' component={Ticks} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/user' component={User} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/user/:userId' component={User} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/todo' component={Todo} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute exact path='/todo/:userId' component={Todo} accessToken={accessToken} isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect} />
          <PropsRoute path='*' status={404} component={NoMatch} />
        </Switch>
      </Container>
      <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
        <Container textAlign='center'>
          <Grid divided inverted stackable>
            <Grid.Row>
              <Grid.Column width={6}>
                <Header inverted as='h4' content='Bouldering' />
                <List link inverted>
                  <List.Item as='a' href='https://buldreinfo.com' rel='noopener' target='_blank'>buldreinfo.com</List.Item>
                  <List.Item as='a' href='https://buldreforer.tromsoklatring.no' rel='noopener' target='_blank'>buldreforer.tromsoklatring.no</List.Item>
                  <List.Item as='a' href='https://buldring.bergen-klatreklubb.no' rel='noopener' target='_blank'>buldring.bergen-klatreklubb.no</List.Item>
                  <List.Item as='a' href='https://buldring.fredrikstadklatreklubb.org' rel='noopener' target='_blank'>buldring.fredrikstadklatreklubb.org</List.Item>
                  <List.Item as='a' href='https://buldring.jotunheimenfjellsport.com' rel='noopener' target='_blank'>buldring.jotunheimenfjellsport.com</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={6}>
                <Header inverted as='h4' content='Climbing' />
                <List link inverted>
                <List.Item as='a' href='https://brattelinjer.no' rel='noopener' target='_blank'>brattelinjer.no</List.Item>
                <List.Item as='a' href='https://klatreforer.narvikklatreklubb.no' rel='noopener' target='_blank'>klatreforer.narvikklatreklubb.no</List.Item>
                <List.Item as='a' href='https://klatreforer.tromsoklatring.no' rel='noopener' target='_blank'>klatreforer.tromsoklatring.no</List.Item>
                <List.Item as='a' href='https://klatring.jotunheimenfjellsport.com' rel='noopener' target='_blank'>klatring.jotunheimenfjellsport.com</List.Item>
                <List.Item as='a' href='https://tau.fredrikstadklatreklubb.org' rel='noopener' target='_blank'>tau.fredrikstadklatreklubb.org</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={4}>
                <Header inverted as='h4' content='Links' />
                <a href='https://play.google.com/store/apps/details?id=org.jossi.android.bouldering&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'  rel="noopener" target="_blank"><img style={styleGoogle} alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/></a><br/>
                <a href={"http://brv.no/"} rel="noopener" target="_blank"><img style={styleBrv} src={"/png/brv.png"} alt="Bratte Rogalands venner"/></a>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Divider inverted section />
          <List horizontal inverted divided link>
            <List.Item as={Link} to='/ethics'>Ethics</List.Item>
            <List.Item as={Link} to='/hse'>HSE</List.Item>
            <List.Item as='a' href='mailto:jostein.oygarden@gmail.com'>Contact</List.Item>
            <List.Item as='a' href='/gpl-3.0.txt' rel='noopener' target='_blank'>GNU Public License</List.Item>
          </List>
          <p>
            Buldreinfo &amp; Bratte Linjer &copy; 2006-2019
          </p>
        </Container>
      </Segment>
    </div>
  );
}

export default withRouter(App);