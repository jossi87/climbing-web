import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Container, Divider, Grid, Header, List, Segment } from 'semantic-ui-react'
import { Link, Route, Switch } from 'react-router-dom';
import routes from './routes';
import Navigation from './components/navigation';
import ReactGA from 'react-ga';
import Auth from './utils/auth';

if (__isBrowser__) {
  ReactGA.initialize('UA-76534258-1');
}

function Analytics(props) {
  if (__isBrowser__) {
    ReactGA.set({ page: props.location.pathname + props.location.search });
    ReactGA.pageview(props.location.pathname + props.location.search);
  }
  return null;
};

class App extends Component {
  auth;
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.auth = new Auth(cookies);
  }

  componentDidMount() {
    this.auth.silentAuthentication();
  }

  render() {
    const thisAuth = this.auth;
    const isAuthenticated = thisAuth.isAuthenticated();
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
        <Switch>
          {routes.map(({ path, exact, component: Component, ...rest }) => (
            <Route key={path} path={path} exact={exact} render={(props: any) => {
              props.isAuthenticated = isAuthenticated;
              props.auth = thisAuth;
              return (
                <>
                  <Analytics {...props}/>
                  <Navigation {...props}/>
                  <Container style={{ marginTop: '1em' }}>
                    <Component {...props} {...rest} />
                  </Container>
                </>
              )
            }} />
          ))}
        </Switch>
        <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
          <Container textAlign='center'>
            <Grid divided inverted stackable>
              <Grid.Row>
                <Grid.Column width={6}>
                  <Header inverted as='h4' content='Bouldering' />
                  <List link inverted>
                    <List.Item as='a' href='https://buldreinfo.com' rel='noopener' target='_blank'>buldreinfo.com</List.Item>
                    <List.Item as='a' href='https://buldring.bergen-klatreklubb.no' rel='noopener' target='_blank'>buldring.bergen-klatreklubb.no</List.Item>
                    <List.Item as='a' href='https://buldring.fredrikstadklatreklubb.org' rel='noopener' target='_blank'>buldring.fredrikstadklatreklubb.org</List.Item>
                    <List.Item as='a' href='https://buldring.jotunheimenfjellsport.com' rel='noopener' target='_blank'>buldring.jotunheimenfjellsport.com</List.Item>
                  </List>
                </Grid.Column>
                <Grid.Column width={6}>
                  <Header inverted as='h4' content='Climbing' />
                  <List link inverted>
                  <List.Item as='a' href='https://brattelinjer.no' rel='noopener' target='_blank'>brattelinjer.no</List.Item>
                  <List.Item as='a' href='https://klatring.jotunheimenfjellsport.com' rel='noopener' target='_blank'>klatring.jotunheimenfjellsport.com</List.Item>
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
              Buldreinfo &amp; Bratte Linjer &copy; 2006-2018
            </p>
          </Container>
        </Segment>
      </div>
    );
  }
}

export default withCookies(App);
