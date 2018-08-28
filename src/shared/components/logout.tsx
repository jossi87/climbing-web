import React, {Component} from 'react';
import { Well } from 'react-bootstrap';
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
    return <Well>Logging out, please wait...</Well>;
  }
}

export default Logout;
