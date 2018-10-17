import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { Container } from 'semantic-ui-react';

class Callback extends Component<any, any> {
  componentDidMount() {
    if (/access_token|id_token|error/.test(window.location.hash)) {
      this.props.auth.handleAuthentication();
      let redirect = localStorage.getItem('redirect') || '/';
      localStorage.removeItem('redirect');
      this.props.history.push(redirect);
    }
  }

  render() {
    return <Container>Signing in, please wait...</Container>;
  }
}

export default withRouter(Callback);
