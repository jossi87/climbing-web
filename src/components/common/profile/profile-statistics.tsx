import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Chart from '../chart/chart';
import ProblemList from '../problem-list/problem-list';
import { LoadingAndRestoreScroll, LockSymbol, Stars } from '../widgets/widgets';
import { Icon, List, Label, Segment, Divider, Button } from 'semantic-ui-react';
import { getProfileStatistics, numberWithCommas, getUsersTicks } from '../../../api';
import { saveAs } from 'file-saver';

const TickListItem = ({ tick } ) => (
  <List.Item key={tick.idProblem}>
    <List.Header>
      <small>{tick.dateHr}</small>
      {' '}<small style={{color: 'gray'}}>{tick.areaName} <LockSymbol lockedAdmin={tick.areaLockedAdmin} lockedSuperadmin={tick.areaLockedSuperadmin} /> / {tick.sectorName}<LockSymbol lockedAdmin={tick.sectorLockedAdmin} lockedSuperadmin={tick.sectorLockedSuperadmin} /> /</small>
      {' '}<Link to={`/problem/${tick.idProblem}`}>{tick.name}</Link>
      {' '}{tick.grade}<LockSymbol lockedAdmin={tick.lockedAdmin} lockedSuperadmin={tick.lockedSuperadmin} />
      {tick.stars!=0 && <>{' '}<Stars numStars={tick.stars} includeNoRating={true} />{' '}</>}
      {tick.fa && <Label color="red" size="mini" content="FA"/>}
      {tick.subType && <Label basic size="mini" content={tick.subType} detail={tick.numPitches>1? tick.numPitches + " pitches" : null}/>}
      {' '}{tick.comment && <small style={{color: 'gray'}}><i>{tick.comment}</i></small>}
    </List.Header>
  </List.Item>
);
const ProfileStatistics = ({ accessToken, userId, canDownload }) => {
  const [data, setData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (data != null) {
      setData(null);
    }
    getProfileStatistics(accessToken, userId).then((data) => setData(data));
  }, [accessToken, userId]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  var numTicks = data.ticks.filter(t => !t.fa).length;
  var numFas = data.ticks.filter(t => t.fa).length;
  const chart = data.ticks.length>0? <Chart data={data.ticks}/> : null;

  return (
    <>
      <Segment>
        {canDownload &&
          <Button floated="right" circular size="small" icon="save" loading={isSaving} onClick={() => {
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
          }}/>
        }
        <Label.Group size="small">
          <Label color='orange' image><Icon name='check' />{numberWithCommas(numFas)}<Label.Detail>FA</Label.Detail></Label>
          <Label color='olive' image><Icon name='check' />{numberWithCommas(numTicks)}<Label.Detail>Tick</Label.Detail></Label>
          <Label color='green' image><Icon name='photo' />{numberWithCommas(data.numImageTags)}<Label.Detail>Tag</Label.Detail></Label>
          <Label color='teal' image><Icon name='photo' />{numberWithCommas(data.numImagesCreated)}<Label.Detail>Captured</Label.Detail></Label>
          <Label color='blue' image><Icon name='video' />{numberWithCommas(data.numVideoTags)}<Label.Detail>Tag</Label.Detail></Label>
          <Label color='violet' image><Icon name='video' />{numberWithCommas(data.numVideosCreated)}<Label.Detail>Captured</Label.Detail></Label>
        </Label.Group>
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

export default ProfileStatistics;
