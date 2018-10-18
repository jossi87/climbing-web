import React, {Component} from 'react';
import { Container } from 'semantic-ui-react';
import { withRouter } from 'react-router';

class Logout extends Component<any, any> {
  componentDidMount() {
    this.props.auth.logout();
    this.props.history.push("/");
  }

  render() {
    return <Container>Logging out, please wait...</Container>;
  }
}

export default withRouter(Logout);
