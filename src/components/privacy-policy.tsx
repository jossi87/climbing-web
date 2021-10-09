import React from 'react';
import MetaTags from 'react-meta-tags';
import { Segment, Header, Icon, List } from 'semantic-ui-react';

const PrivacyPolicy = () => {
  return (
    <>
      <MetaTags>
        <title>Privacy Policy</title>
        <meta name="description" content="Privacy Policy" />
        <meta property="og:type" content="website" />
        <meta property="og:description" content="Privacy Policy" />
      </MetaTags>
      <Segment>
        <Header as="h3">
          <Icon name='law' />
          <Header.Content>Privacy Policy</Header.Content>
          <Header.Subheader>This is a non-profit site. We publish your name but we keep your email address private. We do not send spam.</Header.Subheader>
        </Header>

        <List ordered>
          <List.Item>
            <List.Header>Introduction</List.Header>
            <List.List>
              <List.Item>We are committed to safeguarding the privacy of our website visitors.</List.Item>
              <List.Item>We use cookies on our website. These are not strictly necessary, but will give the users a better experience by remembering user settings.</List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>How we use your personal data</List.Header>
            <List.List>
              <List.Item>We collect and store your data when you create an account. The data we save is your name, email address and profile picture (from login via third party such as Facebook or Google).</List.Item>
              <List.Item>Data you choose to save, such as routes/boulders climbed, and images, can at any time be deleted from your profile page.</List.Item>
              <List.Item>The data you choose to save will increase the quality of the climbing guide, and help other users to choose route/boulder based on logged climbs.</List.Item>
              <List.Item>Your personal data will never be passed on to a third party. This page is a non-profit site, by the climbing community, for the climbing community.</List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>Personal data of children</List.Header>
            <List.List>
              <List.Item>Our website and services are targeted at persons over the age of 13.</List.Item>
              <List.Item>If we have a reason to believe that we hold personal data of a person under that age in our database, we will delete that personal data.</List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>Deleting personal data</List.Header>
            <List.List>
              <List.Item>Most of your personal data can be deleted on your profile page after you log in.</List.Item>
              <List.Item>If you need help, or want to delete data someone else uploaded, please contact Jostein Øygarden on e-mail <a href="mailto:jostein.oygarden@gmail.com">jostein.oygarden@gmail.com</a> with the data you want to delete.</List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>About cookies</List.Header>
            <List.List>
              <List.Item>A cookie is a file containing an identifier (a string of letters and numbers) that is sent by a web server to a web browser and is stored by the browser. The identifier is then sent back to the server each time the browser requests a page from the server.</List.Item>
              <List.Item>Cookies may be either "persistent" cookies or "session" cookies: a persistent cookie will be stored by a web browser and will remain valid until its set expiry date, unless deleted by the user before the expiry date; a session cookie, on the other hand, will expire at the end of the user session, when the web browser is closed.</List.Item>
              <List.Item>Cookies do not typically contain any information that personally identifies a user, but personal information that we store about you may be linked to the information stored in and obtained from cookies.</List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>Cookies that we use</List.Header>
            <List.List>
              <List.Item>Cookie consent - we use cookies to store your preferences in relation to the use of cookies.</List.Item>
              <List.Item>We use Google Analytics to analyse the use of our website. Google Analytics gathers information about website use by means of cookies. The information gathered relating to our website is used to create reports about the use of our website. Google's privacy policy is available at: <a href="https://www.google.com/policies/privacy/" rel='noopener' target='_blank'>https://www.google.com/policies/privacy/</a>.</List.Item>
            </List.List>
          </List.Item>
        </List>
      </Segment>
    </>
  );
}

export default PrivacyPolicy;
