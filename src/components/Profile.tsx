import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Loading } from "./common/widgets/widgets";
import { Header, Image, Menu, Icon } from "semantic-ui-react";
import { getProfile } from "../api";
import { useAuth0 } from "@auth0/auth0-react";
import ProfileStatistics from "./common/profile/profile-statistics";
import ProfileTodo from "./common/profile/profile-todo";
import ProfileMedia from "./common/profile/profile-media";
import ProfileSettings from "./common/profile/profile-settings";

enum Page {
  user,
  todo,
  media,
  captured,
  settings,
}
const Profile = () => {
  let { userId, page } = useParams();
  let navigate = useNavigate();
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [activePage, setActivePage] = useState(page ? Page[page] : Page.user);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!isLoading) {
      if (profile != null) {
        setProfile(null);
      }
      const update = async () => {
        const accessToken = isAuthenticated
          ? await getAccessTokenSilently()
          : null;
        getProfile(accessToken, userId ? parseInt(userId) : -1).then(
          (profile) => setProfile({ ...profile, accessToken })
        );
      };
      update();
    }
  }, [isLoading, isAuthenticated, userId]);

  function onPageChanged(page: Page) {
    setActivePage(page);
    navigate("/user/" + profile.id + "/" + Page[page]);
  }

  if (!profile) {
    return <Loading />;
  }

  const loggedInProfile = profile.userRegions && profile.userRegions.length > 0;

  let content = null;
  if (activePage === Page.user) {
    content = (
      <ProfileStatistics
        accessToken={profile.accessToken}
        userId={profile.id}
        canDownload={loggedInProfile}
        defaultCenter={profile.metadata.defaultCenter}
        defaultZoom={profile.metadata.defaultZoom}
      />
    );
  } else if (activePage === Page.todo) {
    content = (
      <ProfileTodo
        accessToken={profile.accessToken}
        userId={profile.id}
        defaultCenter={profile.metadata.defaultCenter}
        defaultZoom={profile.metadata.defaultZoom}
      />
    );
  } else if (activePage === Page.media) {
    content = (
      <ProfileMedia
        accessToken={profile.accessToken}
        userId={profile.id}
        gradeSystem={profile.metadata.gradeSystem}
        captured={false}
      />
    );
  } else if (activePage === Page.captured) {
    content = (
      <ProfileMedia
        accessToken={profile.accessToken}
        userId={profile.id}
        gradeSystem={profile.metadata.gradeSystem}
        captured={true}
      />
    );
  } else if (activePage === Page.settings) {
    content = (
      <ProfileSettings
        accessToken={profile.accessToken}
        userRegions={profile.userRegions}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.metadata.title}</title>
        <meta name="description" content={profile.metadata.description} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={profile.metadata.description}
        />
        <meta property="og:url" content={profile.metadata.og.url} />
        <meta property="og:title" content={profile.metadata.title} />
        <meta property="og:image" content={profile.metadata.og.image} />
        <meta
          property="og:image:width"
          content={profile.metadata.og.imageWidth}
        />
        <meta
          property="og:image:height"
          content={profile.metadata.og.imageHeight}
        />
        <meta property="fb:app_id" content={profile.metadata.og.fbAppId} />
      </Helmet>
      <Header as="h5" textAlign="center" className="buldreinfo-visible-mobile">
        {profile.picture && <Image circular src={profile.picture} />}
        <Header.Content>
          {profile.firstname} {profile.lastname}
        </Header.Content>
      </Header>
      <Menu pointing icon="labeled" size="mini">
        <Menu.Item header className="buldreinfo-hidden-mobile">
          <Header as="h4">
            {profile.picture && <Image circular src={profile.picture} />}
            <Header.Content>
              {profile.firstname}
              <br />
              {profile.lastname}
            </Header.Content>
          </Header>
        </Menu.Item>
        <Menu.Item
          name={Page[Page.user]}
          active={activePage === Page.user}
          onClick={() => onPageChanged(Page.user)}
        >
          <Icon name="user" />
          User
        </Menu.Item>
        <Menu.Item
          name={Page[Page.todo]}
          active={activePage === Page.todo}
          onClick={() => onPageChanged(Page.todo)}
        >
          <Icon name="bookmark" />
          Todo
        </Menu.Item>
        <Menu.Item
          name={Page[Page.media]}
          active={activePage === Page.media}
          onClick={() => onPageChanged(Page.media)}
        >
          <Icon name="images" />
          Media
        </Menu.Item>
        <Menu.Item
          name={Page[Page.captured]}
          active={activePage === Page.captured}
          onClick={() => onPageChanged(Page.captured)}
        >
          <Icon name="photo" />
          Captured
        </Menu.Item>
        {isAuthenticated && loggedInProfile && (
          <Menu.Item
            name={Page[Page.settings]}
            active={activePage === Page.settings}
            onClick={() => onPageChanged(Page.settings)}
          >
            <Icon name="cogs" />
            Settings
          </Menu.Item>
        )}
      </Menu>
      {content}
    </>
  );
};

export default Profile;
