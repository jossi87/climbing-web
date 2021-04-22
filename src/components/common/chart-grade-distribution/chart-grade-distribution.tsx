import React, { useState, useEffect } from 'react';
import { LoadingAndRestoreScroll } from '../widgets/widgets';
import { Popup, Table } from 'semantic-ui-react'
import { getGradeDistribution } from './../../../api';

const ChartGradeDistribution = ({accessToken, idArea, idSector}) => {
  const [gradeDistribution, setGradeDistribution] = useState([]);

  useEffect(() => {
    getGradeDistribution(accessToken, idArea, idSector).then((res) => {
      setGradeDistribution(res);
    });
  }, [accessToken, idArea, idSector]);

  if (!gradeDistribution) {
    return <LoadingAndRestoreScroll />;
  }
  const maxValue = Math.max.apply(Math, gradeDistribution.map(d => {return d.num}));
  const cols = gradeDistribution.map((g, i) => {
    const hPrim = (g.prim/maxValue*80) + '%';
    const hSec = (g.sec/maxValue*80) + '%';
    const col = (
      <td key={i} style={{height: '100%', verticalAlign: 'bottom', textAlign: 'center'}}>
        {g.num>0 && g.num}
        {g.sec>0 && <div style={{marginLeft: '3px', marginRight: '3px', height: hSec, backgroundColor: '#BD313C'}} />}
        {g.prim>0 && <div style={{marginLeft: '3px', marginRight: '3px', paddingBottom: hSec, height: hPrim, backgroundColor: '#3182bd'}} />}
      </td>
    );
    if (g.rows && g.rows.length>0) {
      const hasBoulder = g.rows.filter(x => x.numBoulder>0).length>0;
      const hasSport = g.rows.filter(x => x.numSport>0).length>0;
      const hasTrad = g.rows.filter(x => x.numTrad>0).length>0;
      const hasMixed = g.rows.filter(x => x.numMixed>0).length>0;
      const hasTopRope = g.rows.filter(x => x.numTopRope>0).length>0;
      const hasAid = g.rows.filter(x => x.numAid>0).length>0;
      const hasAidTrad = g.rows.filter(x => x.numAidTrad>0).length>0;
      const hasIce = g.rows.filter(x => x.numIce>0).length>0;
      return (
          <Popup
            inverted
            position="bottom center"
            offset={[0, 20]}
            trigger={col}
            content={
              <Table compact inverted unstackable>
                <Table.Header>
                  <Table.HeaderCell>Sector</Table.HeaderCell>
                  {hasBoulder && <Table.HeaderCell>Boulder</Table.HeaderCell>}
                  {hasSport && <Table.HeaderCell>Sport</Table.HeaderCell>}
                  {hasTrad && <Table.HeaderCell>Trad</Table.HeaderCell>}
                  {hasMixed && <Table.HeaderCell>Mixed</Table.HeaderCell>}
                  {hasTopRope && <Table.HeaderCell>Top rope</Table.HeaderCell>}
                  {hasAid && <Table.HeaderCell>Aid</Table.HeaderCell>}
                  {hasAidTrad && <Table.HeaderCell>Aid/Trad</Table.HeaderCell>}
                  {hasIce && <Table.HeaderCell>Ice</Table.HeaderCell>}
                </Table.Header>
                <Table.Body>
                  {g.rows.map((s, i) => (
                    <Table.Row key={i}>
                      <Table.Cell>{s.name}</Table.Cell>
                      {hasBoulder && <Table.Cell>{s.numBoulder}</Table.Cell>}
                      {hasSport && <Table.Cell>{s.numSport}</Table.Cell>}
                      {hasTrad && <Table.Cell>{s.numTrad}</Table.Cell>}
                      {hasMixed && <Table.Cell>{s.numMixed}</Table.Cell>}
                      {hasTopRope && <Table.Cell>{s.numTopRope}</Table.Cell>}
                      {hasAid && <Table.Cell>{s.numAid}</Table.Cell>}
                      {hasAidTrad && <Table.Cell>{s.numAidTrad}</Table.Cell>}
                      {hasIce && <Table.Cell>{s.numIce}</Table.Cell>}
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
    <table style={{height: '20vh', tableLayout: 'fixed', width: '100%', maxWidth: '400px'}}>
      <tbody>
        <tr>
          {cols}
        </tr>
        <tr>
          {gradeDistribution.map((g, i) => <td style={{width: '40px', textAlign: 'center'}} key={i}><strong>{g.grade}</strong></td>)}
        </tr>
      </tbody>
    </table>
  )
}

export default ChartGradeDistribution;