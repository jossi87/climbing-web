import React from "react";
import { Link } from "react-router-dom";
import { Feed, Segment, Header, Label, Button } from "semantic-ui-react";
import { useAccessToken, useProblem, postComment } from "../../../api";
import Media from "../../common/media/media";
import Avatar from "../../common/avatar/avatar";
import { useMeta } from "../../common/meta";
import Linkify from "linkify-react";
import { components } from "../../../@types/buldreinfo/swagger";

export const ProblemComments = ({
  problemId,
  showHiddenMedia,
  onShowCommentModal,
}: {
  problemId: number;
  showHiddenMedia: boolean;
  onShowCommentModal: (comment: components["schemas"]["ProblemComment"]) => void;
}) => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useProblem(+problemId, showHiddenMedia);

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
  return (
    <Feed as={Segment} style={{ maxWidth: "100%" }}>
      <Header as="h3" dividing>
        Comments
        {data.comments?.length > 0 && (
          <Label circular>{data.comments?.length}</Label>
        )}
      </Header>
      {data.comments?.length ? (
        data.comments.map((c) => {
          let extra: React.JSX.Element | null = null;
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
            <Feed.Event key={c.id} style={{ padding: 0 }}>
              <Feed.Label>
                <Avatar
                  userId={c.idUser}
                  name={c.name}
                  avatarCrc32={c.avatarCrc32}
                />
              </Feed.Label>
              <Feed.Content>
                {c.editable && (
                  <Button.Group size="tiny" basic compact floated="right">
                    <Button onClick={() => onShowCommentModal(c)} icon="edit" />
                    <Button onClick={() => deleteComment(c.id)} icon="trash" />
                  </Button.Group>
                )}
                <Feed.Summary>
                  <Feed.User as={Link} to={`/user/${c.idUser}`}>
                    {c.name}
                  </Feed.User>
                  <Feed.Date>{c.date}</Feed.Date>
                </Feed.Summary>
                <Linkify>{c.message}</Linkify>
                {c.media && c.media.length > 0 && (
                  <Media
                    pitches={data.sections}
                    media={c.media}
                    orderableMedia={c.media}
                    carouselMedia={c.media}
                    optProblemId={null}
                    showLocation={false}
                  />
                )}
                {extra && (
                  <>
                    <br />
                    {extra}
                  </>
                )}
              </Feed.Content>
            </Feed.Event>
          );
        })
      ) : (
        <i>No comments</i>
      )}
    </Feed>
  );
};
