import React, {Component} from 'react';
import { Container } from 'semantic-ui-react';
import { Redirect } from 'react-router';

class Logout extends Component<any, any> {
  componentDidMount() {
    this.props.auth.logout();
    this.setState({pushUrl: '/'});
  }

  render() {
    if (this.state && this.state.pushUrl) {
      return (<Redirect to={this.state.pushUrl} push />);
    }
    return <Container>Logging out, please wait...</Container>;
  }
}

export default Logout;
