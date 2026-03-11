import { useAuth0 } from '@auth0/auth0-react';
import { Container, Dropdown, Image, Menu, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import SearchBox from '../common/search-box/search-box';
import { useMeta } from '../common/meta/context';
import './Navigation.css';

export const Navigation = () => {
  const { isAdmin, isSuperAdmin, isAuthenticated, isBouldering, sites } = useMeta();
  const { isLoading, loginWithRedirect, logout } = useAuth0();
  const activeSite = sites?.filter((s) => s.active)[0];

  return (
    <Menu attached='top' inverted compact borderless>
      <Container className='nav-container'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
          }}
          className='row-1'
        >
          <Menu.Item header as={Link} to='/' aria-label='Home'>
            <Image
              size='mini'
              src='/png/logo_35x30.png'
              alt='Bratte Linjer Logo'
              title='Bratte Linjer Home'
              width='35'
              height='30'
              loading='eager'
              style={{ width: '35px', height: '30px' }}
            />
          </Menu.Item>
          <Menu.Item as={SearchBox} style={{ flex: 1 }} aria-label='Search' />
        </div>
        {activeSite && (
          <Dropdown
            item
            simple
            labeled
            aria-label='Select Region'
            trigger={
              <>
                <Icon role='img' name='world' aria-label='Select Region' />
                <span>{activeSite.name}</span>
              </>
            }
            icon={null}
          >
            <Dropdown.Menu>
              <Dropdown.Header>{activeSite.group} REGIONS</Dropdown.Header>
              {sites
                .filter((s) => s.group === activeSite.group)
                .map((s) => (
                  <Dropdown.Item active={s.active} key={s.name} as={Link} to={s.url}>
                    {s.name}
                  </Dropdown.Item>
                ))}
              <Dropdown.Divider />
              <Dropdown.Header>ALL SITES (MAP)</Dropdown.Header>
              {sites
                .map((g) => g.group)
                .filter((x, i, a) => a.indexOf(x) == i)
                .map((g) => (
                  <Dropdown.Item key={g} as={Link} to={'/sites/' + g.toLowerCase()}>
                    {g}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        <Menu.Item as={Link} to='/areas' aria-label='Areas list'>
          <Icon role='img' name='list' aria-label='Areas list' />
          <span>Areas</span>
        </Menu.Item>
        <Menu.Item
          as={Link}
          to='/problems'
          aria-label={isBouldering ? 'Bouldering problems' : 'Climbing routes'}
        >
          <Icon
            role='img'
            name='database'
            aria-label={isBouldering ? 'Bouldering problems' : 'Climbing routes'}
          />
          <span>{isBouldering ? 'Problems' : 'Routes'}</span>
        </Menu.Item>
        {!isBouldering && (
          <Menu.Item as={Link} to='/dangerous' aria-label='Dangerous routes warning'>
            <Icon role='img' name='warning sign' aria-label='Dangerous routes warning' />
            <span>Dangerous</span>
          </Menu.Item>
        )}
        <Menu.Item as={Link} to='/graph' className='collapse-1' aria-label='Statistics and graphs'>
          <Icon role='img' name='chart bar' aria-label='Statistics and graphs' />
          <span>Graph</span>
        </Menu.Item>
        <Menu.Item as={Link} to='/webcams' className='collapse-1' aria-label='Crag webcams'>
          <Icon role='img' name='camera' aria-label='Crag webcams' />
          <span>Webcams</span>
        </Menu.Item>
        <Menu.Item as={Link} to='/about' className='collapse-1' aria-label='About this site'>
          <Icon role='img' name='info' aria-label='About this site' />
          <span>About</span>
        </Menu.Item>
        {!isLoading &&
          (isAuthenticated ? (
            <Dropdown
              item
              simple
              labeled
              aria-label='Account Menu'
              trigger={
                <>
                  <Icon role='img' name='user' aria-label='Account Menu' />
                  <span>Account</span>
                </>
              }
              icon={null}
              className='collapse-1'
            >
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to='/user'>
                  <Icon name='user' />
                  Profile
                </Dropdown.Item>
                {(isAdmin || isSuperAdmin) && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to='/trash'>
                      <Icon name='trash' />
                      Trash
                    </Dropdown.Item>
                    {isSuperAdmin && (
                      <>
                        <Dropdown.Item as={Link} to='/permissions'>
                          <Icon name='users' />
                          Permissions
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to='/swagger'>
                          <Icon name='code' />
                          Swagger
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Item
                      as={Link}
                      to='/pdf/20230525_administrator_doc.pdf'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Icon name='help' />
                      Help
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Divider />
                <Dropdown.Item
                  as='a'
                  onClick={() => logout({ logoutParams: { returnTo: window.origin } })}
                >
                  <Icon name='sign out' />
                  Sign out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Menu.Item
              as='a'
              href='/login'
              onClick={(e) => {
                e.preventDefault();
                loginWithRedirect({ appState: { returnTo: location.pathname } });
              }}
              className='collapse-1'
            >
              <Icon name='sign in' />
              <span>Sign in</span>
            </Menu.Item>
          ))}
      </Container>
    </Menu>
  );
};
