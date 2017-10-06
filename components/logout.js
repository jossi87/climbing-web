import React, {Component} from 'react';
import auth from '../utils/auth.js';
import { Panel } from 'react-bootstrap';

export default class Logout extends Component {
  componentDidMount() {
    auth.logout();
  }

  render() {
    return (
      <Panel bsStyle='success'>Logged out</Panel>
    );
  }
}
