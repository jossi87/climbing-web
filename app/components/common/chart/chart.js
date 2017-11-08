import React, {Component} from 'react';
import { Table } from 'react-bootstrap';

const margin = {top: '0px', right: '0px', bottom: '0px', left: '0px'};

export default class Chart extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var data = [];
    this.props.data.map(t => {
      var d = data.filter(val => {return val.grade===t.grade})
      if (!d[0]) {
        data.push({grade: t.grade, fa: (t.fa? 1 : 0), tick: (t.fa? 0 : 1)});
      } else {
        if (t.fa) {
          d[0].fa++;
        } else {
          d[0].tick++;
        }
      }
    });
    data.sort((a,b) => {return b.grade.localeCompare(a.grade)});
    const maxValue = Math.max.apply(Math, data.map(d => {return d.fa+d.tick}));

    const rows = data.map((d, i) => {
      const faWidth = (d.fa/maxValue*100) + '%';
      const tickWidth = (d.tick/maxValue*100) + '%';
      const style = {padding: 0, textAlign: 'center'};
      return (
        <tr key={i}>
          <td style={style}>{d.grade}</td>
          <td style={style}>{d.fa}</td>
          <td style={style}>{d.tick}</td>
          <td style={style}><strong>{d.fa+d.tick}</strong></td>
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
