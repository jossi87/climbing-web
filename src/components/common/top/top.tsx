import { Loading } from '../widgets/widgets';
import { Table, Label } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useTop } from '../../../api';
import Avatar from '../../common/avatar/avatar';

type TopProps = {
  idArea: number;
  idSector: number;
};

const Top = ({ idArea, idSector }: TopProps) => {
  const { data: top } = useTop({ idArea, idSector });

  if (!top) {
    return <Loading />;
  }

  const rows = top.rows?.map((t) => (
    <Table.Row key={t.percentage}>
      <Table.Cell verticalAlign='top'>#{t.rank}</Table.Cell>
      <Table.Cell verticalAlign='top'>{t.percentage}%</Table.Cell>
      <Table.Cell>
        <Label.Group>
          {(t.users ?? []).map((u) => (
            <Label
              key={u.userId}
              as={Link}
              to={`/user/${u.userId}`}
              image
              style={{ backgroundColor: u.mine ? '#d2f8d2' : '#ffffff' }}
              basic
            >
              <Avatar userId={u.userId} name={u.name} avatarCrc32={u.avatarCrc32} />
              {u.name}
            </Label>
          ))}
        </Label.Group>
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <Table
      basic='very'
      size='small'
      celled
      collapsing
      unstackable
      compact
      style={{ overflowWrap: 'normal', wordBreak: 'normal' }}
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Rank</Table.HeaderCell>
          <Table.HeaderCell>Completed</Table.HeaderCell>
          <Table.HeaderCell>
            People <Label circular>{top.numUsers}</Label>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{rows}</Table.Body>
    </Table>
  );
};

export default Top;
