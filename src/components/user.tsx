import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams } from 'react-router-dom';
import Chart from './common/chart/chart';
import AccordionContainer from './common/accordion-container/accordion-container'
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
        {tick.stars>0 && <>{' '}<Stars numStars={tick.stars} />{' '}</>}
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
  const [sortBy, setSortBy] = useState('date');
  useEffect(() => {
    if (!loading) {
      getUser(accessToken, userId? parseInt(userId) : -1)
      .then((data) => {
        setData(data);
        order('date');
      });
    }
  }, [loading, accessToken, userId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  var numTicks = data.ticks.filter(t => !t.fa).length;
  var numFas = data.ticks.filter(t => t.fa).length;
  const chart = data.ticks.length>0? <Chart data={data.ticks}/> : null;

  function order(type) {
    data && data.ticks && data.ticks.sort((a, b) => {
      if (type == 'grade') {
        if (a.gradeNumber != b.gradeNumber) return b.gradeNumber-a.gradeNumber
        else if (a.date && !b.date) return -1;
        else if (!a.date && b.date) return 1;
        else if (a.date != b.date) return b.date.localeCompare(a.date);
        return a.name.localeCompare(b.name);
      } else if (type == 'date') {
        return a.num-b.num;
      } else if (type == 'name') {
        if (a.areaName > b.areaName) return 1;
        else if (a.areaName < b.areaName) return -1;
        else if (a.sectorName > b.sectorName) return 1;
        else if (a.sectorName < b.sectorName) return -1;
        else if (a.name > b.name) return 1;
        else if (a.name < b.name) return -1;
        return 0;
      } else if (type == 'fa') {
        if (a.fa && !b.fa) return -1;
        else if (!a.fa && b.fa) return 1;
        else if (a.gradeNumber != b.gradeNumber) return b.gradeNumber-a.gradeNumber;
        else if (a.date && !b.date) return -1;
        else if (!a.date && b.date) return 1;
        else if (a.date != b.date) return b.date.localeCompare(a.date);
        return a.name.localeCompare(b.name);
      } else {
        console.log("Wrong type: " + type);
      }
    });
    setSortBy(type);
  }

  let subTypes = data.ticks.map(t => t.subType).filter((value, index, self) => self.indexOf(value) === index).sort(); 
  let ticks;
  if (sortBy==='grade' && subTypes.length>1) {
    let accordionRows = subTypes.map(subType => {
      let rows = data.ticks.filter(t => t.subType===subType).map((t, i) => <TickListItem key={i} tick={t} />);
      let label = subType + " (" + rows.length + ")";
      let content = <List selection>{rows}</List>;
      return (
        {label, content}
      );
    });
    ticks = <AccordionContainer accordionRows={accordionRows}/>;
  }
  else {
    ticks = (
      <Segment attached="bottom">
        <List selection>
          {data.ticks.map((t, i) => <TickListItem key={i} tick={t} />)}
        </List>
      </Segment>
    )
  }
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
        <ButtonGroup floated="right" size="mini" basic>
          {isAuthenticated && !userId &&
            <Button loading={isSaving} icon labelPosition="left" onClick={() => {
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
              <Icon name="file excel"/>
              Download
            </Button>
          }
          <Button icon labelPosition="left" as={Link} to={`/todo/${data.id}`}>
            <Icon name="list"/>
            To-do list
          </Button>
          {(data.numImageTags>0 || data.numVideoTags>0) && <Button icon labelPosition="left" as={Link} to={`/user/media/${data.id}`}>
            <Icon name="images"/>
            Media
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
        <>
          <ButtonGroup size="mini" compact  attached="top">
            <Button icon labelPosition="left" onClick={() => order('date')} toggle primary={sortBy==='date'}><Icon name="sort content ascending"/>Date</Button>
            <Button icon labelPosition="left" onClick={() => order('grade')} toggle primary={sortBy==='grade'}><Icon name="sort content ascending"/>Grade</Button>
            {numFas>0 && <Button icon labelPosition="left" onClick={() => order('fa')} toggle primary={sortBy==='fa'}><Icon name="sort content ascending"/>FA</Button>}
            <Button icon labelPosition="left" onClick={() => order('name')} toggle primary={sortBy==='name'}><Icon name="sort alphabet down"/>Name</Button>
          </ButtonGroup>
          {ticks}
        </>
      }
    </>
  );
}

export default User;
