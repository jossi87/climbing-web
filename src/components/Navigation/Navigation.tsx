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
              src='/png/logo_70x62.png'
              alt='Bratte Linjer Logo'
              title='Bratte Linjer Home'
              width='35'
              loading='eager'
              style={{ width: '35px', height: 'auto' }}
            />
          </Menu.Item>
          <Menu.Item as={SearchBox} style={{ flex: 1 }} aria-label='Search' />
        </div>
        {activeSite && (
          <Dropdown
            item
            simple
            labeled
            aria-label={`Current region: ${activeSite.name}. Click to change region.`}
            trigger={
              <>
                <Icon name='world' aria-hidden='true' />
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
                  <Dropdown.Item
                    active={s.active}
                    key={s.name}
                    as={Link}
                    to={s.url}
                    role='option'
                    aria-selected={s.active}
                  >
                    {s.name}
                  </Dropdown.Item>
                ))}
              <Dropdown.Divider />
              <Dropdown.Header>ALL SITES (MAP)</Dropdown.Header>
              {sites
                .map((g) => g.group)
                .filter((x, i, a) => a.indexOf(x) == i)
                .map((g) => (
                  <Dropdown.Item
                    key={g}
                    as={Link}
                    to={'/sites/' + g.toLowerCase()}
                    role='option'
                    aria-selected='false'
                  >
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
              aria-label='Account Menu. Click to view profile or sign out.'
              trigger={
                <>
                  <Icon name='user' aria-hidden='true' />
                  <span>Account</span>
                </>
              }
              icon={null}
              className='collapse-1'
            >
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to='/user' role='option' aria-selected='false'>
                  <Icon name='user' aria-hidden='true' />
                  Profile
                </Dropdown.Item>
                {(isAdmin || isSuperAdmin) && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to='/trash' role='option' aria-selected='false'>
                      <Icon name='trash' aria-hidden='true' />
                      Trash
                    </Dropdown.Item>
                    {isSuperAdmin && (
                      <>
                        <Dropdown.Item
                          as={Link}
                          to='/permissions'
                          role='option'
                          aria-selected='false'
                        >
                          <Icon name='users' aria-hidden='true' />
                          Permissions
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to='/swagger' role='option' aria-selected='false'>
                          <Icon name='code' aria-hidden='true' />
                          Swagger
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Item
                      as={Link}
                      to='/pdf/20230525_administrator_doc.pdf'
                      target='_blank'
                      rel='noopener noreferrer'
                      role='option'
                      aria-selected='false'
                    >
                      <Icon name='help' aria-hidden='true' />
                      Help
                    </Dropdown.Item>
                  </>
                )}
                <Dropdown.Divider />
                <Dropdown.Item
                  as='a'
                  onClick={() => logout({ logoutParams: { returnTo: window.origin } })}
                  role='option'
                  aria-selected='false'
                >
                  <Icon name='sign out' aria-hidden='true' />
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
              aria-label='Sign in to your account'
            >
              <Icon name='sign in' aria-hidden='true' />
              <span>Sign in</span>
            </Menu.Item>
          ))}
      </Container>
    </Menu>
  );
};
