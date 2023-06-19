import React, { useState, useEffect } from "react";
import ImageUpload from "./common/image-upload/image-upload";
import { useAuth0 } from "@auth0/auth0-react";
import { getProblem, postProblemMedia } from "../api";
import { Loading } from "./common/widgets/widgets";
import { Segment, Button } from "semantic-ui-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const ProblemEditMedia = () => {
  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [id, setId] = useState(null);
  const [isMultiPitch, setIsMultiPitch] = useState(false);
  const [media, setMedia] = useState(null);
  const [saving, setSaving] = useState(false);
  const { problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (problemId && isAuthenticated) {
      getAccessTokenSilently().then((accessToken) => {
        getProblem(accessToken, parseInt(problemId), false).then((data) => {
          setId(data.id);
          setIsMultiPitch(data.sections && data.sections.length > 1);
        });
      });
    }
  }, [isAuthenticated, problemId]);

  function save(event) {
    event.preventDefault();
    setSaving(true);
    getAccessTokenSilently().then((accessToken) => {
      postProblemMedia(accessToken, id, media)
        .then((res) => {
          navigate("/problem/" + res.id);
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  }

  if (isLoading || (isAuthenticated && !id)) {
    return <Loading />;
  } else if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: location.pathname } });
  } else {
    return (
      <Segment>
        <h3>Upload image(s) or embed video(s)</h3>
        <form onSubmit={save}>
          <ImageUpload
            onMediaChanged={(newMedia) => setMedia(newMedia)}
            isMultiPitch={isMultiPitch}
            includeVideoEmbedder={true}
          />
          <Button.Group>
            <Button onClick={() => navigate(`/problem/${id}`)}>Cancel</Button>
            <Button.Or />
            <Button type="submit" positive loading={saving}>
              Save
            </Button>
          </Button.Group>
        </form>
      </Segment>
    );
  }
};

export default ProblemEditMedia;
