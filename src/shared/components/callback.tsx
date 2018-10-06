import React, {Component} from 'react';
import { Redirect } from 'react-router';
import { Container } from 'semantic-ui-react';

class Callback extends Component<any, any> {
  componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      this.props.auth.handleAuthentication();
      let redirect = localStorage.getItem('redirect') || '/';
      localStorage.removeItem('redirect');
      this.setState({pushUrl: redirect});
    }
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return <Container>Signing in, please wait...</Container>;
  }
}

export default Callback;
