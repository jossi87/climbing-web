import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Well } from 'react-bootstrap';
import { setCookies } from '../utils/auth';

class Callback extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  componentDidMount() {
    const { cookies } = this.props;
    setCookies(cookies);
    window.location.href = "/";
  }

  render() {
    return <Well>Logging in, please wait...</Well>;
  }
}

export default withCookies(Callback);
