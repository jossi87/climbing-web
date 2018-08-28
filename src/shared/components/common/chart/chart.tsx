import React, {Component} from 'react';
import { Table } from 'react-bootstrap';

export default class Chart extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    var data = [];
    this.props.data.map(t => {
      var d = data.filter(val => {return val.gradeNumber===t.gradeNumber})
      if (!d[0]) {
        data.push({gradeNumber: t.gradeNumber, grade: t.grade, fa: (t.fa? 1 : 0), tick: (t.fa? 0 : 1)});
      } else {
        if (t.fa) {
          d[0].fa++;
        } else {
          d[0].tick++;
        }
      }
    });
    data.sort((a,b) => {return b.gradeNumber-a.gradeNumber});
    const maxValue = Math.max.apply(Math, data.map(d => {return d.fa+d.tick}));

    const rows = data.map((d, i) => {
      const faWidth = (d.fa/maxValue*100) + '%';
      const tickWidth = (d.tick/maxValue*100) + '%';
      return (
        <tr key={i}>
          <td style={{padding: 0, textAlign: 'center'}}>{d.grade}</td>
          <td style={{padding: 0, textAlign: 'center'}}>{d.fa}</td>
          <td style={{padding: 0, textAlign: 'center'}}>{d.tick}</td>
          <td style={{padding: 0, textAlign: 'center'}}><strong>{d.fa+d.tick}</strong></td>
          <td style={{width: '100%', verticalAlign: 'middle'}}>
            <div style={{width: faWidth, height: '10px', backgroundColor: '#3182bd', float: 'left'}}></div>
            <div style={{width: tickWidth, height: '10px', backgroundColor: '#6baed6', marginLeft: faWidth}}></div>
         </td>
        </tr>
      )
    });

    return (
      <Table responsive>
        <thead>
          <tr>
            <th>Grade</th>
            <th>FA</th>
            <th>Tick</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
}
