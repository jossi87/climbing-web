import React, { useState, useEffect } from 'react';
import { LoadingAndRestoreScroll } from './../../common/widgets/widgets';
import { Segment } from 'semantic-ui-react';
import { getProfileMedia } from '../../../api';
import Media from '../../common/media/media';

const ProfileMedia = ({accessToken, userId, gradeSystem}) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (data != null) {
      setData(null);
    }
    getProfileMedia(accessToken, userId).then((data) => setData(data));
  }, [accessToken, userId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  else if (data.length === 0) {
    return <Segment>Empty list.</Segment>;
  }

  return (
    <Segment>
      <Media isAdmin={false}
        removeMedia={null}
        media={data}
        optProblemId={null}
        isBouldering={gradeSystem==='BOULDER'} />
    </Segment>
  );
}

export default ProfileMedia;
