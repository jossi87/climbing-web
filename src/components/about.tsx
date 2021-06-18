import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { Segment, Header, Icon, List, Image } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { getAbout } from '../api';

const About = () => {
  const { accessToken } = useAuth0();
  const [data, setData] = useState(null);
  useEffect(() => {
    getAbout(accessToken).then((data) => setData(data));
  }, [accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }

  return (
    <>
      <MetaTags>
        {data.metadata.canonical && <link rel="canonical" href={data.metadata.canonical} />}
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </MetaTags>
      {data.administrators && data.administrators.length>0 &&
        <Segment>
          <Header as="h3">
            <Icon name='users' />
            <Header.Content>Administrators</Header.Content>
            <Header.Subheader>{data.administrators.length} users</Header.Subheader>
          </Header>
          <List>
            {data.administrators.map((u, key) => (
              <List.Item key={key}>
                <Image src={u.picture? u.picture : '/png/image.png'} />
                <List.Content>
                  <List.Header as={Link} to={`/user/${u.userId}`}>{u.name}</List.Header>
                  <List.Description>
                    Last seen {u.lastLogin}
                  </List.Description>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>
      }
      <Segment>
        <Header as="h3">
          <Icon name='pencil' />
          <Header.Content>Ethics</Header.Content>
        </Header>
        If you&#39;re going out climbing, we ask you to please follow these guidelines for the best possible bouldering experience now, and for the future generations of climbers.<br/>
        <ul>
          <li>Show respect for the landowners, issue care and be polite.</li>
          <li>Follow paths where possible, and do not cross cultivated land.</li>
          <li>Take your trash back with you.</li>
          <li>Park with reason, and think of others. Make room for potential tractors and such if necessary.</li>
          <li>Start where directed, and don&#39;t hesitate to ask if your unsure.</li>
          <li>Sit start means that the behind should be the last thing to leave the ground/crashpad.</li>
          <li>No chipping allowed.</li>
          <li>Remember climbing can be dangerous and always involves risk. Your safety is your own responsibility.</li>
          <li>Use common sense!</li>
        </ul>
      </Segment>
      <Segment>
        <Header as="h3">
          <Icon name='eye' />
          <Header.Content>Privacy policy</Header.Content>
        </Header>
        We respect your privacy and handle your data with the care that we would expect our own data to be handled. We will never sell or pass on your information to any third party. You can delete any of your profile information at any time, <a href="mailto:jostein.oygarden@gmail.com">send us an e-mail</a> with the data you want to delete.
      </Segment>
    </>
  );
}

export default About;
