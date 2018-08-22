import React, {Component} from 'react';
import { Well } from 'react-bootstrap';
import { logout } from '../utils/auth';

class Logout extends Component {
  componentDidMount() {
    this.props.auth.logout();
  }

  render() {
    return <Well>Logging out, please wait...</Well>;
  }
}

export default Logout;
