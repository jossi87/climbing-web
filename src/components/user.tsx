import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams } from 'react-router-dom';
import Chart from './common/chart/chart';
import ProblemList from './common/problem-list/problem-list';
import { LoadingAndRestoreScroll, LockSymbol, Stars } from './common/widgets/widgets';
import { Icon, List, Label, Header, Segment, Divider, Image, Button, ButtonGroup } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getUser, getUsersTicks, numberWithCommas, postUserRegion } from '../api';
import { saveAs } from 'file-saver';

interface UserParams {
  userId: string;
}
const TickListItem = ({ tick } ) => (
    <List.Item key={tick.idProblem}>
      <List.Header>
        <small>{tick.dateHr}</small>
        {' '}<small style={{color: 'gray'}}>{tick.areaName} <LockSymbol lockedAdmin={tick.areaLockedAdmin} lockedSuperadmin={tick.areaLockedSuperadmin} /> / {tick.sectorName}<LockSymbol lockedAdmin={tick.sectorLockedAdmin} lockedSuperadmin={tick.sectorLockedSuperadmin} /> /</small>
        {' '}<Link to={`/problem/${tick.idProblem}`}>{tick.name}</Link>
        {' '}{tick.grade}<LockSymbol lockedAdmin={tick.lockedAdmin} lockedSuperadmin={tick.lockedSuperadmin} />
        {tick.stars!=0 && <>{' '}<Stars numStars={tick.stars} includeNoRating={true} />{' '}</>}
        {tick.fa && <Label color="red" size="mini" content="FA"/>}
        {tick.subType && <Label size="mini" content={tick.subType}/>}
        {' '}{tick.comment && <small style={{color: 'gray'}}><i>{tick.comment}</i></small>}
      </List.Header>
    </List.Item>
);
const User = () => {
  let { userId } = useParams<UserParams>();
  const { loading, isAuthenticated, accessToken } = useAuth0();
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!loading) {
      if (data != null) {
        setData(null);
      }
      getUser(accessToken, userId? parseInt(userId) : -1).then((data) => setData(data));
    }
  }, [loading, accessToken, userId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  var numTicks = data.ticks.filter(t => !t.fa).length;
  var numFas = data.ticks.filter(t => t.fa).length;
  const chart = data.ticks.length>0? <Chart data={data.ticks}/> : null;

  return (
    <>
      <MetaTags>
        <title>{data.metadata.title}</title>
        <meta name="description" content={data.metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={data.metadata.description} />
        <meta property="og:url" content={data.metadata.og.url} />
        <meta property="og:title" content={data.metadata.title} />
        <meta property="og:image" content={data.metadata.og.image} />
        <meta property="og:image:width" content={data.metadata.og.imageWidth} />
        <meta property="og:image:height" content={data.metadata.og.imageHeight} />
        <meta property="fb:app_id" content={data.metadata.og.fbAppId} />
      </MetaTags>
      <Segment>
        <ButtonGroup floated="right" size="small">
          {isAuthenticated && !userId &&
            <Button animated='fade' loading={isSaving} onClick={() => {
              setIsSaving(true);
              let filename = "ticks.xlsx";
              getUsersTicks(accessToken).then(response => {
                filename = response.headers.get("content-disposition").slice(22,-1);
                return response.blob();
              })
              .then (blob => {
                setIsSaving(false);
                saveAs(blob, filename)
              });
            }}>
              <Button.Content hidden>Download</Button.Content>
              <Button.Content visible>
                <Icon name='file excel' />
              </Button.Content>
            </Button>
          }
          <Button animated='fade' as={Link} to={`/todo/${data.id}`}>
            <Button.Content hidden>Todo</Button.Content>
            <Button.Content visible>
              <Icon name='list' />
            </Button.Content>
          </Button>
          {(data.numImageTags>0 || data.numVideoTags>0) && <Button animated='fade' as={Link} to={`/user/media/${data.id}`}>
            <Button.Content hidden>Media</Button.Content>
            <Button.Content visible>
              <Icon name='images' />
            </Button.Content>
          </Button>}
        </ButtonGroup>
        <Header as="h2">
          {data.picture && <Image size="small" circular src={data.picture}/>} {data.name}
        </Header>  
        <Label.Group size="small">
          <Label color='orange' image><Icon name='check' />{numberWithCommas(numFas)}<Label.Detail>FA</Label.Detail></Label>
          <Label color='olive' image><Icon name='check' />{numberWithCommas(numTicks)}<Label.Detail>Tick</Label.Detail></Label>
          <Label color='green' image><Icon name='photo' />{numberWithCommas(data.numImageTags)}<Label.Detail>Tag</Label.Detail></Label>
          <Label color='teal' image><Icon name='photo' />{numberWithCommas(data.numImagesCreated)}<Label.Detail>Captured</Label.Detail></Label>
          <Label color='blue' image><Icon name='video' />{numberWithCommas(data.numVideoTags)}<Label.Detail>Tag</Label.Detail></Label>
          <Label color='violet' image><Icon name='video' />{numberWithCommas(data.numVideosCreated)}<Label.Detail>Captured</Label.Detail></Label>
        </Label.Group>
        {isAuthenticated && !userId && data.userRegions &&
          <>
            <Divider/>
            Specify the different region(s) you want to show:<br/>
            {data.userRegions.map(ur => {
              if (ur.enabled && ur.readOnly) {
                return (
                  <Label color="blue" key={ur.id} active={false} size="mini">
                    {ur.name}
                    <Label.Detail>{ur.role? ur.role : "Current site"}</Label.Detail>
                  </Label>
                );
              } else if (ur.enabled && !ur.readOnly) {
                return (
                  <Label color="blue" key={ur.id} active={true} size="mini" as="a" onClick={() => {
                    postUserRegion(accessToken, ur.id, true)
                    .then((response) => {
                      window.location.reload();
                    })
                    .catch((error) => {
                      console.warn(error);
                      alert(error.toString());
                    });
                  }}>
                    {ur.name}
                    <Icon name='delete' />
                  </Label>
                );
              } else {
                return (
                  <Label key={ur.id} active={true} size="mini" as="a" onClick={() => {
                    postUserRegion(accessToken, ur.id, false)
                    .then((response) => {
                      window.location.reload();
                    })
                    .catch((error) => {
                      console.warn(error);
                      alert(error.toString());
                    });
                  }}>
                    <Icon name='add' />
                    {ur.name}
                  </Label>
                );
              }
            })}
          </>
        }
        {chart && 
          <>
            <Divider/>
            {chart}
          </>
        }
      </Segment>
      {data.ticks.length>0 &&
        <ProblemList isSectorNotUser={false} preferOrderByGrade={data.orderByGrade}
          rows={data.ticks.map(t => {
            return ({
              element: <TickListItem tick={t} />,
              areaName: t.areaName, sectorName: t.sectorName,
              name: t.name, nr: null, gradeNumber: t.gradeNumber, stars: t.stars,
              numTicks: null, ticked: null,
              rock: null, subType: t.subType,
              num: t.num, fa: t.fa
            });
          })}
        />
      }
    </>
  );
}

export default User;
