import React, { useState, useEffect } from 'react';
import ImageUpload from './common/image-upload/image-upload';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblem, postProblemMedia } from '../api';
import { LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, Button } from 'semantic-ui-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface ProblemIdParams {
  problemId: string;
}
const ProblemEditMedia = () => {
  const { accessToken, isAuthenticated, loading, loginWithRedirect } = useAuth0();
  const [id, setId] = useState();
  const [isMultiPitch, setIsMultiPitch] = useState(false);
  const [media, setMedia] = useState();
  const [saving, setSaving] = useState(false);
  let { problemId } = useParams<ProblemIdParams>();
  let navigate = useNavigate();
  let location = useLocation();
  useEffect(() => {
    if (problemId && accessToken) {
      getProblem(accessToken, parseInt(problemId), false).then((data) => {
        setId(data.id);
        setIsMultiPitch(data.sections && data.sections.length>1);
      });
    }
  }, [accessToken, problemId]);

  function save(event) {
    event.preventDefault();
    setSaving(true);
    postProblemMedia(accessToken, id, media)
    .then((response) => {
      navigate("/problem/" + response.id);
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  if (loading || (isAuthenticated && !id)) {
    return <LoadingAndRestoreScroll />;
  } else if (!isAuthenticated) {
    loginWithRedirect({appState: { targetUrl: location.pathname }});
  }
  return (
    <Segment>
      <h3>Upload image(s) or embed video(s)</h3>
      <form onSubmit={save}>
        <ImageUpload onMediaChanged={(newMedia) => setMedia(newMedia)} isMultiPitch={isMultiPitch} includeVideoEmbedder={true} />
        <Button.Group>
          <Button onClick={() => navigate(`/problem/${id}`)}>Cancel</Button>
          <Button.Or />
          <Button type="submit" positive loading={saving}>Save</Button>
        </Button.Group>
      </form>
    </Segment>
  );
}

export default ProblemEditMedia;
