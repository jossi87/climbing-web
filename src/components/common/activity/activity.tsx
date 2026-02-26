import type { CSSProperties, SyntheticEvent } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';
import { Link } from 'react-router-dom';
import {
  Label,
  Icon,
  Image,
  Feed,
  Segment,
  Placeholder,
  Button,
  Dropdown,
} from 'semantic-ui-react';
import { useInView } from 'react-intersection-observer';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useMeta } from '../../common/meta/context';
import { getMediaFileUrl, useActivity } from '../../../api';
import Avatar from '../../common/avatar/avatar';
import { LockSymbol, Stars } from './../../common/widgets/widgets';
import Linkify from 'linkify-react';

type ProblemNameProps = {
  a: components['schemas']['Activity'];
};

function ProblemName({ a }: ProblemNameProps) {
  return (
    <>
      <span style={{ opacity: 0.6, fontSize: '80%' }}>
        <Feed.User as={Link} to={`/area/${a.areaId}`} style={{ color: 'black' }}>
          {a.areaName}
        </Feed.User>
        <LockSymbol lockedAdmin={a.areaLockedAdmin} lockedSuperadmin={a.areaLockedSuperadmin} />
        {' / '}
        <Feed.User as={Link} to={`/sector/${a.sectorId}`} style={{ color: 'black' }}>
          {a.sectorName}
        </Feed.User>
        <LockSymbol lockedAdmin={a.sectorLockedAdmin} lockedSuperadmin={a.sectorLockedSuperadmin} />
        {' / '}
      </span>
      <Feed.User as={Link} to={`/problem/${a.problemId}`}>
        {a.problemName}
      </Feed.User>{' '}
      {a.grade}
      {a.problemSubtype && (
        <Label basic size='mini'>
          {a.problemSubtype}
        </Label>
      )}
      <LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} />
    </>
  );
}

