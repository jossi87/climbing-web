import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { useParams } from 'react-router-dom';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Header, Image, Icon } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getUserMedia } from '../api';
import Media from './common/media/media';

interface UserMediaParams {
  userId: string;
}
const UserMedia = () => {
  let { userId } = useParams<UserMediaParams>();
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!loading) {
      getUserMedia(accessToken, userId).then((data) => setData(data));
    }
  }, [loading, accessToken, userId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }

  const style = {objectFit: 'cover', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%'};

  return (
    <Segment>
      <MetaTags>
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
      <Header as="h2">
      {data.picture ? <Image size="small" circular src={data.picture}/> : <Icon name='user' />}
        <Header.Content>
          {data.name}
          <Header.Subheader>{data.metadata.description}</Header.Subheader>
        </Header.Content>
      </Header>
      <Media isAdmin={false}
        removeMedia={null}
        media={data.media}
        useBlueNotRed={data.metadata.useBlueNotRed} />
    </Segment>
  );
}

export default UserMedia;
