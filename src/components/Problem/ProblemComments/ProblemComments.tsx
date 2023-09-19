import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Comment, Segment, Header, Label, Button } from "semantic-ui-react";
import { useAccessToken, useProblem, postComment } from "../../../api";
import Media from "../../common/media/media";
import { useMeta } from "../../common/meta";
import Linkify from "react-linkify";
import { componentDecorator } from "../../../utils/componentDecorator";
import { components } from "../../../@types/buldreinfo/swagger";

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
  const [collapseComments, setCollapseComments] = useState(true);

  const CommentBody = ({
    c,
    expandable,
  }: {
    c: components["schemas"]["ProblemComment"];
    expandable?: boolean;
  }) => {
    let extra: JSX.Element | null = null;
    if (c.danger) {
      extra = <Label color="red">Flagged as dangerous</Label>;
    } else if (c.resolved) {
      extra = <Label color="green">Flagged as safe</Label>;
    } else if (meta.isAuthenticated && meta.isClimbing) {
      extra = (
        <Button basic size="tiny" compact onClick={() => flagAsDangerous(c)}>
          Flag as dangerous
        </Button>
      );
    }
    return (
      <>
        <Comment.Avatar src={c.picture ? c.picture : "/png/image.png"} />
        <Comment.Content>
          {(c.editable || expandable) && (
            <Button.Group size="tiny" basic compact floated="right">
              {c.editable && (
                <>
                  <Button onClick={() => onShowCommentModal(c)} icon="edit" />
                  <Button onClick={() => deleteComment(c.id)} icon="trash" />
                </>
              )}
              {expandable && (
                <Button
                  onClick={() => setCollapseComments(!collapseComments)}
                  icon={collapseComments ? "plus" : "minus"}
                />
              )}
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
                orderableMedia={c.media}
                carouselMedia={c.media}
                optProblemId={null}
                showLocation={false}
              />
            )}
          </Comment.Text>
          {extra && <Comment.Actions>{extra}</Comment.Actions>}
        </Comment.Content>
      </>
    );
  };

  function flagAsDangerous({ id, message }: { id?: number; message?: string }) {
    if (!id || !message) {
      return;
    }
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

  function deleteComment(id?: number) {
    if (!id) {
      return;
    }

    if (confirm("Are you sure you want to delete this comment?")) {
      postComment(accessToken, id, data.id, null, false, false, true, []).catch(
        (error) => {
          console.warn(error);
          alert(error.toString());
        },
      );
    }
  }

  if (data.comments?.length == 0) {
    return null;
  }
  const latestSafetyComment = data.comments
    ?.filter((c) => c.danger || c.resolved)
    .reduce((prev, current) => (prev?.id > current.id ? prev : current), null);
  const rootComments = data.comments?.filter(
    (c) => (!c.danger && !c.resolved) || c.id == latestSafetyComment?.id,
  );
  const safetyHistoryComments =
    latestSafetyComment &&
    data.comments?.filter(
      (c) => (c.danger || c.resolved) && c.id !== latestSafetyComment.id,
    );

  return (
    <Comment.Group threaded as={Segment} style={{ maxWidth: "100%" }}>
      <Header as="h3" dividing>
        Comments
        {data.comments?.length > 0 && (
          <Label circular>{data.comments?.length}</Label>
        )}
      </Header>
      {rootComments?.length ? (
        rootComments.map((c) => (
          <Comment key={c.id}>
            <CommentBody
              c={c}
              expandable={
                c.id === latestSafetyComment?.id &&
                safetyHistoryComments?.length > 0
              }
            />
            {c.id === latestSafetyComment?.id &&
              safetyHistoryComments?.length > 0 && (
                <Comment.Group collapsed={collapseComments}>
                  {safetyHistoryComments.map((cHistory) => (
                    <Comment key={cHistory.id}>
                      <CommentBody c={cHistory} />
                    </Comment>
                  ))}
                </Comment.Group>
              )}
          </Comment>
        ))
      ) : (
        <i>No comments</i>
      )}
    </Comment.Group>
  );
};
