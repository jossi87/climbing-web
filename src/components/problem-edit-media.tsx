import React, { useState, useEffect } from 'react';
import ImageUpload from './common/image-upload/image-upload';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblem, postProblemMedia } from '../api';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Button } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const ProblemEditMedia = () => {
  const { accessToken, isAuthenticated } = useAuth0();
  const [id, setId] = useState();
  const [media, setMedia] = useState();
  const [saving, setSaving] = useState(false);
  let { problemId } = useParams();
  let history = useHistory();
  useEffect(() => {
    if (problemId && accessToken) {
      getProblem(accessToken, parseInt(problemId)).then((data) => {
        setId(data.id);
      });
    }
  }, [accessToken, problemId]);

  function save(event) {
    event.preventDefault();
    setSaving(true);
    postProblemMedia(accessToken, id, media)
    .then((response) => {
      history.push("/problem/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  if (!id || !isAuthenticated) {
    return <LoadingAndRestoreScroll />;
  }
    
  return (
    <Segment>
      <h3>Upload image(s)</h3>
      <form onSubmit={save}>
        <ImageUpload onMediaChanged={(newMedia) => setMedia(newMedia)} />
        <Button.Group>
          <Button onClick={() => window.history.back()}>Cancel</Button>
          <Button.Or />
          <Button type="submit" positive loading={saving}>Save</Button>
        </Button.Group>
      </form>
    </Segment>
  );
}

export default ProblemEditMedia;
