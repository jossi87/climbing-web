import React from "react";
import { Loading } from "../widgets/widgets";
import { Table, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useTop } from "../../../api";
import Avatar from "../../common/avatar/avatar";

type TopProps = {
  idArea: number;
  idSector: number;
};

const Top = ({ idArea, idSector }: TopProps) => {
  const { data: top } = useTop({ idArea, idSector });

  if (!top) {
    return <Loading />;
  }

  const rows = top.map((t) => (
    <Table.Row
      key={t.userId}
      style={{ backgroundColor: t.mine ? "#d2f8d2" : "#ffffff" }}
    >
      <Table.Cell>#{t.rank}</Table.Cell>
      <Table.Cell>
        <Header as="h4" image>
          <Avatar userId={t.userId} avatarCrc32={t.avatarCrc32} />
          <Header.Content as={Link} to={`/user/${t.userId}`}>
            {t.name}
          </Header.Content>
        </Header>
      </Table.Cell>
      <Table.Cell>{t.percentage}%</Table.Cell>
    </Table.Row>
  ));

  return (
    <Table basic="very" size="small" celled collapsing unstackable compact>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Rank</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Completed</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{rows}</Table.Body>
    </Table>
  );
};

export default Top;
