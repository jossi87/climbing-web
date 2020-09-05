import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link, useParams } from 'react-router-dom';
import Chart from './common/chart/chart';
import { LoadingAndRestoreScroll, LockSymbol, Stars } from './common/widgets/widgets';
import { Icon, List, Label, Header, Segment, Divider, Image, Button, Checkbox, ButtonGroup } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getUser, getUsersTicks, numberWithCommas, postUser } from '../api';
import { saveAs } from 'file-saver';

interface UserParams {
  userId: string;
}
const User = () => {
  let { userId } = useParams<UserParams>();
  const { loading, isAuthenticated, accessToken } = useAuth0();
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
    data.ticks.sort((a, b) => {
      if (type == 'grade') {
        if (a.gradeNumber != b.gradeNumber) {
          return b.gradeNumber-a.gradeNumber;
        }
        if (a.date && !b.date) {
          return -1;
        } else if (!a.date && b.date) {
          return 1;
        } else if (a.date != b.date) {
          return b.date.localeCompare(a.date);
        }
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
      } else {
        console.log("Wrong type: " + type);
      }
    });
    setSortBy(type);
  }

  let subTypes = data.ticks.map(t => t.subtype).filter((value, index, self) => self.indexOf(value) === index).sort(); 
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
        <ButtonGroup floated="right">
          {isAuthenticated && !userId &&
            <Button icon labelPosition="left" size="mini" onClick={() => {
              let filename = "ticks.xlsx";
              getUsersTicks(accessToken).then(response => {
                filename = response.headers.get("content-disposition").substring(22,42);
                return response.blob();
              })
              .then (blob => saveAs(blob, filename));
            }}>
              <Icon name="file excel"/>
              Download
            </Button>
          }
          <Button icon labelPosition="left" size="mini" as={Link} to={`/todo/${data.id}`}>
            <Icon name="list"/>
            To-do list
          </Button>
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
        {isAuthenticated && !userId &&
          <>
            <br/>
            <Checkbox
              checked={data.metadata.useBlueNotRed}
              label='Use blue instead of red lines on schematics'
              onClick={() => {
                let metadata = data.metadata;
                metadata.useBlueNotRed = !metadata.useBlueNotRed;
                postUser(accessToken, metadata.useBlueNotRed)
                .then(() => {
                  setData(prevState => ({ ...prevState, metadata }));
                  order('date');
                })
                .catch((error) => {
                  console.warn(error);
                });
              }}
            />
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
          <ButtonGroup size="mini" compact basic attached="top">
            <Button icon labelPosition="left" onClick={() => order('date')} toggle active={sortBy==='date'}><Icon name="sort content ascending"/>Date</Button>
            <Button icon labelPosition="left" onClick={() => order('grade')} toggle active={sortBy==='grade'}><Icon name="sort alphabet down"/>Grade</Button>
            <Button icon labelPosition="left" onClick={() => order('name')} toggle active={sortBy==='name'}><Icon name="sort alphabet down"/>Name</Button>
          </ButtonGroup>
          <Segment attached="bottom">
            {subTypes.filter((x, i) => sortBy==='grade' || i === 0).map((subType, i) => (
              <span key={i}>
                {sortBy==='grade' && subTypes.length>1 && <Header as="h5">{subType}:</Header>}
                <List selection attached="bottom">
                  {data.ticks.filter(t=> (sortBy!='grade' || t.subtype==subType)).map((t, j) => (
                    <List.Item key={j}>
                      <List.Header>
                        <small>{t.dateHr}</small>
                        {' '}<small style={{color: 'gray'}}>{t.areaName} <LockSymbol visibility={t.areaVisibility}/> / {t.sectorName}<LockSymbol visibility={t.sectorVisibility}/> /</small>
                        {' '}<Link to={`/problem/${t.idProblem}`}>{t.name}</Link>
                        {' '}{t.grade}<LockSymbol visibility={t.visibility}/>
                        {t.stars>0 && <>{' '}<Stars numStars={t.stars} />{' '}</>}
                        {t.fa && <Label color="red" size="mini" content="FA"/>}
                        {t.subtype && <Label size="mini" content={t.subtype}/>}
                        {' '}{t.comment && <small style={{color: 'gray'}}><i>{t.comment}</i></small>}
                      </List.Header>
                    </List.Item>
                  ))}
                </List>
              </span>
            ))}
          </Segment>
        </>
      }
    </>
  );
}

export default User;
