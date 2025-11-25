import React, { useState } from 'react';
import ImageUpload, { UploadedMedia } from './common/image-upload/image-upload';
import { useAuth0 } from '@auth0/auth0-react';
import { postProblemMedia, useProblem } from '../api';
import { Loading } from './common/widgets/widgets';
import { Segment, Button } from 'semantic-ui-react';
import { useNavigate, useParams } from 'react-router-dom';

const ProblemEditMedia = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [media, setMedia] = useState<UploadedMedia[] | null>(null);
  const [saving, setSaving] = useState(false);
  const { problemId } = useParams();
  const navigate = useNavigate();

  const { data: problem, isLoading } = useProblem(+(problemId || '-1'), false);

  function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      postProblemMedia(accessToken, +(problemId || '-1'), media ?? [])
        .then(async (res) => {
          navigate(`/problem/${res.id}`);
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Segment>
        <h3>Upload image(s) or embed video(s)</h3>
        <form onSubmit={save}>
          <ImageUpload
            onMediaChanged={setMedia}
            isMultiPitch={(problem?.sections ?? []).length > 0}
          />
        </form>
      </Segment>
      <Button.Group>
        <Button onClick={() => navigate(`/problem/${problemId}`)}>Cancel</Button>
        <Button.Or />
        <Button type='submit' positive loading={saving} onClick={save}>
          Save
        </Button>
      </Button.Group>
    </>
  );
};

export default ProblemEditMedia;
