import { Loading } from '../widgets/widgets';
import { Popup, Table } from 'semantic-ui-react';
import { useGradeDistribution } from './../../../api';
import type { components } from '../../../@types/buldreinfo/swagger';

type Data = components['schemas']['GradeDistribution'][];

type Props =
  | { idArea: number; idSector?: never; data?: never }
  | { idArea?: never; idSector: number; data?: never }
  | { idArea?: never; idSector?: never; data: Data };

const ChartGradeDistribution = ({ idArea = 0, idSector = 0, data = undefined }: Props) => {
  const { data: gradeDistribution } = useGradeDistribution(idArea, idSector, data || undefined);

  if (!gradeDistribution) {
    return <Loading />;
  }

  const maxValue = Math.max(
    1,
    ...gradeDistribution.map((d) => {
      return d.num ?? 0;
    }),
  );
  const cols = gradeDistribution.map((g) => {
    const prim = g.prim ?? 0;
    const sec = g.sec ?? 0;
    const hPrim = (prim / maxValue) * 80 + '%';
    const hSec = (sec / maxValue) * 80 + '%';
    const col = (
      <td
        key={[g.grade, g.prim, g.sec, g.num, g.sec].join('/')}
        style={{ height: '100%', verticalAlign: 'bottom', textAlign: 'center' }}
      >
        {(g.num ?? 0) > 0 && (g.num ?? 0)}
        {(g.sec ?? 0) > 0 && (
          <div
            style={{
              marginLeft: '3px',
              marginRight: '3px',
              height: hSec,
              backgroundColor: '#BD313C',
            }}
          />
        )}
        {(g.prim ?? 0) > 0 && (
          <div
            style={{
              marginLeft: '3px',
              marginRight: '3px',
              paddingBottom: hSec,
              height: hPrim,
              backgroundColor: '#3182bd',
            }}
          />
        )}
      </td>
    );
    if (g.rows && g.rows.length > 0) {
      const hasBoulder = g.rows.filter((x) => (x.numBoulder ?? 0) > 0).length > 0;
      const hasSport = g.rows.filter((x) => (x.numSport ?? 0) > 0).length > 0;
      const hasTrad = g.rows.filter((x) => (x.numTrad ?? 0) > 0).length > 0;
      const hasMixed = g.rows.filter((x) => (x.numMixed ?? 0) > 0).length > 0;
      const hasTopRope = g.rows.filter((x) => (x.numTopRope ?? 0) > 0).length > 0;
      const hasAid = g.rows.filter((x) => (x.numAid ?? 0) > 0).length > 0;
      const hasAidTrad = g.rows.filter((x) => (x.numAidTrad ?? 0) > 0).length > 0;
      const hasIce = g.rows.filter((x) => (x.numIce ?? 0) > 0).length > 0;
      return (
        <Popup
          key={[g.grade, g.prim, g.sec, g.num, g.sec].join('/')}
          inverted
          position='bottom center'
          offset={[0, 20]}
          trigger={col}
          content={
            <Table compact inverted unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    {idArea > 0 || idSector > 0 ? 'Sector' : 'Region'}
                  </Table.HeaderCell>
                  {hasBoulder && <Table.HeaderCell>Boulder</Table.HeaderCell>}
                  {hasSport && <Table.HeaderCell>Sport</Table.HeaderCell>}
                  {hasTrad && <Table.HeaderCell>Trad</Table.HeaderCell>}
                  {hasMixed && <Table.HeaderCell>Mixed</Table.HeaderCell>}
                  {hasTopRope && <Table.HeaderCell>Top rope</Table.HeaderCell>}
                  {hasAid && <Table.HeaderCell>Aid</Table.HeaderCell>}
                  {hasAidTrad && <Table.HeaderCell>Aid/Trad</Table.HeaderCell>}
                  {hasIce && <Table.HeaderCell>Ice</Table.HeaderCell>}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {g.rows.map((s) => (
                  <Table.Row key={s.name}>
                    <Table.Cell>{s.name}</Table.Cell>
                    {hasBoulder && <Table.Cell>{s.numBoulder ?? 0}</Table.Cell>}
                    {hasSport && <Table.Cell>{s.numSport ?? 0}</Table.Cell>}
                    {hasTrad && <Table.Cell>{s.numTrad ?? 0}</Table.Cell>}
                    {hasMixed && <Table.Cell>{s.numMixed ?? 0}</Table.Cell>}
                    {hasTopRope && <Table.Cell>{s.numTopRope ?? 0}</Table.Cell>}
                    {hasAid && <Table.Cell>{s.numAid ?? 0}</Table.Cell>}
                    {hasAidTrad && <Table.Cell>{s.numAidTrad ?? 0}</Table.Cell>}
                    {hasIce && <Table.Cell>{s.numIce ?? 0}</Table.Cell>}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          }
          size='mini'
        />
      );
    }
    return col;
  });
  return (
    <table
      style={{
        height: '20vh',
        tableLayout: 'fixed',
        width: '100%',
        maxWidth: '400px',
      }}
    >
      <tbody>
        <tr>{cols}</tr>
        <tr>
          {gradeDistribution.map((g) => (
            <td style={{ width: '40px', textAlign: 'center' }} key={g.grade}>
              <strong>{g.grade}</strong>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default ChartGradeDistribution;
