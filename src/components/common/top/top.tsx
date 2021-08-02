import React, { useState, useEffect } from 'react';
import { LoadingAndRestoreScroll } from '../widgets/widgets';
import { Table, Header, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { getTop } from '../../../api';

const Top = ({idArea, idSector}) => {
  const [top, setTop] = useState([]);

  useEffect(() => {
    getTop(idArea, idSector).then((res) => {
      setTop(res);
    });
  }, [idArea, idSector]);

  if (!top) {
    return <LoadingAndRestoreScroll />;
  }
  const rows = top.map((t, i) =>
    <Table.Row key={i}>
      <Table.Cell>
        <Header as='h4' image>
          <Image src={t.picture} rounded size='mini' />
          <Header.Content as={Link} to={`/user/${t.userId}`}>
            {t.name}
            <Header.Subheader>#{t.rank}</Header.Subheader>
          </Header.Content>
        </Header>
      </Table.Cell>
      <Table.Cell>{t.percentage}%</Table.Cell>
    </Table.Row>
  );
  return (
    <Table basic='very' size="small" celled collapsing unstackable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Completed</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows}
      </Table.Body>
    </Table>
  )
}

export default Top;