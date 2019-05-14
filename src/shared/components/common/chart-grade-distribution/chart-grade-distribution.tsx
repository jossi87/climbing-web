import React, {Component} from 'react';
import { LoadingAndRestoreScroll } from '../widgets/widgets';
import { getGradeDistribution } from './../../../api';

class ChartGradeDistribution extends Component<any, any> {
  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate() {
    this.refresh();
  }
  
  refresh() {
    getGradeDistribution(this.props.auth.getAccessToken(), this.props.idArea, this.props.idSector).then((res) => {
      this.setState({ gradeDistribution: res });
    });
  }

  render() {
    if (!this.state) {
      return <LoadingAndRestoreScroll />;
    }
    const { gradeDistribution } = this.state;
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
}

export default ChartGradeDistribution;