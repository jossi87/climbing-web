import React, {Component} from 'react';
import { getLogout } from './../api';
import { Panel } from 'react-bootstrap';

export default class Logout extends Component {
  componentDidMount() {
    getLogout();
  }

  render() {
    return (
      <Panel bsStyle='success'>Logged out</Panel>
    );
  }
}
