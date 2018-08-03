import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Well } from 'react-bootstrap';
import { logout } from '../utils/auth';

class Logout extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  componentDidMount() {
    const { cookies } = this.props;
    logout(cookies);
    window.location.href = "/";
  }

  render() {
    return <Well>Logging out, please wait...</Well>;
  }
}

export default withCookies(Logout);
