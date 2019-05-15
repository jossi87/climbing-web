import React, { useState, useEffect } from 'react';
import { LoadingAndRestoreScroll } from '../widgets/widgets';
import { getGradeDistribution } from './../../../api';

const ChartGradeDistribution = ({auth, idArea, idSector}) => {
  const [gradeDistribution, setGradeDistribution] = useState([]);

  useEffect(() => {
    getGradeDistribution(auth.getAccessToken(), idArea, idSector).then((res) => {
      setGradeDistribution(res);
    });
  }, [auth, idArea, idSector]);

  if (!gradeDistribution) {
    return <LoadingAndRestoreScroll />;
  }
  const maxValue = Math.max.apply(Math, gradeDistribution.map(d => {return d.num}));
  const cols = gradeDistribution.map((g, i) => {
    const h = (g.num/maxValue*90) + '%';
    return (
        <td key={i} style={{height: '100%', verticalAlign: 'bottom', textAlign: 'center'}}>
          {g.num}
          <div style={{marginLeft: '3px', marginRight: '3px', height: h, backgroundColor: '#3182bd'}}></div>
        </td>
    )
  });
  return (
    <table style={{height: '20vh'}}>
      <tr>
        {cols}
      </tr>
      <tr>
        {gradeDistribution.map((g, i) => <td style={{width: '40px', textAlign: 'center'}} key={i}><strong>{g.grade}</strong></td>)}
      </tr>
    </table>
  )
}

export default ChartGradeDistribution;