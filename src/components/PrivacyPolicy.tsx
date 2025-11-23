import { useMeta } from './common/meta';
import { Segment, Header, Icon, List } from 'semantic-ui-react';

const PrivacyPolicy = () => {
  const meta = useMeta();
  return (
    <>
      <title>{`Privacy Policy | ${meta?.title}`}</title>
      <meta name='description' content='Privacy Policy' />
      <Segment>
        <Header as='h2'>
          <Icon name='law' />
          <Header.Content>
            Privacy Policy
            <Header.Subheader>
              This is a non-profit site. We publish your name but we keep your email address
              private. We do not send spam.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <List ordered>
          <List.Item>
            <List.Header>Introduction</List.Header>
            <List.List>
              <List.Item>
                We are committed to safeguarding the privacy of our website visitors.
              </List.Item>
              <List.Item>
                We use cookies on our website. These are not strictly necessary, but will give the
                users a better experience by remembering user settings.
              </List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>How we use your personal data</List.Header>
            <List.List>
              <List.Item>
                We collect and store your data when you create an account. The data we save is your
                name, email address and profile picture (from login via third party such as Facebook
                or Google).
              </List.Item>
              <List.Item>
                Data you choose to save, such as routes/boulders climbed, and images, can at any
                time be deleted from your profile page.
              </List.Item>
              <List.Item>
                The data you choose to save will increase the quality of the climbing guide, and
                help other users to choose route/boulder based on logged climbs.
              </List.Item>
              <List.Item>
                Your personal data will never be passed on to a third party. This page is a
                non-profit site, by the climbing community, for the climbing community.
              </List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>Personal data of children</List.Header>
            <List.List>
              <List.Item>
                Our website and services are targeted at persons over the age of 13.
              </List.Item>
              <List.Item>
                If we have a reason to believe that we hold personal data of a person under that age
                in our database, we will delete that personal data.
              </List.Item>
            </List.List>
          </List.Item>
          <List.Item>
            <List.Header>Deleting personal data</List.Header>
            <List.List>
              <List.Item>
                Most of your personal data can be deleted on your profile page after you log in.
              </List.Item>
              <List.Item>
                If you need help, or want to delete data someone else uploaded, please contact
                Jostein Øygarden on e-mail{' '}
                <a href='mailto:jostein.oygarden@gmail.com'>jostein.oygarden@gmail.com</a> with the
                data you want to delete.
              </List.Item>
            </List.List>
          </List.Item>
        </List>
      </Segment>
    </>
  );
};

export default PrivacyPolicy;
