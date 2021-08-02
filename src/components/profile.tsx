import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import MetaTags from 'react-meta-tags';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Header, Image, Menu, Icon } from 'semantic-ui-react';
import { getProfile } from '../api';
import { useAuth0 } from '../utils/react-auth0-spa';
import ProfileStatistics from './common/profile/profile-statistics';
import ProfileTodo from './common/profile/profile-todo';
import ProfileMedia from './common/profile/profile-media';
import ProfileSettings from './common/profile/profile-settings';

enum Page {
  user, todo, media, settings
}
interface ProfileParams {
  userId: string;
  page: string;
}
const Profile = () => {
  let { userId, page } = useParams<ProfileParams>();
  let history = useHistory();
  const { loading, isAuthenticated, accessToken } = useAuth0();
  const [activePage, setActivePage] = useState(page? Page[page] : Page.user);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!loading) {
      if (profile != null) {
        setProfile(null);
      }
      getProfile(accessToken, userId? parseInt(userId) : -1).then((profile) => setProfile(profile));
    }
  }, [loading, accessToken, userId]);

  function onPageChanged(page: Page) {
    setActivePage(page);
    history.replace("/user/" + profile.id + "/" + Page[page]);
  }
  
  if (!profile) {
    return <LoadingAndRestoreScroll />;
  }

  const loggedInProfile = profile.userRegions && profile.userRegions.length>0;

  let content = null;
  if (activePage === Page.user) {
      content = <ProfileStatistics accessToken={accessToken} userId={profile.id} canDownload={loggedInProfile} />
  } else if (activePage === Page.todo) {
    content = <ProfileTodo accessToken={accessToken} userId={profile.id} defaultCenter={profile.metadata.defaultCenter} defaultZoom={profile.metadata.defaultZoom} />
  } else if (activePage === Page.media) {
    content = <ProfileMedia accessToken={accessToken} userId={profile.id} gradeSystem={profile.metadata.gradeSystem} />
  } else if (activePage === Page.settings) {
    content = <ProfileSettings accessToken={accessToken} userRegions={profile.userRegions} />
  }
  
  return (
    <>
      <MetaTags>
        <title>{profile.metadata.title}</title>
        <meta name="description" content={profile.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={profile.metadata.description} />
        <meta property="og:url" content={profile.metadata.og.url} />
        <meta property="og:title" content={profile.metadata.title} />
        <meta property="og:image" content={profile.metadata.og.image} />
        <meta property="og:image:width" content={profile.metadata.og.imageWidth} />
        <meta property="og:image:height" content={profile.metadata.og.imageHeight} />
        <meta property="fb:app_id" content={profile.metadata.og.fbAppId} />
      </MetaTags>
      <Header as="h5" textAlign="center" className="buldreinfo-visible-mobile">
        {profile.picture && <Image circular src={profile.picture}/>} 
        <Header.Content>{profile.firstname} {profile.lastname}</Header.Content>
      </Header>
      <Menu pointing icon='labeled' size="mini">
        <Menu.Item header className="buldreinfo-hidden-mobile">
          <Header as="h4">
            {profile.picture && <Image circular src={profile.picture}/>} 
            <Header.Content>{profile.firstname}<br/>{profile.lastname}</Header.Content>
          </Header>
        </Menu.Item>
        <Menu.Item name={Page[Page.user]} active={activePage === Page.user} onClick={() => onPageChanged(Page.user)}>
          <Icon name='user' />
          User
        </Menu.Item>
        <Menu.Item name={Page[Page.todo]} active={activePage === Page.todo} onClick={() => onPageChanged(Page.todo)}>
          <Icon name='tasks' />
          Todo
        </Menu.Item>
        <Menu.Item name={Page[Page.media]} active={activePage === Page.media} onClick={() => onPageChanged(Page.media)}>
          <Icon name='images' />
          Media
        </Menu.Item>
        {isAuthenticated && loggedInProfile &&
          <Menu.Item name={Page[Page.settings]} active={activePage === Page.settings} onClick={() => onPageChanged(Page.settings)}>
            <Icon name='cogs' />
            Settings
          </Menu.Item>
        }
      </Menu>
      {content}
    </>
  )
}

export default Profile;
