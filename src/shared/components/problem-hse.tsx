import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LockSymbol } from './common/widgets/widgets';
import { Breadcrumb, Table } from 'react-bootstrap';
import { Loader } from 'semantic-ui-react';

class ProblemHse extends Component<any, any> {
  constructor(props) {
    super(props);
    let data;
    if (__isBrowser__) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    this.state = {data, tabIndex: 1};
  }

  componentDidMount() {
    if (!this.state.data) {
      this.props.fetchInitialData(this.props.auth.getAccessToken()).then((data) => this.setState(() => ({data})));
    }
  }

  render() {
    const { data } = this.state;
    if (!data) {
      return <Loader active inline='centered' />;
    }

    const rows = data.map((hse, i) => {
      return (
        <tr key={i}>
          <td><Link to={`/area/${hse.areaId}`}>{hse.areaName}</Link> <LockSymbol visibility={hse.areaVisibility}/></td>
          <td><Link to={`/sector/${hse.sectorId}`}>{hse.sectorName}</Link> <LockSymbol visibility={hse.sectorVisibility}/></td>
          <td><Link to={`/problem/${hse.problemId}`}>{hse.problemName}</Link> <LockSymbol visibility={hse.problemVisibility}/></td>
          <td>{hse.comment}</td>
        </tr>
      )
    });

    return (
      <React.Fragment>
        <MetaTags>
          <title>Flagged as dangerous</title>
          <meta name="description" content={"HSE"} />
        </MetaTags>
        <Breadcrumb>
          <Link to={`/`}>Home</Link> / Flagged as dangerous (HSE)
        </Breadcrumb>
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>Area</th>
              <th>Sector</th>
              <th>Problem</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </React.Fragment>
    );
  }
}

export default ProblemHse;
