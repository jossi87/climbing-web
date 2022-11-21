import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Label, Icon, Image, Feed, Segment, Placeholder, Button, Dropdown } from 'semantic-ui-react';
import LazyLoad from 'react-lazyload';
import { useLocalStorage } from '../../../utils/use-local-storage';
import { useAuth0 } from '../../../utils/react-auth0-spa';
import { getActivity, getImageUrl } from '../../../api';
import { LockSymbol, Stars } from './../../common/widgets/widgets';
import Linkify from 'react-linkify';

const Activity = ({ metadata, idArea, idSector }) => {
  const { loading, accessToken } = useAuth0();
  const [activity, setActivity] = useState(null);
  const [lowerGradeId, setLowerGradeId] = useLocalStorage("lower_grade_id", 0);
  const [lowerGradeText, setLowerGradeText] = useLocalStorage("lower_grade_text", "n/a");
  const [activityTypeTicks, setActivityTypeTicks] = useLocalStorage("activity_type_ticks", true);
  const [activityTypeFa, setActivityTypeFa] = useLocalStorage("activity_type_fa", true);
  const [activityTypeComments, setActivityTypeComments] = useLocalStorage("activity_type_comments", true);
  const [activityTypeMedia, setActivityTypeMedia] = useLocalStorage("activity_type_media", true);

  //@ts-ignore
  useEffect(() => {
    if (!loading) {
      let canceled = false;
      getActivity(accessToken, idArea, idSector, lowerGradeId, activityTypeFa, activityTypeComments, activityTypeTicks, activityTypeMedia).then((res) => {
        if (!canceled) {
          setActivity(res);
        }
      });
      return () => (canceled = true);
    }
  }, [loading, accessToken, idArea, idSector, lowerGradeId, activityTypeFa, activityTypeComments, activityTypeTicks, activityTypeMedia]);

  if (metadata && metadata.grades.filter(g => {
    let gradeText = g.grade.indexOf('(')>0? g.grade.substr(g.grade.indexOf('(')+1).replace(')','') : g.grade;
    return (gradeText == lowerGradeText && g.id == lowerGradeId)
  }).length === 0) {
    if (lowerGradeId != 0) setLowerGradeId(0);
    if (lowerGradeText!="n/a") setLowerGradeText("n/a");
    if (!activityTypeTicks) setActivityTypeTicks(true);
    if (!activityTypeFa) setActivityTypeFa(true);
    if (!activityTypeComments) setActivityTypeComments(true);
    if (!activityTypeMedia) setActivityTypeMedia(true);
  }
  const imgStyle = {height: "fit-content", maxHeight: '80px', objectFit: 'none'};

  const componentDecorator = (href, text, key) => (
    <a href={href} key={key} rel="noreferrer noopener" target="_blank">
      {text}
    </a>
  );

  return (
    <>
      <Segment vertical style={{paddingTop: 0}}>
        <Button.Group size="mini" compact>
          <Dropdown
            text={"Lower grade: " + lowerGradeText}
            icon="filter"
            floating
            compact
            labeled
            button
            className='icon'>
            <Dropdown.Menu>
              <Dropdown.Menu scrolling>
                {metadata && metadata.grades.map((a, i) => (
                  <Dropdown.Item key={i} text={a.grade} onClick={() => {
                    let gradeText = a.grade.indexOf('(')>0? a.grade.substr(a.grade.indexOf('(')+1).replace(')','') : a.grade;
                    setActivity(null);
                    setLowerGradeId(a.id);
                    setLowerGradeText(gradeText);
                  }}/>
                ))}
              </Dropdown.Menu>
            </Dropdown.Menu>
          </Dropdown>
          <Button animated='fade' inverted={!activityTypeFa} onClick={() => {
            setActivity(null);
            setActivityTypeFa(!activityTypeFa);
          }}>
            <Button.Content hidden>FA</Button.Content>
            <Button.Content visible><Icon name='plus' color='black' /></Button.Content>
          </Button>
          <Button animated='fade' inverted={!activityTypeTicks} onClick={() => {
            setActivity(null);
            setActivityTypeTicks(!activityTypeTicks);
          }}>
            <Button.Content hidden>Tick</Button.Content>
            <Button.Content visible><Icon name='check' color='black' /></Button.Content>
          </Button>
          <Button animated='fade' inverted={!activityTypeMedia} onClick={() => {
            setActivity(null);
            setActivityTypeMedia(!activityTypeMedia);
          }}>
            <Button.Content hidden>Media</Button.Content>
            <Button.Content visible><Icon name='images' color='black' /></Button.Content>
          </Button>
          <Button animated='fade' inverted={!activityTypeComments} onClick={() => {
            setActivity(null);
            setActivityTypeComments(!activityTypeComments);
          }}>
            <Button.Content hidden>Comment</Button.Content>
            <Button.Content visible><Icon name='comments' color='black' /></Button.Content>
          </Button>
        </Button.Group>
      </Segment>
      {!activity &&
        <Segment vertical>
          <Placeholder fluid>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
            <Placeholder.Header image><Placeholder.Line/></Placeholder.Header>
          </Placeholder>
        </Segment>
      }
      {activity && activity.length===0 &&
        <Segment vertical>No data</Segment>
      }
      {activity && activity.length!=0 &&
        <Feed>
          {activity.map((a, i) => {
            // FA
            if (a.users) {
              const typeDescription = metadata && metadata.gradeSystem==='BOULDER'? "problem" : "route";
              return (
                <Feed.Event key={i}>
                  <Feed.Label>
                    {a.problemRandomMediaId>0 && <img style={{height: '35px', objectFit: 'cover'}} src={getImageUrl(a.problemRandomMediaId, a.problemRandomMediaCrc32, 35)} />}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      New {typeDescription} <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}{a.problemSubtype && <Label basic size="mini">{a.problemSubtype}</Label>}<LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} /><Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra text>
                      {a.description}
                    </Feed.Extra>
                    {a.media &&
                      <LazyLoad>
                        <Feed.Extra images>
                          {a.media.map((m, i) => (<Link key={i} to={`/problem/${a.problemId}?idMedia=${m.id}`}><Image style={imgStyle} src={getImageUrl(m.id, m.crc32, 85)} onError={i => i.target.src='/png/video_placeholder.png'} /></Link>))}
                        </Feed.Extra>
                        <br/>
                      </LazyLoad>
                    }
                    {a.users &&
                      <Feed.Meta>
                        {a.users.map((u, i) => (
                          <Label basic key={i} as={Link} to={`/user/${u.id}`} image>
                            {u.picture?  <img src={u.picture} /> : <Icon name="user"/>} {u.name}
                          </Label>
                        ))}
                      </Feed.Meta>
                    }
                  </Feed.Content>
                </Feed.Event>
              )
            }
            // Guestbook
            else if (a.message) {
              return (
                <Feed.Event key={i}>
                  <Feed.Label>
                    {a.picture && <img src={a.picture} />}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User as={Link} to={`/user/${a.id}`} style={{color: "black"}}>{a.name}</Feed.User> posted a comment on <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}{a.problemSubtype && <Label basic size="mini">{a.problemSubtype}</Label>}<LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} /><Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra text>
                      <Linkify componentDecorator={componentDecorator}>{a.message}</Linkify>
                    </Feed.Extra>
                    {a.media &&
                      <LazyLoad>
                        <Feed.Extra images>
                          {a.media.map((m, i) => (<Link key={i} to={`/problem/${a.problemId}?idMedia=${m.id}`}><Image style={imgStyle} src={getImageUrl(m.id, m.crc32, 85)} onError={i => i.target.src='/png/video_placeholder.png'} /></Link>))}
                        </Feed.Extra>
                        <br/>
                      </LazyLoad>
                    }
                  </Feed.Content>
                </Feed.Event>
              )
            }
            // Media
            else if (a.media) {
              const numImg = a.media.filter(m => !m.isMovie).length;
              const img = (numImg>0 && <>{numImg} new <Icon name="photo"/></>);
              const numMov = a.media.filter(m => m.isMovie).length;
              const mov = (numMov>0 && <>{numMov} new <Icon name="film"/></>);
              var summary;
              if (img && mov) {
                summary = <>{img}and {mov}</>;
              } else if (mov) {
                summary = mov;
              } else {
                summary = img;
              }
              return (
                <Feed.Event key={i}>
                  <Feed.Label>
                    {a.problemRandomMediaId>0 && <img style={{height: '35px', objectFit: 'cover'}} src={getImageUrl(a.problemRandomMediaId, a.problemRandomMediaCrc32, 35)} />}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary style={{marginBottom: '3px'}}>
                      {summary}on <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}{a.problemSubtype && <Label basic size="mini">{a.problemSubtype}</Label>}<LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} /><Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    <LazyLoad>
                      <Feed.Extra images>
                        {a.media.map((m, i) => (<Link key={i} to={`/problem/${a.problemId}?idMedia=${m.id}`}><Image style={imgStyle} src={getImageUrl(m.id, m.crc32, 85)} onError={i => i.target.src='/png/video_placeholder.png'} /></Link>))}
                      </Feed.Extra>
                    </LazyLoad>
                  </Feed.Content>
                </Feed.Event>
              )
            }
            // Tick
            else {
              const action = a.repeat? "repeated" : "ticked";
              return (
                <Feed.Event key={i}>
                  <Feed.Label>
                    {a.picture && <img src={a.picture} />}
                  </Feed.Label>
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User as={Link} to={`/user/${a.id}`} style={{color: "black"}}>{a.name}</Feed.User> {action} <Feed.User as={Link} to={`/problem/${a.problemId}`}>{a.problemName}</Feed.User> {a.grade}{a.problemSubtype && <Label basic size="mini">{a.problemSubtype}</Label>}<LockSymbol lockedAdmin={a.problemLockedAdmin} lockedSuperadmin={a.problemLockedSuperadmin} /><Feed.Date>{a.timeAgo}</Feed.Date>
                    </Feed.Summary>
                    {a.description && <Feed.Extra text>{a.description}</Feed.Extra>}
                    {a.stars!=0 && <Feed.Meta><Stars numStars={a.stars} includeNoRating={true} /></Feed.Meta>}
                  </Feed.Content>
                </Feed.Event>
              )
            }
          })}
        </Feed>
      }
    </>
  )
}

export default Activity;