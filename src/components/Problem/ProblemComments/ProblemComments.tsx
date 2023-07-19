import React from "react";
import { Link } from "react-router-dom";
import { Comment, Segment, Header, Label, Button } from "semantic-ui-react";
import { useAccessToken, useProblem, postComment } from "../../../api";
import Media from "../../common/media/media";
import { useMeta } from "../../common/meta";
import Linkify from "react-linkify";
import { componentDecorator } from "../../../utils/componentDecorator";

export const ProblemComments = ({
  problemId,
  showHiddenMedia,
  onShowCommentModal,
}: {
  problemId: number;
  showHiddenMedia: boolean;
  onShowCommentModal: (comment: any) => void;
}) => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useProblem(+problemId, showHiddenMedia);

  function flagAsDangerous({ id, message }) {
    if (confirm("Are you sure you want to flag this comment?")) {
      postComment(
        accessToken,
        id,
        data.id,
        message,
        true,
        false,
        false,
        [],
      ).catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  function deleteComment({ id }) {
    if (confirm("Are you sure you want to delete this comment?")) {
      postComment(accessToken, id, data.id, null, false, false, true, []).catch(
        (error) => {
          console.warn(error);
          alert(error.toString());
        },
      );
    }
  }

  if (!data) {
    return null;
  }

  return (
    <Comment.Group as={Segment}>
      <Header as="h3" dividing>
        Comments:
      </Header>
      {data.comments?.length ? (
        data.comments.map((c) => {
          let extra: JSX.Element | null = null;
          if (c.danger) {
            extra = <Label color="red">Flagged as dangerous</Label>;
          } else if (c.resolved) {
            extra = <Label color="green">Flagged as safe</Label>;
          } else if (meta.isAuthenticated && meta.isClimbing) {
            extra = (
              <Button
                basic
                size="tiny"
                compact
                onClick={() => flagAsDangerous(c)}
              >
                Flag as dangerous
              </Button>
            );
          }
          return (
            <Comment key={[c.idUser, c.date].join("@")}>
              <Comment.Avatar src={c.picture ? c.picture : "/png/image.png"} />
              <Comment.Content>
                {c.editable && (
                  <Button.Group size="tiny" basic compact floated="right">
                    <Button onClick={() => onShowCommentModal(c)} icon="edit" />
                    <Button onClick={() => deleteComment(c)} icon="trash" />
                  </Button.Group>
                )}
                <Comment.Author as={Link} to={`/user/${c.idUser}`}>
                  {c.name}
                </Comment.Author>
                <Comment.Metadata>{c.date}</Comment.Metadata>
                <Comment.Text>
                  <Linkify componentDecorator={componentDecorator}>
                    {c.message}
                  </Linkify>
                  {c.media && c.media.length > 0 && (
                    <Media
                      numPitches={data.sections?.length || 0}
                      media={c.media}
                      optProblemId={null}
                    />
                  )}
                </Comment.Text>
                {extra && <Comment.Actions>{extra}</Comment.Actions>}
              </Comment.Content>
            </Comment>
          );
        })
      ) : (
        <i>No comments</i>
      )}
    </Comment.Group>
  );
};