const LazyLoadedMedia = ({
  media,
  problemId,
  imgStyle,
}: {
  media: components['schemas']['Media'][];
  problemId?: number;
  imgStyle: CSSProperties;
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  const numericHeight = 80;
  const numericWidth = 85;

  return (
    <Feed.Extra images ref={ref}>
      {media.map((m) => (
        <Link key={m.id ?? 0} to={`/problem/${problemId ?? 0}/${m.id ?? 0}`}>
          {inView ? (
            <Image
              style={imgStyle}
              width={numericWidth}
              height={numericHeight}
              src={getMediaFileUrl(Number(m.id ?? 0), Number(m.versionStamp ?? 0), false, {
                minDimension: numericWidth,
              })}
              onError={(e: SyntheticEvent<HTMLImageElement>) =>
                ((e.target as HTMLImageElement).src = '/png/video_placeholder.png')
              }
            />
          ) : (
            <div
              style={{
                ...imgStyle,
                backgroundColor: '#e0e0e0',
                width: `${numericWidth}px`,
                height: `${numericHeight}px`,
              }}
            ></div>
          )}
        </Link>
      ))}
    </Feed.Extra>
  );
};

type Props = {
  idArea: number;
  idSector: number;
};

const Activity = ({ idArea, idSector }: Props) => {
  const [lowerGradeId, setLowerGradeId] = useLocalStorage('lower_grade_id', 0);
  const [lowerGradeText, setLowerGradeText] = useLocalStorage('lower_grade_text', 'n/a');
  const [activityTypeTicks, setActivityTypeTicks] = useLocalStorage('activity_type_ticks', true);
  const [activityTypeFa, setActivityTypeFa] = useLocalStorage('activity_type_fa', true);
  const [activityTypeComments, setActivityTypeComments] = useLocalStorage(
    'activity_type_comments',
    true,
  );
  const [activityTypeMedia, setActivityTypeMedia] = useLocalStorage('activity_type_media', true);

  const meta = useMeta();
  const { data: activity, refetch } = useActivity({
    idArea,
    idSector,
    lowerGrade: lowerGradeId,
    fa: activityTypeFa,
    comments: activityTypeComments,
    ticks: activityTypeTicks,
    media: activityTypeMedia,
  });

  const gradeOptions = meta.grades.map((g) => ({
    key: g.id,
    text: g.grade,
    value: g.id,
  }));

  if (
    meta.grades.filter((g) => {
      const gradeText = g.grade.includes('(')
        ? g.grade.substring(g.grade.indexOf('(') + 1).replace(')', '')
        : g.grade;
      return gradeText === lowerGradeText && g.id === lowerGradeId;
    }).length === 0
  ) {
    if (lowerGradeId !== 0) setLowerGradeId(0);
    if (lowerGradeText !== 'n/a') setLowerGradeText('n/a');
    if (!activityTypeTicks) setActivityTypeTicks(true);
    if (!activityTypeFa) setActivityTypeFa(true);
    if (!activityTypeComments) setActivityTypeComments(true);
    if (!activityTypeMedia) setActivityTypeMedia(true);
  }

  const imgStyle = {
    height: 'fit-content',
    maxHeight: '80px',
    objectFit: 'cover' as const,
    verticalAlign: 'top' as const,
  };

  return (
    <>
      <Segment vertical style={{ paddingTop: 0 }}>
        <Button.Group size='mini' compact>
          <Dropdown
            button
            floating
            compact
            className='icon'
            scrolling
            options={gradeOptions}
            trigger={
              <span>
                <Icon name='filter' />
                {'Lower grade: ' + lowerGradeText}
              </span>
            }
            onChange={(_e, { value }) => {
              const selectedGrade = meta.grades.find((g) => g.id === value);
              if (selectedGrade) {
                const gradeText = selectedGrade.grade.includes('(')
                  ? selectedGrade.grade
                      .substring(selectedGrade.grade.indexOf('(') + 1)
                      .replace(')', '')
                  : selectedGrade.grade;
                setLowerGradeId(selectedGrade.id);
                setLowerGradeText(gradeText);
                refetch();
              }
            }}
          />
          <Button
            animated='fade'
            inverted={!activityTypeFa}
            onClick={() => {
              setActivityTypeFa(!activityTypeFa);
              refetch();
            }}
          >
            <Button.Content hidden>FA</Button.Content>
            <Button.Content visible>
              <Icon name='plus' color='black' />
            </Button.Content>
          </Button>
          <Button
            animated='fade'
            inverted={!activityTypeTicks}
            onClick={() => {
              setActivityTypeTicks(!activityTypeTicks);
              refetch();
            }}
          >
            <Button.Content hidden>Tick</Button.Content>
            <Button.Content visible>
              <Icon name='check' color='black' />
            </Button.Content>
          </Button>
          <Button
            animated='fade'
            inverted={!activityTypeMedia}
            onClick={() => {
              setActivityTypeMedia(!activityTypeMedia);
              refetch();
            }}
          >
            <Button.Content hidden>Media</Button.Content>
            <Button.Content visible>
              <Icon name='images' color='black' />
            </Button.Content>
          </Button>
          <Button
            animated='fade'
            inverted={!activityTypeComments}
            onClick={() => {
              setActivityTypeComments(!activityTypeComments);
              refetch();
            }}
          >
            <Button.Content hidden>Com</Button.Content>
            <Button.Content visible>
              <Icon name='comments' color='black' />
            </Button.Content>
          </Button>
        </Button.Group>
      </Segment>

      {!activity && (
        <Segment vertical>
          <Placeholder fluid>
            {[...Array(15)].map((_, i) => (
              <Placeholder.Header image key={i}>
                <Placeholder.Line length='medium' />
                <Placeholder.Line length='short' />
              </Placeholder.Header>
            ))}
          </Placeholder>
        </Segment>
      )}

      {activity && activity.length === 0 && <Segment vertical>No recent activity</Segment>}

      {activity && activity.length !== 0 && (
        <Feed>
          {activity.map((a) => {
            const currentKey = a.activityIds?.join('+') ?? `activity-${a.id ?? 0}`;

            // FA
            if (a.users) {
              const typeDescription = meta.isBouldering ? 'problem' : 'route';
              return (
                <Feed.Event key={currentKey}>
                  <Feed.Label>
                    {(a.problemRandomMediaId ?? 0) > 0 && (
                      <img
                        style={{ height: '35px', width: '35px', objectFit: 'cover' }}
                        width='35'
                        height='35'
                        src={getMediaFileUrl(
                          Number(a.problemRandomMediaId ?? 0),
                          Number(a.problemRandomMediaVersionStamp ?? 0),
                          false,
                          { minDimension: 35 },
                        )}
                        onError={(e: SyntheticEvent<HTMLImageElement>) =>
                          ((e.target as HTMLImageElement).src = '/png/video_placeholder.png')
                        }
                      />
                    )}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      New {typeDescription} <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra text>{a.description}</Feed.Extra>
                    {a.media && (
                      <>
                        <LazyLoadedMedia
                          media={a.media}
                          problemId={a.problemId}
                          imgStyle={imgStyle}
                        />
                        <br />
                      </>
                    )}
                    <Feed.Meta>
                      {a.users.map((u) => (
                        <Label basic key={u.id} as={Link} to={`/user/${u.id}`} image>
                          <Avatar
                            name={u.name}
                            mediaId={u.mediaId}
                            mediaVersionStamp={u.mediaVersionStamp}
                          />{' '}
                          {u.name}
                        </Label>
                      ))}
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              );
            }
            // Comments
            else if (a.message) {
              return (
                <Feed.Event key={currentKey}>
                  <Feed.Label>
                    <Avatar
                      name={a.name}
                      mediaId={a.mediaId}
                      mediaVersionStamp={a.mediaVersionStamp}
                    />
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User as={Link} to={`/user/${a.id}`} style={{ color: 'black' }}>
                        {a.name}
                      </Feed.User>{' '}
                      posted a comment on <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra text>
                      <Linkify>{a.message}</Linkify>
                    </Feed.Extra>
                    {a.media && (
                      <>
                        <LazyLoadedMedia
                          media={a.media}
                          problemId={a.problemId ?? 0}
                          imgStyle={imgStyle}
                        />
                        <br />
                      </>
                    )}
                  </Feed.Content>
                </Feed.Event>
              );
            }
            // Media
            else if (a.media) {
              const [numImg, numMov] = a.media.reduce(
                (acc, { movie }) => (movie ? [acc[0], acc[1] + 1] : [acc[0] + 1, acc[1]]),
                [0, 0],
              );

              const summaryText = (
                <>
                  {numImg > 0 && (
                    <>
                      {numImg} new <Icon name='photo' />{' '}
                    </>
                  )}
                  {numImg > 0 && numMov > 0 && 'and '}
                  {numMov > 0 && (
                    <>
                      {numMov} new <Icon name='film' />
                    </>
                  )}
                </>
              );

              return (
                <Feed.Event key={currentKey}>
                  <Feed.Label>
                    {(a.problemRandomMediaId ?? 0) > 0 && (
                      <img
                        style={{ height: '35px', width: '35px', objectFit: 'cover' }}
                        width='35'
                        height='35'
                        src={getMediaFileUrl(
                          Number(a.problemRandomMediaId ?? 0),
                          Number(a.problemRandomMediaVersionStamp ?? 0),
                          false,
                          { minDimension: 35 },
                        )}
                        onError={(e: SyntheticEvent<HTMLImageElement>) =>
                          ((e.target as HTMLImageElement).src = '/png/video_placeholder.png')
                        }
                      />
                    )}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary style={{ marginBottom: '3px' }}>
                      {summaryText} on <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <LazyLoadedMedia
                      media={a.media}
                      problemId={a.problemId ?? 0}
                      imgStyle={imgStyle}
                    />
                  </Feed.Content>
                </Feed.Event>
              );
            }
            // Ticks
            else {
              const action = a.repeat ? 'repeated' : 'ticked';
              return (
                <Feed.Event key={currentKey}>
                  <Feed.Label>
                    <Avatar
                      name={a.name}
                      mediaId={a.mediaId}
                      mediaVersionStamp={a.mediaVersionStamp}
                    />
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User as={Link} to={`/user/${a.id}`} style={{ color: 'black' }}>
                        {a.name}
                      </Feed.User>{' '}
                      {action} <ProblemName a={a} />
                      <Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    {a.description && <Feed.Extra text>{a.description}</Feed.Extra>}
                    {(a.noPersonalGrade || a.stars !== 0) && (
                      <Feed.Meta>
                        {a.noPersonalGrade && (
                          <Label basic size='mini'>
                            <Icon name='x' /> No personal grade
                          </Label>
                        )}
                        {a.stars !== 0 && <Stars numStars={a.stars} includeStarOutlines={true} />}
                      </Feed.Meta>
                    )}
                  </Feed.Content>
                </Feed.Event>
              );
            }
          })}
        </Feed>
      )}
    </>
  );
};

export default Activity;
