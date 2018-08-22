import React, {Component} from 'react';
import { Well } from 'react-bootstrap';
import { Redirect } from 'react-router';

class Callback extends Component {
  componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      this.props.auth.handleAuthentication();
      let pushUrl = localStorage.getItem('redirect') || '/';
      localStorage.removeItem('redirect');
      this.setState({pushUrl});
    }
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return <Redirect to={this.state.pushUrl}/>;
    }
    return <Well>Signing in, please wait...</Well>;
  }
}

export default Callback;
