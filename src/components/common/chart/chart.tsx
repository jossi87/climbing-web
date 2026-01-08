import { memo } from 'react';
import type { components } from '../../../@types/buldreinfo/swagger';

type Props = {
  ticks: NonNullable<components['schemas']['ProfileStatistics']['ticks']>;
};

function Chart({ ticks: data }: Props) {
  type LocalGrade = { gradeNumber: number; grade: string; fa: number; tick: number };
  const grades: LocalGrade[] = [];
  data.forEach((t) => {
    const gradeNumber = t.gradeNumber ?? 0;
    const gradeLabel = t.grade ?? '';
    const d = grades.find((val) => val.gradeNumber === gradeNumber);
    if (!d) {
      grades.push({
        gradeNumber,
        grade: gradeLabel,
        fa: t.fa ? 1 : 0,
        tick: t.fa ? 0 : 1,
      });
    } else {
      if (t.fa) {
        d.fa++;
      } else {
        d.tick++;
      }
    }
  });
  grades.sort((a, b) => b.gradeNumber - a.gradeNumber);
  const maxValue = Math.max(
    1,
    ...grades.map((d) => {
      return d.fa + d.tick;
    }),
  );
  const rows = grades.map((g) => {
    const faWidth = (g.fa / maxValue) * 100 + '%';
    const tickWidth = (g.tick / maxValue) * 100 + '%';
    return (
      <tr key={[g.grade, g.fa, g.tick].join('/')}>
        <td style={{ padding: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>{g.grade}</td>
        <td style={{ padding: 0, textAlign: 'center' }}>{g.fa}</td>
        <td style={{ padding: 0, textAlign: 'center' }}>{g.tick}</td>
        <td style={{ padding: 0, textAlign: 'center' }}>
          <strong>{g.fa + g.tick}</strong>
        </td>
        <td style={{ width: '100%', verticalAlign: 'middle' }}>
          <div
            style={{
              width: faWidth,
              height: '10px',
              backgroundColor: '#3182bd',
              float: 'left',
            }}
          ></div>
          <div
            style={{
              width: tickWidth,
              height: '10px',
              backgroundColor: '#6baed6',
              marginLeft: faWidth,
            }}
          ></div>
        </td>
      </tr>
    );
  });

  return (
    <table style={{ overflowWrap: 'normal', wordBreak: 'normal' }}>
      <thead>
        <tr>
          <th>Grade</th>
          <th>FA</th>
          <th>Tick</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default memo(Chart);
