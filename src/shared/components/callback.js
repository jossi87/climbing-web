import React, {Component} from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import { Redirect } from 'react-router';
import { setIdToken, setAccessToken } from '../utils/auth';

class Callback extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  componentDidMount() {
    const { cookies } = this.props;
    setAccessToken(cookies);
    setIdToken(cookies);
    this.setState({pushUrl: '/'});
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return null;
  }
}

export default withCookies(Callback);
