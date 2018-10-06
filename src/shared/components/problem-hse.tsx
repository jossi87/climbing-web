import React, {Component} from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';
import { LockSymbol } from './common/widgets/widgets';
import { Loader, Table } from 'semantic-ui-react';

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
        <Table.Row key={i}>
          <Table.Cell><Link to={`/area/${hse.areaId}`}>{hse.areaName}</Link> <LockSymbol visibility={hse.areaVisibility}/></Table.Cell>
          <Table.Cell><Link to={`/sector/${hse.sectorId}`}>{hse.sectorName}</Link> <LockSymbol visibility={hse.sectorVisibility}/></Table.Cell>
          <Table.Cell><Link to={`/problem/${hse.problemId}`}>{hse.problemName}</Link> <LockSymbol visibility={hse.problemVisibility}/></Table.Cell>
          <Table.Cell>{hse.comment}</Table.Cell>
        </Table.Row>
      )
    });

    return (
      <React.Fragment>
        <MetaTags>
          <title>Flagged as dangerous</title>
          <meta name="description" content={"HSE"} />
        </MetaTags>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Area</Table.HeaderCell>
              <Table.HeaderCell>Sector</Table.HeaderCell>
              <Table.HeaderCell>Problem</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows}
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}

export default ProblemHse;
