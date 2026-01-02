import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { Feed, Segment, Header, Label, Button } from 'semantic-ui-react';
import { useAccessToken, useProblem, postComment } from '../../../api';
import Media from '../../common/media/media';
import Avatar from '../../common/avatar/avatar';
import { useMeta } from '../../common/meta/context';
import Linkify from 'linkify-react';
import { components } from '../../../@types/buldreinfo/swagger';

export const ProblemComments = ({
  problemId,
  showHiddenMedia,
  onShowCommentModal,
  orderableMedia,
  carouselMedia,
}: {
  problemId: number;
  showHiddenMedia: boolean;
  orderableMedia: components['schemas']['Media'][];
  carouselMedia: components['schemas']['Media'][];
  onShowCommentModal: (comment: components['schemas']['ProblemComment']) => void;
}) => {
  const accessToken = useAccessToken();
  const meta = useMeta();
  const { data } = useProblem(+problemId, showHiddenMedia);

  function flagAsDangerous({ id, message }: { id?: number; message?: string }) {
    if (!id || !message) {
      return;
    }
    const pid = data?.id;
    if (!pid) return;
    if (confirm('Are you sure you want to flag this comment?')) {
      postComment(accessToken, id, pid, message, true, false, false, []).catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  function deleteComment(id?: number) {
    if (!id) {
      return;
    }
    const pid = data?.id;
    if (!pid) return;

    if (confirm('Are you sure you want to delete this comment?')) {
      postComment(accessToken, id, pid, null, false, false, true, []).catch((error) => {
        console.warn(error);
        alert(error.toString());
      });
    }
  }

  const comments = data?.comments ?? [];
  const sections = data?.sections ?? [];

  if (comments.length === 0) {
    return null;
  }
  return (
    <Feed as={Segment} style={{ maxWidth: '100%' }}>
      <Header as='h3' dividing>
        Comments
        {comments.length > 0 && <Label circular>{comments.length}</Label>}
      </Header>
      {comments.length ? (
        comments.map((c) => {
          let extra: JSX.Element | null = null;
          if (c.danger) {
            extra = <Label color='red'>Flagged as dangerous</Label>;
          } else if (c.resolved) {
            extra = <Label color='green'>Flagged as safe</Label>;
          } else if (meta.isAuthenticated && meta.isClimbing) {
            extra = (
              <Button basic size='tiny' compact onClick={() => flagAsDangerous(c)}>
                Flag as dangerous
              </Button>
            );
          }
          return (
            <Feed.Event key={c.id} style={{ padding: 0 }}>
              <Feed.Label>
                <Avatar userId={c.idUser} name={c.name} avatarCrc32={c.avatarCrc32} />
              </Feed.Label>
              <Feed.Content>
                {c.editable && (
                  <Button.Group size='tiny' basic compact floated='right'>
                    <Button onClick={() => onShowCommentModal(c)} icon='edit' />
                    <Button onClick={() => deleteComment(c.id)} icon='trash' />
                  </Button.Group>
                )}
                <Feed.Summary>
                  <Feed.User as={Link} to={`/user/${c.idUser}`}>
                    {c.name}
                  </Feed.User>
                  <Feed.Date>{c.date}</Feed.Date>
                </Feed.Summary>
                <Linkify>{c.message}</Linkify>
                {(c.media ?? []).length > 0 && (
                  <Media
                    pitches={sections}
                    media={c.media ?? []}
                    orderableMedia={orderableMedia}
                    carouselMedia={carouselMedia}
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
