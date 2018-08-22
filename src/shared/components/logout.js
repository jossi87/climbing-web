import React, {Component} from 'react';
import { Well } from 'react-bootstrap';
import { Redirect } from 'react-router';
import { logout } from '../utils/auth';

class Logout extends Component {
  componentDidMount() {
    this.props.auth.logout();
    this.setState({pushUrl: '/'});
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return <Redirect to={this.state.pushUrl}/>;
    }
    return <Well>Logging out, please wait...</Well>;
  }
}

export default Logout;
