import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LockSymbol, LoadingAndRestoreScroll } from './common/widgets/widgets';
import { Table, Header } from 'semantic-ui-react';
import { useAuth0 } from '../utils/react-auth0-spa';
import { getProblemHse } from '../api';

const ProblemHse = () => {
  const { accessToken } = useAuth0();
  const [data, setData] = useState();
  useEffect(() => {
    getProblemHse(accessToken).then((data) => setData(data));
  }, [accessToken]);

  if (!data) {
    return <LoadingAndRestoreScroll />;
  }
  const rows = data.map((hse, i) => {
    return (
      <Table.Row key={i}>
        <Table.Cell><Link to={`/area/${hse.areaId}`}>{hse.areaName}</Link> <LockSymbol visibility={hse.areaVisibility}/></Table.Cell>
        <Table.Cell><Link to={`/sector/${hse.sectorId}`}>{hse.sectorName}</Link> <LockSymbol visibility={hse.sectorVisibility}/></Table.Cell>
        <Table.Cell><Link to={`/problem/${hse.problemId}`}>{hse.problemName}</Link> <LockSymbol visibility={hse.problemVisibility}/></Table.Cell>
        <Table.Cell>{hse.comment}</Table.Cell>
      </Table.Row>
    )
  });

  return (
    <>
      <MetaTags>
        <title>Flagged as dangerous</title>
        <meta name="description" content={"HSE"} />
      </MetaTags>
      <Header>Health and Safety Executive (HSE)</Header>
      <Table celled compact unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Area</Table.HeaderCell>
            <Table.HeaderCell>Sector</Table.HeaderCell>
            <Table.HeaderCell>Problem</Table.HeaderCell>
            <Table.HeaderCell>Comment</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
        </Table.Body>
      </Table>
    </>
  );
}

export default ProblemHse;
