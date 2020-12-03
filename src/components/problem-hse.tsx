import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LockSymbol, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Segment, List, Header } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblemHse } from '../api';

const ProblemHse = () => {
  const { loading, accessToken } = useAuth0();
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!loading) {
      getProblemHse(accessToken).then((data) => setData(data));
    }
  }, [loading, accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  return (
    <>
      <MetaTags>
        <title>Flagged as dangerous</title>
        <meta name="description" content={"HSE"} />
      </MetaTags>
      <Segment>
        <Header>Health and Safety Executive (HSE)</Header>
        <List divided relaxed>
          {data.map((hse, i) => (
            <List.Item key={i}>
              <List.Content>
                <List.Header>
                  <Link to={`/area/${hse.areaId}`}>{hse.areaName}</Link> <LockSymbol lockedAdmin={hse.areaLockedAdmin} lockedSuperadmin={hse.areaLockedSuperadmin} />
                  {' / '}
                  <Link to={`/sector/${hse.sectorId}`}>{hse.sectorName}</Link> <LockSymbol lockedAdmin={hse.sectorLockedAdmin} lockedSuperadmin={hse.sectorLockedSuperadmin} />
                  {' / '}
                  <Link to={`/problem/${hse.problemId}`}>{hse.problemName}</Link> <LockSymbol lockedAdmin={hse.problemLockedAdmin} lockedSuperadmin={hse.problemLockedSuperadmin} />
                </List.Header>
                <List.Description>{hse.comment}</List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Segment>
    </>
  );
}

export default ProblemHse;
