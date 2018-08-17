import React, {Component} from 'react';

class Login extends Component {
  componentDidMount() {
    this.props.auth.login();
  }

  render() {
    return null;
  }
}

export default Login;
