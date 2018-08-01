import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { login } from '../utils/auth';

class Login extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  componentDidMount() {
    const { cookies } = this.props;
    login(cookies);
  }

  render() {
    return null;
  }
}

export default withCookies(Login);
