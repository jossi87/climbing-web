import React, { useState, useEffect } from 'react';
import { LoadingAndRestoreScroll } from '../widgets/widgets';
import { Popup } from 'semantic-ui-react'
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
    if (g.tooltip) {
      return (
          <Popup
            position="bottom center"
            inverted
            offset={[0, 20]}
            trigger={col}
            content={g.tooltip}
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